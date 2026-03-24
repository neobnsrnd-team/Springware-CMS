// src/lib/current-user.ts
// 현재 로그인 사용자 정보 — cookie 기반 (데모용)
// TODO: 로그인 기능 구현 시 세션/토큰 기반으로 교체

import { cookies } from 'next/headers';

import { findDemoUser } from '@/data/demo-users';

export interface CurrentUser {
    userId: string;
    userName: string;
    role: 'admin' | 'user';
}

/** 현재 사용자 반환 — cookie에서 userId 읽기, 미설정 시 'system' 폴백 */
export async function getCurrentUser(): Promise<CurrentUser> {
    const cookieStore = await cookies();
    const userId = cookieStore.get('cms-user')?.value ?? 'system';
    const user = findDemoUser(userId);
    return {
        userId: user.userId,
        userName: user.userName,
        role: user.role,
    };
}
