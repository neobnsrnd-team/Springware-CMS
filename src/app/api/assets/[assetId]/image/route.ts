// src/app/api/assets/[assetId]/image/route.ts
// 에셋 이미지 URL redirect API (하위 호환)

import { NextRequest } from 'next/server';

import { getAssetById } from '@/db/repository/asset.repository';
import { errorResponse, getErrorMessage } from '@/lib/api-response';

/** GET /api/assets/:assetId/image — ASSET_URL로 302 redirect (기존 URL 하위 호환) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    try {
        const { assetId } = await params;

        const asset = await getAssetById(assetId);
        if (!asset || !asset.ASSET_URL) {
            return errorResponse('이미지를 찾을 수 없습니다.', 404);
        }

        return Response.redirect(new URL(asset.ASSET_URL, req.url), 302);
    } catch (err: unknown) {
        console.error('에셋 이미지 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
