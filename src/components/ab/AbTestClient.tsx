// src/components/ab/AbTestClient.tsx
'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/Modal';
import { VIEW_MODE_STYLE } from '@/components/ui/PageCard';
import type { ViewMode } from '@/components/ui/PageCard';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

// 그룹 페이지 구분 색상 팔레트
const GROUP_COLORS = ['#0046A4', '#008C6A', '#b45309', '#dc2626', '#6d28d9'];

// ── 타입 ──

export interface AbGroupInfo {
    groupId: string;
    pages: AbGroupPage[];
}

export interface AbGroupPage {
    PAGE_ID: string;
    PAGE_NAME: string;
    AB_WEIGHT: number | null;
    IS_PUBLIC: string;
}

/** 대시보드용 페이지 카드 정보 */
export interface AbPageCard {
    id: string;
    label: string;
    viewMode: ViewMode;
    thumbnail: string | null;
    lastModifiedDtime: string | null;
    approveState: string;
    abGroupId: string | null;
    abWeight: number | null;
    viewCount: number;
    clickCount: number;
}

export interface AbTestClientProps {
    /** APPROVED 상태의 페이지 목록 */
    pages: AbPageCard[];
    /** 현재 존재하는 A/B 그룹 목록 */
    groups: AbGroupInfo[];
}

// ── 상수 ──

const GUIDE_URL = '/api/ab/';

// ── 메인 컴포넌트 ──

export default function AbTestClient({ pages: initialPages, groups: initialGroups }: AbTestClientProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [pages] = useState(initialPages);
    const [groups, setGroups] = useState(initialGroups);

    // 그룹 생성 모달
    const [createModalOpen, setCreateModalOpen] = useState(false);
    // Winner 선정 모달
    const [winnerModalOpen, setWinnerModalOpen] = useState(false);
    const [winnerGroup, setWinnerGroup] = useState<AbGroupInfo | null>(null);

    // 그룹 생성 폼
    const [newGroupId, setNewGroupId] = useState('');
    const [selectedPages, setSelectedPages] = useState<{ pageId: string; weight: number }[]>([]);
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // 안내 복사 상태
    const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

    // ── 헬퍼 ──

    const refreshGroups = useCallback(async () => {
        startTransition(() => router.refresh());
    }, [router]);

    const copyUrl = useCallback(async (groupId: string) => {
        const url = `${window.location.origin}${GUIDE_URL}${groupId}`;
        await navigator.clipboard.writeText(url);
        setCopiedGroupId(groupId);
        setTimeout(() => setCopiedGroupId(null), 2000);
    }, []);

    // ── 그룹 생성 ──

    const handleAddPage = () => {
        setSelectedPages((prev) => [...prev, { pageId: '', weight: 5 }]);
    };

    const handleRemovePage = (idx: number) => {
        setSelectedPages((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleCreateGroup = async () => {
        setCreateError('');
        if (!newGroupId.trim()) {
            setCreateError('그룹 ID를 입력해주세요.');
            return;
        }
        if (!/^[a-z0-9-]{1,64}$/.test(newGroupId)) {
            setCreateError('그룹 ID는 영문 소문자, 숫자, 하이픈만 사용 가능합니다 (최대 64자).');
            return;
        }
        if (selectedPages.length < 2) {
            setCreateError('2개 이상의 페이지를 선택해주세요.');
            return;
        }
        if (selectedPages.some((p) => !p.pageId)) {
            setCreateError('모든 페이지를 선택해주세요.');
            return;
        }
        if (new Set(selectedPages.map((p) => p.pageId)).size !== selectedPages.length) {
            setCreateError('동일한 페이지를 중복 선택할 수 없습니다.');
            return;
        }

        setCreateLoading(true);
        try {
            const res = await fetch('/api/builder/ab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: newGroupId, pages: selectedPages }),
            });
            const data = await res.json();
            if (!data.ok) {
                setCreateError(data.error ?? '그룹 생성에 실패했습니다.');
                return;
            }
            setCreateModalOpen(false);
            setNewGroupId('');
            setSelectedPages([]);
            await refreshGroups();
        } catch {
            setCreateError('네트워크 오류가 발생했습니다.');
        } finally {
            setCreateLoading(false);
        }
    };

    // ── 그룹 해제 ──

    const handleClearGroup = async (groupId: string) => {
        if (!confirm(`그룹 '${groupId}'를 해제하시겠습니까?\n그룹 내 모든 페이지의 A/B 설정이 초기화됩니다.`)) return;
        try {
            const res = await fetch(`/api/builder/ab?groupId=${encodeURIComponent(groupId)}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                alert(data?.error ?? '그룹 해제에 실패했습니다.');
                return;
            }
            await refreshGroups();
        } catch {
            alert('네트워크 오류로 그룹 해제에 실패했습니다.');
        }
    };

    // ── Winner 선정 ──

    const handlePromoteWinner = async (winnerPageId: string) => {
        if (!winnerGroup) return;
        if (
            !confirm(
                `'${winnerGroup.pages.find((p) => p.PAGE_ID === winnerPageId)?.PAGE_NAME}' 페이지를 Winner로 선정하시겠습니까?\n나머지 페이지의 A/B 설정이 해제됩니다.`,
            )
        )
            return;

        try {
            const res = await fetch('/api/builder/ab/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: winnerGroup.groupId, winnerPageId }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? 'Winner 선정에 실패했습니다.');
                return;
            }
            setWinnerModalOpen(false);
            setWinnerGroup(null);
            await refreshGroups();
        } catch {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    // ── 렌더 ──

    // APPROVED 상태의 페이지만 그룹 생성 대상
    const approvedPages = pages.filter((p) => p.approveState === 'APPROVED');

    return (
        <div className="min-h-screen bg-[#f8f9fb]">
            {/* 헤더 */}
            <header className="bg-[#1e3a5f] px-8 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sticky top-0 z-30">
                <div className="h-[60px] flex items-center gap-3">
                    <span className="font-bold text-base text-white tracking-[-0.3px]">Springware CMS</span>
                    <span className="ml-auto px-2.5 py-1 rounded-full bg-[#b45309] text-white text-[11px] font-bold tracking-wide">
                        관리자
                    </span>
                </div>
                <AdminNavTabs />
            </header>

            {/* 페이지 타이틀 */}
            <div className="bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div>
                    <h1 className="text-lg font-bold text-[#111827] m-0">콘텐츠 최적화 관리</h1>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                        페이지별 노출 비중을 설정하고 클릭률에 따른 최적의 콘텐츠를 결정합니다.
                    </p>
                </div>
                <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0046A4] hover:bg-[#003380] transition-colors"
                    onClick={() => {
                        setCreateModalOpen(true);
                        setSelectedPages([
                            { pageId: '', weight: 5 },
                            { pageId: '', weight: 5 },
                        ]);
                    }}
                >
                    + 새 그룹 생성
                </button>
            </div>

            <main className="px-6 py-6 max-w-5xl mx-auto">
                {/* 그룹 목록 */}
                {groups.length === 0 ? (
                    <div className="text-center py-20 text-[#9ca3af] text-sm">생성된 그룹이 없습니다.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {groups.map((group) => (
                            <AbGroupCard
                                key={group.groupId}
                                group={group}
                                pages={pages}
                                copied={copiedGroupId === group.groupId}
                                onCopyUrl={() => copyUrl(group.groupId)}
                                onPromote={() => {
                                    setWinnerGroup(group);
                                    setWinnerModalOpen(true);
                                }}
                                onClear={() => handleClearGroup(group.groupId)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 그룹 생성 모달 */}
            {createModalOpen && (
                <Modal title="A/B 테스트 그룹 생성" onClose={() => setCreateModalOpen(false)}>
                    <div className="p-6 w-full max-w-lg">
                        <h2 className="text-base font-bold text-[#111827] mb-4">A/B 테스트 그룹 생성</h2>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-[#374151] mb-1">그룹 ID</label>
                            <input
                                type="text"
                                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0046A4] focus:border-transparent"
                                placeholder="예: banner-event-2024"
                                value={newGroupId}
                                onChange={(e) => setNewGroupId(e.target.value)}
                            />
                            <p className="text-[11px] text-[#9ca3af] mt-1">
                                영문 소문자, 숫자, 하이픈만 사용 가능 (최대 64자)
                            </p>
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-[#374151]">페이지 설정</label>
                                <button className="text-xs text-[#0046A4] hover:underline" onClick={handleAddPage}>
                                    + 페이지 추가
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {selectedPages.map((sp, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <select
                                            className="flex-1 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0046A4]"
                                            value={sp.pageId}
                                            onChange={(e) => {
                                                const newPages = [...selectedPages];
                                                newPages[idx] = { ...newPages[idx], pageId: e.target.value };
                                                setSelectedPages(newPages);
                                            }}
                                        >
                                            <option value="">페이지 선택</option>
                                            {approvedPages.map((p) => (
                                                <option
                                                    key={p.id}
                                                    value={p.id}
                                                    disabled={selectedPages.some(
                                                        (s, i) => i !== idx && s.pageId === p.id,
                                                    )}
                                                >
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-20 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0046A4]"
                                            value={sp.weight}
                                            onChange={(e) => {
                                                const newPages = [...selectedPages];
                                                newPages[idx] = {
                                                    ...newPages[idx],
                                                    weight: Math.max(0.01, parseFloat(e.target.value) || 1),
                                                };
                                                setSelectedPages(newPages);
                                            }}
                                        />
                                        <span className="text-xs text-[#6b7280] w-12">노출 비중</span>
                                        {selectedPages.length > 2 && (
                                            <button
                                                className="text-[#dc2626] text-xs hover:underline"
                                                onClick={() => handleRemovePage(idx)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#9ca3af] mt-1">
                                노출 비중은 상대적 비율입니다 (예: 7과 3이면 70%:30% 노출)
                            </p>
                        </div>

                        {createError && <p className="text-xs text-[#dc2626] mb-3">{createError}</p>}

                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#374151] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={createLoading}
                            >
                                취소
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0046A4] hover:bg-[#003380] transition-colors disabled:opacity-50"
                                onClick={handleCreateGroup}
                                disabled={createLoading}
                            >
                                {createLoading ? '생성 중...' : '그룹 생성'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Winner 선정 모달 */}
            {winnerModalOpen && winnerGroup && (
                <Modal
                    title="Winner 선정"
                    onClose={() => {
                        setWinnerModalOpen(false);
                        setWinnerGroup(null);
                    }}
                >
                    <div className="p-6 w-full max-w-md">
                        <h2 className="text-base font-bold text-[#111827] mb-1">Winner 선정</h2>
                        <p className="text-xs text-[#6b7280] mb-4">
                            선정된 페이지만 단독 노출되며, 나머지 페이지의 A/B 설정이 해제됩니다.
                        </p>
                        <div className="flex flex-col gap-2">
                            {winnerGroup.pages.map((p) => (
                                <button
                                    key={p.PAGE_ID}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#e5e7eb] hover:border-[#0046A4] hover:bg-[#f0f4ff] transition-colors text-left"
                                    onClick={() => handlePromoteWinner(p.PAGE_ID)}
                                >
                                    <span className="text-sm font-semibold text-[#111827]">{p.PAGE_NAME}</span>
                                    <span className="text-xs text-[#6b7280]">노출 비중 {p.AB_WEIGHT ?? '-'}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            className="mt-4 w-full px-4 py-2 rounded-lg text-sm text-[#374151] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
                            onClick={() => {
                                setWinnerModalOpen(false);
                                setWinnerGroup(null);
                            }}
                        >
                            취소
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ── 그룹 카드 컴포넌트 ──

interface AbGroupCardProps {
    group: AbGroupInfo;
    pages: AbPageCard[];
    copied: boolean;
    onCopyUrl: () => void;
    onPromote: () => void;
    onClear: () => void;
}

function AbGroupCard({ group, pages, copied, onCopyUrl, onPromote, onClear }: AbGroupCardProps) {
    const totalWeight = group.pages.reduce((sum, p) => sum + (p.AB_WEIGHT ?? 0), 0);

    return (
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
            {/* 그룹 헤더 */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-xs font-semibold text-[#0046A4] bg-[#e8f0fd] px-2 py-0.5 rounded-full">
                        {group.groupId}
                    </span>
                    <p className="text-[11px] text-[#9ca3af] mt-1">
                        페이지 {group.pages.length}개 · 총 노출 비중 {totalWeight}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0046A4] bg-[#e8f0fd] hover:bg-[#d1e3fa] transition-colors"
                        onClick={onCopyUrl}
                    >
                        {copied ? '복사됨!' : 'URL 복사'}
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#008C6A] hover:bg-[#006e52] transition-colors"
                        onClick={onPromote}
                    >
                        Winner 선정
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] transition-colors"
                        onClick={onClear}
                    >
                        그룹 해제
                    </button>
                </div>
            </div>

            {/* 페이지 비율 바 */}
            <div className="flex rounded-lg overflow-hidden h-3 mb-3">
                {group.pages.map((p, idx) => {
                    const ratio = totalWeight > 0 ? ((p.AB_WEIGHT ?? 0) / totalWeight) * 100 : 0;
                    return (
                        <div
                            key={p.PAGE_ID}
                            style={{ width: `${ratio}%`, background: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                            title={`${p.PAGE_NAME}: ${ratio.toFixed(1)}%`}
                        />
                    );
                })}
            </div>

            {/* 페이지 목록 */}
            <div className="flex flex-col gap-2">
                {group.pages.map((p, idx) => {
                    const pageDetail = pages.find((pd) => pd.id === p.PAGE_ID);
                    const ratio = totalWeight > 0 ? ((p.AB_WEIGHT ?? 0) / totalWeight) * 100 : 0;
                    const vmStyle = pageDetail ? VIEW_MODE_STYLE[pageDetail.viewMode] : null;

                    return (
                        <div key={p.PAGE_ID} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f8f9fb]">
                            <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                            />
                            <span className="flex-1 text-sm font-semibold text-[#111827] truncate">{p.PAGE_NAME}</span>
                            {vmStyle && (
                                <span
                                    className="px-2 py-0.5 rounded-[10px] text-[10px] font-semibold"
                                    style={{ background: vmStyle.bg, color: vmStyle.color }}
                                >
                                    {vmStyle.label}
                                </span>
                            )}
                            <span className="text-xs text-[#6b7280] shrink-0">
                                노출 비중 {p.AB_WEIGHT ?? '-'} ({ratio.toFixed(1)}%)
                            </span>
                            {pageDetail && (
                                <div className="flex gap-2 text-[11px] text-[#9ca3af] shrink-0">
                                    <span>노출 {pageDetail.viewCount.toLocaleString()}</span>
                                    <span>클릭 {pageDetail.clickCount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
