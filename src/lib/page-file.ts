// src/lib/page-file.ts
// 페이지 HTML 파일 읽기/쓰기 유틸리티 (서버 전용 — API Route, 서버 컴포넌트에서만 사용)

import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'public', 'uploads', 'pages');

/** HTML 파일 저장. 디렉토리 없으면 자동 생성. DB에 기록할 FILE_PATH 반환. */
export async function writePageHtml(pageId: string, html: string): Promise<string> {
    await fs.mkdir(PAGES_DIR, { recursive: true });
    const filePath = `/uploads/pages/${pageId}.html`;
    const fullPath = path.join(PAGES_DIR, `${pageId}.html`);
    await fs.writeFile(fullPath, html, 'utf-8');
    return filePath;
}

/** FILE_PATH 기반 HTML 파일 읽기. 파일 없으면 null 반환. */
export async function readPageHtml(filePath: string): Promise<string | null> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
        return await fs.readFile(fullPath, 'utf-8');
    } catch {
        return null;
    }
}

/** FILE_PATH 기반 HTML 파일 삭제. 파일 없으면(ENOENT) 무시, 그 외 에러는 rethrow. */
export async function deletePageHtml(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    try {
        await fs.unlink(fullPath);
    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            return; // 파일이 이미 없으면 무시
        }
        throw error;
    }
}
