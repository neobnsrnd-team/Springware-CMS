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
    PAGE_REQUEST_APPROVAL,
    PAGE_UPDATE_APPROVE_STATE,
    PAGE_SOFT_DELETE,
    PAGE_HARD_DELETE,
    COMP_MAP_DELETE_BY_PAGE,
} from '@/db/queries/page.sql';
import {
    PAGE_HISTORY_NEXT_VERSION,
    PAGE_HISTORY_INSERT,
    PAGE_HISTORY_SELECT_LATEST,
    PAGE_HISTORY_SELECT_BY_VERSION,
    PAGE_HISTORY_SELECT_LIST,
    PAGE_HISTORY_COUNT_BY_PAGE,
} from '@/db/queries/page-history.sql';
import { COMP_MAP_DELETE_BY_PAGE_VERSION } from '@/db/queries/component-map.sql';

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

/** 페이지 목록 조회 (페이지네이션 + 검색 + 정렬) */
export async function getPageList(
    options: {
        approveState?: ApproveState;
        createUserId?: string;
        createUserName?: string; // CREATE_USER_NAME 필터
        search?: string; // PAGE_NAME LIKE 검색어
        sortBy?: 'name' | 'date'; // 'name': 이름순, 'date'(기본): 최신 수정순
        viewMode?: ViewMode; // 뷰 모드 필터
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
        createUserName: options.createUserName ?? null,
        search: options.search ?? null,
        sortBy: options.sortBy === 'name' ? 'name' : 'date',
        viewMode: options.viewMode ?? null,
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
                    createUserName: binds.createUserName,
                    search: binds.search,
                    viewMode: binds.viewMode,
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

/** 승인 요청 — APPROVE_STATE를 PENDING으로 변경, 결재자 지정 */
export async function requestApproval(pageId: string, approverId: string, approverName: string): Promise<void> {
    await withTransaction(async (conn) => {
        await conn.execute(PAGE_REQUEST_APPROVAL, { pageId, approverId, approverName });
    });
}

/** 결재 상태 변경 — APPROVED일 때만 HISTORY INSERT (W-6.3 핵심) */
export async function updateApproveState(input: {
    pageId: string;
    approveState: ApproveState;
    approverId?: string;
    approverName?: string;
    rejectedReason?: string;
    expiredDate?: string | null;
    lastModifierId: string;
}): Promise<{ version?: number }> {
    return await withTransaction(async (conn) => {
        // 1. 결재 상태 UPDATE
        await conn.execute(PAGE_UPDATE_APPROVE_STATE, {
            pageId: input.pageId,
            approveState: input.approveState,
            approverId: input.approverId ?? null,
            approverName: input.approverName ?? null,
            rejectedReason: clobBind(input.rejectedReason ?? null),
            expiredDate: input.expiredDate ?? null,
            lastModifierId: input.lastModifierId,
        });

        // 2. 승인(APPROVED)일 때만 PAGE_HISTORY INSERT + COMP_PAGE_MAP 틀
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
            });

            // TODO #138: COMP_PAGE_MAP 매핑 생성 — 현재는 빈 매핑으로 구조만 확보
            // 향후 페이지 HTML 파싱 → 컴포넌트 ID 추출 → INSERT 추가
            await conn.execute(COMP_MAP_DELETE_BY_PAGE_VERSION, {
                pageId: input.pageId,
                version: nextVersion,
            });

            return { version: nextVersion };
        }

        return {};
    });
}

/**
 * 페이지 삭제 — 이슈 #26 삭제 정책:
 * - 미승인 (HISTORY 없음): PAGE + COMP_MAP 하드 삭제
 * - 승인됨 (HISTORY 있음): PAGE 소프트 삭제 (USE_YN='N'), HISTORY 보존
 * @returns 삭제 유형 ('hard' | 'soft')
 */
export async function deletePage(pageId: string, lastModifierId: string): Promise<{ deleteType: 'hard' | 'soft' }> {
    return await withTransaction(async (conn) => {
        // 승인 이력 존재 여부 확인
        const historyResult = await conn.execute<{ CNT: number }>(
            PAGE_HISTORY_COUNT_BY_PAGE,
            { pageId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        const hasHistory = (historyResult.rows?.[0]?.CNT ?? 0) > 0;

        if (hasHistory) {
            // 승인된 페이지: 소프트 삭제 (DB 보존, HISTORY 유지)
            await conn.execute(PAGE_SOFT_DELETE, { pageId, lastModifierId });
            return { deleteType: 'soft' };
        } else {
            // 미승인 페이지: COMP_MAP + PAGE 하드 삭제
            await conn.execute(COMP_MAP_DELETE_BY_PAGE, { pageId });
            await conn.execute(PAGE_HARD_DELETE, { pageId });
            return { deleteType: 'hard' };
        }
    });
}

// ═══════════════════════════════════════════════
// 이력 조회
// ═══════════════════════════════════════════════

/** 최신 이력 조회 */
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
