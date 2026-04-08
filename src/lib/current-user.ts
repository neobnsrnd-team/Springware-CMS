// src/lib/current-user.ts
// 현재 로그인 사용자 정보 — JWT 기반 (HttpOnly 쿠키)

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface CurrentUser {
    userId: string;
    userName: string;
    role: 'admin' | 'user';
}

interface JwtPayload {
    userId: string;
    userName: string;
    role: 'admin' | 'user';
}

const JWT_SECRET_RAW = process.env.JWT_SECRET ?? '';

function getSecretKey(): Uint8Array {
    return new TextEncoder().encode(JWT_SECRET_RAW);
}

/**
 * 현재 사용자 반환 — cms-token 쿠키의 JWT 검증
 * 토큰 없음·검증 실패 시 비로그인 사용자(system/user)로 폴백
 * TODO: 2단계 — 폴백 제거 후 미인증 시 명시적 401 처리로 전환
 */
export async function getCurrentUser(): Promise<CurrentUser> {
    const cookieStore = await cookies();
    const token = cookieStore.get('cms-token')?.value;

    if (!token || !JWT_SECRET_RAW) {
        return { userId: 'system', userName: '시스템', role: 'user' };
    }

    try {
        const { payload } = await jwtVerify<JwtPayload>(token, getSecretKey());
        return {
            userId: payload.userId,
            userName: payload.userName,
            role: payload.role,
        };
    } catch {
        // 서명 검증 실패·만료 — 비로그인으로 처리
        return { userId: 'system', userName: '시스템', role: 'user' };
    }
}
