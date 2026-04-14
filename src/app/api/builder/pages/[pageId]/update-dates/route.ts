// src/app/api/builder/pages/[pageId]/update-dates/route.ts
// 승인된 페이지 시작일/만료일 수정 API — 관리자 전용

import { NextRequest } from 'next/server';

import { updatePageDates } from '@/db/repository/page.repository';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;
        const currentUser = await getCurrentUser();
        const { userId } = currentUser;

        if (!canWriteCms(currentUser)) {
            return errorResponse('이 작업을 수행할 권한이 없습니다.', 403);
        }

        const body = await req.json().catch(() => ({}));
        const beginningDate: string | null = body.beginningDate ?? null;
        const expiredDate: string | null = body.expiredDate ?? null;

        // 유효성: 시작일 ≤ 만료일 (둘 다 있을 때)
        if (beginningDate && expiredDate && beginningDate > expiredDate) {
            return errorResponse('시작일은 만료일보다 이전이어야 합니다.', 400);
        }

        await updatePageDates(pageId, beginningDate, expiredDate, userId);

        return successResponse({ pageId, beginningDate, expiredDate });
    } catch (err: unknown) {
        console.error('날짜 수정 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
