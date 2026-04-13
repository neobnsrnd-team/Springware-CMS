// src/app/api/builder/pages/[pageId]/approve-request/route.ts

import { NextRequest } from 'next/server';

import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';
import { requestApproval } from '@/db/repository/page.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;

        if (!pageId || pageId.includes('..')) {
            return errorResponse('유효하지 않은 페이지 ID입니다.', 400);
        }

        const body = await req.json();
        const { approverId, approverName, expiredDate } = body;

        if (!approverId || !approverName) {
            return errorResponse('결재자 정보가 누락되었습니다.', 400);
        }

        if (!expiredDate) {
            return errorResponse('만료일은 필수입니다.', 400);
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate) || isNaN(Date.parse(expiredDate))) {
            return errorResponse('만료일 형식이 올바르지 않습니다. (YYYY-MM-DD)', 400);
        }

        // KST(UTC+9) 기준 오늘 날짜 계산
        const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
        if (expiredDate <= kstToday) {
            return errorResponse('만료일은 오늘 이후 날짜여야 합니다.', 400);
        }

        await requestApproval(pageId, approverId, approverName, expiredDate);

        return successResponse({ message: '승인 요청이 완료되었습니다.' });
    } catch (err: unknown) {
        console.error('승인 요청 처리 오류:', err);
        return errorResponse(getErrorMessage(err), 500);
    }
}
