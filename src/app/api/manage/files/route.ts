// src/app/api/assets/files/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || "uploads/");
const PAGE_SIZE = 10; // Files per page

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const relativePath = searchParams.get('path') || '';
        
        // Security: prevent directory traversal
        if (relativePath.includes('..')) {
            return Response.json({ error: '유효하지 않은 경로입니다.' }, { status: 400 });
        }
        
        const absolutePath = path.join(process.cwd(), UPLOAD_PATH, relativePath);
        
        if (!fs.existsSync(absolutePath)) {
            return Response.json({ error: '디렉토리를 찾을 수 없습니다.' }, { status: 404 });
        }

        const allFiles = fs.readdirSync(absolutePath).map(file => {
            const filePath = path.join(absolutePath, file);
            const stats = fs.statSync(filePath);
            const urlPath = relativePath ? `${relativePath}/${file}` : file;
            
            return {
                name: file,
                size: stats.size,
                isDirectory: stats.isDirectory(),
                url: `${UPLOAD_URL}${urlPath}`, // must start with "/"
                modified: stats.mtime.getTime(),
            };
        })
        // Sort: directories first, then by newest
        .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return b.modified - a.modified;
        });

        // Simple offset-based pagination
        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedFiles = allFiles.slice(startIndex, startIndex + PAGE_SIZE);
        const hasMore = startIndex + PAGE_SIZE < allFiles.length;
        
        return Response.json({ 
            files: paginatedFiles,
            hasMore,
            nextPage: hasMore ? page + 1 : null,
            currentPath: relativePath
        });
    } catch (error) {
        console.error('파일 목록 조회 실패:', error);
        return Response.json({ error: '파일 목록 조회에 실패했습니다.' }, { status: 500 });
    }
}

function normalizeUploadUrl(url: string): string {
    let safe = url.trim();

    // Case 1: Absolute URL (http/https)
    if (/^https?:\/\//i.test(safe)) {
        return safe.endsWith("/") ? safe : safe + "/";
    }

    // Case 2: Relative server path
    if (!safe.startsWith("/")) {
        safe = "/" + safe;
    }

    if (!safe.endsWith("/")) {
        safe += "/";
    }

    // Collapse duplicate slashes (but keep // in http://)
    safe = safe.replace(/([^:]\/)\/+/g, "$1");

    return safe;
}