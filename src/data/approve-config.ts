// src/data/approve-config.ts
// 승인 관리 화면 필터 설정 — 서버/클라이언트 양쪽에서 공유

export type ApproveStateFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

export const APPROVE_FILTERS: { value: ApproveStateFilter | null; label: string }[] = [
    { value: null, label: '전체' },
    { value: 'PENDING', label: '승인대기' },
    { value: 'APPROVED', label: '승인' },
    { value: 'REJECTED', label: '반려' },
];

/** null 제외 상태 값 목록 — URL 파라미터 유효성 검사용 */
export const APPROVE_STATE_VALUES: ApproveStateFilter[] = APPROVE_FILTERS.map((f) => f.value).filter(
    (v): v is ApproveStateFilter => v !== null,
);
