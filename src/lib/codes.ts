// src/lib/codes.ts
// FWK_CODE 공통 조회 함수 — 서버 컴포넌트, route.ts에서 직접 사용

import { getConnection } from '@/db/connection';

export interface CodeItem {
    code: string;
    codeName: string;
    sortOrder: number;
}

export const CMS_ASSET_CATEGORY_GROUP_ID = 'CMS00001';
export const CMS_ASSET_DEFAULT_CATEGORY = 'COMMON';
export const CMS_ASSET_CATEGORY_LABELS: Record<string, string> = {
    COMMON: '공통',
    CARD: '카드',
    LOAN: '여신',
    DEPOSIT: '수신',
};

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

export async function getCmsAssetCategoryCodes(): Promise<CodeItem[]> {
    return getCodesByGroup(CMS_ASSET_CATEGORY_GROUP_ID);
}

export async function normalizeCmsAssetCategory(category?: string | null): Promise<string> {
    const normalized = category?.trim() || CMS_ASSET_DEFAULT_CATEGORY;
    const codes = await getCmsAssetCategoryCodes();

    if (!codes.some((item) => item.code === normalized)) {
        throw new Error('유효하지 않은 이미지 카테고리입니다.');
    }

    return normalized;
}
