// ============================================================================
// SPW_CMS_COMP_PAGE_MAP — 컴포넌트-페이지 매핑 SQL 맵퍼
// ============================================================================

/** 페이지의 컴포넌트 매핑 목록 (정렬순, 컴포넌트 정보 JOIN) */
export const COMP_MAP_SELECT_BY_PAGE = `
  SELECT m.SEQ, m.PAGE_ID, m.COMPONENT_ID, m.SORT_ORDER,
         m.LAST_MODIFIER_ID, m.LAST_MODIFIED_DTIME,
         c.COMPONENT_TYPE, c.VIEW_MODE, c.COMPONENT_THUMBNAIL
  FROM SPW_CMS_COMP_PAGE_MAP m
  JOIN SPW_CMS_COMPONENT c ON m.COMPONENT_ID = c.COMPONENT_ID
  WHERE m.PAGE_ID = :pageId
  ORDER BY m.SORT_ORDER
`;

/** 매핑 추가 (SEQ는 TRG_SPW_COMP_MAP_SEQ 트리거에서 자동 채번) */
export const COMP_MAP_INSERT = `
  INSERT INTO SPW_CMS_COMP_PAGE_MAP (
    SEQ, PAGE_ID, COMPONENT_ID, SORT_ORDER, LAST_MODIFIER_ID
  ) VALUES (
    NULL, :pageId, :componentId, :sortOrder, :lastModifierId
  )
`;

/** 매핑 정렬 순서 변경 */
export const COMP_MAP_UPDATE_ORDER = `
  UPDATE SPW_CMS_COMP_PAGE_MAP
  SET SORT_ORDER = :sortOrder,
      LAST_MODIFIER_ID = :lastModifierId
  WHERE SEQ = :seq
`;

/** 특정 매핑 삭제 */
export const COMP_MAP_DELETE = `
  DELETE FROM SPW_CMS_COMP_PAGE_MAP
  WHERE SEQ = :seq
`;

/** 페이지의 모든 매핑 삭제 (저장 시 전체 재생성 패턴) */
export const COMP_MAP_DELETE_BY_PAGE = `
  DELETE FROM SPW_CMS_COMP_PAGE_MAP
  WHERE PAGE_ID = :pageId
`;
