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
        const { approverId, approverName } = body;

        if (!approverId || !approverName) {
            return errorResponse('결재자 정보가 누락되었습니다.', 400);
        }

        await requestApproval(pageId, approverId, approverName);

        return successResponse({ message: '승인 요청이 완료되었습니다.' });
    } catch (err: unknown) {
        console.error('승인 요청 처리 오류:', err);
        return errorResponse(getErrorMessage(err), 500);
    }
}
