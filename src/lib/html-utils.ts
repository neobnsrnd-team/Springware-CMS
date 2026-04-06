// src/lib/html-utils.ts
// HTML 처리 공통 유틸리티

/** HTML 특수문자 이스케이프 (XSS 방지) */
export const escapeHtml = (str: string): string =>
    str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] ?? m);
