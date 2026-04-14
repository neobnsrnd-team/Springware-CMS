import { NextRequest } from 'next/server';

import { requestApproval } from '@/db/repository/page.repository';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
    try {
        const { pageId } = await params;

        if (!pageId || pageId.includes('..')) {
            return errorResponse('Invalid page ID.', 400);
        }

        const body = await req.json();
        const { approverId, approverName, expiredDate } = body;

        if (!approverId || !approverName) {
            return errorResponse('Approver information is required.', 400);
        }

        const currentUser = await getCurrentUser();
        if (!canWriteCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }

        if (!expiredDate) {
            return errorResponse('Expiration date is required.', 400);
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiredDate) || isNaN(Date.parse(expiredDate))) {
            return errorResponse('Expiration date must use YYYY-MM-DD format.', 400);
        }

        const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
        if (expiredDate <= kstToday) {
            return errorResponse('Expiration date must be after today.', 400);
        }

        await requestApproval(pageId, approverId, approverName, expiredDate);

        return successResponse({ message: 'Approval request completed.' });
    } catch (err: unknown) {
        console.error('Approval request failed:', err);
        return errorResponse(getErrorMessage(err), 500);
    }
}
