// ============================================================================
// SPW_CMS_PAGE — 페이지 테이블 SQL 맵퍼
// ============================================================================

/** 페이지 단건 조회 */
export const PAGE_SELECT_BY_ID = `
  SELECT *
  FROM SPW_CMS_PAGE
  WHERE PAGE_ID = :pageId
    AND USE_YN = 'Y'
`;

/** 페이지 목록 조회 (결재상태 + 생성자 필터, 페이지네이션) */
export const PAGE_SELECT_LIST = `
  SELECT *
  FROM (
    SELECT p.*, ROWNUM AS RN
    FROM (
      SELECT *
      FROM SPW_CMS_PAGE
      WHERE USE_YN = 'Y'
        AND (:approveState IS NULL OR APPROVE_STATE = :approveState)
        AND (:createUserId IS NULL OR CREATE_USER_ID = :createUserId)
      ORDER BY LAST_MODIFIED_DTIME DESC
    ) p
    WHERE ROWNUM <= :endRow
  )
  WHERE RN > :startRow
`;

/** 페이지 총 건수 조회 (페이지네이션용) */
export const PAGE_COUNT = `
  SELECT COUNT(*) AS TOTAL_COUNT
  FROM SPW_CMS_PAGE
  WHERE USE_YN = 'Y'
    AND (:approveState IS NULL OR APPROVE_STATE = :approveState)
    AND (:createUserId IS NULL OR CREATE_USER_ID = :createUserId)
`;

/** 페이지 신규 생성 (W-3: VIEW_MODE 바인딩 추가) */
export const PAGE_INSERT = `
  INSERT INTO SPW_CMS_PAGE (
    PAGE_ID, PAGE_NAME, VIEW_MODE, OWNER_DEPT_CODE, FILE_PATH,
    CREATE_USER_ID, CREATE_USER_NAME,
    LAST_MODIFIER_ID, LAST_MODIFIER_NAME,
    APPROVE_STATE, PAGE_DESC, PAGE_DESC_DETAIL,
    TEMPLATE_ID, THUMBNAIL, TARGET_CD, USE_YN, IS_PUBLIC
  ) VALUES (
    :pageId, :pageName, NVL(:viewMode, 'mobile'), :ownerDeptCode, :filePath,
    :createUserId, :createUserName,
    :lastModifierId, :lastModifierName,
    'WORK', :pageDesc, :pageDescDetail,
    :templateId, :thumbnail, :targetCd, 'Y', 'Y'
  )
`;

/** 페이지 내용 수정 (에디터 저장 시, W-3: VIEW_MODE 추가) */
export const PAGE_UPDATE = `
  UPDATE SPW_CMS_PAGE
  SET PAGE_NAME = NVL(:pageName, PAGE_NAME),
      VIEW_MODE = NVL(:viewMode, VIEW_MODE),
      PAGE_DESC = :pageDesc,
      PAGE_DESC_DETAIL = :pageDescDetail,
      FILE_PATH = :filePath,
      THUMBNAIL = :thumbnail,
      LAST_MODIFIER_ID = :lastModifierId,
      LAST_MODIFIER_NAME = :lastModifierName
  WHERE PAGE_ID = :pageId
    AND USE_YN = 'Y'
`;

/** 결재 상태 변경 */
export const PAGE_UPDATE_APPROVE_STATE = `
  UPDATE SPW_CMS_PAGE
  SET APPROVE_STATE = :approveState,
      APPROVER_ID = :approverId,
      APPROVER_NAME = :approverName,
      APPROVE_DATE = SYSTIMESTAMP,
      REJECTED_REASON = :rejectedReason,
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;

/** 논리 삭제 (USE_YN = 'N') */
export const PAGE_DELETE = `
  UPDATE SPW_CMS_PAGE
  SET USE_YN = 'N',
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;
