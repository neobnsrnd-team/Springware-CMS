// ============================================================================
// Springware CMS — DB 테이블 TypeScript 인터페이스
// ============================================================================
// DDL 기준: V1__init_schema.sql (SPW_CMS_ 4개 + FWK_CMS_ 2개)

// ── 공통 타입 ──

export type ComponentType = 'finance' | 'basic';
export type ViewMode = 'mobile' | 'web' | 'responsive';
export type UseYn = 'Y' | 'N';
export type ApproveState = 'WORK' | 'PENDING' | 'APPROVED' | 'REJECTED';


// ── SPW_CMS_COMPONENT ──

export interface CmsComponent {
  COMPONENT_ID: string;
  COMPONENT_TYPE: ComponentType;
  VIEW_MODE: ViewMode;
  COMPONENT_THUMBNAIL: string | null;
  DATA: string | null;             // CLOB → string (fetchAsString), JSON.parse 필요
  USE_YN: UseYn;
  CREATE_USER_ID: string | null;
  CREATE_USER_NAME: string | null;
  LAST_MODIFIER_ID: string | null;
  LAST_MODIFIED_DTIME: Date | null;
}

/** DATA 컬럼을 파싱한 컴포넌트 (앱 레이어용) */
export interface CmsComponentParsed extends Omit<CmsComponent, 'DATA'> {
  DATA: Record<string, unknown> | null;
}


// ── SPW_CMS_PAGE ──

export interface CmsPage {
  PAGE_ID: string;
  PAGE_NAME: string;
  OWNER_DEPT_CODE: string | null;
  FILE_PATH: string | null;
  CREATE_USER_ID: string | null;
  CREATE_USER_NAME: string | null;
  LAST_MODIFIER_ID: string | null;
  LAST_MODIFIER_NAME: string | null;
  APPROVER_ID: string | null;
  APPROVER_NAME: string | null;
  CREATE_DATE: Date | null;
  CONFIRM_DTIME: Date | null;
  BEGINNING_DATE: Date | null;
  EXPIRED_DATE: Date | null;
  APPROVE_STATE: ApproveState;
  LAST_MODIFIED_DTIME: Date | null;
  PAGE_DESC: string | null;
  PAGE_DESC_DETAIL: string | null;
  TEMPLATE_ID: string | null;
  THUMBNAIL: string | null;
  VIEW_MODE: string | null;
  USER_GUIDE: string | null;
  FILE_PATH_BACK: string | null;
  REJECTED_REASON: string | null;
  USE_YN: UseYn;
  IS_PUBLIC: UseYn;
  APPROVE_DATE: Date | null;
  FILE_CRC_VALUE: string | null;
  FINAL_APPROVAL_STATE: string | null;
  FINAL_APPROVAL_DTIME: Date | null;
  FINAL_APPROVAL_USER_ID: string | null;
  FINAL_APPROVAL_USER_NAME: string | null;
}


// ── SPW_CMS_PAGE_HISTORY ──

export interface CmsPageHistory extends CmsPage {
  VERSION: number;
  SNAPSHOT_DTIME: Date | null;
  RENDERED_HTML: string | null;
}


// ── SPW_CMS_COMP_PAGE_MAP ──

export interface CmsCompPageMap {
  SEQ: number;
  PAGE_ID: string;
  COMPONENT_ID: string;
  SORT_ORDER: number;
  LAST_MODIFIER_ID: string | null;
  LAST_MODIFIED_DTIME: Date | null;
}


// ── FWK_CMS_FILE_SEND_HIS (AS-IS 참조) ──

export interface FileSendHistory {
  INSTANCE_ID: string;
  FILE_ID: string;
  FILE_SIZE: number | null;
  FILE_CRC_VALUE: string | null;
  LAST_MODIFIED_DTIME: Date | null;
  LAST_MODIFIER_ID: string | null;
}


// ── FWK_CMS_SERVER_INSTANCE (AS-IS 참조) ──

export interface ServerInstance {
  INSTANCE_ID: string;
  INSTANCE_NAME: string | null;
  INSTANCE_DESC: string | null;
  INSTANCE_IP: string | null;
  INSTANCE_PORT: number | null;
  CREATE_DTIME: Date | null;
  ALIVE_YN: UseYn | null;
  LAST_ALIVE_CHECK_DTIME: Date | null;
  SERVER_TYPE: string | null;
  LAST_MODIFIER_ID: string | null;
  LAST_MODIFIED_DTIME: Date | null;
}
