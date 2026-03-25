// src/components/edit/SlideEditorModal.tsx
'use client';

import React, { useState } from 'react';
import type { FinanceComponent } from '@/data/finance-component-data';

// ── 타입 ──────────────────────────────────────────────────────────────────

interface PromoBannerSlide {
    itemId: string;
    bgColor: string;
    badge: string;
    title: string;
    desc: string;
    ctaText: string;
    ctaHref: string;
}

interface ProductGalleryCard {
    type: 'savings' | 'deposit' | 'loan';
    badge: string;
    productName: string;
    rateValue: string;
    rateLabel: string;
    detail: string;
    ctaHref: string;
}

// ── HTML 파싱 ─────────────────────────────────────────────────────────────

function parsePromoBannerSlides(html: string): PromoBannerSlide[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const slides: PromoBannerSlide[] = [];
    doc.querySelectorAll('[data-pb-slide]').forEach((wrapper, i) => {
        const inner = wrapper.querySelector('.pb-slide');
        if (!inner) return;
        const bgEl = inner.querySelector('.pb-slide-bg') as HTMLElement | null;
        const ctaEl = inner.querySelector('.pb-slide-cta') as HTMLAnchorElement | null;
        slides.push({
            itemId: inner.getAttribute('data-item-id') ?? `pb-${i + 1}`,
            bgColor: bgEl?.style.background ?? '',
            badge: inner.querySelector('.pb-badge')?.textContent ?? '',
            title: inner.querySelector('.pb-slide-title')?.textContent ?? '',
            desc: inner.querySelector('.pb-slide-desc')?.textContent ?? '',
            ctaText: (ctaEl?.textContent ?? '').replace(/\s*→\s*$/, '').trim(),
            ctaHref: ctaEl?.getAttribute('href') ?? '#',
        });
    });
    return slides;
}

function parseProductGalleryCards(html: string): ProductGalleryCard[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const cards: ProductGalleryCard[] = [];
    doc.querySelectorAll('[data-pg-slide]').forEach((wrapper) => {
        const inner = wrapper.firstElementChild as HTMLElement | null;
        if (!inner) return;
        const ctaEl = inner.querySelector('[data-pg-field="cta"]') as HTMLAnchorElement | null;
        cards.push({
            type: (inner.getAttribute('data-type') ?? 'savings') as ProductGalleryCard['type'],
            badge: inner.querySelector('[data-pg-field="badge"]')?.textContent ?? '',
            productName: inner.querySelector('[data-pg-field="productName"]')?.textContent ?? '',
            rateValue: inner.querySelector('[data-pg-field="rateValue"]')?.textContent ?? '',
            rateLabel: inner.querySelector('[data-pg-field="rateLabel"]')?.textContent ?? '',
            detail: inner.querySelector('[data-pg-field="detail"]')?.textContent ?? '',
            ctaHref: ctaEl?.getAttribute('href') ?? '#',
        });
    });
    return cards;
}

// ── HTML 재생성 ───────────────────────────────────────────────────────────

function buildPromoBannerSlideHtml(slide: PromoBannerSlide): string {
    return (
        `<div class="pb-slide" data-item-id="${slide.itemId}" style="position:relative;height:200px;overflow:hidden;border-radius:16px;">` +
        `<div class="pb-slide-bg" style="position:absolute;top:0;right:0;bottom:0;left:0;background:${slide.bgColor};"></div>` +
        `<div class="pb-slide-content" style="position:relative;z-index:1;padding:24px 20px;display:flex;flex-direction:column;gap:6px;height:100%;box-sizing:border-box;justify-content:center;">` +
        `<span class="pb-badge" style="display:inline-block;background:rgba(255,255,255,0.25);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;width:fit-content;border:1px solid rgba(255,255,255,0.4);">${slide.badge}</span>` +
        `<h3 class="pb-slide-title" style="font-size:22px;font-weight:800;color:#fff;margin:0;line-height:1.2;letter-spacing:-0.5px;">${slide.title}</h3>` +
        `<p class="pb-slide-desc" style="font-size:13px;color:rgba(255,255,255,0.85);margin:0;line-height:1.4;">${slide.desc}</p>` +
        `<a class="pb-slide-cta" href="${slide.ctaHref}" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.2);color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;border:1px solid rgba(255,255,255,0.5);width:fit-content;margin-top:4px;min-height:36px;-webkit-tap-highlight-color:transparent;">${slide.ctaText} →</a>` +
        `</div>` +
        `</div>`
    );
}

const CARD_COLORS: Record<string, { accent: string; accentLight: string }> = {
    savings: { accent: '#0046A4', accentLight: '#E8F0FC' },
    deposit: { accent: '#0046A4', accentLight: '#E8F0FC' },
    loan: { accent: '#FF6600', accentLight: '#FFF3EC' },
};

function buildProductGalleryCardHtml(card: ProductGalleryCard, itemId: string): string {
    const { accent, accentLight } = CARD_COLORS[card.type];
    return (
        `<div data-type="${card.type}" data-item-id="${itemId}" style="background:#fff;border-radius:16px;padding:24px 20px;display:flex;flex-direction:column;gap:6px;box-shadow:0 4px 20px rgba(0,70,164,0.08);position:relative;overflow:hidden;">` +
        `<div style="position:absolute;top:0;right:0;width:120px;height:120px;background:linear-gradient(135deg,${accentLight} 0%,transparent 70%);border-radius:0 16px 0 100%;pointer-events:none;"></div>` +
        `<div data-pg-field="badge" style="display:inline-flex;align-items:center;background:${accentLight};color:${accent};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;width:fit-content;letter-spacing:0.5px;">${card.badge}</div>` +
        `<div data-pg-field="productName" style="font-size:20px;font-weight:700;color:#1A1A2E;line-height:1.3;margin-top:4px;">${card.productName}</div>` +
        `<div data-pg-field="rateWrap" style="display:flex;align-items:baseline;gap:2px;margin-top:8px;">` +
        `<span data-pg-field="rateValue" style="font-size:40px;font-weight:800;color:${accent};line-height:1;letter-spacing:-1px;">${card.rateValue}</span>` +
        `<span style="font-size:22px;font-weight:700;color:${accent};">%</span>` +
        `</div>` +
        `<div data-pg-field="rateLabel" style="font-size:12px;color:#6B7280;font-weight:500;">${card.rateLabel}</div>` +
        `<div data-pg-field="detail" style="font-size:13px;color:#6B7280;padding:10px 0;border-top:1px solid #F3F4F6;margin-top:4px;">${card.detail}</div>` +
        `<a data-pg-field="cta" href="${card.ctaHref}" style="display:flex;align-items:center;justify-content:center;background:${accent};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px;border-radius:12px;margin-top:8px;min-height:48px;-webkit-tap-highlight-color:transparent;">자세히 보기</a>` +
        `</div>`
    );
}

// ── HTML 재조립 (트랙 내용만 교체, 스크립트 등 나머지 구조 유지) ──────────

function rebuildPromoBannerHtml(originalHtml: string, slides: PromoBannerSlide[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalHtml, 'text/html');
    const track = doc.querySelector('[data-pb-track]');
    if (!track) return originalHtml;

    track.innerHTML = slides
        .map((slide) => `<div data-pb-slide style="width:100%;">${buildPromoBannerSlideHtml(slide)}</div>`)
        .join('');

    // 카운터 "/ N" 텍스트 업데이트
    const curEl = doc.querySelector('[data-pb-cur]');
    if (curEl?.nextSibling?.nodeType === Node.TEXT_NODE) {
        curEl.nextSibling.textContent = ` / ${slides.length}`;
    }

    return doc.body.innerHTML;
}

function rebuildProductGalleryHtml(comp: FinanceComponent, cards: ProductGalleryCard[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(comp.html, 'text/html');

    if (comp.id === 'product-gallery-web') {
        // 웹 variant: data-pg-track 없음 — 두 번째 자식이 그리드 컨테이너
        const container = doc.querySelector('[data-component-id="product-gallery-web"]');
        const gridDiv = container?.children[1] as HTMLElement | null;
        if (gridDiv) {
            gridDiv.innerHTML = cards
                .map(
                    (card, i) =>
                        `<div style="flex:1;min-width:0;">${buildProductGalleryCardHtml(card, `pg-${i + 1}`)}</div>`,
                )
                .join('');
        }
    } else {
        const track = doc.querySelector('[data-pg-track]');
        if (track) {
            track.innerHTML = cards
                .map(
                    (card, i) =>
                        `<div data-pg-slide style="width:100%;">${buildProductGalleryCardHtml(card, `pg-${i + 1}`)}</div>`,
                )
                .join('');
        }
    }

    return doc.body.innerHTML;
}

// ── 기본값 ────────────────────────────────────────────────────────────────

const DEFAULT_PROMO_SLIDE: PromoBannerSlide = {
    itemId: '',
    bgColor: 'linear-gradient(135deg,#0046A4 0%,#0066CC 100%)',
    badge: '이벤트',
    title: '새 배너 제목',
    desc: '배너 설명을 입력하세요',
    ctaText: '자세히 보기',
    ctaHref: '#',
};

const DEFAULT_PRODUCT_CARD: ProductGalleryCard = {
    type: 'savings',
    badge: '적금',
    productName: '새 상품명',
    rateValue: '0.0',
    rateLabel: '최고 금리 (연)',
    detail: '기간 및 조건을 입력하세요',
    ctaHref: '#',
};

// ── 컴포넌트 ─────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#111827',
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6b7280',
};

export function SlideEditorModal({
    comp,
    onClose,
    onSaved,
}: {
    comp: FinanceComponent;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isPromoBanner = comp.id.startsWith('promo-banner-');

    const [promoSlides, setPromoSlides] = useState<PromoBannerSlide[]>(() => parsePromoBannerSlides(comp.html));
    const [productCards, setProductCards] = useState<ProductGalleryCard[]>(() => parseProductGalleryCards(comp.html));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const newHtml = isPromoBanner
            ? rebuildPromoBannerHtml(comp.html, promoSlides)
            : rebuildProductGalleryHtml(comp, productCards);
        try {
            const res = await fetch('/api/components', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    componentId: comp.id,
                    viewMode: comp.viewMode,
                    label: comp.label,
                    description: comp.description,
                    html: newHtml,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error ?? '저장에 실패했습니다.');
            } else {
                onSaved();
            }
        } catch (err: unknown) {
            console.error('슬라이드 편집 저장 오류:', err);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }

    const title = isPromoBanner ? '홍보 배너 슬라이드 편집' : '금융 상품 카드 편집';

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    width: '560px',
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                }}
            >
                {/* 헤더 */}
                <div
                    style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{title}</span>
                    <button
                        onClick={onClose}
                        style={{
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width={16}
                            height={16}
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* 본문 */}
                <div
                    style={{
                        padding: '16px 20px',
                        overflowY: 'auto',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}
                >
                    {isPromoBanner ? (
                        <PromoSlidesEditor slides={promoSlides} onChange={setPromoSlides} />
                    ) : (
                        <ProductCardsEditor cards={productCards} onChange={setProductCards} />
                    )}

                    {error && (
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#ef4444',
                                padding: '8px 10px',
                                background: '#fef2f2',
                                borderRadius: '6px',
                                border: '1px solid #fca5a5',
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div
                    style={{
                        padding: '14px 20px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        flexShrink: 0,
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            padding: '7px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#374151',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.5 : 1,
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '7px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            background: saving ? '#93c5fd' : '#0046A4',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── 홍보 배너 슬라이드 편집기 ─────────────────────────────────────────────

function PromoSlidesEditor({
    slides,
    onChange,
}: {
    slides: PromoBannerSlide[];
    onChange: (slides: PromoBannerSlide[]) => void;
}) {
    function updateSlide(idx: number, patch: Partial<PromoBannerSlide>) {
        onChange(slides.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    }

    function addSlide() {
        const newId = `pb-${slides.length + 1}`;
        onChange([...slides, { ...DEFAULT_PROMO_SLIDE, itemId: newId }]);
    }

    function removeSlide(idx: number) {
        onChange(slides.filter((_, i) => i !== idx));
    }

    return (
        <>
            {slides.map((slide, idx) => (
                <div
                    key={slide.itemId}
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    {/* 슬라이드 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>슬라이드 {idx + 1}</span>
                        <button
                            onClick={() => removeSlide(idx)}
                            disabled={slides.length <= 1}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: slides.length <= 1 ? 'not-allowed' : 'pointer',
                                color: slides.length <= 1 ? '#d1d5db' : '#ef4444',
                                fontSize: '12px',
                                padding: '2px 6px',
                            }}
                        >
                            삭제
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>뱃지</span>
                            <input
                                value={slide.badge}
                                onChange={(e) => updateSlide(idx, { badge: e.target.value })}
                                style={INPUT_STYLE}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>CTA 버튼 텍스트</span>
                            <input
                                value={slide.ctaText}
                                onChange={(e) => updateSlide(idx, { ctaText: e.target.value })}
                                style={INPUT_STYLE}
                            />
                        </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={LABEL_STYLE}>제목</span>
                        <input
                            value={slide.title}
                            onChange={(e) => updateSlide(idx, { title: e.target.value })}
                            style={INPUT_STYLE}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={LABEL_STYLE}>설명</span>
                        <input
                            value={slide.desc}
                            onChange={(e) => updateSlide(idx, { desc: e.target.value })}
                            style={INPUT_STYLE}
                        />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>CTA 링크</span>
                            <input
                                value={slide.ctaHref}
                                onChange={(e) => updateSlide(idx, { ctaHref: e.target.value })}
                                style={INPUT_STYLE}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>배경 색상 (CSS gradient)</span>
                            <input
                                value={slide.bgColor}
                                onChange={(e) => updateSlide(idx, { bgColor: e.target.value })}
                                style={INPUT_STYLE}
                            />
                        </label>
                    </div>
                </div>
            ))}

            <button
                onClick={addSlide}
                style={{
                    padding: '8px',
                    border: '1px dashed #9ca3af',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                + 슬라이드 추가
            </button>
        </>
    );
}

// ── 금융 상품 카드 편집기 ─────────────────────────────────────────────────

const CARD_TYPE_OPTIONS: { value: ProductGalleryCard['type']; label: string }[] = [
    { value: 'savings', label: '적금' },
    { value: 'deposit', label: '예금' },
    { value: 'loan', label: '대출' },
];

function ProductCardsEditor({
    cards,
    onChange,
}: {
    cards: ProductGalleryCard[];
    onChange: (cards: ProductGalleryCard[]) => void;
}) {
    function updateCard(idx: number, patch: Partial<ProductGalleryCard>) {
        onChange(cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    }

    function addCard() {
        onChange([...cards, { ...DEFAULT_PRODUCT_CARD }]);
    }

    function removeCard(idx: number) {
        onChange(cards.filter((_, i) => i !== idx));
    }

    return (
        <>
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    {/* 카드 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>상품 카드 {idx + 1}</span>
                        <button
                            onClick={() => removeCard(idx)}
                            disabled={cards.length <= 1}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: cards.length <= 1 ? 'not-allowed' : 'pointer',
                                color: cards.length <= 1 ? '#d1d5db' : '#ef4444',
                                fontSize: '12px',
                                padding: '2px 6px',
                            }}
                        >
                            삭제
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>상품 유형</span>
                            <select
                                value={card.type}
                                onChange={(e) =>
                                    updateCard(idx, { type: e.target.value as ProductGalleryCard['type'] })
                                }
                                style={INPUT_STYLE}
                            >
                                {CARD_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>뱃지 텍스트</span>
                            <input
                                value={card.badge}
                                onChange={(e) => updateCard(idx, { badge: e.target.value })}
                                style={INPUT_STYLE}
                            />
                        </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={LABEL_STYLE}>상품명</span>
                        <input
                            value={card.productName}
                            onChange={(e) => updateCard(idx, { productName: e.target.value })}
                            style={INPUT_STYLE}
                        />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>금리 수치</span>
                            <input
                                value={card.rateValue}
                                onChange={(e) => updateCard(idx, { rateValue: e.target.value })}
                                style={INPUT_STYLE}
                                placeholder="예: 4.5"
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={LABEL_STYLE}>금리 레이블</span>
                            <input
                                value={card.rateLabel}
                                onChange={(e) => updateCard(idx, { rateLabel: e.target.value })}
                                style={INPUT_STYLE}
                                placeholder="예: 최고 금리 (연)"
                            />
                        </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={LABEL_STYLE}>상세 조건</span>
                        <input
                            value={card.detail}
                            onChange={(e) => updateCard(idx, { detail: e.target.value })}
                            style={INPUT_STYLE}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={LABEL_STYLE}>링크</span>
                        <input
                            value={card.ctaHref}
                            onChange={(e) => updateCard(idx, { ctaHref: e.target.value })}
                            style={INPUT_STYLE}
                        />
                    </label>
                </div>
            ))}

            <button
                onClick={addCard}
                style={{
                    padding: '8px',
                    border: '1px dashed #9ca3af',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                + 상품 카드 추가
            </button>
        </>
    );
}
