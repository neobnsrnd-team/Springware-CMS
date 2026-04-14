// src/lib/page-file.ts
// 페이지 HTML 파일 읽기 유틸리티 (서버 전용 — API Route, 서버 컴포넌트에서만 사용)
// 기존 데이터 호환용 폴백 — PAGE_HTML NULL인 레거시 페이지 지원

import fs from 'fs/promises';
import path from 'path';

/** FILE_PATH 기반 HTML 파일 읽기. 파일 없으면 null 반환. */
export async function readPageHtml(filePath: string): Promise<string | null> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
        return await fs.readFile(fullPath, 'utf-8');
    } catch {
        return null;
    }
}
