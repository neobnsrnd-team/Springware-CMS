// src/app/api/track/view/route.ts
// 페이지 조회(VIEW) 트래킹 수신 API — 대고객 페이지에서 sendBeacon으로 호출

import { NextRequest } from 'next/server';

import { insertViewLog } from '@/db/repository/page-view-log.repository';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { TRACKER_CORS_ORIGIN } from '@/lib/env';

// 배포 페이지(운영 서버 포트)에서 CMS API 호출 시 CORS 허용
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': TRACKER_CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// CORS preflight 요청 처리
export function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
    try {
        const { pageId } = await req.json();

        if (!pageId || typeof pageId !== 'string') {
            return errorResponse('pageId가 필요합니다.', 400, CORS_HEADERS);
        }

        await insertViewLog(pageId, 'VIEW');

        return successResponse(undefined, 200, CORS_HEADERS);
    } catch (err: unknown) {
        console.error('VIEW 로그 기록 실패:', err);
        return errorResponse(getErrorMessage(err), 500, CORS_HEADERS);
    }
}
