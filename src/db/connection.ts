// src/db/connection.ts

import oracledb from 'oracledb';

import { ORACLE_USER, ORACLE_PASSWORD, ORACLE_HOST, ORACLE_PORT, ORACLE_SERVICE, ORACLE_SCHEMA } from '@/lib/env';

let poolInitPromise: Promise<void> | null = null;

// 커넥션 풀 설정 (최초 호출 시 Oracle Client 초기화 + CLOB 설정 포함)
// Promise 캐싱 패턴: 동시 요청이 동일한 Promise를 await하여 레이스 컨디션 방지
async function initPool(): Promise<void> {
    if (poolInitPromise) return poolInitPromise;

    poolInitPromise = (async () => {
        try {
            // Thick 모드 사용: Oracle Instant Client 필요 (구버전 Oracle XE 지원)
            oracledb.initOracleClient();
            // CLOB 컬럼을 string으로 자동 변환 (DATA, PAGE_DESC 등)
            oracledb.fetchAsString = [oracledb.CLOB];

            await oracledb.createPool({
                user: ORACLE_USER,
                password: ORACLE_PASSWORD,
                connectString: `${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}`,
                poolMin: 0, // 공유 Oracle XE 세션 제한 고려 (최대 20개)
                poolMax: 5,
                poolIncrement: 1,
            });

            console.warn('Oracle 커넥션 풀 초기화 완료');
        } catch (error) {
            poolInitPromise = null;
            console.error('Oracle 커넥션 풀 초기화 실패:', error);
            throw error;
        }
    })();

    return poolInitPromise;
}

// 커넥션 획득 (최초 호출 시 풀 자동 초기화, 스키마 설정 포함)
export async function getConnection(): Promise<oracledb.Connection> {
    await initPool();
    const conn = await oracledb.getConnection();
    // 테이블 소유 스키마로 세션 변경 (쿼리에서 스키마 생략 가능)
    // SQL 인젝션 방지를 위해 PL/SQL 블록과 바인드 변수 사용
    await conn.execute(
        `BEGIN
           EXECUTE IMMEDIATE 'ALTER SESSION SET CURRENT_SCHEMA = ' || DBMS_ASSERT.ENQUOTE_NAME(:schemaName);
         END;`,
        { schemaName: ORACLE_SCHEMA },
    );
    return conn;
}

// 커넥션 풀 종료
export async function closePool(): Promise<void> {
    if (!poolInitPromise) return;
    await oracledb.getPool().close(10);
    poolInitPromise = null;
    console.warn('Oracle 커넥션 풀 종료 완료');
}

// 트랜잭션 래퍼 — 콜백 내 모든 쿼리를 하나의 트랜잭션으로 실행
// 성공 시 COMMIT, 예외 시 ROLLBACK 후 재throw
export async function withTransaction<T>(task: (conn: oracledb.Connection) => Promise<T>): Promise<T> {
    const conn = await getConnection();
    try {
        const result = await task(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        await conn.close();
    }
}

// CLOB 바인딩 헬퍼 — 4000바이트 초과 문자열을 CLOB 타입으로 바인딩
export function clobBind(value: string | null): string | { val: string; type: number } | null {
    if (!value) return null;
    return value.length > 4000 ? { val: value, type: oracledb.CLOB } : value;
}
