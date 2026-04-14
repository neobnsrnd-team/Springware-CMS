// src/app/api/deploy/history/route.ts
import { NextRequest } from 'next/server';

import { getFileSendByPage } from '@/db/repository/file-send.repository';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const pageId = req.nextUrl.searchParams.get('pageId');

        if (!pageId || typeof pageId !== 'string') {
            return errorResponse('pageId가 필요합니다.', 400);
        }
        if (pageId.includes('..')) {
            return errorResponse('유효하지 않은 pageId입니다.', 400);
        }

        const history = await getFileSendByPage(pageId);

        return successResponse({ history });
    } catch (err: unknown) {
        console.error('배포 이력 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
