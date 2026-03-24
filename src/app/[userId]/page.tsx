// src/app/[userId]/page.tsx
// 사용자 대시보드 — 페이지 목록 카드 그리드

import { Suspense } from 'react';

import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    return (
        <Suspense fallback={<div style={{ padding: '24px', color: '#6b7280' }}>로딩 중...</div>}>
            <DashboardClient userId={userId} />
        </Suspense>
    );
}
