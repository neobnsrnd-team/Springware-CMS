// src/app/[userId]/page.tsx
// 사용자 대시보드 — 페이지 목록 카드 그리드

import { getPageList } from '@/db/repository/page.repository';
import DashboardClient from '@/components/dashboard/DashboardClient';
import type { ViewMode } from '@/db/types';

const PAGE_SIZE = 12;

const VIEW_MODE_VALUES: ViewMode[] = ['mobile', 'web', 'responsive'];

export default async function DashboardPage({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ page?: string; search?: string; sortBy?: string; viewMode?: string }>;
}) {
    const { userId } = await params;
    const { page: pageParam, search: searchParam, sortBy: sortByParam, viewMode: viewModeParam } = await searchParams;

    const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));
    const search = searchParam ?? '';
    const sortBy = sortByParam === 'name' ? 'name' : 'date';
    const viewMode = VIEW_MODE_VALUES.includes(viewModeParam as ViewMode) ? (viewModeParam as ViewMode) : undefined;

    const { list, totalCount } = await getPageList({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        sortBy,
        viewMode,
    });

    const pages = list.map((p) => ({
        id: p.PAGE_ID,
        label: p.PAGE_NAME,
        viewMode: (p.VIEW_MODE ?? 'mobile') as ViewMode,
        thumbnail: p.THUMBNAIL ?? null,
        lastModifiedDtime: p.LAST_MODIFIED_DTIME ? new Date(p.LAST_MODIFIED_DTIME).toISOString() : null,
        approveState: p.APPROVE_STATE,
    }));

    return (
        <DashboardClient
            userId={userId}
            initialPages={pages}
            totalCount={totalCount}
            currentPage={currentPage}
            search={search}
            sortBy={sortBy}
            viewMode={viewMode ?? null}
        />
    );
}
