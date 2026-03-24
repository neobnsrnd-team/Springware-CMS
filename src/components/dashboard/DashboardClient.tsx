// src/components/dashboard/DashboardClient.tsx
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

export interface PageCard {
    id: string;
    label: string;
    viewMode: ViewMode;
    thumbnail: string | null;
    lastModifiedDtime: string | null;
    approveState: string;
}

export interface DashboardClientProps {
    userId: string;
    initialPages: PageCard[];
    totalCount: number;
    currentPage: number;
    search: string;
    sortBy: SortBy;
}

// 뷰 모드 뱃지 색상
const VIEW_MODE_STYLE: Record<ViewMode, { bg: string; color: string; label: string }> = {
    mobile: { bg: '#e8f0fd', color: '#0046A4', label: '모바일' },
    web: { bg: '#e6f4ef', color: '#008C6A', label: '웹' },
    responsive: { bg: '#f0eaf9', color: '#6d28d9', label: '반응형' },
};

// 결재 상태 뱃지 색상
const APPROVE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    WORK: { bg: '#f3f4f6', color: '#6b7280', label: '작업중' },
    PENDING: { bg: '#fefce8', color: '#b45309', label: '승인대기' },
    APPROVED: { bg: '#e6f4ef', color: '#008C6A', label: '승인' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', label: '반려' },
};

const PAGE_SIZE = 12;

export default function DashboardClient({
    userId,
    initialPages,
    totalCount,
    currentPage,
    search: initialSearch,
    sortBy: initialSortBy,
}: DashboardClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 검색·정렬은 로컬 상태로 관리 후 URL 반영
    const [search, setSearch] = useState(initialSearch);
    const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);

    // 삭제 후 낙관적 업데이트용 로컬 페이지 목록
    const [pages, setPages] = useState<PageCard[]>(initialPages);
    const [localTotalCount, setLocalTotalCount] = useState(totalCount);

    // 서버에서 새 데이터가 내려올 때 동기화
    useEffect(() => {
        setPages(initialPages);
        setLocalTotalCount(totalCount);
    }, [initialPages, totalCount]);

    // 새 페이지 생성 모달
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPageName, setNewPageName] = useState('');
    const [newPageViewMode, setNewPageViewMode] = useState<ViewMode>('mobile');
    const [creating, setCreating] = useState(false);

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

    // URL 업데이트 헬퍼 — searchParams 변경 시 서버 컴포넌트 재렌더링 유도
    function navigate(params: { page?: number; search?: string; sortBy?: SortBy }) {
        const sp = new URLSearchParams();
        const nextPage = params.page ?? 1;
        const nextSearch = params.search ?? search;
        const nextSortBy = params.sortBy ?? sortBy;

        if (nextPage > 1) sp.set('page', String(nextPage));
        if (nextSearch) sp.set('search', nextSearch);
        if (nextSortBy !== 'date') sp.set('sortBy', nextSortBy);

        const query = sp.toString();
        startTransition(() => {
            router.push(`/${userId}${query ? `?${query}` : ''}`);
        });
    }

    // 검색어 디바운스 (300ms) → URL 반영
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

    // 정렬 변경 → URL 반영
    function handleSortChange(value: SortBy) {
        setSortBy(value);
        navigate({ page: 1, search, sortBy: value });
    }

    // 페이지 이동 → URL 반영
    function handlePageChange(page: number) {
        navigate({ page, search, sortBy });
    }

    // 새 페이지 생성
    async function handleCreatePage() {
        const label = newPageName.trim();
        if (!label || creating) return;

        setCreating(true);
        const id = `${userId}-${Date.now()}`;

        try {
            await fetch('/api/builder/save', {
                method: 'POST',
                body: JSON.stringify({ html: '', bank: id, pageName: label, viewMode: newPageViewMode }),
                headers: { 'Content-Type': 'application/json' },
            });
            window.location.href = `/edit?bank=${id}`;
        } catch (err) {
            console.error('페이지 생성 실패:', err);
            setCreating(false);
        }
    }

    // 페이지 삭제 — 낙관적 업데이트 후 API 호출
    async function handleDeletePage(pageId: string, label: string) {
        if (!confirm(`'${label}' 페이지를 삭제하시겠습니까?\n저장된 내용도 함께 삭제됩니다.`)) return;

        // 낙관적 업데이트
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        setLocalTotalCount((prev) => prev - 1);

        try {
            const res = await fetch(`/api/builder/pages?pageId=${encodeURIComponent(pageId)}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.ok) {
                // 실패 시 서버 데이터로 복구
                setPages(initialPages);
                setLocalTotalCount(totalCount);
            }
        } catch (err) {
            console.error('페이지 삭제 실패:', err);
            setPages(initialPages);
            setLocalTotalCount(totalCount);
        }
    }

    function handleModalClose() {
        setShowCreateModal(false);
        setNewPageName('');
        setNewPageViewMode('mobile');
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
        <div style={{ minHeight: '100vh', background: '#f8faff', fontFamily: 'inherit' }}>
            {/* ── 헤더 ── */}
            <header
                style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 32px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0046A4', letterSpacing: '-0.3px' }}>
                    Springware CMS
                </span>
                <span style={{ color: '#d1d5db', fontSize: '14px' }}>/</span>
                <span style={{ fontSize: '14px', color: '#374151' }}>대시보드</span>
            </header>

            {/* ── 본문 ── */}
            <main
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '32px 32px 64px',
                    opacity: isPending ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                }}
            >
                {/* ── 툴바: 타이틀 / 검색 / 정렬 / 새 페이지 ── */}
                <div style={{ marginBottom: '28px' }}>
                    {/* 타이틀 행 */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                            gap: '12px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>대시보드</h1>
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                                {localTotalCount.toLocaleString()}개
                            </span>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '9px 18px',
                                borderRadius: '8px',
                                background: '#0046A4',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            + 새 페이지
                        </button>
                    </div>

                    {/* 검색 + 정렬 행 */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* 검색 인풋 */}
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '14px',
                                    color: '#9ca3af',
                                    pointerEvents: 'none',
                                }}
                            >
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="페이지 이름 검색"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '9px 14px 9px 36px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    fontSize: '13px',
                                    outline: 'none',
                                    background: '#ffffff',
                                    color: '#111827',
                                }}
                            />
                        </div>

                        {/* 정렬 드롭다운 */}
                        <div ref={sortDropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                            <button
                                onClick={() => setSortDropdownOpen((v) => !v)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '9px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${sortDropdownOpen ? '#0046A4' : '#e5e7eb'}`,
                                    background: sortDropdownOpen ? '#f0f4ff' : '#ffffff',
                                    fontSize: '13px',
                                    color: sortDropdownOpen ? '#0046A4' : '#374151',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                    fontWeight: 500,
                                }}
                            >
                                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    style={{
                                        transform: sortDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.15s',
                                        flexShrink: 0,
                                    }}
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
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        right: 0,
                                        minWidth: '140px',
                                        background: '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                        overflow: 'hidden',
                                        zIndex: 50,
                                    }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                handleSortChange(opt.value);
                                                setSortDropdownOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '9px 14px',
                                                border: 'none',
                                                background: '#ffffff',
                                                color: sortBy === opt.value ? '#0046A4' : '#374151',
                                                fontSize: '13px',
                                                fontWeight: sortBy === opt.value ? 600 : 400,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
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
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontSize: '14px' }}>
                        {search
                            ? `'${search}'에 대한 검색 결과가 없습니다.`
                            : '아직 페이지가 없습니다. 새 페이지를 만들어 보세요.'}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '20px',
                            marginBottom: '32px',
                        }}
                    >
                        {pages.map((page) => {
                            const vmStyle = VIEW_MODE_STYLE[page.viewMode] ?? VIEW_MODE_STYLE.mobile;
                            const apStyle = APPROVE_STYLE[page.approveState] ?? APPROVE_STYLE.WORK;

                            return (
                                <div
                                    key={page.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'box-shadow 0.15s, transform 0.15s',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                                            '0 8px 24px rgba(0,70,164,0.12)';
                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                                            '0 2px 8px rgba(0,0,0,0.06)';
                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                    }}
                                    onClick={() => {
                                        window.location.href = `/edit?bank=${page.id}`;
                                    }}
                                >
                                    {/* 썸네일 영역 */}
                                    <div
                                        style={{
                                            height: '140px',
                                            background: page.thumbnail
                                                ? `url(${page.thumbnail}) center/cover no-repeat`
                                                : '#f0f4ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            borderBottom: '1px solid #f3f4f6',
                                        }}
                                    >
                                        {!page.thumbnail && (
                                            <span style={{ fontSize: '36px', opacity: 0.4 }}>
                                                {page.viewMode === 'mobile'
                                                    ? '📱'
                                                    : page.viewMode === 'web'
                                                      ? '🖥️'
                                                      : '🔄'}
                                            </span>
                                        )}
                                    </div>

                                    {/* 카드 본문 */}
                                    <div
                                        style={{
                                            padding: '14px 16px 12px',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                        }}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#111827',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                            title={page.label}
                                        >
                                            {page.label}
                                        </p>

                                        {/* 뱃지 행 */}
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span
                                                style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: vmStyle.bg,
                                                    color: vmStyle.color,
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {vmStyle.label}
                                            </span>
                                            <span
                                                style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: apStyle.bg,
                                                    color: apStyle.color,
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {apStyle.label}
                                            </span>
                                        </div>

                                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                            {formatDate(page.lastModifiedDtime)}
                                        </p>
                                    </div>

                                    {/* 카드 푸터: 삭제 버튼 */}
                                    <div
                                        style={{
                                            padding: '8px 16px',
                                            borderTop: '1px solid #f3f4f6',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleDeletePage(page.id, page.label)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                border: '1px solid #fca5a5',
                                                background: 'transparent',
                                                color: '#dc2626',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                background: currentPage === 1 ? '#f9fafb' : '#ffffff',
                                color: currentPage === 1 ? '#d1d5db' : '#374151',
                                fontSize: '13px',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            }}
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
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: currentPage === p ? '#0046A4' : '#e5e7eb',
                                    background: currentPage === p ? '#0046A4' : '#ffffff',
                                    color: currentPage === p ? '#ffffff' : '#374151',
                                    fontSize: '13px',
                                    fontWeight: currentPage === p ? 600 : 400,
                                    cursor: 'pointer',
                                }}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                background: currentPage === totalPages ? '#f9fafb' : '#ffffff',
                                color: currentPage === totalPages ? '#d1d5db' : '#374151',
                                fontSize: '13px',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            }}
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>

            {/* ── 새 페이지 생성 모달 ── */}
            {showCreateModal && (
                <div
                    onClick={handleModalClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 200,
                        background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '480px',
                            maxWidth: '90vw',
                            boxShadow: '0 24px 64px rgba(0,70,164,0.15)',
                        }}
                    >
                        <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                            새 페이지 만들기
                        </h3>

                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '6px',
                            }}
                        >
                            페이지 이름
                        </label>
                        <input
                            autoFocus
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newPageName.trim()) handleCreatePage();
                                if (e.key === 'Escape') handleModalClose();
                            }}
                            placeholder="예: 메인 페이지"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                marginBottom: '20px',
                                outline: 'none',
                            }}
                        />

                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '8px',
                            }}
                        >
                            화면 유형
                        </label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                            {(['mobile', 'web', 'responsive'] as ViewMode[]).map((vm) => {
                                const icon = vm === 'mobile' ? '📱' : vm === 'web' ? '🖥️' : '🔄';
                                const vmLabel = vm === 'mobile' ? '모바일' : vm === 'web' ? '웹' : '반응형';
                                return (
                                    <button
                                        key={vm}
                                        onClick={() => setNewPageViewMode(vm)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 6px',
                                            borderRadius: '8px',
                                            border: '2px solid',
                                            borderColor: newPageViewMode === vm ? '#0046A4' : '#e5e7eb',
                                            background: newPageViewMode === vm ? '#f0f4ff' : '#ffffff',
                                            color: newPageViewMode === vm ? '#0046A4' : '#6b7280',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <span style={{ fontSize: '20px' }}>{icon}</span>
                                        {vmLabel}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                onClick={handleModalClose}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreatePage}
                                disabled={!newPageName.trim() || creating}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: !newPageName.trim() || creating ? '#d1d5db' : '#0046A4',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: !newPageName.trim() || creating ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {creating ? '생성 중...' : '만들기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
