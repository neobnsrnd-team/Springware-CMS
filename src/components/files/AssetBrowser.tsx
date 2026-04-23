'use client';

import { useEffect, useMemo, useState } from 'react';

import { nextApi } from '@/lib/api-url';
import { CMS_ASSET_CATEGORY_LABELS } from '@/lib/cms-asset-category';

interface AssetItem {
    assetId: string;
    assetName: string;
    businessCategory: string | null;
    mimeType: string;
    fileSize: number | null;
    assetDesc: string | null;
    url: string | null;
}

interface CodeItem {
    code: string;
    codeName: string;
    sortOrder: number;
}

const PAGE_SIZE_OPTIONS = [20, 30, 50, 100, 200];

/**
 * 자산 이미지 src 해결 — DB의 ASSET_URL은 보통 `/uploads/...` 같은 root-relative 경로인데
 * Next.js `basePath: '/cms'` 환경에서는 브라우저가 `/cms/uploads/...`로 요청해야 하므로
 * 절대 URL이나 이미 basePath를 포함한 경우가 아니면 nextApi()로 접두어를 붙인다.
 */
function resolveAssetSrc(url: string | null): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/cms/')) return url;
    return nextApi(url.startsWith('/') ? url : `/${url}`);
}

export default function AssetBrowser() {
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [categories, setCategories] = useState<CodeItem[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [draftSearch, setDraftSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categoryMap = useMemo(
        () =>
            categories.reduce<Record<string, string>>(
                (acc, item) => {
                    acc[item.code] = item.codeName;
                    return acc;
                },
                { ...CMS_ASSET_CATEGORY_LABELS },
            ),
        [categories],
    );

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const visiblePages = useMemo(() => {
        const length = Math.min(7, totalPages);
        const half = 3;
        let start = Math.max(1, page - half);
        const end = Math.min(totalPages, start + 6);
        start = Math.max(1, end - 6);
        return Array.from({ length }, (_, index) => start + index);
    }, [page, totalPages]);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                // /cms-admin/asset-approvals 화면과 동일한 출처(spider-admin) 사용
                const res = await fetch(nextApi('/api/cms-admin/asset-categories'));
                const json = await res.json();
                const list: CodeItem[] = Array.isArray(json.categories) ? json.categories : [];
                if (cancelled) return;

                if (list.length > 0) {
                    setCategories(list);
                } else {
                    setCategories(
                        Object.entries(CMS_ASSET_CATEGORY_LABELS).map(([code, codeName], index) => ({
                            code,
                            codeName,
                            sortOrder: index + 1,
                        })),
                    );
                }
            } catch {
                if (!cancelled) {
                    setCategories(
                        Object.entries(CMS_ASSET_CATEGORY_LABELS).map(([code, codeName], index) => ({
                            code,
                            codeName,
                            sortOrder: index + 1,
                        })),
                    );
                }
            }
        }

        void loadCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        void fetchAssets(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, category, search]);

    async function fetchAssets(nextPage: number) {
        try {
            setError(null);
            setLoading(true);

            const params = new URLSearchParams({
                page: String(nextPage),
                pageSize: String(pageSize),
                assetState: 'APPROVED',
            });

            if (category) {
                params.set('category', category);
            }
            if (search) {
                params.set('search', search);
            }

            const res = await fetch(nextApi(`/api/assets?${params.toString()}`));
            const json = await res.json();
            const list = Array.isArray(json.assets) ? json.assets : [];
            const nextTotalCount = Number(json.totalCount ?? 0);

            setAssets(list);
            setTotalCount(nextTotalCount);
        } catch {
            setError('이미지 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }

    function moveToFirstPage() {
        setPage(1);
    }

    function handleCategoryChange(nextCategory: string) {
        setCategory(nextCategory);
        moveToFirstPage();
    }

    function handleSearchSubmit() {
        setSearch(draftSearch.trim());
        moveToFirstPage();
    }

    function handleReset() {
        setCategory('');
        setDraftSearch('');
        setSearch('');
        setPageSize(20);
        setPage(1);
    }

    function toggleSelection(url: string | null) {
        if (!url) return;

        setSelectedUrls((prev) => {
            const next = new Set(prev);
            if (next.has(url)) {
                next.delete(url);
            } else {
                next.add(url);
            }
            return next;
        });
    }

    function handleConfirm() {
        const urls = Array.from(selectedUrls);
        if (urls.length === 0) return;

        const msg = { type: 'ASSETS_SELECTED', urls };
        if (window.opener) {
            window.opener.postMessage(msg, '*');
            window.close();
            return;
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage(msg, '*');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
                {/* 검색 조건 카드 — cms-admin/asset-approvals 스타일 */}
                <div className="mb-3 rounded-md border border-slate-200 bg-white p-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="m-0 text-xs font-medium text-slate-700">카테고리</label>
                        <select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="h-8 w-[130px] rounded border border-slate-300 bg-white px-2 text-xs"
                        >
                            <option value="">전체</option>
                            {categories.map((item) => (
                                <option key={item.code} value={item.code}>
                                    {item.codeName}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={draftSearch}
                            onChange={(e) => setDraftSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchSubmit();
                                }
                            }}
                            placeholder="이미지명 또는 업로더 검색"
                            className="ml-2 h-8 w-[200px] rounded border border-slate-300 px-2 text-xs"
                        />

                        <div className="flex-1" />

                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                moveToFirstPage();
                            }}
                            className="h-8 w-[72px] rounded border border-slate-300 bg-white px-2 text-xs"
                        >
                            {PAGE_SIZE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <label className="m-0 mr-1 text-xs font-medium text-slate-700">건씩</label>

                        <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="h-8 rounded bg-[#0046A4] px-3 text-xs font-medium text-white hover:bg-[#003399]"
                        >
                            조회
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="h-8 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                            초기화
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedUrls.size === 0}
                            className="h-8 rounded bg-[#0046A4] px-3 text-xs font-medium text-white hover:bg-[#003399] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            선택 완료{selectedUrls.size > 0 ? ` (${selectedUrls.size})` : ''}
                        </button>
                    </div>
                </div>

                {/* 건수 */}
                <div className="mb-3 flex justify-end text-xs text-slate-500">
                    <p>
                        총 {totalCount}건, {page} / {totalPages} 페이지
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                        이미지 목록을 불러오는 중입니다.
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
                        {error}
                    </div>
                ) : assets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                        조건에 맞는 이미지가 없습니다.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
                            {assets.map((asset) => {
                                const isSelected = asset.url ? selectedUrls.has(asset.url) : false;
                                const label = asset.businessCategory ? categoryMap[asset.businessCategory] : '-';

                                return (
                                    <button
                                        key={asset.assetId}
                                        type="button"
                                        onClick={() => toggleSelection(asset.url)}
                                        className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                            isSelected
                                                ? 'border-[#0046A4] ring-2 ring-[#0046A4]/20'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="aspect-square bg-slate-100">
                                            {asset.url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={resolveAssetSrc(asset.url)}
                                                    alt={asset.assetName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                                    미리보기 없음
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1.5 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                    {label}
                                                </span>
                                                {isSelected ? (
                                                    <span className="text-[11px] font-semibold text-[#0046A4]">
                                                        선택됨
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {asset.assetName}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {totalPages > 1 ? (
                            <div className="mt-6 flex justify-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className={`px-3.5 py-1.5 rounded-md border border-[#e5e7eb] text-[13px] ${
                                        page === 1
                                            ? 'bg-[#f9fafb] text-[#d1d5db] cursor-not-allowed'
                                            : 'bg-white text-[#374151] cursor-pointer'
                                    }`}
                                >
                                    이전
                                </button>

                                {visiblePages.map((visiblePage) => (
                                    <button
                                        key={visiblePage}
                                        type="button"
                                        onClick={() => setPage(visiblePage)}
                                        className={`px-3 py-1.5 rounded-md border text-[13px] cursor-pointer ${
                                            page === visiblePage
                                                ? 'border-[#0046A4] bg-[#0046A4] text-white font-semibold'
                                                : 'border-[#e5e7eb] bg-white text-[#374151] font-normal'
                                        }`}
                                    >
                                        {visiblePage}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className={`px-3.5 py-1.5 rounded-md border border-[#e5e7eb] text-[13px] ${
                                        page === totalPages
                                            ? 'bg-[#f9fafb] text-[#d1d5db] cursor-not-allowed'
                                            : 'bg-white text-[#374151] cursor-pointer'
                                    }`}
                                >
                                    다음
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}
