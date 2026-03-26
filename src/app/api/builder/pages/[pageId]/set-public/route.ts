// src/app/api/builder/pages/[pageId]/set-public/route.ts
// IS_PUBLIC 긴급 차단/해제 API — 관리자 전용

import { NextRequest } from 'next/server';

import { setPagePublic } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;
        const { userId, role } = await getCurrentUser();

        if (role !== 'admin') {
            return errorResponse('이 작업을 수행할 권한이 없습니다.', 403);
        }

        const body = await req.json().catch(() => ({}));
        const isPublic = body.isPublic;

        if (isPublic !== 'Y' && isPublic !== 'N') {
            return errorResponse('isPublic은 "Y" 또는 "N"이어야 합니다.', 400);
        }

        await setPagePublic(pageId, isPublic, userId);

        return successResponse({ pageId, isPublic });
    } catch (err: unknown) {
        console.error('IS_PUBLIC 변경 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
