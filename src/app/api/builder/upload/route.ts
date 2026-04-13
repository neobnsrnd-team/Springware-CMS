// src/app/api/builder/upload/route.ts

import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { createAsset } from '@/db/repository/asset.repository';
import { getCurrentUser } from '@/lib/current-user';
import { contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return contentBuilderErrorResponse('파일이 없습니다.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(' ', '_');
    const assetId = crypto.randomUUID();

    try {
        const { userId, userName } = await getCurrentUser();

        await createAsset({
            assetId,
            assetName: filename,
            mimeType: file.type || 'application/octet-stream',
            fileSize: buffer.length,
            assetData: buffer,
            createUserId: userId,
            createUserName: userName,
        });

        return NextResponse.json({ ok: true, url: `/api/assets/${assetId}/image` }, { status: 201 });
    } catch (err: unknown) {
        console.error('파일 업로드 실패:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
