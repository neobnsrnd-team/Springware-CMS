// src/app/api/manage/files/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

import { UPLOAD_PATH, UPLOAD_URL } from '@/lib/upload';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';
const PAGE_SIZE = 10; // 페이지당 파일 수

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const relativePath = searchParams.get('path') || '';

        // 보안: 디렉토리 트래버설 방지
        if (relativePath.includes('..')) {
            return errorResponse('유효하지 않은 경로입니다.', 400);
        }

        const absoluteBasePath = path.join(process.cwd(), UPLOAD_PATH);
        const absolutePath = path.join(absoluteBasePath, relativePath);

        // 보안: uploads 디렉토리 범위 이탈 방지
        if (!absolutePath.startsWith(absoluteBasePath)) {
            return errorResponse('유효하지 않은 경로입니다.', 400);
        }

        if (!fs.existsSync(absolutePath)) {
            return errorResponse('디렉토리를 찾을 수 없습니다.', 404);
        }

        const allFiles = fs
            .readdirSync(absolutePath)
            .map((file) => {
                const filePath = path.join(absolutePath, file);
                const stats = fs.statSync(filePath);
                const urlPath = relativePath ? `${relativePath}/${file}` : file;

                return {
                    name: file,
                    size: stats.size,
                    isDirectory: stats.isDirectory(),
                    url: `${UPLOAD_URL}${urlPath}`,
                    modified: stats.mtime.getTime(),
                };
            })
            // 디렉토리 우선, 이후 최신순 정렬
            .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return b.modified - a.modified;
            });

        // offset 기반 페이지네이션
        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedFiles = allFiles.slice(startIndex, startIndex + PAGE_SIZE);
        const hasMore = startIndex + PAGE_SIZE < allFiles.length;

        return successResponse({
            files: paginatedFiles,
            hasMore,
            nextPage: hasMore ? page + 1 : null,
            currentPath: relativePath,
        });
    } catch (err: unknown) {
        console.error('파일 목록 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
