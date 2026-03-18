// ============================================================================
// SPW_CMS_COMPONENT + SPW_CMS_COMP_PAGE_MAP — Repository
// ============================================================================

import oracledb from 'oracledb';
import { getConnection, withTransaction, clobBind } from '@/db/connection';
import type { CmsComponent, CmsComponentParsed, CmsCompPageMap, ComponentType, ViewMode } from '@/db/types';
import {
  COMPONENT_SELECT_BY_ID, COMPONENT_SELECT_LIST,
  COMPONENT_INSERT, COMPONENT_UPDATE, COMPONENT_DELETE,
} from '@/db/queries/component.sql';
import {
  COMP_MAP_SELECT_BY_PAGE, COMP_MAP_INSERT,
  COMP_MAP_UPDATE_ORDER, COMP_MAP_DELETE, COMP_MAP_DELETE_BY_PAGE,
} from '@/db/queries/component-map.sql';

const OBJ = { outFormat: oracledb.OUT_FORMAT_OBJECT };

/** DATA(CLOB string) → JSON 파싱 변환 (파싱 실패 시 null 반환) */
function parseComponentData(row: CmsComponent): CmsComponentParsed {
  let parsedData: Record<string, unknown> | null = null;
  if (row.DATA) {
    try {
      parsedData = JSON.parse(row.DATA);
    } catch (err) {
      console.error(`COMPONENT_ID ${row.COMPONENT_ID}의 DATA JSON 파싱 오류:`, err);
    }
  }
  return { ...row, DATA: parsedData };
}


// ═══════════════════════════════════════════════
// 컴포넌트 CRUD
// ═══════════════════════════════════════════════

/** 컴포넌트 단건 조회 (DATA JSON 파싱 포함) */
export async function getComponentById(componentId: string): Promise<CmsComponentParsed | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<CmsComponent>(COMPONENT_SELECT_BY_ID, { componentId }, OBJ);
    const row = result.rows?.[0];
    return row ? parseComponentData(row) : null;
  } finally {
    await conn.close();
  }
}

/** 컴포넌트 목록 조회 (유형/뷰모드 필터, DATA JSON 파싱 포함) */
export async function getComponentList(options?: {
  componentType?: ComponentType;
  viewMode?: ViewMode;
}): Promise<CmsComponentParsed[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<CmsComponent>(COMPONENT_SELECT_LIST, {
      componentType: options?.componentType ?? null,
      viewMode: options?.viewMode ?? null,
    }, OBJ);
    return (result.rows ?? []).map(parseComponentData);
  } finally {
    await conn.close();
  }
}

/** 컴포넌트 등록 (DATA는 JSON.stringify 후 CLOB 저장) */
export async function createComponent(input: {
  componentId: string;
  componentType: ComponentType;
  viewMode: ViewMode;
  componentThumbnail?: string;
  data?: Record<string, unknown>;
  createUserId: string;
  createUserName: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMPONENT_INSERT, {
      componentId: input.componentId,
      componentType: input.componentType,
      viewMode: input.viewMode,
      componentThumbnail: input.componentThumbnail ?? null,
      data: input.data ? clobBind(JSON.stringify(input.data)) : null,
      createUserId: input.createUserId,
      createUserName: input.createUserName,
      lastModifierId: input.createUserId,
    });
  });
}

/** 컴포넌트 수정 */
export async function updateComponent(input: {
  componentId: string;
  componentType?: ComponentType;
  viewMode?: ViewMode;
  componentThumbnail?: string;
  data?: Record<string, unknown>;
  lastModifierId: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMPONENT_UPDATE, {
      componentId: input.componentId,
      componentType: input.componentType ?? null,
      viewMode: input.viewMode ?? null,
      componentThumbnail: input.componentThumbnail ?? null,
      data: input.data ? clobBind(JSON.stringify(input.data)) : null,
      lastModifierId: input.lastModifierId,
    });
  });
}

/** 컴포넌트 논리 삭제 */
export async function deleteComponent(componentId: string, lastModifierId: string): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMPONENT_DELETE, { componentId, lastModifierId });
  });
}


// ═══════════════════════════════════════════════
// 컴포넌트-페이지 매핑
// ═══════════════════════════════════════════════

/** 매핑 조회 — 페이지별 (컴포넌트 정보 JOIN) */
export async function getMapByPage(pageId: string): Promise<(CmsCompPageMap & {
  COMPONENT_TYPE: ComponentType;
  VIEW_MODE: ViewMode;
  COMPONENT_THUMBNAIL: string | null;
})[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(COMP_MAP_SELECT_BY_PAGE, { pageId }, OBJ);
    return (result.rows ?? []) as (CmsCompPageMap & {
      COMPONENT_TYPE: ComponentType;
      VIEW_MODE: ViewMode;
      COMPONENT_THUMBNAIL: string | null;
    })[];
  } finally {
    await conn.close();
  }
}

/** 매핑 추가 (단건, SEQ 자동 채번) */
export async function createMap(input: {
  pageId: string;
  componentId: string;
  sortOrder: number;
  lastModifierId: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMP_MAP_INSERT, {
      pageId: input.pageId,
      componentId: input.componentId,
      sortOrder: input.sortOrder,
      lastModifierId: input.lastModifierId,
    });
  });
}

/** 매핑 전체 교체 — 페이지 저장 시 DELETE ALL + INSERT ALL (트랜잭션) */
export async function replaceAllMaps(input: {
  pageId: string;
  mappings: Array<{ componentId: string; sortOrder: number }>;
  lastModifierId: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    // 1. 기존 매핑 전체 삭제
    await conn.execute(COMP_MAP_DELETE_BY_PAGE, { pageId: input.pageId });

    // 2. 새 매핑 순서대로 INSERT
    for (const mapping of input.mappings) {
      await conn.execute(COMP_MAP_INSERT, {
        pageId: input.pageId,
        componentId: mapping.componentId,
        sortOrder: mapping.sortOrder,
        lastModifierId: input.lastModifierId,
      });
    }
  });
}

/** 매핑 순서 변경 */
export async function updateMapOrder(seq: number, sortOrder: number, lastModifierId: string): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMP_MAP_UPDATE_ORDER, { seq, sortOrder, lastModifierId });
  });
}

/** 매핑 삭제 (단건) */
export async function deleteMap(seq: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.execute(COMP_MAP_DELETE, { seq });
  });
}
