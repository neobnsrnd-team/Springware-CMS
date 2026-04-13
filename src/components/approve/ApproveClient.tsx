// src/components/approve/ApproveClient.tsx
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/Modal';
import PageCard, { VIEW_MODE_STYLE, formatDate } from '@/components/ui/PageCard';
import type { ViewMode } from '@/components/ui/PageCard';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import StatsModal from './StatsModal';
import RollbackModal from './RollbackModal';
import { APPROVE_FILTERS } from '@/data/approve-config';
import type { ApproveStateFilter } from '@/data/approve-config';

export type { ApproveStateFilter };

// 정렬 옵션 목록
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'date', label: '최신 수정순' },
    { value: 'name', label: '이름순' },
];

type SortBy = 'date' | 'name';

export interface ApprovePageCard {
    id: string;
    label: string;
    viewMode: ViewMode;
    thumbnail: string | null;
    lastModifiedDtime: string | null;
    approveState: ApproveStateFilter;
    createUserName: string;
    hasFile: boolean;
    isPublic: string;
    beginningDate: string | null;
    expiredDate: string | null;
    isExpired: boolean;
    hasApproveHistory: boolean;
}

export interface ApproveClientProps {
    initialPages: ApprovePageCard[];
    totalCount: number;
    currentPage: number;
    search: string;
    sortBy: SortBy;
    approveState: ApproveStateFilter | null;
    createUser: string;
}

const PAGE_SIZE = 12;

export default function ApproveClient({
    initialPages,
    totalCount,
    currentPage,
    search: initialSearch,
    sortBy: initialSortBy,
    approveState: initialApproveState,
    createUser: initialCreateUser,
}: ApproveClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 검색·정렬·필터는 로컬 상태로 관리 후 URL 반영
    const [search, setSearch] = useState(initialSearch);
    const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
    const [approveStateFilter, setApproveStateFilter] = useState<ApproveStateFilter | null>(initialApproveState);
    const [createUserFilter, setCreateUserFilter] = useState(initialCreateUser);
    const [showExpired, setShowExpired] = useState(true);

    const [pages, setPages] = useState<ApprovePageCard[]>(initialPages);
    const [localTotalCount, setLocalTotalCount] = useState(totalCount);

    // 반려 모달 상태
    const [rejectModalPageId, setRejectModalPageId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejecting, setRejecting] = useState(false);

    // 승인 모달 상태
    const [approveModalPageId, setApproveModalPageId] = useState<string | null>(null);
    const [beginningDate, setBeginningDate] = useState('');
    const [approving, setApproving] = useState(false);

    // 날짜 관리 모달 상태
    const [statsPageId, setStatsPageId] = useState<string | null>(null);
    const [statsLabel, setStatsLabel] = useState('');

    const [dateModalPageId, setDateModalPageId] = useState<string | null>(null);
    const [editBeginningDate, setEditBeginningDate] = useState('');
    const [editExpiredDate, setEditExpiredDate] = useState('');
    const [savingDates, setSavingDates] = useState(false);

    // 롤백 모달 상태
    const [rollbackModalPageId, setRollbackModalPageId] = useState<string | null>(null);
    const [rollbackModalLabel, setRollbackModalLabel] = useState('');

    // 배포 상태
    const [deploying, setDeploying] = useState<string | null>(null); // 배포 중인 pageId

    // 카드 더보기 드롭다운 상태
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // 배포 이력 모달 상태
    type DeployRecord = {
        INSTANCE_ID: string;
        FILE_ID: string;
        FILE_SIZE: string | null;
        FILE_CRC_VALUE: string | null;
        LAST_MODIFIED_DTIME: string | null;
        LAST_MODIFIER_ID: string | null;
        INSTANCE_NAME?: string;
    };
    const [historyModalPageId, setHistoryModalPageId] = useState<string | null>(null);
    const [historyModalPage, setHistoryModalPage] = useState<ApprovePageCard | null>(null);
    const [historyList, setHistoryList] = useState<DeployRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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
        createUser?: string;
    }) {
        const sp = new URLSearchParams();
        const nextPage = params.page ?? 1;
        const nextSearch = params.search ?? search;
        const nextSortBy = params.sortBy ?? sortBy;
        const nextApproveState = 'approveState' in params ? params.approveState : approveStateFilter;
        const nextCreateUser = 'createUser' in params ? (params.createUser ?? '') : createUserFilter;

        if (nextPage > 1) sp.set('page', String(nextPage));
        if (nextSearch) sp.set('search', nextSearch);
        if (nextSortBy !== 'date') sp.set('sortBy', nextSortBy);
        if (nextApproveState) sp.set('approveState', nextApproveState);
        if (nextCreateUser) sp.set('createUser', nextCreateUser);

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

    // 승인 상태 필터 변경 (동일 값 재클릭 시 해제 → 전체)
    function handleApproveStateChange(value: ApproveStateFilter | null) {
        const next = approveStateFilter === value ? null : value;
        setApproveStateFilter(next);
        navigate({ page: 1, search, sortBy, approveState: next });
    }

    // 작성자 필터 클릭
    function handleCreateUserClick(e: React.MouseEvent, userName: string) {
        e.stopPropagation();
        const next = createUserFilter === userName ? '' : userName;
        setCreateUserFilter(next);
        navigate({ page: 1, search, sortBy, createUser: next });
    }

    // 작성자 필터 해제
    function clearCreateUserFilter() {
        setCreateUserFilter('');
        navigate({ page: 1, search, sortBy, createUser: '' });
    }

    // 날짜 관리 모달 열기
    function handleOpenDateModal(pageId: string) {
        const target = pages.find((p) => p.id === pageId);
        setDateModalPageId(pageId);
        setEditBeginningDate(target?.beginningDate?.split('T')[0] ?? '');
        setEditExpiredDate(target?.expiredDate?.split('T')[0] ?? '');
    }

    // 날짜 관리 저장
    async function handleSaveDates() {
        if (!dateModalPageId || savingDates) return;
        if (editBeginningDate && editExpiredDate && editBeginningDate > editExpiredDate) {
            alert('시작일은 만료일보다 이전이어야 합니다.');
            return;
        }
        setSavingDates(true);
        try {
            const res = await fetch(`/api/builder/pages/${dateModalPageId}/update-dates`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beginningDate: editBeginningDate || null,
                    expiredDate: editExpiredDate || null,
                }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '날짜 수정에 실패했습니다.');
                return;
            }
            setDateModalPageId(null);
            router.refresh();
        } catch (err: unknown) {
            console.error('날짜 수정 오류:', err);
            alert('날짜 수정에 실패했습니다.');
        } finally {
            setSavingDates(false);
        }
    }

    // IS_PUBLIC 토글 — 비공개/공개 복원
    async function handleSetPublic(pageId: string, isPublic: 'Y' | 'N') {
        const actionText = isPublic === 'Y' ? '공개 복원' : '비공개 처리';
        if (!confirm(`이 페이지를 ${actionText}하시겠습니까?`)) return;
        try {
            const res = await fetch(`/api/builder/pages/${pageId}/set-public`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? `${actionText}에 실패했습니다.`);
                return;
            }
            router.refresh();
        } catch {
            alert(`${actionText}에 실패했습니다.`);
        }
    }

    // 페이지 이동
    function handlePageChange(page: number) {
        navigate({ page, search, sortBy });
    }

    // 승인 모달 열기
    function handleApprove(pageId: string) {
        setApproveModalPageId(pageId);
        const d = new Date();
        setBeginningDate(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        );
    }

    // 승인 확정 — API 호출 후 페이지 새로고침
    async function handleApproveConfirm() {
        if (!approveModalPageId || approving) return;

        setApproving(true);
        try {
            const res = await fetch(`/api/builder/pages/${approveModalPageId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beginningDate: beginningDate || null,
                }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '승인 처리에 실패했습니다.');
                return;
            }
            setApproveModalPageId(null);
            router.refresh();
        } catch (err: unknown) {
            console.error('승인 처리 오류:', err);
            alert('승인 처리에 실패했습니다.');
        } finally {
            setApproving(false);
        }
    }

    // 배포 실행 — 컨펌 후 API 호출
    async function handleDeploy(pageId: string) {
        if (!window.confirm('배포하시겠습니까?\n승인된 페이지를 운영 서버로 전송합니다.')) return;
        if (deploying) return;

        setDeploying(pageId);
        try {
            const res = await fetch('/api/deploy/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '배포에 실패했습니다.');
                return;
            }
            alert(`배포 완료 (성공: ${data.successCount}개 서버, 실패: ${data.failCount}개 서버)`);
            router.refresh();
        } catch (err: unknown) {
            console.error('배포 오류:', err);
            alert('배포 처리에 실패했습니다.');
        } finally {
            setDeploying(null);
        }
    }

    // 배포 이력 모달 열기
    async function handleOpenHistory(pageId: string) {
        const targetPage = pages.find((p) => p.id === pageId) ?? null;
        setHistoryModalPageId(pageId);
        setHistoryModalPage(targetPage);
        setHistoryList([]);
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/deploy/history?pageId=${encodeURIComponent(pageId)}`);
            const data = await res.json();
            if (data.ok) setHistoryList(data.history ?? []);
        } catch (err: unknown) {
            console.error('배포 이력 조회 오류:', err);
        } finally {
            setHistoryLoading(false);
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

    const totalPages = Math.ceil(localTotalCount / PAGE_SIZE);

    // 빈 상태 메시지 결정
    function getEmptyMessage() {
        if (search) return `'${search}'에 대한 검색 결과가 없습니다.`;
        switch (approveStateFilter) {
            case 'PENDING':
                return '현재 승인 대기 중인 페이지가 없습니다.';
            case null:
                return '등록된 페이지가 없습니다.';
            default:
                return '조건에 맞는 페이지가 없습니다.';
        }
    }

    return (
        <div className="min-h-screen bg-[#eaedf0]">
            {/* ── 헤더 ── */}
            <header className="bg-[#1e3a5f] px-8 shadow-[0_2px_8px_rgba(0,0,0,0.18)] sticky top-0 z-[100]">
                <div className="h-[60px] flex items-center gap-3">
                    <span className="font-bold text-base text-white tracking-[-0.3px]">Springware CMS</span>
                    <span className="ml-auto px-2.5 py-1 rounded-full bg-[#b45309] text-white text-[11px] font-bold tracking-wide">
                        관리자
                    </span>
                </div>
                <AdminNavTabs />
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
                        <button
                            onClick={() => setShowExpired(!showExpired)}
                            className={`px-[14px] py-[5px] rounded-full border text-[12px] cursor-pointer transition-all duration-150 ${
                                showExpired
                                    ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-semibold'
                                    : 'border-[#e5e7eb] bg-white text-[#6b7280] font-normal'
                            }`}
                        >
                            만료 포함
                        </button>
                    </div>

                    {/* 작성자 필터 태그 */}
                    {createUserFilter && (
                        <div className="flex items-center gap-1.5 mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef2f7] text-[12px] text-[#1e3a5f] font-medium">
                                작성자: {createUserFilter}
                                <button
                                    onClick={clearCreateUserFilter}
                                    className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full border-0 bg-transparent text-[#6b7280] text-[11px] cursor-pointer hover:bg-[#d1d5db] hover:text-[#374151]"
                                >
                                    ✕
                                </button>
                            </span>
                        </div>
                    )}

                    {/* 검색 + 정렬 행 */}
                    <div className="flex gap-2 items-center">
                        {/* 검색 인풋 */}
                        <div className="relative flex-1 max-w-[400px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] pointer-events-none">
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="페이지 이름 또는 작성자 검색"
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
                    <div className="text-center py-20 text-[#9ca3af] text-sm">{getEmptyMessage()}</div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 mb-8">
                        {pages
                            .filter((p) => showExpired || !p.isExpired)
                            .map((page) => {
                                return (
                                    <PageCard
                                        key={page.id}
                                        page={page}
                                        onClick={() => {
                                            if (page.isExpired) {
                                                alert('만료된 페이지입니다.');
                                                return;
                                            }
                                            if (!page.hasFile) {
                                                alert('페이지 파일이 로컬에 존재하지 않습니다.');
                                                return;
                                            }
                                            window.open(`/view?bank=${page.id}`, '_blank');
                                        }}
                                        overlay={{ label: '미리보기', color: 'rgba(30,58,95,0.45)' }}
                                        authorSlot={
                                            <div className="flex items-center justify-between gap-1">
                                                <span
                                                    className={`flex items-center gap-1 text-[11px] min-w-0 cursor-pointer transition-colors duration-150 ${
                                                        createUserFilter === page.createUserName
                                                            ? 'text-[#1e3a5f] font-semibold'
                                                            : 'text-[#6b7280] hover:text-[#1e3a5f]'
                                                    }`}
                                                    onClick={(e) => handleCreateUserClick(e, page.createUserName)}
                                                >
                                                    <svg
                                                        width="11"
                                                        height="11"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        className="shrink-0 text-[#9ca3af]"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="8"
                                                            r="4"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        />
                                                        <path
                                                            d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <span className="truncate">{page.createUserName}</span>
                                                </span>
                                                <span className="text-[11px] text-[#9ca3af] shrink-0">
                                                    {formatDate(page.lastModifiedDtime)}
                                                </span>
                                            </div>
                                        }
                                        footerSlot={
                                            page.approveState === 'PENDING' ? (
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
                                                        className="px-2.5 py-1 rounded-md border border-[#1e3a5f] bg-[#1e3a5f] text-white text-xs cursor-pointer"
                                                    >
                                                        승인
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'APPROVED' && page.isExpired ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex items-center justify-between"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-xs text-[#dc2626] font-medium">
                                                        만료된 페이지
                                                    </span>
                                                    <button
                                                        onClick={() => handleSetPublic(page.id, 'Y')}
                                                        className="px-2.5 py-1 rounded-md border border-[#93c5fd] bg-transparent text-[#0046A4] text-xs cursor-pointer"
                                                    >
                                                        공개 복원
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'APPROVED' && page.isPublic === 'N' ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex items-center justify-between"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-xs text-[#6b7280] font-medium">
                                                        비공개 상태
                                                    </span>
                                                    <button
                                                        onClick={() => handleSetPublic(page.id, 'Y')}
                                                        className="px-2.5 py-1 rounded-md border border-[#93c5fd] bg-transparent text-[#0046A4] text-xs cursor-pointer"
                                                    >
                                                        공개 복원
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'APPROVED' ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex justify-end gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* 더보기 드롭다운 */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === page.id ? null : page.id);
                                                            }}
                                                            className="px-2.5 py-1 rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] text-xs cursor-pointer hover:bg-[#f9fafb]"
                                                        >
                                                            ⋮ 더보기
                                                        </button>
                                                        {openMenuId === page.id && (
                                                            <>
                                                                {/* 외부 클릭 감지용 오버레이 */}
                                                                <div
                                                                    className="fixed inset-0 z-[9]"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-10 py-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            setStatsPageId(page.id);
                                                                            setStatsLabel(page.label);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        통계
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleOpenDateModal(page.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        날짜 관리
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleOpenHistory(page.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        배포 이력
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setRollbackModalPageId(page.id);
                                                                            setRollbackModalLabel(page.label);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        버전 롤백
                                                                    </button>
                                                                    <div className="my-1 border-t border-[#f3f4f6]" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleSetPublic(page.id, 'N');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#dc2626] hover:bg-[#fff5f5] cursor-pointer"
                                                                    >
                                                                        비공개 처리
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* 배포 버튼 */}
                                                    <button
                                                        onClick={() => handleDeploy(page.id)}
                                                        disabled={deploying === page.id || !page.hasFile}
                                                        title={
                                                            !page.hasFile
                                                                ? '로컬 파일이 없습니다. 에디터에서 저장 후 시도해 주세요.'
                                                                : undefined
                                                        }
                                                        className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                                                            deploying === page.id || !page.hasFile
                                                                ? 'border-[#d1d5db] bg-[#d1d5db] text-white cursor-not-allowed'
                                                                : 'border-[#0046A4] bg-[#0046A4] text-white cursor-pointer'
                                                        }`}
                                                    >
                                                        {deploying === page.id ? '배포 중...' : '배포'}
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'WORK' &&
                                              page.hasApproveHistory &&
                                              page.isExpired ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex items-center justify-between"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-xs text-[#dc2626] font-medium">
                                                        만료된 페이지
                                                    </span>
                                                    <button
                                                        onClick={() => handleSetPublic(page.id, 'Y')}
                                                        className="px-2.5 py-1 rounded-md border border-[#93c5fd] bg-transparent text-[#0046A4] text-xs cursor-pointer"
                                                    >
                                                        공개 복원
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'WORK' &&
                                              page.hasApproveHistory &&
                                              page.isPublic === 'N' ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex items-center justify-between"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-xs text-[#6b7280] font-medium">
                                                        비공개 상태
                                                    </span>
                                                    <button
                                                        onClick={() => handleSetPublic(page.id, 'Y')}
                                                        className="px-2.5 py-1 rounded-md border border-[#93c5fd] bg-transparent text-[#0046A4] text-xs cursor-pointer"
                                                    >
                                                        공개 복원
                                                    </button>
                                                </div>
                                            ) : page.approveState === 'WORK' && page.hasApproveHistory ? (
                                                <div
                                                    className="px-4 py-2 border-t border-[#f3f4f6] flex justify-end"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === page.id ? null : page.id);
                                                            }}
                                                            className="px-2.5 py-1 rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] text-xs cursor-pointer hover:bg-[#f9fafb]"
                                                        >
                                                            ⋮ 더보기
                                                        </button>
                                                        {openMenuId === page.id && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-[9]"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-10 py-1"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            setStatsPageId(page.id);
                                                                            setStatsLabel(page.label);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        통계
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleOpenDateModal(page.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        날짜 관리
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleOpenHistory(page.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        배포 이력
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setRollbackModalPageId(page.id);
                                                                            setRollbackModalLabel(page.label);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                                                                    >
                                                                        버전 롤백
                                                                    </button>
                                                                    <div className="my-1 border-t border-[#f3f4f6]" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleSetPublic(page.id, 'N');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-xs text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer"
                                                                    >
                                                                        비공개 처리
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : undefined
                                        }
                                    />
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
                <Modal
                    title="반려 사유 입력"
                    onClose={() => setRejectModalPageId(null)}
                    showCloseButton={false}
                    width="480px"
                    className="p-8"
                >
                    <textarea
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
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
                </Modal>
            )}

            {/* ── 승인 확인 모달 ── */}
            {approveModalPageId &&
                (() => {
                    const targetPage = pages.find((p) => p.id === approveModalPageId);
                    return (
                        <Modal
                            title="페이지 승인"
                            onClose={() => setApproveModalPageId(null)}
                            showCloseButton={false}
                            width="480px"
                            className="p-8"
                        >
                            {/* 페이지 정보 요약 */}
                            {targetPage && (
                                <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
                                    <div
                                        className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center"
                                        style={{
                                            background: targetPage.thumbnail
                                                ? `url(${targetPage.thumbnail}) center/cover no-repeat`
                                                : '#e8f0fd',
                                        }}
                                    >
                                        {!targetPage.thumbnail && (
                                            <span className="text-lg opacity-40">
                                                {targetPage.viewMode === 'mobile'
                                                    ? '📱'
                                                    : targetPage.viewMode === 'web'
                                                      ? '🖥️'
                                                      : '🔄'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="m-0 text-sm font-semibold text-[#111827] truncate">
                                            {targetPage.label}
                                        </p>
                                        <span
                                            className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold"
                                            style={{
                                                background: VIEW_MODE_STYLE[targetPage.viewMode]?.bg,
                                                color: VIEW_MODE_STYLE[targetPage.viewMode]?.color,
                                            }}
                                        >
                                            {VIEW_MODE_STYLE[targetPage.viewMode]?.label}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 시작일 입력 */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                                    시작일 <span className="text-[#9ca3af] font-normal">(선택)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={beginningDate}
                                        onChange={(e) => setBeginningDate(e.target.value)}
                                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                        className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm outline-none pr-9 cursor-pointer"
                                    />
                                    {beginningDate && (
                                        <button
                                            type="button"
                                            onClick={() => setBeginningDate('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full border-0 bg-transparent text-[#9ca3af] text-sm cursor-pointer hover:bg-[#f3f4f6] hover:text-[#374151]"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <p className="m-0 mt-1 text-[12px] text-[#9ca3af]">
                                    페이지 노출 시작일입니다. 기본값은 오늘입니다.
                                </p>
                            </div>

                            {/* 만료일 — 승인 요청 시 지정된 값 (읽기 전용) */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-[#374151] mb-1.5">만료일</label>
                                <div className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-sm text-[#374151]">
                                    {formatDate(pages.find((p) => p.id === approveModalPageId)?.expiredDate ?? null) ??
                                        '-'}
                                </div>
                                <p className="m-0 mt-1 text-[12px] text-[#9ca3af]">승인 요청 시 지정된 만료일입니다.</p>
                            </div>

                            {/* 버튼 */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setApproveModalPageId(null)}
                                    className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] text-sm cursor-pointer"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleApproveConfirm}
                                    disabled={approving}
                                    className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                                        approving ? 'bg-[#d1d5db] cursor-not-allowed' : 'bg-[#1e3a5f] cursor-pointer'
                                    }`}
                                >
                                    {approving ? '처리 중...' : '승인 확정'}
                                </button>
                            </div>
                        </Modal>
                    );
                })()}
            {/* ── 통계 모달 ── */}
            {statsPageId && (
                <StatsModal pageId={statsPageId} pageLabel={statsLabel} onClose={() => setStatsPageId(null)} />
            )}

            {/* ── 날짜 관리 모달 ── */}
            {dateModalPageId && (
                <Modal
                    title="날짜 관리"
                    onClose={() => setDateModalPageId(null)}
                    showCloseButton={false}
                    width="420px"
                    className="p-8"
                >
                    {/* 시작일 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#374151] mb-1.5">시작일</label>
                        <input
                            type="date"
                            value={editBeginningDate}
                            onChange={(e) => setEditBeginningDate(e.target.value)}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                            className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm outline-none cursor-pointer"
                        />
                    </div>

                    {/* 만료일 */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[#374151] mb-1.5">만료일</label>
                        <input
                            type="date"
                            value={editExpiredDate}
                            min={editBeginningDate || undefined}
                            onChange={(e) => setEditExpiredDate(e.target.value)}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                            className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm outline-none cursor-pointer"
                        />
                        {editBeginningDate && editExpiredDate && editBeginningDate > editExpiredDate && (
                            <p className="m-0 mt-1 text-[12px] text-[#dc2626] font-medium">
                                시작일은 만료일보다 이전이어야 합니다.
                            </p>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDateModalPageId(null)}
                            className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] text-sm cursor-pointer"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSaveDates}
                            disabled={
                                savingDates ||
                                (!!editBeginningDate && !!editExpiredDate && editBeginningDate > editExpiredDate)
                            }
                            className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                                savingDates ||
                                (!!editBeginningDate && !!editExpiredDate && editBeginningDate > editExpiredDate)
                                    ? 'bg-[#d1d5db] cursor-not-allowed'
                                    : 'bg-[#1e3a5f] cursor-pointer'
                            }`}
                        >
                            {savingDates ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ── 배포 이력 모달 ── */}
            {historyModalPageId &&
                (() => {
                    // 바로가기 활성 조건: IS_PUBLIC='Y' AND (만료일 없음 OR 만료일 미경과)
                    const isActive =
                        historyModalPage?.isPublic === 'Y' &&
                        (!historyModalPage.expiredDate || new Date(historyModalPage.expiredDate) >= new Date());

                    const disabledReason =
                        historyModalPage?.isPublic === 'N'
                            ? '공개 차단된 페이지입니다.'
                            : historyModalPage?.expiredDate && new Date(historyModalPage.expiredDate) < new Date()
                              ? '만료된 페이지입니다.'
                              : undefined;

                    return (
                        <Modal
                            title="배포 이력"
                            onClose={() => setHistoryModalPageId(null)}
                            showCloseButton
                            width="560px"
                            className="p-8"
                        >
                            {/* 바로가기 버튼 — 이력이 있을 때만 표시 */}
                            {!historyLoading && historyList.length > 0 && (
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#f3f4f6]">
                                    <span className="text-sm font-medium text-[#374151]">배포된 페이지</span>
                                    <button
                                        disabled={!isActive}
                                        title={disabledReason}
                                        onClick={() => window.open(`/deployed/${historyModalPageId}.html`, '_blank')}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                                            isActive
                                                ? 'border-[#0046A4] text-[#0046A4] bg-white cursor-pointer hover:bg-[#EBF4FF]'
                                                : 'border-[#e5e7eb] text-[#d1d5db] bg-[#f9fafb] cursor-not-allowed'
                                        }`}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M15 3h6v6M10 14L21 3"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        {disabledReason ?? '바로가기'}
                                    </button>
                                </div>
                            )}

                            {historyLoading ? (
                                <p className="text-sm text-[#9ca3af] text-center py-8">불러오는 중...</p>
                            ) : historyList.length === 0 ? (
                                <p className="text-sm text-[#9ca3af] text-center py-8">배포 이력이 없습니다.</p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                                    {historyList.map((record) => (
                                        <div
                                            key={`${record.INSTANCE_ID}-${record.FILE_ID}`}
                                            className="flex flex-col gap-1 px-4 py-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-xs"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-[#1e3a5f]">
                                                    {record.INSTANCE_NAME ?? record.INSTANCE_ID}
                                                </span>
                                                <span className="text-[#9ca3af]">
                                                    {record.LAST_MODIFIED_DTIME ?? '-'}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 text-[#6b7280]">
                                                <span>파일: {record.FILE_ID}</span>
                                                {record.FILE_SIZE && (
                                                    <span>크기: {Number(record.FILE_SIZE).toLocaleString()} B</span>
                                                )}
                                            </div>
                                            {record.FILE_CRC_VALUE && (
                                                <span className="text-[#9ca3af] font-mono">
                                                    CRC: {record.FILE_CRC_VALUE}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Modal>
                    );
                })()}

            {/* ── 버전 롤백 모달 ── */}
            {rollbackModalPageId && (
                <RollbackModal
                    pageId={rollbackModalPageId}
                    pageLabel={rollbackModalLabel}
                    onClose={() => setRollbackModalPageId(null)}
                    onSuccess={() => {
                        setRollbackModalPageId(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
