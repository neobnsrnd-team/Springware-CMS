import crypto from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { NextRequest } from 'next/server';

import { createAsset } from '@/db/repository/asset.repository';
import { contentBuilderErrorResponse, successResponse, getErrorMessage } from '@/lib/api-response';
import { canAccessCmsEdit, getCurrentUser } from '@/lib/current-user';
import { ASSET_UPLOAD_DIR, ASSET_BASE_URL, SERVER_MODE } from '@/lib/env';

export async function POST(req: NextRequest) {
    if (SERVER_MODE === 'operation') {
        return contentBuilderErrorResponse('이미지 업로드는 관리자 서버에서만 가능합니다.');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return contentBuilderErrorResponse('File is required.');
    }

    // Spider Admin 연동용 선택 파라미터 — 없으면 현재 사용자·기본값 사용
    const bodyUserId = formData.get('userId')?.toString() || null;
    const bodyUserName = formData.get('userName')?.toString() || null;
    const businessCategory = formData.get('businessCategory')?.toString() || null;
    const assetDesc = formData.get('assetDesc')?.toString() || null;

    try {
        // 권한 체크는 파일 바이트 로드 전에 수행 — 권한 없는 대용량 업로드 조기 차단
        const currentUser = await getCurrentUser();
        if (!canAccessCmsEdit(currentUser)) {
            return contentBuilderErrorResponse('Permission denied.');
        }

        // 외부 userId가 주어지면 userName도 외부 값 우선 사용 — 감사 로그 짝 일관성 유지
        const userId = bodyUserId ?? currentUser.userId;
        const userName = bodyUserId ? (bodyUserName ?? userId) : currentUser.userName;

        const buffer = Buffer.from(await file.arrayBuffer());
        const assetId = crypto.randomUUID();
        const assetName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

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
                businessCategory: businessCategory ?? undefined,
                mimeType: file.type || 'application/octet-stream',
                fileSize: buffer.length,
                assetPath: filepath,
                assetUrl,
                assetDesc: assetDesc ?? undefined,
                createUserId: userId,
                createUserName: userName,
            });
        } catch (dbErr: unknown) {
            // DB 실패 시 고아 파일 정리
            await unlink(filepath).catch(() => {});
            throw dbErr;
        }

        return successResponse({ url: assetUrl, assetId }, 201);
    } catch (err: unknown) {
        console.error('File upload failed:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
