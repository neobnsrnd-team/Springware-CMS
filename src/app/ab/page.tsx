// src/app/ab/page.tsx
// A/B 테스트 관리 대시보드 — 그룹 목록 조회 및 관리

import { getPageList } from '@/db/repository/page.repository';
import { getViewCountByPage, getClickCountByPage } from '@/db/repository/page-view-log.repository';
import AbTestClient from '@/components/ab/AbTestClient';
import type { ViewMode } from '@/db/types';
import type { AbGroupInfo, AbPageCard } from '@/components/ab/AbTestClient';

export default async function AbTestPage() {
    // APPROVED 상태 페이지 전체 조회 (A/B 그룹 컬럼 포함)
    const { list } = await getPageList({
        approveState: 'APPROVED',
        pageSize: 500,
    });

    // 페이지 카드 정보 + 조회/클릭 수 조회 (병렬)
    const pages: AbPageCard[] = await Promise.all(
        list.map(async (p) => {
            const [viewCount, clickCount] = await Promise.all([
                getViewCountByPage(p.PAGE_ID),
                getClickCountByPage(p.PAGE_ID),
            ]);
            return {
                id: p.PAGE_ID,
                label: p.PAGE_NAME,
                viewMode: (p.VIEW_MODE ?? 'mobile') as ViewMode,
                thumbnail: p.THUMBNAIL ?? null,
                lastModifiedDtime: p.LAST_MODIFIED_DTIME ? new Date(p.LAST_MODIFIED_DTIME).toISOString() : null,
                approveState: p.APPROVE_STATE,
                abGroupId: p.AB_GROUP_ID ?? null,
                abWeight: p.AB_WEIGHT ?? null,
                viewCount,
                clickCount,
            };
        }),
    );

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
