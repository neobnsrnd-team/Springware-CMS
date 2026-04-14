// src/app/api/assets/[assetId]/route.ts
// 에셋 단건 삭제 API

import { NextRequest } from 'next/server';

import { deleteAsset, getAssetMetaById } from '@/db/repository/asset.repository';
import { getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

/** DELETE /api/assets/:assetId — 에셋 논리 삭제 (USE_YN = 'N') */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    try {
        const { assetId } = await params;

        const asset = await getAssetMetaById(assetId);
        if (!asset) {
            return errorResponse('에셋을 찾을 수 없습니다.', 404);
        }

        const { userId, userName } = await getCurrentUser();
        await deleteAsset(assetId, userId, userName);

        return successResponse({ deleted: assetId });
    } catch (err: unknown) {
        console.error('에셋 삭제 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
