// src/app/api/builder/pages/route.ts
// 페이지(탭) 목록 조회 · 논리 삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { getPageList, deletePage } from '@/db/repository/page.repository';

/** GET /api/builder/pages — USE_YN='Y'인 전체 페이지 목록 반환 */
export async function GET() {
    try {
        // 페이지 수 제한 없이 전체 조회 (탭 목록용)
        const { list } = await getPageList({ pageSize: 9999 });

        const pages = list.map(p => ({
            id: p.PAGE_ID,
            label: p.PAGE_NAME,
            viewMode: p.VIEW_MODE ?? 'mobile',
        }));

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('페이지 목록 조회 실패:', error);
        return NextResponse.json({ error: '페이지 목록 조회 실패' }, { status: 500 });
    }
}

/** DELETE /api/builder/pages?pageId=xxx — 논리 삭제 (USE_YN='N') */
export async function DELETE(req: NextRequest) {
    try {
        const pageId = req.nextUrl.searchParams.get('pageId');
        if (!pageId) {
            return NextResponse.json({ error: 'pageId가 필요합니다' }, { status: 400 });
        }

        await deletePage(pageId, 'system');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('페이지 삭제 실패:', error);
        return NextResponse.json({ error: '페이지 삭제 실패' }, { status: 500 });
    }
}
