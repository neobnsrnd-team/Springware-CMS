// src/components/approve/ApproveClient.tsx
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// 정렬 옵션 목록
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'date', label: '최신 수정순' },
    { value: 'name', label: '이름순' },
];

type ViewMode = 'mobile' | 'web' | 'responsive';
type SortBy = 'date' | 'name';
type ApproveStateFilter = 'WORK' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovePageCard {
    id: string;
    label: string;
    viewMode: ViewMode;
    thumbnail: string | null;
    lastModifiedDtime: string | null;
    approveState: ApproveStateFilter;
    createUserName: string;
}

export interface ApproveClientProps {
    initialPages: ApprovePageCard[];
    totalCount: number;
    currentPage: number;
    search: string;
    sortBy: SortBy;
    approveState: ApproveStateFilter | null;
}

// 뷰 모드 뱃지 색상
const VIEW_MODE_STYLE: Record<ViewMode, { bg: string; color: string; label: string }> = {
    mobile: { bg: '#e8f0fd', color: '#0046A4', label: '모바일' },
    web: { bg: '#e6f4ef', color: '#008C6A', label: '웹' },
    responsive: { bg: '#f0eaf9', color: '#6d28d9', label: '반응형' },
};

// 결재 상태 뱃지 색상
const APPROVE_STYLE: Record<ApproveStateFilter, { bg: string; color: string; label: string }> = {
    WORK: { bg: '#f3f4f6', color: '#6b7280', label: '작업중' },
    PENDING: { bg: '#fefce8', color: '#b45309', label: '승인대기' },
    APPROVED: { bg: '#e6f4ef', color: '#008C6A', label: '승인' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', label: '반려' },
};

const PAGE_SIZE = 12;

// 승인 상태 필터 옵션
const APPROVE_FILTERS: { value: ApproveStateFilter | null; label: string }[] = [
    { value: null, label: '전체' },
    { value: 'PENDING', label: '승인대기' },
    { value: 'WORK', label: '작업중' },
    { value: 'APPROVED', label: '승인' },
    { value: 'REJECTED', label: '반려' },
];

export default function ApproveClient({
    initialPages,
    totalCount,
    currentPage,
    search: initialSearch,
    sortBy: initialSortBy,
    approveState: initialApproveState,
}: ApproveClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 검색·정렬·필터는 로컬 상태로 관리 후 URL 반영
    const [search, setSearch] = useState(initialSearch);
    const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
    const [approveStateFilter, setApproveStateFilter] = useState<ApproveStateFilter | null>(initialApproveState);

    const [pages, setPages] = useState<ApprovePageCard[]>(initialPages);
    const [localTotalCount, setLocalTotalCount] = useState(totalCount);

    // 반려 모달 상태
    const [rejectModalPageId, setRejectModalPageId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);

    // 서버에서 새 데이터가 내려올 때 동기화
    useEffect(() => {
        setPages(initialPages);
        setLocalTotalCount(totalCount);
    }, [initialPages, totalCount]);

    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
                setSortDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // URL 업데이트 헬퍼
    function navigate(params: {
        page?: number;
        search?: string;
        sortBy?: SortBy;
        approveState?: ApproveStateFilter | null;
    }) {
        const sp = new URLSearchParams();
        const nextPage = params.page ?? 1;
        const nextSearch = params.search ?? search;
        const nextSortBy = params.sortBy ?? sortBy;
        const nextApproveState = 'approveState' in params ? params.approveState : approveStateFilter;

        if (nextPage > 1) sp.set('page', String(nextPage));
        if (nextSearch) sp.set('search', nextSearch);
        if (nextSortBy !== 'date') sp.set('sortBy', nextSortBy);
        if (nextApproveState) sp.set('approveState', nextApproveState);

        const query = sp.toString();
        startTransition(() => {
            router.push(`/approve${query ? `?${query}` : ''}`);
        });
    }

    // 검색어 디바운스 (300ms)
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            navigate({ page: 1, search, sortBy });
        }, 300);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // 정렬 변경
    function handleSortChange(value: SortBy) {
        setSortBy(value);
        navigate({ page: 1, search, sortBy: value });
    }

    // 승인 상태 필터 변경
    function handleApproveStateChange(value: ApproveStateFilter | null) {
        setApproveStateFilter(value);
        navigate({ page: 1, search, sortBy, approveState: value });
    }

    // 페이지 이동
    function handlePageChange(page: number) {
        navigate({ page, search, sortBy });
    }

    // 승인 처리 — 확인 후 API 호출
    async function handleApprove(pageId: string) {
        if (!confirm('이 페이지를 승인하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/builder/pages/${pageId}/approve`, {
                method: 'PATCH',
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '승인 처리에 실패했습니다.');
                return;
            }
            router.refresh();
        } catch (err: unknown) {
            console.error('승인 처리 오류:', err);
            alert('승인 처리에 실패했습니다.');
        }
    }

    function handleReject(pageId: string) {
        setRejectModalPageId(pageId);
        setRejectReason('');
    }

    // 반려 확정 — API 호출 후 페이지 새로고침
    async function handleRejectConfirm() {
        if (!rejectModalPageId || !rejectReason.trim() || rejecting) return;

        setRejecting(true);
        try {
            const res = await fetch(`/api/builder/pages/${rejectModalPageId}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectedReason: rejectReason.trim() }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '반려 처리에 실패했습니다.');
                return;
            }
            // 성공 → 모달 닫기 + 페이지 새로고침
            setRejectModalPageId(null);
            router.refresh();
        } catch (err: unknown) {
            console.error('반려 처리 오류:', err);
            alert('반려 처리에 실패했습니다.');
        } finally {
            setRejecting(false);
        }
    }

    // 날짜 포맷 (YYYY.MM.DD HH:MM)
    function formatDate(isoStr: string | null): string {
        if (!isoStr) return '—';
        const d = new Date(isoStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
    }

    const totalPages = Math.ceil(localTotalCount / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-[#f0f0f5]">
            {/* ── 헤더 ── */}
            <header className="bg-[#1e3a5f] px-8 h-[60px] flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sticky top-0 z-[100]">
                <span className="font-bold text-base text-white tracking-[-0.3px]">Springware CMS</span>
                <span className="text-[#4e7aad] text-sm">/</span>
                <span className="text-sm text-[#c8dff5]">승인 관리</span>
                <span className="ml-auto px-2.5 py-1 rounded-full bg-[#b45309] text-white text-[11px] font-bold tracking-wide">
                    관리자
                </span>
            </header>

            {/* ── 본문 ── */}
            <main
                className={`max-w-[1280px] mx-auto px-8 pt-8 pb-16 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}
            >
                {/* ── 툴바 ── */}
                <div className="mb-7">
                    {/* 타이틀 행 */}
                    <div className="flex items-center justify-between mb-5 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-7 rounded-full bg-[#1e3a5f] shrink-0" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="text-[#1e3a5f] shrink-0"
                                    >
                                        <path
                                            d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M9 12l2 2 4-4"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <h1 className="m-0 text-[22px] font-bold text-[#1e3a5f]">승인 관리</h1>
                                    <span className="text-[13px] text-[#9ca3af]">
                                        {localTotalCount.toLocaleString()}개
                                    </span>
                                </div>
                                <p className="m-0 text-[12px] text-[#6b7280] mt-0.5">
                                    승인 대기 중인 페이지를 검토하고 처리합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 승인 상태 필터 버튼 */}
                    <div className="flex gap-1.5 mb-3">
                        {APPROVE_FILTERS.map((f) => {
                            const active = approveStateFilter === f.value;
                            return (
                                <button
                                    key={String(f.value)}
                                    onClick={() => handleApproveStateChange(f.value)}
                                    className={`px-[14px] py-[5px] rounded-full border text-[12px] cursor-pointer transition-all duration-150 ${
                                        active
                                            ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white font-semibold'
                                            : 'border-[#e5e7eb] bg-white text-[#6b7280] font-normal'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* 검색 + 정렬 행 */}
                    <div className="flex gap-2 items-center">
                        {/* 검색 인풋 */}
                        <div className="relative flex-1 max-w-[400px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] pointer-events-none">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="페이지 이름 검색"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full box-border py-[9px] pr-[14px] pl-9 rounded-lg border border-[#e5e7eb] text-[13px] outline-none bg-white text-[#111827]"
                            />
                        </div>

                        {/* 정렬 드롭다운 */}
                        <div ref={sortDropdownRef} className="relative shrink-0">
                            <button
                                onClick={() => setSortDropdownOpen((v) => !v)}
                                className={`inline-flex items-center gap-1.5 px-[14px] py-[9px] rounded-lg border text-[13px] cursor-pointer whitespace-nowrap transition-all duration-150 font-medium ${
                                    sortDropdownOpen
                                        ? 'border-[#0046A4] bg-[#f0f4ff] text-[#0046A4]'
                                        : 'border-[#e5e7eb] bg-white text-[#374151]'
                                }`}
                            >
                                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className={`transition-transform duration-150 shrink-0 ${sortDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                                >
                                    <path
                                        d="M2 4l4 4 4-4"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            {sortDropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] right-0 min-w-[140px] bg-white rounded-lg border border-[#e5e7eb] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden z-50">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                handleSortChange(opt.value);
                                                setSortDropdownOpen(false);
                                            }}
                                            className={`flex items-center justify-between w-full px-[14px] py-[9px] border-0 bg-white text-[13px] cursor-pointer text-left ${
                                                sortBy === opt.value
                                                    ? 'text-[#0046A4] font-semibold'
                                                    : 'text-[#374151] font-normal'
                                            }`}
                                        >
                                            {opt.label}
                                            {sortBy === opt.value && (
                                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                    <path
                                                        d="M2 6.5l3 3 6-6"
                                                        stroke="#0046A4"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 카드 그리드 */}
                {pages.length === 0 ? (
                    <div className="text-center py-20 text-[#9ca3af] text-sm">
                        {search
                            ? `'${search}'에 대한 검색 결과가 없습니다.`
                            : approveStateFilter === 'PENDING'
                              ? '현재 승인 대기 중인 페이지가 없습니다.'
                              : approveStateFilter === null
                                ? '등록된 페이지가 없습니다.'
                                : '조건에 맞는 페이지가 없습니다.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 mb-8">
                        {pages.map((page) => {
                            const vmStyle = VIEW_MODE_STYLE[page.viewMode] ?? VIEW_MODE_STYLE.mobile;
                            const apStyle = APPROVE_STYLE[page.approveState] ?? APPROVE_STYLE.WORK;

                            return (
                                <div
                                    key={page.id}
                                    className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150 cursor-pointer flex flex-col hover:shadow-[0_8px_24px_rgba(0,70,164,0.12)] hover:-translate-y-0.5"
                                    onClick={() => {
                                        window.open(`/view?bank=${page.id}`, '_blank');
                                    }}
                                >
                                    {/* 썸네일 영역 */}
                                    <div
                                        className="relative h-[140px] flex items-center justify-center shrink-0 border-b border-[#f3f4f6] group/thumb overflow-hidden"
                                        style={{
                                            background: page.thumbnail
                                                ? `url(${page.thumbnail}) center/cover no-repeat`
                                                : '#f0f4ff',
                                        }}
                                    >
                                        {!page.thumbnail && (
                                            <span className="text-[36px] opacity-40">
                                                {page.viewMode === 'mobile'
                                                    ? '📱'
                                                    : page.viewMode === 'web'
                                                      ? '🖥️'
                                                      : '🔄'}
                                            </span>
                                        )}
                                        {/* 미리보기 호버 오버레이 */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[rgba(30,58,95,0.45)] opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-150">
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-white"
                                            >
                                                <path
                                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            <span className="text-white text-[12px] font-semibold">미리보기</span>
                                        </div>
                                    </div>

                                    {/* 카드 본문 */}
                                    <div className="px-4 pt-3.5 pb-3 flex-1 flex flex-col gap-2">
                                        <p
                                            className="m-0 text-sm font-semibold text-[#111827] truncate"
                                            title={page.label}
                                        >
                                            {page.label}
                                        </p>

                                        {/* 작성자 */}
                                        <p className="m-0 text-[11px] text-[#6b7280]">작성자: {page.createUserName}</p>

                                        {/* 뱃지 행 */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            <span
                                                className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold"
                                                style={{ background: vmStyle.bg, color: vmStyle.color }}
                                            >
                                                {vmStyle.label}
                                            </span>
                                            <span
                                                className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold"
                                                style={{ background: apStyle.bg, color: apStyle.color }}
                                            >
                                                {apStyle.label}
                                            </span>
                                        </div>

                                        <p className="m-0 text-[11px] text-[#9ca3af]">
                                            {formatDate(page.lastModifiedDtime)}
                                        </p>
                                    </div>

                                    {/* 카드 푸터: 승인/반려 버튼 (PENDING 상태일 때만) */}
                                    {page.approveState === 'PENDING' && (
                                        <div
                                            className="px-4 py-2 border-t border-[#f3f4f6] flex justify-end gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => handleReject(page.id)}
                                                className="px-2.5 py-1 rounded-md border border-[#fca5a5] bg-transparent text-[#dc2626] text-xs cursor-pointer"
                                            >
                                                반려
                                            </button>
                                            <button
                                                onClick={() => handleApprove(page.id)}
                                                className="px-2.5 py-1 rounded-md border border-[#0046A4] bg-[#0046A4] text-white text-xs cursor-pointer"
                                            >
                                                승인
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-1">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3.5 py-1.5 rounded-md border border-[#e5e7eb] text-[13px] ${
                                currentPage === 1
                                    ? 'bg-[#f9fafb] text-[#d1d5db] cursor-not-allowed'
                                    : 'bg-white text-[#374151] cursor-pointer'
                            }`}
                        >
                            이전
                        </button>

                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                            const half = 3;
                            let start = Math.max(1, currentPage - half);
                            const end = Math.min(totalPages, start + 6);
                            start = Math.max(1, end - 6);
                            return start + i;
                        }).map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-1.5 rounded-md border text-[13px] cursor-pointer ${
                                    currentPage === p
                                        ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white font-semibold'
                                        : 'border-[#e5e7eb] bg-white text-[#374151] font-normal'
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3.5 py-1.5 rounded-md border border-[#e5e7eb] text-[13px] ${
                                currentPage === totalPages
                                    ? 'bg-[#f9fafb] text-[#d1d5db] cursor-not-allowed'
                                    : 'bg-white text-[#374151] cursor-pointer'
                            }`}
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>

            {/* ── 반려 사유 입력 모달 ── */}
            {rejectModalPageId && (
                <div
                    onClick={() => setRejectModalPageId(null)}
                    className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[20px] p-8 w-[480px] max-w-[90vw] shadow-[0_24px_64px_rgba(0,70,164,0.15)]"
                    >
                        <h3 className="m-0 mb-6 text-lg font-bold text-[#111827]">반려 사유 입력</h3>

                        <textarea
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setRejectModalPageId(null);
                            }}
                            placeholder="반려 사유를 입력해 주세요."
                            rows={4}
                            className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm mb-5 outline-none resize-y"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectModalPageId(null)}
                                className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] text-sm cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={!rejectReason.trim() || rejecting}
                                className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                                    !rejectReason.trim() || rejecting
                                        ? 'bg-[#d1d5db] cursor-not-allowed'
                                        : 'bg-[#dc2626] cursor-pointer'
                                }`}
                            >
                                {rejecting ? '처리 중...' : '반려 확정'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
