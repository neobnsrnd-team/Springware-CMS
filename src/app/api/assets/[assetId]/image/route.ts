// src/app/api/assets/[assetId]/image/route.ts
// 에셋 이미지 바이너리 반환 API

import { NextRequest } from 'next/server';

import { getAssetById } from '@/db/repository/asset.repository';
import { errorResponse, getErrorMessage } from '@/lib/api-response';

/** GET /api/assets/:assetId/image — DB BLOB → 이미지 바이너리 (ETag + immutable 캐시) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    try {
        const { assetId } = await params;

        const asset = await getAssetById(assetId);
        if (!asset || !asset.ASSET_DATA) {
            return errorResponse('이미지를 찾을 수 없습니다.', 404);
        }

        // Weak ETag: 수정일시 + 파일 크기 조합 (BLOB 해싱 대비 경량)
        const etag = `W/"${asset.LAST_MODIFIED_DTIME?.getTime() || 0}-${asset.FILE_SIZE || 0}"`;

        // 304 Not Modified — 브라우저 캐시 유효
        if (req.headers.get('if-none-match') === etag) {
            return new Response(null, { status: 304 });
        }

        return new Response(new Uint8Array(asset.ASSET_DATA), {
            headers: {
                'Content-Type': asset.MIME_TYPE,
                'Content-Length': String(asset.ASSET_DATA.length),
                'Cache-Control': 'public, max-age=31536000, immutable',
                ETag: etag,
            },
        });
    } catch (err: unknown) {
        console.error('에셋 이미지 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
