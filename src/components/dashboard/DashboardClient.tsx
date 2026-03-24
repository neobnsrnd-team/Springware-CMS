// src/components/dashboard/DashboardClient.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type ViewMode = 'mobile' | 'web' | 'responsive';
type SortBy = 'date' | 'name';

interface PageCard {
    id: string;
    label: string;
    viewMode: ViewMode;
    thumbnail: string | null;
    lastModifiedDtime: string | null;
    approveState: string;
}

export interface DashboardClientProps {
    userId: string;
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

export default function DashboardClient({ userId }: DashboardClientProps) {
    const [pages, setPages] = useState<PageCard[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [loading, setLoading] = useState(true);

    // 새 페이지 생성 모달
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPageName, setNewPageName] = useState('');
    const [newPageViewMode, setNewPageViewMode] = useState<ViewMode>('mobile');
    const [creating, setCreating] = useState(false);

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 검색어 디바운스 (300ms)
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // 검색 시 첫 페이지로 이동
        }, 300);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [search]);

    // 페이지 목록 로드
    const loadPages = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                pageSize: String(PAGE_SIZE),
                sortBy,
            });
            if (debouncedSearch) params.set('search', debouncedSearch);

            const res = await fetch(`/api/builder/pages?${params.toString()}`);
            const data = await res.json();
            if (data.ok) {
                setPages(data.pages);
                setTotalCount(data.totalCount);
            }
        } catch (err) {
            console.error('페이지 목록 로드 실패:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, sortBy]);

    useEffect(() => {
        loadPages();
    }, [loadPages]);

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

    // 페이지 삭제
    async function handleDeletePage(pageId: string, label: string) {
        if (!confirm(`'${label}' 페이지를 삭제하시겠습니까?\n저장된 내용도 함께 삭제됩니다.`)) return;

        try {
            const res = await fetch(`/api/builder/pages?pageId=${encodeURIComponent(pageId)}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.ok) {
                setPages((prev) => prev.filter((p) => p.id !== pageId));
                setTotalCount((prev) => prev - 1);
            }
        } catch (err) {
            console.error('페이지 삭제 실패:', err);
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

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
                <span style={{ fontSize: '14px', color: '#374151' }}>내 페이지</span>
            </header>

            {/* ── 본문 ── */}
            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 64px' }}>
                {/* 타이틀 + 새 페이지 버튼 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            내 페이지
                        </h1>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            {loading ? '로딩 중...' : `총 ${totalCount.toLocaleString()}개`}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            background: '#0046A4',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        + 새 페이지 만들기
                    </button>
                </div>

                {/* 검색 + 정렬 */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '24px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    <input
                        type="text"
                        placeholder="페이지 이름으로 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            maxWidth: '400px',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            background: '#ffffff',
                        }}
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value as SortBy);
                            setCurrentPage(1);
                        }}
                        style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            background: '#ffffff',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="date">최신 수정순</option>
                        <option value="name">이름순</option>
                    </select>
                </div>

                {/* 카드 그리드 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontSize: '14px' }}>
                        로딩 중...
                    </div>
                ) : pages.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '80px 0',
                            color: '#9ca3af',
                            fontSize: '14px',
                        }}
                    >
                        {debouncedSearch
                            ? `'${debouncedSearch}'에 대한 검색 결과가 없습니다.`
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
                                        onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 버블링 방지
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
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                            // 현재 페이지 기준으로 최대 7개 페이지 버튼 표시
                            const half = 3;
                            let start = Math.max(1, currentPage - half);
                            const end = Math.min(totalPages, start + 6);
                            start = Math.max(1, end - 6);
                            return start + i;
                        }).map((p) => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
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
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

                        {/* 페이지 이름 */}
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

                        {/* 뷰 모드 */}
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
                                const label = vm === 'mobile' ? '모바일' : vm === 'web' ? '웹' : '반응형';
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
                                        {label}
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
