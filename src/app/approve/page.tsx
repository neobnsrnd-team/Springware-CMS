// src/app/approve/page.tsx
// 관리자 승인 대시보드 — 전체 페이지 목록 (승인 상태 필터)

import { existsSync } from 'fs';
import { join } from 'path';

import { getPageList } from '@/db/repository/page.repository';
import { isPageExpired } from '@/lib/page-file';
import ApproveClient from '@/components/approve/ApproveClient';
import { APPROVE_STATE_VALUES, type ApproveStateFilter } from '@/data/approve-config';
import type { ViewMode } from '@/db/types';

const PAGE_SIZE = 12;

export default async function ApprovePage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
        sortBy?: string;
        approveState?: string;
        createUser?: string;
    }>;
}) {
    const {
        page: pageParam,
        search: searchParam,
        sortBy: sortByParam,
        approveState: approveStateParam,
        createUser: createUserParam,
    } = await searchParams;

    const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));
    const search = searchParam ?? '';
    const sortBy = sortByParam === 'name' ? 'name' : 'date';
    const approveState = APPROVE_STATE_VALUES.includes(approveStateParam as ApproveStateFilter)
        ? (approveStateParam as ApproveStateFilter)
        : undefined;
    const createUser = createUserParam ?? '';

    const { list, totalCount } = await getPageList({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        sortBy,
        approveState,
        excludeNewWork: true,
        createUserName: createUser || undefined,
    });

    const pages = list.map((p) => ({
        id: p.PAGE_ID,
        label: p.PAGE_NAME,
        viewMode: (p.VIEW_MODE ?? 'mobile') as ViewMode,
        thumbnail: p.THUMBNAIL ?? null,
        lastModifiedDtime: p.LAST_MODIFIED_DTIME ? new Date(p.LAST_MODIFIED_DTIME).toISOString() : null,
        approveState: p.APPROVE_STATE as ApproveStateFilter,
        createUserName: p.CREATE_USER_NAME ?? '알 수 없음',
        hasFile: p.FILE_PATH ? existsSync(join(process.cwd(), 'public', p.FILE_PATH.replace(/^\//, ''))) : false,
        isPublic: p.IS_PUBLIC ?? 'Y',
        beginningDate: p.BEGINNING_DATE ? new Date(p.BEGINNING_DATE).toISOString() : null,
        expiredDate: p.EXPIRED_DATE ? new Date(p.EXPIRED_DATE).toISOString() : null,
        isExpired: isPageExpired(p.IS_PUBLIC, p.EXPIRED_DATE),
        hasApproveHistory: p.APPROVE_DATE != null,
    }));

    return (
        <ApproveClient
            initialPages={pages}
            totalCount={totalCount}
            currentPage={currentPage}
            search={search}
            sortBy={sortBy}
            approveState={approveState ?? null}
            createUser={createUser}
        />
    );
}
