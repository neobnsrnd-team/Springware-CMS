// src/app/api/builder/pages/route.ts
// 페이지(탭) 목록 조회 · 삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { getPageList, getPageById, deletePage } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { deletePageHtml } from '@/lib/page-file';
import { errorResponse, getErrorMessage } from '@/lib/api-response';

/** GET /api/builder/pages — USE_YN='Y'인 전체 페이지 목록 반환 */
export async function GET() {
    try {
        // 페이지 수 제한 없이 전체 조회 (탭 목록용)
        const { list } = await getPageList({ pageSize: 9999 });

        const pages = list.map((p) => ({
            id: p.PAGE_ID,
            label: p.PAGE_NAME,
            viewMode: p.VIEW_MODE ?? 'mobile',
        }));

        const { userId } = getCurrentUser();
        return NextResponse.json({ pages, currentUserId: userId });
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

        const { userId } = getCurrentUser();

        // DB 삭제 (미승인: 하드, 승인: 소프트)
        const { deleteType } = await deletePage(pageId, userId);

        // 물리적 파일 삭제 (미승인·승인 모두 삭제)
        if (page.FILE_PATH) {
            await deletePageHtml(page.FILE_PATH);
        }

        return NextResponse.json({ ok: true, deleteType });
    } catch (err: unknown) {
        console.error('페이지 삭제 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
