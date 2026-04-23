// src/app/api/assets/[assetId]/image/route.ts
// 에셋 이미지 스트리밍 API — Admin 서버 등 서버 간 호출용
// ASSET_PATH에서 파일을 직접 읽어 반환 (URL 매핑 의존 없음)

import { readFile } from 'fs/promises';

import { NextRequest } from 'next/server';

import { getAssetById } from '@/db/repository/asset.repository';
import { errorResponse, getErrorMessage } from '@/lib/api-response';

/** GET /api/assets/:assetId/image — 이미지 파일 직접 스트리밍 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ assetId: string }> }) {
    try {
        const { assetId } = await params;

        const asset = await getAssetById(assetId);
        if (!asset) {
            return errorResponse('이미지를 찾을 수 없습니다.', 404);
        }

        if (!asset.ASSET_PATH) {
            return errorResponse('이미지 경로 정보가 없습니다.', 404);
        }

        let buffer: Buffer;
        try {
            buffer = await readFile(asset.ASSET_PATH);
        } catch {
            return errorResponse('이미지 파일을 찾을 수 없습니다.', 404);
        }

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': asset.MIME_TYPE || 'application/octet-stream',
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (err: unknown) {
        console.error('에셋 이미지 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
