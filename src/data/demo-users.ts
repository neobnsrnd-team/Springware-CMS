// src/data/demo-users.ts
// 임시 사용자 데이터 — 로그인 미구현 상태에서 개발/데모용으로 사용
// TODO: 실제 로그인 시스템 도입 시 제거

type UserRole = 'admin' | 'user';

export interface DemoUser {
    userId: string;
    userName: string;
    role: UserRole;
}

// 기본 사용자 ID — 폴백 및 초기값으로 사용
export const DEFAULT_USER_ID = 'system';

export const DEMO_USERS: DemoUser[] = [
    { userId: 'admin', userName: '관리자', role: 'admin' },
    { userId: 'system', userName: '시스템', role: 'user' },
    { userId: 'user1', userName: '김담당', role: 'user' },
    { userId: 'user2', userName: '시연자', role: 'user' },
];

/** userId로 데모 사용자 조회. 없으면 system 폴백 */
export function findDemoUser(userId: string): DemoUser {
    return DEMO_USERS.find((u) => u.userId === userId)
        ?? DEMO_USERS.find((u) => u.userId === DEFAULT_USER_ID)!;
}
