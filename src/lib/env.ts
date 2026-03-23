// src/lib/env.ts
// 서버 사이드 전용 — NEXT_PUBLIC_ prefix 없는 환경변수는 클라이언트 번들에 포함되지 않습니다.

/**
 * 필수 환경변수 반환
 * 값이 없으면 즉시 예외를 발생시킵니다. 서버 시작 시 조기 검증에 활용합니다.
 */
export function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
    }
    return value;
}

/**
 * 선택 환경변수 반환
 * 값이 없으면 defaultValue를 반환합니다.
 */
export function optionalEnv(key: string, defaultValue = ''): string {
    return process.env[key] ?? defaultValue;
}

// ── AI 서비스 ──
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
export const FAL_API_KEY = process.env.FAL_API_KEY ?? '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

// ── 파일 업로드 ──
export const UPLOAD_PATH_ENV = process.env.UPLOAD_PATH || 'public/uploads/';
export const UPLOAD_URL_ENV = process.env.UPLOAD_URL || 'uploads/';

// ── Oracle DB ──
export const ORACLE_USER = process.env.ORACLE_USER ?? '';
export const ORACLE_PASSWORD = process.env.ORACLE_PASSWORD ?? '';
export const ORACLE_HOST = process.env.ORACLE_HOST ?? '';
export const ORACLE_PORT = process.env.ORACLE_PORT ?? '1521';
export const ORACLE_SERVICE = process.env.ORACLE_SERVICE ?? '';
export const ORACLE_SCHEMA = process.env.ORACLE_SCHEMA ?? '';
