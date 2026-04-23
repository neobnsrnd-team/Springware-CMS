'use client';

import { useEffect, useMemo, useState } from 'react';

import { nextApi } from '@/lib/api-url';
import { CMS_ASSET_CATEGORY_GROUP_ID, CMS_ASSET_CATEGORY_LABELS, CMS_ASSET_DEFAULT_CATEGORY } from '@/lib/codes';

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
                const res = await fetch(nextApi(`/api/codes?groupId=${CMS_ASSET_CATEGORY_GROUP_ID}`));
                const json = await res.json();
                if (!cancelled) {
                    setCategories(Array.isArray(json.data) ? json.data : []);
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
            const list = Array.isArray(json.data?.assets) ? json.data.assets : [];
            const nextTotalCount = Number(json.data?.totalCount ?? 0);

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
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
                        <div className="min-w-48 flex-1">
                            <label className="mb-1 block text-sm font-medium text-slate-700">카테고리</label>
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">전체</option>
                                {categories.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.codeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-[2]">
                            <label className="mb-1 block text-sm font-medium text-slate-700">ASSET_NAME 검색</label>
                            <div className="flex gap-2">
                                <input
                                    value={draftSearch}
                                    onChange={(e) => setDraftSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder="이미지명으로 검색"
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                        <div className="min-w-32">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Items</label>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    moveToFirstPage();
                                }}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                                {PAGE_SIZE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                            >
                                초기화
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={selectedUrls.size === 0}
                                className="rounded-xl bg-[#0046A4] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                선택 완료
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                        <p>
                            승인된 이미지 자산만 표시됩니다. 기본 카테고리는 {categoryMap[CMS_ASSET_DEFAULT_CATEGORY]}
                            입니다.
                        </p>
                        <p>
                            총 {totalCount}건, {page} / {totalPages} 페이지
                        </p>
                    </div>
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
                                                <img
                                                    src={asset.url}
                                                    alt={asset.assetName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                                    미리보기 없음
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 p-3">
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
                                            <div className="line-clamp-2 min-h-8 text-xs text-slate-500">
                                                {asset.assetDesc || asset.mimeType}
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
