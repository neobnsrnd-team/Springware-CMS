// src/app/api/builder/pages/[pageId]/rollback/route.ts
// 페이지 버전 롤백 API — 지정 버전의 FILE_PATH를 PAGE에 복원 + APPROVE_STATE = 'WORK' 전환

import { NextRequest } from 'next/server';

import { updatePageRollback } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;

        if (!pageId || !isValidBankId(pageId)) {
            return errorResponse('유효하지 않은 페이지 ID입니다.', 400);
        }

        const { userId, role } = await getCurrentUser();

        if (role !== 'admin') {
            return errorResponse('이 작업을 수행할 권한이 없습니다.', 403);
        }

        const body = await req.json().catch(() => ({}));
        const version = body.version;

        if (!Number.isInteger(version) || version < 1) {
            return errorResponse('유효하지 않은 버전입니다.', 400);
        }

        await updatePageRollback(pageId, version, userId);

        return successResponse({ message: `v${version}으로 롤백이 완료되었습니다. 재승인 후 배포하세요.` });
    } catch (err: unknown) {
        console.error('롤백 처리 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
