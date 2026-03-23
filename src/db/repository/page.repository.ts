// ============================================================================
// SPW_CMS_PAGE + SPW_CMS_PAGE_HISTORY — Repository
// ============================================================================
// W-6 해결: VIEW_MODE 추가, HISTORY INSERT 타이밍 변경 (승인 시에만), SNAPSHOT_DTIME 제거
// 설계 원칙: PAGE는 최신 상태 조회용 (INSERT 1회 + UPDATE 반복)
//           PAGE_HISTORY는 승인(APPROVED) 시에만 VERSION INSERT

import oracledb from 'oracledb';
import { getConnection, withTransaction, clobBind } from '@/db/connection';
import type { CmsPage, CmsPageHistory, ApproveState, ViewMode } from '@/db/types';
import {
    PAGE_SELECT_BY_ID,
    PAGE_SELECT_LIST,
    PAGE_COUNT,
    PAGE_INSERT,
    PAGE_UPDATE,
    PAGE_UPDATE_APPROVE_STATE,
    PAGE_DELETE,
} from '@/db/queries/page.sql';
import {
    PAGE_HISTORY_NEXT_VERSION,
    PAGE_HISTORY_INSERT,
    PAGE_HISTORY_SELECT_LATEST,
    PAGE_HISTORY_SELECT_BY_VERSION,
    PAGE_HISTORY_SELECT_LIST,
} from '@/db/queries/page-history.sql';

const OBJ = { outFormat: oracledb.OUT_FORMAT_OBJECT };

// ═══════════════════════════════════════════════
// 페이지 조회
// ═══════════════════════════════════════════════

/** 페이지 단건 조회 */
export async function getPageById(pageId: string): Promise<CmsPage | null> {
    const conn = await getConnection();
    try {
        const result = await conn.execute<CmsPage>(PAGE_SELECT_BY_ID, { pageId }, OBJ);
        return result.rows?.[0] ?? null;
    } finally {
        await conn.close();
    }
}

/** 페이지 목록 조회 (페이지네이션) */
export async function getPageList(
    options: {
        approveState?: ApproveState;
        createUserId?: string;
        page?: number;
        pageSize?: number;
    } = {},
): Promise<{ list: CmsPage[]; totalCount: number }> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 10;
    const startRow = (page - 1) * pageSize;
    const endRow = page * pageSize;

    const binds = {
        approveState: options.approveState ?? null,
        createUserId: options.createUserId ?? null,
        startRow,
        endRow,
    };

    const conn = await getConnection();
    try {
        const [listResult, countResult] = await Promise.all([
            conn.execute<CmsPage>(PAGE_SELECT_LIST, binds, OBJ),
            conn.execute<{ TOTAL_COUNT: number }>(
                PAGE_COUNT,
                {
                    approveState: binds.approveState,
                    createUserId: binds.createUserId,
                },
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

// ═══════════════════════════════════════════════
// 페이지 저장 (W-6.3: PAGE만 INSERT/UPDATE, HISTORY INSERT 제거)
// ═══════════════════════════════════════════════

/** 페이지 신규 생성 — PAGE INSERT만 (HISTORY는 승인 시에만 INSERT) */
export async function createPage(input: {
    pageId: string;
    pageName: string;
    viewMode?: ViewMode;
    ownerDeptCode?: string;
    filePath?: string;
    createUserId: string;
    createUserName: string;
    pageDesc?: string;
    pageDescDetail?: string;
    templateId?: string;
    thumbnail?: string;
    targetCd?: string;
}): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(PAGE_INSERT, {
            pageId: input.pageId,
            pageName: input.pageName,
            viewMode: input.viewMode ?? null,
            ownerDeptCode: input.ownerDeptCode ?? null,
            filePath: input.filePath ?? null,
            createUserId: input.createUserId,
            createUserName: input.createUserName,
            lastModifierId: input.createUserId,
            lastModifierName: input.createUserName,
            pageDesc: clobBind(input.pageDesc ?? null),
            pageDescDetail: clobBind(input.pageDescDetail ?? null),
            templateId: input.templateId ?? null,
            thumbnail: input.thumbnail ?? null,
            targetCd: input.targetCd ?? null,
        });
    });
}

/** 페이지 수정 — PAGE UPDATE만 (HISTORY는 승인 시에만 INSERT) */
export async function updatePage(input: {
    pageId: string;
    pageName?: string;
    viewMode?: ViewMode;
    pageDesc?: string;
    pageDescDetail?: string;
    filePath?: string;
    thumbnail?: string;
    lastModifierId: string;
    lastModifierName: string;
}): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(PAGE_UPDATE, {
            pageId: input.pageId,
            pageName: input.pageName ?? null,
            viewMode: input.viewMode ?? null,
            pageDesc: clobBind(input.pageDesc ?? null),
            pageDescDetail: clobBind(input.pageDescDetail ?? null),
            filePath: input.filePath ?? null,
            thumbnail: input.thumbnail ?? null,
            lastModifierId: input.lastModifierId,
            lastModifierName: input.lastModifierName,
        });
    });
}

/** 결재 상태 변경 — APPROVED일 때만 HISTORY INSERT (W-6.3 핵심) */
export async function updateApproveState(input: {
    pageId: string;
    approveState: ApproveState;
    approverId?: string;
    approverName?: string;
    rejectedReason?: string;
    lastModifierId: string;
    renderedHtml?: string;
}): Promise<{ version?: number }> {
    return await withTransaction(async (conn) => {
        // 1. 결재 상태 UPDATE
        await conn.execute(PAGE_UPDATE_APPROVE_STATE, {
            pageId: input.pageId,
            approveState: input.approveState,
            approverId: input.approverId ?? null,
            approverName: input.approverName ?? null,
            rejectedReason: clobBind(input.rejectedReason ?? null),
            lastModifierId: input.lastModifierId,
        });

        // 2. 승인(APPROVED)일 때만 PAGE_HISTORY INSERT
        if (input.approveState === 'APPROVED') {
            const versionResult = await conn.execute<{ NEXT_VERSION: number }>(
                PAGE_HISTORY_NEXT_VERSION,
                { pageId: input.pageId },
                OBJ,
            );
            const nextVersion = versionResult.rows?.[0]?.NEXT_VERSION ?? 1;

            await conn.execute(PAGE_HISTORY_INSERT, {
                pageId: input.pageId,
                version: nextVersion,
                renderedHtml: clobBind(input.renderedHtml ?? null),
            });

            return { version: nextVersion };
        }

        return {};
    });
}

/** 페이지 논리 삭제 */
export async function deletePage(pageId: string, lastModifierId: string): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(PAGE_DELETE, { pageId, lastModifierId });
    });
}

// ═══════════════════════════════════════════════
// 이력 조회
// ═══════════════════════════════════════════════

/** 최신 이력 조회 (미리보기용 RENDERED_HTML 포함) */
export async function getLatestHistory(pageId: string): Promise<CmsPageHistory | null> {
    const conn = await getConnection();
    try {
        const result = await conn.execute<CmsPageHistory>(PAGE_HISTORY_SELECT_LATEST, { pageId }, OBJ);
        return result.rows?.[0] ?? null;
    } finally {
        await conn.close();
    }
}

/** 특정 버전 이력 조회 */
export async function getHistoryByVersion(pageId: string, version: number): Promise<CmsPageHistory | null> {
    const conn = await getConnection();
    try {
        const result = await conn.execute<CmsPageHistory>(PAGE_HISTORY_SELECT_BY_VERSION, { pageId, version }, OBJ);
        return result.rows?.[0] ?? null;
    } finally {
        await conn.close();
    }
}

/** 이력 목록 조회 (버전 역순, 요약 정보) — W-6.2: SNAPSHOT_DTIME → APPROVE_DATE */
export async function getHistoryList(
    pageId: string,
): Promise<
    Pick<
        CmsPageHistory,
        | 'PAGE_ID'
        | 'VERSION'
        | 'PAGE_NAME'
        | 'APPROVE_STATE'
        | 'LAST_MODIFIER_ID'
        | 'LAST_MODIFIER_NAME'
        | 'APPROVE_DATE'
    >[]
> {
    const conn = await getConnection();
    try {
        const result = await conn.execute(PAGE_HISTORY_SELECT_LIST, { pageId }, OBJ);
        return (result.rows ?? []) as Pick<
            CmsPageHistory,
            | 'PAGE_ID'
            | 'VERSION'
            | 'PAGE_NAME'
            | 'APPROVE_STATE'
            | 'LAST_MODIFIER_ID'
            | 'LAST_MODIFIER_NAME'
            | 'APPROVE_DATE'
        >[];
    } finally {
        await conn.close();
    }
}
