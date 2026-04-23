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

export default function AssetBrowser() {
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [categories, setCategories] = useState<CodeItem[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [draftSearch, setDraftSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
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
        void fetchAssets(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, search]);

    async function fetchAssets(nextPage: number, replace: boolean) {
        try {
            setError(null);
            if (replace) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = new URLSearchParams({
                page: String(nextPage),
                pageSize: '24',
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
            const totalCount = Number(json.data?.totalCount ?? 0);

            setAssets((prev) => (replace ? list : [...prev, ...list]));
            setPage(nextPage);
            setHasMore(nextPage * 24 < totalCount);
        } catch {
            setError('이미지 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
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
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="min-w-48 flex-1">
                            <label className="mb-1 block text-sm font-medium text-slate-700">카테고리</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
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
                            <label className="mb-1 block text-sm font-medium text-slate-700">검색</label>
                            <div className="flex gap-2">
                                <input
                                    value={draftSearch}
                                    onChange={(e) => setDraftSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setSearch(draftSearch.trim());
                                        }
                                    }}
                                    placeholder="이미지명 또는 설명 검색"
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSearch(draftSearch.trim())}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCategory('');
                                    setDraftSearch('');
                                    setSearch('');
                                }}
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
                    <p className="mt-3 text-xs text-slate-500">
                        승인된 이미지 자산만 표시됩니다. 기본 카테고리는 {categoryMap[CMS_ASSET_DEFAULT_CATEGORY]}
                        입니다.
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
                                            <div className="truncate text-sm font-medium text-slate-900">
                                                {asset.assetName}
                                            </div>
                                            <div className="line-clamp-2 min-h-8 text-xs text-slate-500">
                                                {asset.assetDesc || asset.mimeType}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {hasMore ? (
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => void fetchAssets(page + 1, false)}
                                    disabled={loadingMore}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                                >
                                    {loadingMore ? '불러오는 중...' : '더 보기'}
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}
