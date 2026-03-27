// src/app/api/builder/ab/promote/route.ts
// A/B 테스트 Winner 승격 API

import { NextRequest } from 'next/server';

import { getAbGroup, promoteWinner } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

/**
 * POST /api/builder/ab/promote
 * Winner 선정 — 패배 페이지의 AB_GROUP_ID, AB_WEIGHT를 NULL로 초기화
 * Winner 페이지도 AB_GROUP_ID, AB_WEIGHT를 NULL로 초기화 (단독 노출로 전환)
 *
 * Body: { groupId: string, winnerPageId: string }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { groupId, winnerPageId } = body as { groupId: string; winnerPageId: string };

        if (!groupId || !winnerPageId) {
            return errorResponse('groupId와 winnerPageId가 필요합니다.', 400);
        }

        // 그룹 존재 여부 + winnerPageId가 해당 그룹에 속하는지 확인
        const pages = await getAbGroup(groupId);
        if (pages.length === 0) {
            return errorResponse('A/B 그룹을 찾을 수 없습니다.', 404);
        }
        if (!pages.some((p) => p.PAGE_ID === winnerPageId)) {
            return errorResponse('winnerPageId가 해당 그룹에 속하지 않습니다.', 400);
        }

        const { userId } = await getCurrentUser();

        await promoteWinner(groupId, winnerPageId, userId);

        return successResponse({ groupId, winnerPageId, promoted: true });
    } catch (err: unknown) {
        console.error('A/B Winner 승격 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
