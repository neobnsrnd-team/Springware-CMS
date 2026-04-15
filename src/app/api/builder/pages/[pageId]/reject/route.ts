// src/app/api/builder/pages/[pageId]/reject/route.ts
// 페이지 반려 API — PENDING → REJECTED 상태 변경

import { NextRequest } from 'next/server';

import { updateApproveState } from '@/db/repository/page.repository';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;

        if (!pageId || pageId.includes('..')) {
            return errorResponse('유효하지 않은 페이지 ID입니다.', 400);
        }

        const body = await req.json();
        const { rejectedReason } = body;

        if (!rejectedReason || !rejectedReason.trim()) {
            return errorResponse('반려 사유를 입력해 주세요.', 400);
        }

        const currentUser = await getCurrentUser();
        const { userId, userName } = currentUser;

        if (!canWriteCms(currentUser)) {
            return errorResponse('이 작업을 수행할 권한이 없습니다.', 403);
        }

        await updateApproveState({
            pageId,
            approveState: 'REJECTED',
            approverId: userId,
            approverName: userName,
            rejectedReason: rejectedReason.trim(),
            lastModifierId: userId,
        });

        return successResponse({ message: '반려 처리가 완료되었습니다.' });
    } catch (err: unknown) {
        console.error('반려 처리 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
