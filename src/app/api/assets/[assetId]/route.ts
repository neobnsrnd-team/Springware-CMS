// src/app/api/assets/[assetId]/route.ts
// 에셋 단건 삭제 API

import { unlink } from 'fs/promises';

import { NextRequest } from 'next/server';

import { deleteAsset, getAssetById } from '@/db/repository/asset.repository';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

/** DELETE /api/assets/:assetId — 에셋 논리 삭제 (USE_YN = 'N') + 물리 파일 삭제 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    try {
        const { assetId } = await params;

        const asset = await getAssetById(assetId);
        if (!asset) {
            return errorResponse('에셋을 찾을 수 없습니다.', 404);
        }

        const currentUser = await getCurrentUser();
        if (!canWriteCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }
        const { userId, userName } = currentUser;

        // DB 논리 삭제
        await deleteAsset(assetId, userId, userName);

        // 물리 파일 삭제 (없어도 무시)
        if (asset.ASSET_PATH) {
            await unlink(asset.ASSET_PATH).catch(() => {});
        }

        return successResponse({ deleted: assetId });
    } catch (err: unknown) {
        console.error('에셋 삭제 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
