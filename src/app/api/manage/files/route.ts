// src/app/api/manage/files/route.ts
// 승인된 이미지 목록 조회 — DEPLOYED_UPLOAD_DIR/img 기준 (읽기 전용, 페이지네이션)

import fs from 'fs';
import path from 'path';

import { NextRequest } from 'next/server';

import { DEPLOYED_UPLOAD_DIR, DEPLOYED_BASE_URL, DEPLOYED_IMG_SUBDIR } from '@/lib/env';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

const PAGE_SIZE = 24;

/** 절대 경로 해석 */
function resolveDeployedRoot(): string {
    return path.isAbsolute(DEPLOYED_UPLOAD_DIR) ? DEPLOYED_UPLOAD_DIR : path.join(process.cwd(), DEPLOYED_UPLOAD_DIR);
}

/** URL prefix 정규화 — 끝 슬래시 보장 */
function normalizeBaseUrl(): string {
    return DEPLOYED_BASE_URL.endsWith('/') ? DEPLOYED_BASE_URL : `${DEPLOYED_BASE_URL}/`;
}

/**
 * GET /api/manage/files?page=N&path=<상대경로>
 * - path는 img 루트 기준 상대 경로 (빈 문자열 = img 루트 자체)
 * - img 디렉토리 범위 이탈 차단
 */
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
        const relativePath = searchParams.get('path') || '';

        // 보안: 디렉토리 트래버설 방지
        if (relativePath.includes('..')) {
            return errorResponse('유효하지 않은 경로입니다.', 400);
        }

        // 이미지 루트를 베이스로 고정 (env.DEPLOYED_IMG_SUBDIR)
        const imgRoot = path.join(resolveDeployedRoot(), DEPLOYED_IMG_SUBDIR);
        const absolutePath = path.join(imgRoot, relativePath);

        // 보안: 이미지 루트 범위 이탈 방지
        if (!absolutePath.startsWith(imgRoot)) {
            return errorResponse('유효하지 않은 경로입니다.', 400);
        }

        if (!fs.existsSync(absolutePath)) {
            // 아직 이미지 폴더가 없는 경우(승인된 이미지 0건)에도 빈 목록 반환
            return successResponse({
                files: [],
                hasMore: false,
                nextPage: null,
                currentPath: relativePath,
            });
        }

        const baseUrl = normalizeBaseUrl();

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
                    url: `${baseUrl}${urlPath}`,
                    modified: stats.mtime.getTime(),
                };
            })
            // 디렉토리 우선, 이후 최신순 정렬
            .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return b.modified - a.modified;
            });

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
