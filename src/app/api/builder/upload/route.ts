import crypto from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { NextRequest } from 'next/server';

import { createAsset } from '@/db/repository/asset.repository';
import { contentBuilderErrorResponse, successResponse, getErrorMessage } from '@/lib/api-response';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { ASSET_UPLOAD_DIR, ASSET_BASE_URL } from '@/lib/env';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return contentBuilderErrorResponse('File is required.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const assetId = crypto.randomUUID();
    const assetName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    try {
        const currentUser = await getCurrentUser();
        if (!canWriteCms(currentUser)) {
            return contentBuilderErrorResponse('Permission denied.');
        }
        const { userId, userName } = currentUser;

        // 파일 시스템에 저장
        const filename = `${assetId}_${assetName}`;
        const filepath = join(ASSET_UPLOAD_DIR, filename);
        await mkdir(dirname(filepath), { recursive: true });
        await writeFile(filepath, buffer);
        const assetUrl = `${ASSET_BASE_URL}/${filename}`;

        try {
            await createAsset({
                assetId,
                assetName,
                mimeType: file.type || 'application/octet-stream',
                fileSize: buffer.length,
                assetPath: filepath,
                assetUrl,
                createUserId: userId,
                createUserName: userName,
            });
        } catch (dbErr: unknown) {
            // DB 실패 시 고아 파일 정리
            await unlink(filepath).catch(() => {});
            throw dbErr;
        }

        return successResponse({ url: assetUrl }, 201);
    } catch (err: unknown) {
        console.error('File upload failed:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
