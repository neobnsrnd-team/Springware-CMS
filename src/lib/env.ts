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
export const OPENROUTER_API_KEY = optionalEnv('OPENROUTER_API_KEY');
export const OPENAI_API_KEY = optionalEnv('OPENAI_API_KEY');
export const FAL_API_KEY = optionalEnv('FAL_API_KEY');
export const GEMINI_API_KEY = optionalEnv('GEMINI_API_KEY');

// ── 브랜드 테마 ──
export const BANK_BRAND = optionalEnv('BANK_BRAND', '');

// ── git 자동 커밋·푸시 ──
export const GIT_AUTO_COMMIT = optionalEnv('GIT_AUTO_COMMIT', 'false');
export const GIT_USER_NAME = optionalEnv('GIT_USER_NAME', 'Springware CMS');
export const GIT_USER_EMAIL = optionalEnv('GIT_USER_EMAIL', 'cms@springware.local');
export const GIT_BRANCH = optionalEnv('GIT_BRANCH', 'main');

// ── Oracle DB ──
export const ORACLE_USER = optionalEnv('ORACLE_USER');
export const ORACLE_PASSWORD = optionalEnv('ORACLE_PASSWORD');
export const ORACLE_HOST = optionalEnv('ORACLE_HOST');
export const ORACLE_PORT = optionalEnv('ORACLE_PORT', '1521');
export const ORACLE_SERVICE = optionalEnv('ORACLE_SERVICE');
export const ORACLE_SCHEMA = optionalEnv('ORACLE_SCHEMA');
