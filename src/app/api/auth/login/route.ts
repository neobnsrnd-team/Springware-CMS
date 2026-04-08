// src/app/api/auth/login/route.ts
// 로그인 API — 사용자 검증 후 서명된 JWT 발급
// 1단계: demo-users.ts 기반 (2단계에서 DB 사용자 테이블로 교체 예정)

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

import { findDemoUser } from '@/data/demo-users';
import { errorResponse } from '@/lib/api-response';

const JWT_SECRET_RAW = process.env.JWT_SECRET ?? '';
const JWT_EXPIRES_IN = '8h';

/** JWT 서명 키 — TextEncoder로 Uint8Array 변환 (jose 요구사항) */
function getSecretKey(): Uint8Array {
    return new TextEncoder().encode(JWT_SECRET_RAW);
}

export async function POST(req: NextRequest) {
    if (!JWT_SECRET_RAW) {
        console.error('[로그인] JWT_SECRET 환경변수가 설정되지 않았습니다.');
        return errorResponse('서버 설정 오류입니다.', 500);
    }

    let userId: string | undefined;
    let password: string | undefined;
    try {
        const body = (await req.json()) as { userId?: string; password?: string };
        userId = body.userId;
        password = body.password;
    } catch {
        return errorResponse('요청 본문이 올바르지 않습니다.', 400);
    }

    if (!userId || !password) {
        return errorResponse('아이디와 비밀번호를 입력해 주세요.', 400);
    }

    // TODO: 2단계 — DB 사용자 테이블 조회 + bcrypt 비밀번호 검증으로 교체
    const user = findDemoUser(userId);
    if (user.userId === 'system' && userId !== 'system') {
        // findDemoUser는 없는 userId일 때 system으로 폴백 — 미존재 사용자 차단
        return errorResponse('아이디 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    // JWT 발급
    const token = await new SignJWT({ userId: user.userId, userName: user.userName, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(getSecretKey());

    // HttpOnly 쿠키에 토큰 저장
    const response = NextResponse.json({ ok: true, userId: user.userId, userName: user.userName, role: user.role });
    response.cookies.set('cms-token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}
