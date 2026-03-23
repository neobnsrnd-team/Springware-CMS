// src/app/api/manage/folders/route.ts
import fs from 'fs';
import path from 'path';

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';

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
            isExpanded: false
        });
        }
    }

    return folders.sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET() {
    try {
        const absolutePath = path.join(process.cwd(), UPLOAD_PATH);
        
        if (!fs.existsSync(absolutePath)) {
            return Response.json({ folders: [] });
        }

        const folderTree = buildFolderTree(absolutePath);
        
        return Response.json({ 
            folders: folderTree
        });
    } catch (error) {
        console.error('폴더 트리 조회 실패:', error);
        return Response.json({ error: '폴더 트리 조회에 실패했습니다.' }, { status: 500 });
    }
}