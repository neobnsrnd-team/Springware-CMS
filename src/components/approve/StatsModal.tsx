// src/components/approve/StatsModal.tsx
// 페이지 통계 모달 — 조회수 + 컴포넌트별 클릭수 바 차트
'use client';

import { useState, useEffect } from 'react';

import Modal from '@/components/ui/Modal';
import { nextApi } from '@/lib/api-url';

interface ClickItem {
    componentId: string;
    clickCount: number;
}

interface StatsData {
    viewCount: number;
    totalClicks: number;
    clicks: ClickItem[];
}

interface StatsModalProps {
    pageId: string;
    pageLabel: string;
    onClose: () => void;
}

export default function StatsModal({ pageId, pageLabel, onClose }: StatsModalProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(nextApi(`/api/track/stats?pageId=${encodeURIComponent(pageId)}`))
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled && data.ok) {
                    const { viewCount, totalClicks, clicks } = data;
                    setStats({ viewCount, totalClicks, clicks });
                }
            })
            .catch((err) => console.error('통계 조회 오류:', err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [pageId]);

    const maxClick = stats?.clicks?.length ? Math.max(...stats.clicks.map((c) => c.clickCount)) : 0;

    return (
        <Modal title={`페이지 통계 — ${pageLabel}`} onClose={onClose} showCloseButton width="480px">
            <div className="px-7 pb-7">
                {loading ? (
                    <p className="text-sm text-[#9ca3af] text-center py-8">불러오는 중...</p>
                ) : !stats || (stats.viewCount === 0 && stats.totalClicks === 0) ? (
                    <p className="text-sm text-[#9ca3af] text-center py-8">
                        아직 수집된 데이터가 없습니다.
                        <br />
                        <span className="text-[12px]">배포 후 데이터가 쌓입니다.</span>
                    </p>
                ) : (
                    <>
                        {/* 요약 카드 */}
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 rounded-xl bg-[#f0f4ff] p-4 text-center">
                                <p className="m-0 text-[12px] text-[#6b7280] mb-1">전체 조회수</p>
                                <p className="m-0 text-[28px] font-bold text-[#0046A4]">
                                    {stats.viewCount.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex-1 rounded-xl bg-[#fef2f2] p-4 text-center">
                                <p className="m-0 text-[12px] text-[#6b7280] mb-1">전체 클릭수</p>
                                <p className="m-0 text-[28px] font-bold text-[#dc2626]">
                                    {stats.totalClicks.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* 컴포넌트별 클릭수 */}
                        {stats.clicks.length > 0 && (
                            <div>
                                <p className="m-0 text-[13px] font-semibold text-[#374151] mb-3">컴포넌트별 클릭수</p>
                                <div className="flex flex-col gap-2.5">
                                    {stats.clicks.map((item) => {
                                        const pct =
                                            stats.totalClicks > 0
                                                ? Math.round((item.clickCount / stats.totalClicks) * 100)
                                                : 0;
                                        const barWidth =
                                            maxClick > 0 ? Math.max((item.clickCount / maxClick) * 100, 4) : 0;

                                        return (
                                            <div key={item.componentId}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[12px] text-[#374151] font-medium truncate max-w-[200px]">
                                                        {item.componentId}
                                                    </span>
                                                    <span className="text-[12px] text-[#6b7280] shrink-0 ml-2">
                                                        {item.clickCount}회 ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="h-5 rounded-full bg-[#f3f4f6] overflow-hidden">
                                                    <div
                                                        className="h-5 rounded-full bg-[#0046A4] transition-all duration-500"
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
