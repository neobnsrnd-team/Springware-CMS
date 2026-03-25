// src/app/api/builder/pages/[pageId]/approve/route.ts
// 페이지 승인 API — PENDING → APPROVED 상태 변경 + PAGE_HISTORY INSERT

import { NextRequest } from 'next/server';

import { updateApproveState } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;

        if (!pageId || pageId.includes('..')) {
            return errorResponse('유효하지 않은 페이지 ID입니다.', 400);
        }

        const { userId, userName, role } = await getCurrentUser();

        if (role !== 'admin') {
            return errorResponse('이 작업을 수행할 권한이 없습니다.', 403);
        }

        // 요청 본문에서 선택적 만료일 추출
        const body = await req.json().catch(() => ({}));
        const expiredDate: string | null = body.expiredDate ?? null;

        const { version } = await updateApproveState({
            pageId,
            approveState: 'APPROVED',
            approverId: userId,
            approverName: userName,
            expiredDate,
            lastModifierId: userId,
        });

        return successResponse({ message: '승인 처리가 완료되었습니다.', version });
    } catch (err: unknown) {
        console.error('승인 처리 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
