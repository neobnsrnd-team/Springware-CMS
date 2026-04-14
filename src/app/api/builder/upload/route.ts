import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { createAsset } from '@/db/repository/asset.repository';
import { contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return contentBuilderErrorResponse('File is required.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(' ', '_');
    const assetId = crypto.randomUUID();

    try {
        const currentUser = await getCurrentUser();
        if (!canWriteCms(currentUser)) {
            return contentBuilderErrorResponse('Permission denied.');
        }
        const { userId, userName } = currentUser;

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
        console.error('File upload failed:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
