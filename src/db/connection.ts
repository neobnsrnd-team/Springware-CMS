import oracledb from 'oracledb';

// Thick 모드 사용: 로컬 Oracle Client 활용 (구버전 Oracle XE 지원)
oracledb.initOracleClient();

let 풀초기화완료 = false;

// 커넥션 풀 설정
async function 풀초기화(): Promise<void> {
  if (풀초기화완료) return;

  await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
    poolMin: 0,  // 공유 Oracle XE 세션 제한 고려 (최대 20개)
    poolMax: 5,
    poolIncrement: 1,
  });

  풀초기화완료 = true;
  console.log('Oracle 커넥션 풀 초기화 완료');
}

// 커넥션 획득 (최초 호출 시 풀 자동 초기화, 스키마 설정 포함)
export async function 커넥션획득(): Promise<oracledb.Connection> {
  await 풀초기화();
  const conn = await oracledb.getConnection();
  // 테이블 소유 스키마로 세션 변경 (쿼리에서 스키마 생략 가능)
  await conn.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${process.env.ORACLE_SCHEMA}`);
  return conn;
}

// 커넥션 풀 종료
export async function 커넥션풀종료(): Promise<void> {
  if (!풀초기화완료) return;
  await oracledb.getPool().close(10);
  풀초기화완료 = false;
  console.log('Oracle 커넥션 풀 종료 완료');
}
