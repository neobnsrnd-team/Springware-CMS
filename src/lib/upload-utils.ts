// src/lib/upload-utils.ts

/** 업로드 URL을 절대 경로(슬래시로 시작·끝)로 정규화 */
export function normalizeUploadUrl(url: string): string {
    let safe = url.trim();

    // 절대 URL (http/https)
    if (/^https?:\/\//i.test(safe)) {
        return safe.endsWith('/') ? safe : safe + '/';
    }

    // 상대 경로
    if (!safe.startsWith('/')) {
        safe = '/' + safe;
    }

    if (!safe.endsWith('/')) {
        safe += '/';
    }

    // 중복 슬래시 제거 (http:// 유지)
    safe = safe.replace(/([^:]\/)\/+/g, '$1');

    return safe;
}
