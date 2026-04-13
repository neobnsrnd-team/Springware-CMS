// src/app/api/assets/[assetId]/image/route.ts

import { NextRequest } from 'next/server';

import { getAssetById } from '@/db/repository/asset.repository';
import { errorResponse } from '@/lib/api-response';

/** DB BLOB → 이미지 바이너리 응답 (에셋 ID 불변 — immutable 캐시) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    const { assetId } = await params;

    const asset = await getAssetById(assetId);
    if (!asset || !asset.ASSET_DATA) {
        return errorResponse('이미지를 찾을 수 없습니다.', 404);
    }

    return new Response(new Uint8Array(asset.ASSET_DATA), {
        headers: {
            'Content-Type': asset.MIME_TYPE,
            'Content-Length': String(asset.ASSET_DATA.length),
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
