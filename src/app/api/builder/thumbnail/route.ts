// src/app/api/builder/thumbnail/route.ts

import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';

import { successResponse, contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';

// 썸네일 저장 디렉토리 (public/uploads/pages/thumbnails/)
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'uploads', 'pages', 'thumbnails');

// 썸네일 URL 프리픽스
const THUMBNAIL_URL_PREFIX = '/uploads/pages/thumbnails';

// 썸네일 JPG 파일 저장
async function saveThumbnailFile(pageId: string, buffer: Buffer): Promise<string> {
    await mkdir(THUMBNAIL_DIR, { recursive: true });

    const filename = `${pageId}_thumb.jpg`;
    const filePath = path.join(THUMBNAIL_DIR, filename);
    await writeFile(filePath, buffer);

    return `${THUMBNAIL_URL_PREFIX}/${filename}`;
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser(); // 사용자 인증 확인
        if (!canWriteCms(currentUser)) {
            return contentBuilderErrorResponse('권한이 없습니다.');
        }

        const formData = await req.formData();
        const fileValue = formData.get('file');
        const pageIdValue = formData.get('pageId');

        const file = fileValue instanceof File ? fileValue : null;
        const pageId = typeof pageIdValue === 'string' ? pageIdValue : null;

        if (!file) {
            return contentBuilderErrorResponse('썸네일 파일이 없습니다.');
        }

        if (!pageId || !isValidBankId(pageId)) {
            return contentBuilderErrorResponse('유효하지 않은 페이지 ID입니다.');
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const thumbnailPath = await saveThumbnailFile(pageId, buffer);

        return successResponse({ thumbnailPath }, 201);
    } catch (err: unknown) {
        console.error('썸네일 저장 실패:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
