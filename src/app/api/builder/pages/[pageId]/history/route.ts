// src/app/api/builder/pages/[pageId]/history/route.ts
// 페이지 승인 이력 조회 API — 버전 목록 반환 (롤백 UI용)

import { NextRequest } from 'next/server';

import { getHistoryList } from '@/db/repository/page.repository';
import { isValidBankId } from '@/lib/validators';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        if (!canReadCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        const { pageId } = await params;

        if (!pageId || !isValidBankId(pageId)) {
            return errorResponse('유효하지 않은 페이지 ID입니다.', 400);
        }

        const history = await getHistoryList(pageId);
        return successResponse({ history });
    } catch (err: unknown) {
        console.error('승인 이력 조회 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
