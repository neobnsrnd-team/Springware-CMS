// src/app/api/manage/folders/route.ts
// 승인된 이미지 폴더 트리 조회 — DEPLOYED_UPLOAD_DIR/img 기준 (읽기 전용)

import fs from 'fs';
import path from 'path';

import { DEPLOYED_UPLOAD_DIR, DEPLOYED_IMG_SUBDIR } from '@/lib/env';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

interface FolderNode {
    name: string;
    path: string;
    children?: FolderNode[];
    isExpanded?: boolean;
}

/** 승인 이미지 루트(img 폴더) 하위 디렉토리 재귀 탐색 */
function buildFolderTree(dirPath: string, relativePath: string = ''): FolderNode[] {
    if (!fs.existsSync(dirPath)) return [];

    const items = fs.readdirSync(dirPath);
    const folders: FolderNode[] = [];

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
            const children = buildFolderTree(fullPath, itemRelativePath);

            folders.push({
                name: item,
                path: itemRelativePath,
                children: children.length > 0 ? children : undefined,
                isExpanded: false,
            });
        }
    }

    return folders.sort((a, b) => a.name.localeCompare(b.name));
}

/** 절대 경로 해석 — DEPLOYED_UPLOAD_DIR가 상대경로면 process.cwd() 기준 */
function resolveDeployedRoot(): string {
    return path.isAbsolute(DEPLOYED_UPLOAD_DIR) ? DEPLOYED_UPLOAD_DIR : path.join(process.cwd(), DEPLOYED_UPLOAD_DIR);
}

/** GET /api/manage/folders — 승인 이미지 폴더 트리 (루트 고정: img) */
export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const imgRoot = path.join(resolveDeployedRoot(), DEPLOYED_IMG_SUBDIR);

        // 루트 이름·경로 모두 env (DEPLOYED_IMG_SUBDIR) 에서 가져옴
        // 하위 디렉토리는 실제 파일시스템 구조 그대로 반영
        const children = buildFolderTree(imgRoot);

        const root: FolderNode = {
            name: DEPLOYED_IMG_SUBDIR,
            path: '', // 빈 경로 = 이미지 루트 자체 (files route에서 path 파라미터로 공백 전달)
            children: children.length > 0 ? children : undefined,
            isExpanded: true,
        };

        return successResponse({ folders: [root] });
    } catch (err: unknown) {
        console.error('폴더 트리 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
