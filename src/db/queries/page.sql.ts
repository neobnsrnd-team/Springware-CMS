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

/** 페이지 목록 조회 (결재상태 + 생성자 필터 + 검색 + 정렬, 페이지네이션) */
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
        AND (:createUserName IS NULL OR CREATE_USER_NAME = :createUserName)
        AND (:search IS NULL OR PAGE_NAME LIKE '%' || :search || '%' OR CREATE_USER_NAME LIKE '%' || :search || '%')
        AND (:viewMode IS NULL OR VIEW_MODE = :viewMode)
      ORDER BY
        CASE WHEN :sortBy = 'name' THEN PAGE_NAME END ASC,
        CASE WHEN :sortBy != 'name' THEN LAST_MODIFIED_DTIME END DESC NULLS LAST
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
    AND (:createUserName IS NULL OR CREATE_USER_NAME = :createUserName)
    AND (:search IS NULL OR PAGE_NAME LIKE '%' || :search || '%' OR CREATE_USER_NAME LIKE '%' || :search || '%')
    AND (:viewMode IS NULL OR VIEW_MODE = :viewMode)
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
      FILE_PATH = NVL(:filePath, FILE_PATH),
      THUMBNAIL = :thumbnail,
      LAST_MODIFIER_ID = :lastModifierId,
      LAST_MODIFIER_NAME = :lastModifierName
  WHERE PAGE_ID = :pageId
    AND USE_YN = 'Y'
`;

/** 승인 요청 — APPROVE_STATE를 PENDING으로, 결재자 지정, 요청 시각 기록 */
export const PAGE_REQUEST_APPROVAL = `
  UPDATE SPW_CMS_PAGE
  SET APPROVE_STATE = 'PENDING',
      APPROVER_ID   = :approverId,
      APPROVER_NAME = :approverName,
      CONFIRM_DTIME = SYSTIMESTAMP
  WHERE PAGE_ID     = :pageId
    AND APPROVE_STATE IN ('WORK', 'REJECTED')
`;

/** 결재 상태 변경 */
export const PAGE_UPDATE_APPROVE_STATE = `
  UPDATE SPW_CMS_PAGE
  SET APPROVE_STATE = :approveState,
      APPROVER_ID = :approverId,
      APPROVER_NAME = :approverName,
      APPROVE_DATE = SYSTIMESTAMP,
      REJECTED_REASON = :rejectedReason,
      BEGINNING_DATE = TO_DATE(:beginningDate, 'YYYY-MM-DD'),
      EXPIRED_DATE = TO_DATE(:expiredDate, 'YYYY-MM-DD'),
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;

/** 승인된 페이지 시작일/만료일 수정 — 관리자 날짜 관리 */
export const PAGE_UPDATE_DATES = `
  UPDATE SPW_CMS_PAGE
  SET BEGINNING_DATE = TO_DATE(:beginningDate, 'YYYY-MM-DD'),
      EXPIRED_DATE = TO_DATE(:expiredDate, 'YYYY-MM-DD'),
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
    AND APPROVE_STATE = 'APPROVED'
`;

/** 재수정 시 APPROVE_STATE → WORK 전환 (APPROVED/REJECTED만 대상) */
export const PAGE_RESET_TO_WORK = `
  UPDATE SPW_CMS_PAGE
  SET APPROVE_STATE = 'WORK',
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
    AND APPROVE_STATE IN ('APPROVED', 'REJECTED')
`;

/** 만료 페이지 조회 — EXPIRED_DATE 경과 + 공개 + 사용 중인 페이지 */
export const PAGE_SELECT_EXPIRED = `
  SELECT *
  FROM SPW_CMS_PAGE
  WHERE EXPIRED_DATE < TRUNC(SYSDATE)
    AND IS_PUBLIC = 'Y'
    AND USE_YN = 'Y'
`;

/** IS_PUBLIC 단건 업데이트 — 관리자 긴급 차단/해제 */
export const PAGE_UPDATE_IS_PUBLIC = `
  UPDATE SPW_CMS_PAGE
  SET IS_PUBLIC = :isPublic,
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;

/** 만료 처리 — IS_PUBLIC='N', FILE_PATH_BACK 기록 (USE_YN은 유지 — 대시보드 노출) */
export const PAGE_EXPIRE = `
  UPDATE SPW_CMS_PAGE
  SET IS_PUBLIC = 'N',
      FILE_PATH_BACK = :filePathBack,
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;

/** 소프트 삭제 — 승인된 페이지 (USE_YN = 'N', HISTORY 보존) */
export const PAGE_SOFT_DELETE = `
  UPDATE SPW_CMS_PAGE
  SET USE_YN = 'N',
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;

/** 하드 삭제 — 미승인 페이지 (레코드 물리적 삭제) */
export const PAGE_HARD_DELETE = `
  DELETE FROM SPW_CMS_PAGE
  WHERE PAGE_ID = :pageId
`;

/** COMP_PAGE_MAP 전체 삭제 (페이지 하드 삭제 시 연관 매핑 정리) */
export const COMP_MAP_DELETE_BY_PAGE = `
  DELETE FROM SPW_CMS_COMP_PAGE_MAP
  WHERE PAGE_ID = :pageId
`;

/** 배포 완료 후 무결성 값 갱신 — 시작일/만료일은 승인 시점에 이미 설정 */
export const PAGE_UPDATE_DEPLOY = `
  UPDATE SPW_CMS_PAGE
  SET FILE_CRC_VALUE  = :fileCrcValue,
      LAST_MODIFIER_ID = :lastModifierId
  WHERE PAGE_ID = :pageId
`;
