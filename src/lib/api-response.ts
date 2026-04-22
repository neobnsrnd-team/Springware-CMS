// src/lib/api-response.ts

import { NextResponse } from 'next/server';

/** 에러 객체에서 메시지 문자열 추출 */
export function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
}

/** 일반 API 성공 응답 (HTTP 200) */
export function successResponse<T extends Record<string, unknown>>(
    data?: T,
    status = 200,
    headers?: Record<string, string>,
): NextResponse {
    return NextResponse.json({ ok: true, ...data }, { status, headers });
}

/**
 * 일반 API 에러 응답 (HTTP 4xx/5xx)
 * ContentBuilder와 무관한 일반 Next.js API에서 사용합니다.
 */
export function errorResponse(message: string, status = 500, headers?: Record<string, string>): NextResponse {
    return NextResponse.json({ ok: false, error: message }, { status, headers });
}

/**
 * ContentBuilder 라이브러리 규약 에러 응답
 * HTTP 200 + `{ ok: false, error }` 형식 — 라이브러리가 body.ok로 성공 여부를 판별합니다.
 */
export function contentBuilderErrorResponse(message: string): NextResponse {
    return NextResponse.json({ ok: false, error: message });
}
