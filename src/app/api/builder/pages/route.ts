// src/app/api/builder/pages/route.ts
// 페이지 목록 조회 · 삭제 API

import { NextRequest } from 'next/server';

import { getPageList, getPageById, deletePage } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { deletePageHtml, deletePageThumbnail } from '@/lib/page-file';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';

/**
 * GET /api/builder/pages — 페이지 목록 조회 (페이지네이션 + 검색 + 정렬)
 *
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본: 1)
 * - pageSize: 페이지당 항목 수 (기본: 20, 최대: 100)
 * - search: PAGE_NAME 검색어
 * - sortBy: 'name' | 'date' (기본: 'date' = 최신 수정순)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));
        const search = searchParams.get('search') || undefined;
        const sortByParam = searchParams.get('sortBy');
        const sortBy = sortByParam === 'name' ? 'name' : 'date';

        const { list, totalCount } = await getPageList({ page, pageSize, search, sortBy });

        const pages = list.map((p) => ({
            id: p.PAGE_ID,
            label: p.PAGE_NAME,
            viewMode: p.VIEW_MODE ?? 'mobile',
            thumbnail: p.THUMBNAIL ?? null,
            lastModifiedDtime: p.LAST_MODIFIED_DTIME ? new Date(p.LAST_MODIFIED_DTIME).toISOString() : null,
            approveState: p.APPROVE_STATE,
        }));

        const { userId } = await getCurrentUser();
        return successResponse({ pages, totalCount, currentUserId: userId });
    } catch (err: unknown) {
        console.error('페이지 목록 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}

/**
 * DELETE /api/builder/pages?pageId=xxx
 * 이슈 #26 삭제 정책:
 * - 미승인 (HISTORY 없음): DB 하드 삭제 (PAGE + COMP_MAP) + 파일 삭제
 * - 승인됨 (HISTORY 있음): DB 소프트 삭제 (USE_YN='N') + 파일 삭제
 */
export async function DELETE(req: NextRequest) {
    try {
        const pageId = req.nextUrl.searchParams.get('pageId');
        if (!pageId) {
            return errorResponse('pageId가 필요합니다', 400);
        }

        // 페이지 조회 — FILE_PATH 확인 (삭제 전 경로 보존)
        const page = await getPageById(pageId);
        if (!page) {
            return errorResponse('페이지를 찾을 수 없습니다', 404);
        }

        const { userId } = await getCurrentUser();

        // DB 삭제 (미승인: 하드, 승인: 소프트)
        const { deleteType } = await deletePage(pageId, userId);

        // 물리적 파일 삭제 (미승인·승인 모두 삭제)
        if (page.FILE_PATH) {
            await deletePageHtml(page.FILE_PATH);
        }

        // 썸네일 파일 삭제 (없으면 무시)
        await deletePageThumbnail(pageId);

        return successResponse({ deleteType });
    } catch (err: unknown) {
        console.error('페이지 삭제 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
