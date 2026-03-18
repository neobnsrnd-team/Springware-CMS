// ============================================================================
// SPW_CMS_PAGE + SPW_CMS_PAGE_HISTORY — Repository
// ============================================================================
// PAGE 수정/결재변경 시 반드시 PAGE_HISTORY와 트랜잭션으로 묶는다.

import oracledb from 'oracledb';
import { getConnection, withTransaction, clobBind } from '@/db/connection';
import type { CmsPage, CmsPageHistory, ApproveState } from '@/db/types';
import {
  PAGE_SELECT_BY_ID, PAGE_SELECT_LIST, PAGE_COUNT,
  PAGE_INSERT, PAGE_UPDATE, PAGE_UPDATE_APPROVE_STATE, PAGE_DELETE,
} from '@/db/queries/page.sql';
import {
  PAGE_HISTORY_NEXT_VERSION, PAGE_HISTORY_INSERT,
  PAGE_HISTORY_SELECT_LATEST, PAGE_HISTORY_SELECT_BY_VERSION, PAGE_HISTORY_SELECT_LIST,
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
export async function getPageList(options: {
  approveState?: ApproveState;
  createUserId?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ list: CmsPage[]; totalCount: number }> {
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
      conn.execute<{ TOTAL_COUNT: number }>(PAGE_COUNT, {
        approveState: binds.approveState,
        createUserId: binds.createUserId,
      }, OBJ),
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
// 페이지 저장 (트랜잭션 — PAGE + PAGE_HISTORY)
// ═══════════════════════════════════════════════

/** 페이지 신규 생성 + 이력 v1 INSERT */
export async function createPage(input: {
  pageId: string;
  pageName: string;
  ownerDeptCode?: string;
  filePath?: string;
  createUserId: string;
  createUserName: string;
  pageDesc?: string;
  pageDescDetail?: string;
  templateId?: string;
  thumbnail?: string;
  targetCd?: string;
  renderedHtml?: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    // 1. PAGE INSERT
    await conn.execute(PAGE_INSERT, {
      pageId: input.pageId,
      pageName: input.pageName,
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

    // 2. PAGE_HISTORY v1 INSERT
    await conn.execute(PAGE_HISTORY_INSERT, {
      pageId: input.pageId,
      version: 1,
      renderedHtml: clobBind(input.renderedHtml ?? null),
    });
  });
}

/** 페이지 수정 + 이력 INSERT (에디터 Save 핵심) */
export async function updatePage(input: {
  pageId: string;
  pageName?: string;
  pageDesc?: string;
  pageDescDetail?: string;
  filePath?: string;
  thumbnail?: string;
  lastModifierId: string;
  lastModifierName: string;
  renderedHtml: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    // 1. 다음 버전 번호 조회
    const versionResult = await conn.execute<{ NEXT_VERSION: number }>(
      PAGE_HISTORY_NEXT_VERSION, { pageId: input.pageId }, OBJ,
    );
    const nextVersion = versionResult.rows?.[0]?.NEXT_VERSION ?? 1;

    // 2. PAGE UPDATE
    await conn.execute(PAGE_UPDATE, {
      pageId: input.pageId,
      pageName: input.pageName ?? null,
      pageDesc: clobBind(input.pageDesc ?? null),
      pageDescDetail: clobBind(input.pageDescDetail ?? null),
      filePath: input.filePath ?? null,
      thumbnail: input.thumbnail ?? null,
      lastModifierId: input.lastModifierId,
      lastModifierName: input.lastModifierName,
    });

    // 3. PAGE_HISTORY INSERT (현재 PAGE 스냅샷 + renderedHtml)
    await conn.execute(PAGE_HISTORY_INSERT, {
      pageId: input.pageId,
      version: nextVersion,
      renderedHtml: clobBind(input.renderedHtml),
    });
  });
}

/** 결재 상태 변경 + 이력 INSERT */
export async function updateApproveState(input: {
  pageId: string;
  approveState: ApproveState;
  approverId?: string;
  approverName?: string;
  rejectedReason?: string;
  lastModifierId: string;
  renderedHtml?: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    // 1. 다음 버전 번호 조회
    const versionResult = await conn.execute<{ NEXT_VERSION: number }>(
      PAGE_HISTORY_NEXT_VERSION, { pageId: input.pageId }, OBJ,
    );
    const nextVersion = versionResult.rows?.[0]?.NEXT_VERSION ?? 1;

    // 2. 결재 상태 UPDATE
    await conn.execute(PAGE_UPDATE_APPROVE_STATE, {
      pageId: input.pageId,
      approveState: input.approveState,
      approverId: input.approverId ?? null,
      approverName: input.approverName ?? null,
      rejectedReason: clobBind(input.rejectedReason ?? null),
      lastModifierId: input.lastModifierId,
    });

    // 3. PAGE_HISTORY INSERT
    await conn.execute(PAGE_HISTORY_INSERT, {
      pageId: input.pageId,
      version: nextVersion,
      renderedHtml: clobBind(input.renderedHtml ?? null),
    });
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
    const result = await conn.execute<CmsPageHistory>(
      PAGE_HISTORY_SELECT_BY_VERSION, { pageId, version }, OBJ,
    );
    return result.rows?.[0] ?? null;
  } finally {
    await conn.close();
  }
}

/** 이력 목록 조회 (버전 역순, 요약 정보) */
export async function getHistoryList(pageId: string): Promise<Pick<CmsPageHistory,
  'PAGE_ID' | 'VERSION' | 'PAGE_NAME' | 'APPROVE_STATE' |
  'LAST_MODIFIER_ID' | 'LAST_MODIFIER_NAME' | 'SNAPSHOT_DTIME'>[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(PAGE_HISTORY_SELECT_LIST, { pageId }, OBJ);
    return (result.rows ?? []) as Pick<CmsPageHistory,
      'PAGE_ID' | 'VERSION' | 'PAGE_NAME' | 'APPROVE_STATE' |
      'LAST_MODIFIER_ID' | 'LAST_MODIFIER_NAME' | 'SNAPSHOT_DTIME'>[];
  } finally {
    await conn.close();
  }
}
