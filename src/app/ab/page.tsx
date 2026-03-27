// src/app/ab/page.tsx
// A/B 테스트 관리 대시보드 — 그룹 목록 조회 및 관리

export const dynamic = 'force-dynamic';

import { getPageList } from '@/db/repository/page.repository';
import { getViewCountsByPages, getClickCountsByPages } from '@/db/repository/page-view-log.repository';
import AbTestClient from '@/components/ab/AbTestClient';
import type { ViewMode } from '@/db/types';
import type { AbGroupInfo, AbPageCard } from '@/components/ab/AbTestClient';

export default async function AbTestPage() {
    // APPROVED 상태 페이지 전체 조회 (A/B 그룹 컬럼 포함)
    const { list } = await getPageList({
        approveState: 'APPROVED',
        pageSize: 500,
    });

    const pageIds = list.map((p) => p.PAGE_ID);

    // 조회수/클릭수 일괄 조회 — N+1 방지
    const [viewCountsMap, clickCountsMap] = await Promise.all([
        getViewCountsByPages(pageIds),
        getClickCountsByPages(pageIds),
    ]);

    const pages: AbPageCard[] = list.map((p) => ({
        id: p.PAGE_ID,
        label: p.PAGE_NAME,
        viewMode: (p.VIEW_MODE ?? 'mobile') as ViewMode,
        thumbnail: p.THUMBNAIL ?? null,
        lastModifiedDtime: p.LAST_MODIFIED_DTIME ? new Date(p.LAST_MODIFIED_DTIME).toISOString() : null,
        approveState: p.APPROVE_STATE,
        abGroupId: p.AB_GROUP_ID ?? null,
        abWeight: p.AB_WEIGHT ?? null,
        viewCount: viewCountsMap.get(p.PAGE_ID) ?? 0,
        clickCount: clickCountsMap.get(p.PAGE_ID) ?? 0,
    }));

    // A/B 그룹 목록 구성 — AB_GROUP_ID 기준 그룹핑
    const groupMap = new Map<string, AbGroupInfo>();
    for (const p of list) {
        if (!p.AB_GROUP_ID) continue;
        if (!groupMap.has(p.AB_GROUP_ID)) {
            groupMap.set(p.AB_GROUP_ID, { groupId: p.AB_GROUP_ID, pages: [] });
        }
        groupMap.get(p.AB_GROUP_ID)!.pages.push({
            PAGE_ID: p.PAGE_ID,
            PAGE_NAME: p.PAGE_NAME,
            AB_WEIGHT: p.AB_WEIGHT ?? null,
            IS_PUBLIC: p.IS_PUBLIC ?? 'Y',
        });
    }

    const groups = Array.from(groupMap.values());

    return <AbTestClient pages={pages} groups={groups} />;
}
