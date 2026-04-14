// src/lib/codes.ts
// FWK_CODE 공통 조회 함수 — 서버 컴포넌트, route.ts에서 직접 사용

import { getConnection } from '@/db/connection';

export interface CodeItem {
    code: string;
    codeName: string;
    sortOrder: number;
}

/**
 * 지정된 코드 그룹의 코드 목록을 FWK_CODE에서 조회한다.
 * USE_YN = 'Y' 조건, SORT_ORDER 오름차순.
 * 조회 실패 시 빈 배열 반환 (비즈니스 흐름 방해 금지).
 */
export async function getCodesByGroup(codeGroupId: string): Promise<CodeItem[]> {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute<[string, string, number]>(
            `SELECT CODE, CODE_NAME, SORT_ORDER
               FROM FWK_CODE
              WHERE CODE_GROUP_ID = :codeGroupId
                AND USE_YN = 'Y'
              ORDER BY SORT_ORDER ASC`,
            { codeGroupId },
            { outFormat: 4002 }, // oracledb.OUT_FORMAT_ARRAY
        );
        return (result.rows ?? []).map(([code, codeName, sortOrder]) => ({
            code,
            codeName,
            sortOrder,
        }));
    } catch {
        return [];
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch {
                // 커넥션 반환 실패는 무시
            }
        }
    }
}
