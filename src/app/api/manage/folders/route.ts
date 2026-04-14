// src/app/api/manage/folders/route.ts
import fs from 'fs';
import path from 'path';

import { UPLOAD_PATH } from '@/lib/upload';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

interface FolderNode {
    name: string;
    path: string;
    children?: FolderNode[];
    isExpanded?: boolean;
}

function buildFolderTree(dirPath: string, basePath: string = '', relativePath: string = ''): FolderNode[] {
    const items = fs.readdirSync(dirPath);
    const folders: FolderNode[] = [];

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
            const children = buildFolderTree(fullPath, basePath, itemRelativePath);

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

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const absolutePath = path.join(process.cwd(), UPLOAD_PATH);

        if (!fs.existsSync(absolutePath)) {
            return successResponse({ folders: [] });
        }

        const folderTree = buildFolderTree(absolutePath);

        return successResponse({ folders: folderTree });
    } catch (err: unknown) {
        console.error('폴더 트리 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
