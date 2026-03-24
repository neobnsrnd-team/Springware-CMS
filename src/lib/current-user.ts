// 현재 로그인 사용자 정보
// TODO: 로그인 기능 구현 시 세션/토큰 기반으로 교체
export interface CurrentUser {
    userId: string;
    userName: string;
}

/** 현재 사용자 반환 — 로그인 미구현 상태에서는 'system' 고정 */
export function getCurrentUser(): CurrentUser {
    return {
        userId: 'system',
        userName: '시스템',
    };
}
