// src/app/api/builder/ab/route.ts
// A/B 테스트 그룹 관리 API — 그룹 조회 / 설정 / 해제

import { NextRequest } from 'next/server';

import { getAbGroup, setAbGroup, clearAbGroup, clearPageAbGroup } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

/**
 * GET /api/builder/ab?groupId=xxx
 * A/B 그룹 내 페이지 목록 조회
 */
export async function GET(req: NextRequest) {
    try {
        const groupId = req.nextUrl.searchParams.get('groupId');
        if (!groupId) {
            return errorResponse('groupId가 필요합니다.', 400);
        }

        const pages = await getAbGroup(groupId);
        return successResponse({ groupId, pages });
    } catch (err: unknown) {
        console.error('A/B 그룹 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}

/**
 * POST /api/builder/ab
 * 페이지를 A/B 그룹에 설정 (신규 그룹 생성 또는 기존 그룹에 추가)
 *
 * Body: { groupId: string, pages: { pageId: string, weight: number }[] }
 * - groupId가 이미 존재하는 경우, 동일 그룹 ID를 가진 페이지만 업데이트
 * - 이미 다른 그룹에 속한 페이지는 거부 (rowsAffected === 0)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { groupId, pages } = body as {
            groupId: string;
            pages: { pageId: string; weight: number }[];
        };

        if (!groupId || !Array.isArray(pages) || pages.length < 2) {
            return errorResponse('groupId와 2개 이상의 pages가 필요합니다.', 400);
        }

        if (pages.some((p) => !p.pageId || typeof p.weight !== 'number' || p.weight <= 0)) {
            return errorResponse('각 페이지의 pageId와 양수 weight가 필요합니다.', 400);
        }

        const { userId } = await getCurrentUser();

        // 중복 그룹 ID 생성 방지 — 완전히 새로운 그룹인데 다른 페이지가 이미 같은 groupId를 사용 중이라면 거부
        // (단, 이 요청에 포함된 pageId들이 이미 같은 그룹에 속한 경우는 허용 — 가중치 수정)
        // 중복 그룹 ID 방지 — 요청에 없는 외부 페이지가 이미 같은 groupId를 사용 중이면 거부
        const existingPages = await getAbGroup(groupId);
        const requestPageIds = new Set(pages.map((p) => p.pageId));
        const hasExternalPages = existingPages.some((p) => !requestPageIds.has(p.PAGE_ID));

        if (hasExternalPages) {
            return errorResponse(
                `그룹 ID '${groupId}'는 이미 다른 페이지들이 사용 중입니다. 다른 그룹 ID를 사용하세요.`,
                409,
            );
        }

        // 각 페이지 그룹 설정
        // SQL WHERE 조건: AB_GROUP_ID IS NULL OR AB_GROUP_ID = :groupId 으로 타 그룹 덮어쓰기 방지
        const results: { pageId: string; updated: boolean }[] = [];
        for (const { pageId, weight } of pages) {
            const rowsAffected = await setAbGroup(pageId, groupId, weight, userId);
            results.push({ pageId, updated: rowsAffected > 0 });
        }

        const rejected = results.filter((r) => !r.updated).map((r) => r.pageId);
        if (rejected.length > 0) {
            return errorResponse(
                `다음 페이지는 이미 다른 그룹에 속해 있어 설정할 수 없습니다: ${rejected.join(', ')}`,
                409,
            );
        }

        return successResponse({ groupId, results });
    } catch (err: unknown) {
        console.error('A/B 그룹 설정 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}

/**
 * DELETE /api/builder/ab?groupId=xxx — 그룹 전체 해제
 * DELETE /api/builder/ab?pageId=xxx  — 단일 페이지 해제
 */
export async function DELETE(req: NextRequest) {
    try {
        const groupId = req.nextUrl.searchParams.get('groupId');
        const pageId = req.nextUrl.searchParams.get('pageId');

        if (!groupId && !pageId) {
            return errorResponse('groupId 또는 pageId가 필요합니다.', 400);
        }

        const { userId } = await getCurrentUser();

        if (pageId) {
            await clearPageAbGroup(pageId, userId);
            return successResponse({ pageId, cleared: true });
        } else {
            await clearAbGroup(groupId!, userId);
            return successResponse({ groupId, cleared: true });
        }
    } catch (err: unknown) {
        console.error('A/B 그룹 해제 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
