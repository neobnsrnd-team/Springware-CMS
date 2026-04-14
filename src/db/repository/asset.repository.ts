// ============================================================================
// SPW_CMS_ASSET + SPW_CMS_ASSET_PAGE_MAP — Repository
// ============================================================================

import oracledb from 'oracledb';

import { getConnection, withTransaction } from '@/db/connection';
import type { CmsAsset } from '@/db/types';
import {
    ASSET_SELECT_BY_ID,
    ASSET_SELECT_LIST,
    ASSET_COUNT,
    ASSET_INSERT,
    ASSET_DELETE,
    ASSET_MAP_SELECT_BY_PAGE,
    ASSET_MAP_INSERT,
    ASSET_MAP_DELETE_BY_PAGE_VERSION,
} from '@/db/queries/asset.sql';

const OBJ = { outFormat: oracledb.OUT_FORMAT_OBJECT };

// ═══════════════════════════════════════════════
// 에셋 CRUD
// ═══════════════════════════════════════════════

/** 에셋 단건 조회 */
export async function getAssetById(assetId: string): Promise<CmsAsset | null> {
    const conn = await getConnection();
    try {
        const result = await conn.execute<CmsAsset>(ASSET_SELECT_BY_ID, { assetId }, OBJ);
        return result.rows?.[0] ?? null;
    } finally {
        await conn.close();
    }
}

/** 에셋 목록 조회 (페이지네이션) */
export async function getAssetList(options?: {
    businessCategory?: string;
    page?: number;
    pageSize?: number;
}): Promise<{ list: CmsAsset[]; totalCount: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const startRow = (page - 1) * pageSize;
    const endRow = page * pageSize;

    const conn = await getConnection();
    try {
        const [listResult, countResult] = await Promise.all([
            conn.execute<CmsAsset>(
                ASSET_SELECT_LIST,
                {
                    businessCategory: options?.businessCategory ?? null,
                    startRow,
                    endRow,
                },
                OBJ,
            ),
            conn.execute<{ TOTAL_COUNT: number }>(
                ASSET_COUNT,
                { businessCategory: options?.businessCategory ?? null },
                OBJ,
            ),
        ]);

        return {
            list: listResult.rows ?? [],
            totalCount: countResult.rows?.[0]?.TOTAL_COUNT ?? 0,
        };
    } finally {
        await conn.close();
    }
}

/** 에셋 등록 (파일 메타데이터 INSERT) */
export async function createAsset(input: {
    assetId: string;
    assetName: string;
    businessCategory?: string;
    mimeType: string;
    fileSize: number;
    assetPath: string;
    assetUrl: string;
    assetDesc?: string;
    createUserId: string;
    createUserName: string;
}): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(ASSET_INSERT, {
            assetId: input.assetId,
            assetName: input.assetName,
            businessCategory: input.businessCategory ?? null,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
            assetPath: input.assetPath,
            assetUrl: input.assetUrl,
            assetDesc: input.assetDesc ?? null,
            createUserId: input.createUserId,
            createUserName: input.createUserName,
            lastModifierId: input.createUserId,
            lastModifierName: input.createUserName,
        });
    });
}

/** 에셋 논리 삭제 */
export async function deleteAsset(assetId: string, lastModifierId: string, lastModifierName: string): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(ASSET_DELETE, {
            assetId,
            lastModifierId,
            lastModifierName,
        });
    });
}

// ═══════════════════════════════════════════════
// 에셋-페이지 매핑
// ═══════════════════════════════════════════════

/** 페이지 버전별 에셋 매핑 조회 */
export async function getAssetMapByPage(
    pageId: string,
    version: number,
): Promise<
    Array<{
        PAGE_ID: string;
        VERSION: number;
        ASSET_ID: string;
        ASSET_NAME: string;
        MIME_TYPE: string;
        FILE_SIZE: number | null;
    }>
> {
    const conn = await getConnection();
    try {
        const result = await conn.execute(ASSET_MAP_SELECT_BY_PAGE, { pageId, version }, OBJ);
        return (result.rows ?? []) as Array<{
            PAGE_ID: string;
            VERSION: number;
            ASSET_ID: string;
            ASSET_NAME: string;
            MIME_TYPE: string;
            FILE_SIZE: number | null;
        }>;
    } finally {
        await conn.close();
    }
}

/** 에셋-페이지 매핑 일괄 교체 (승인 시 사용 — HTML 파싱하여 asset URL 추출 후 호출) */
export async function replaceAssetMaps(input: { pageId: string; version: number; assetIds: string[] }): Promise<void> {
    await withTransaction(async (conn) => {
        // 1. 기존 매핑 삭제
        await conn.execute(ASSET_MAP_DELETE_BY_PAGE_VERSION, {
            pageId: input.pageId,
            version: input.version,
        });

        // 2. 새 매핑 INSERT
        for (const assetId of input.assetIds) {
            await conn.execute(ASSET_MAP_INSERT, {
                pageId: input.pageId,
                version: input.version,
                assetId,
            });
        }
    });
}
