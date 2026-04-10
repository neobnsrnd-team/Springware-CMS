// src/components/edit/InfoCardSlideEditor.tsx
// info-card-slide 정보 카드 슬라이드 편집 모달 (Issue #274)
// 카드 추가·삭제·순서변경, 슬롯별 편집 (태그/제목/복사/부제목/보조텍스트/버튼)

'use client';

import { useEffect, useRef, useState } from 'react';

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface CardButton {
    label: string;
    href?: string;
}

interface CardSlide {
    tag?: string;
    showMore?: boolean;
    moreHref?: string;
    title: string;
    copyable?: boolean;
    subtitle?: string;
    infoLines?: string[];
    buttons?: CardButton[];
}

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── href 보안 처리 ───────────────────────────────────────────────────────

function sanitizeHref(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|#)/.test(trimmed)) {
        return trimmed.replace(/"/g, '&quot;');
    }
    return '#';
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── 카드 HTML 빌더 (마이그레이션 스크립트와 동기화) ──────────────────────

function buildCardHtml(card: CardSlide, idx: number): string {
    const tagHtml = card.tag
        ? `<span style="display:inline-block;max-width:100%;padding:4px 12px;border-radius:12px;background:#E8F0FC;color:#0046A4;font-size:12px;font-weight:600;overflow-wrap:anywhere;word-break:break-all;box-sizing:border-box;">${escapeHtml(card.tag)}</span>`
        : '';
    const moreHtml = card.showMore
        ? `<a href="${sanitizeHref(card.moreHref || '#')}" style="color:#9CA3AF;font-size:13px;text-decoration:none;line-height:1.4;display:inline-flex;align-items:center;justify-content:flex-end;max-width:96px;min-width:0;overflow-wrap:anywhere;word-break:break-word;text-align:right;flex-shrink:1;">더보기</a>`
        : '';
    const headerHtml =
        tagHtml || moreHtml
            ? `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">${tagHtml}${moreHtml}</div>`
            : '';

    const copyBtnHtml = card.copyable
        ? `<button data-card-copy style="background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;display:flex;align-items:center;">` +
          `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>` +
          `</button>`
        : '';
    const titleHtml =
        `<div style="display:flex;align-items:flex-start;gap:4px;min-width:0;max-width:100%;">` +
        `<span data-card-title style="display:block;font-size:18px;font-weight:700;color:#1A1A2E;flex:1;min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:break-all;line-height:1.4;">${escapeHtml(card.title)}</span>` +
        copyBtnHtml +
        `</div>`;

    const subtitleHtml = card.subtitle
        ? `<span style="display:block;max-width:100%;font-size:14px;color:#6B7280;overflow-wrap:anywhere;word-break:break-all;line-height:1.45;">${escapeHtml(card.subtitle)}</span>`
        : '';

    const infoHtml = (card.infoLines ?? [])
        .map(
            (line) =>
                `<span style="display:block;max-width:100%;font-size:13px;color:#6B7280;text-align:right;overflow-wrap:anywhere;word-break:break-all;line-height:1.45;">${escapeHtml(line)}</span>`,
        )
        .join('');

    const buttonsHtml =
        (card.buttons ?? []).length > 0
            ? `<div style="display:flex;gap:8px;margin-top:4px;min-width:0;max-width:100%;flex-wrap:wrap;">` +
              (card.buttons ?? [])
                  .map(
                      (b) =>
                          `<a href="${sanitizeHref(b.href || '#')}"` +
                          ` style="flex:1 1 120px;min-width:0;max-width:100%;text-align:center;padding:10px;border-radius:8px;background:#F5F7FA;color:#1A1A2E;font-size:13px;font-weight:600;text-decoration:none;white-space:normal;overflow-wrap:anywhere;word-break:break-all;line-height:1.35;box-sizing:border-box;">${escapeHtml(b.label)}</a>`,
                  )
                  .join('') +
              `</div>`
            : '';

    return (
        `<div data-card-item data-card-idx="${idx}"` +
        ` style="flex-shrink:0;width:100%;max-width:100%;padding:0 8px;box-sizing:border-box;">` +
        `<div style="width:100%;max-width:100%;overflow:hidden;background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;min-height:180px;box-sizing:border-box;">` +
        headerHtml +
        titleHtml +
        subtitleHtml +
        infoHtml +
        buttonsHtml +
        `</div></div>`
    );
}

// ── 인라인 스크립트 (마이그레이션 스크립트와 동기화) ─────────────────────

const SLIDE_SCRIPT =
    `<script>` +
    `(function(){` +
    `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
    `if(!root||root.getAttribute('data-card-slide-inited')==='1')return;` +
    `if(root.closest('.is-builder'))return;` +
    `root.setAttribute('data-card-slide-inited','1');` +
    `var track=root.querySelector('[data-card-track]');` +
    `if(track){` +
    `track.style.cssText='display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;` +
    `-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;gap:0;padding:8px 0 12px;scroll-padding:0 4%;';` +
    `var maxH=0;` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight='0';` +
    `if(inner.scrollHeight>maxH)maxH=inner.scrollHeight;` +
    `});` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight=maxH+'px';` +
    `});` +
    `track.querySelectorAll('[data-card-item]').forEach(function(card){` +
    `card.style.flex='0 0 92%';card.style.width='92%';card.style.scrollSnapAlign='center';` +
    `});` +
    `track.querySelectorAll('[data-card-item] a').forEach(function(btn){` +
    `if(!btn.style.borderRadius)return;` +
    `btn.style.minWidth='0';btn.style.maxWidth='100%';btn.style.whiteSpace='normal';btn.style.overflowWrap='anywhere';btn.style.wordBreak='break-all';btn.style.boxSizing='border-box';` +
    `});` +
    `if(!track.getAttribute('data-ics-id')){` +
    `var styleId='ics-hide-'+Math.random().toString(36).slice(2,8);` +
    `track.setAttribute('data-ics-id',styleId);` +
    `var styleEl=document.createElement('style');` +
    `styleEl.textContent='[data-ics-id=\"'+styleId+'\"]::-webkit-scrollbar{display:none}';` +
    `root.appendChild(styleEl);` +
    `}` +
    `}` +
    `root.querySelectorAll('[data-card-copy]').forEach(function(btn){` +
    `btn.addEventListener('click',function(e){` +
    `e.preventDefault();` +
    `var card=btn.closest('[data-card-item]');` +
    `var titleEl=card&&card.querySelector('[data-card-title]');` +
    `if(titleEl&&navigator.clipboard){` +
    `navigator.clipboard.writeText(titleEl.textContent||'');` +
    `var svg=btn.querySelector('svg');` +
    `if(svg){svg.setAttribute('stroke','#059669');setTimeout(function(){svg.setAttribute('stroke','#9CA3AF');},1500);}` +
    `}` +
    `});` +
    `});` +
    `})();` +
    `</script>`;

// ── DOM 조작 함수 ────────────────────────────────────────────────────────

function applyToBlock(blockEl: HTMLElement, slides: CardSlide[]) {
    blockEl.setAttribute('data-card-slides', JSON.stringify(slides));

    const track = blockEl.querySelector<HTMLElement>('[data-card-track]');
    if (track) {
        track.innerHTML = slides.map((card, i) => buildCardHtml(card, i)).join('');
    }

    blockEl.querySelectorAll('script').forEach((el) => el.remove());
    blockEl.querySelectorAll('style').forEach((el) => el.remove());
    blockEl.removeAttribute('data-card-slide-inited');
    blockEl.insertAdjacentHTML('beforeend', SLIDE_SCRIPT);
}

function parseSlides(blockEl: HTMLElement): CardSlide[] {
    // 1순위: 현재 캔버스 DOM에서 추출
    const items = blockEl.querySelectorAll('[data-card-item]');
    if (items.length > 0) {
        return Array.from(items).map((item) => {
            const tagEl = item.querySelector('span[style*="border-radius:12px"]');
            const tag = tagEl?.textContent?.trim() || undefined;
            const moreEl = item.querySelector('a[style*="justify-content:flex-end"]');
            const showMore = !!moreEl;
            const moreHref = moreEl?.getAttribute('href') || undefined;
            const title = item.querySelector('[data-card-title]')?.textContent?.trim() ?? '제목';
            const copyable = !!item.querySelector('[data-card-copy]');
            const subtitleEl = item.querySelector('span[style*="font-size:14px"]');
            const subtitle = subtitleEl?.textContent?.trim() || undefined;
            const infoEls = item.querySelectorAll('span[style*="text-align:right"]');
            const infoLines =
                infoEls.length > 0 ? Array.from(infoEls).map((el) => el.textContent?.trim() ?? '') : undefined;
            const btnEls = item.querySelectorAll('a[style*="border-radius:8px"]');
            const buttons =
                btnEls.length > 0
                    ? Array.from(btnEls).map((el) => ({
                          label: el.textContent?.trim() ?? '',
                          href: el.getAttribute('href') || undefined,
                      }))
                    : undefined;

            return { tag, showMore, moreHref, title, copyable, subtitle, infoLines, buttons };
        });
    }

    // 2순위: data-card-slides JSON
    const raw = blockEl.getAttribute('data-card-slides');
    if (raw) {
        try {
            return JSON.parse(raw) as CardSlide[];
        } catch {
            // 파싱 실패 시 기본값 사용
        }
    }

    return [{ title: '새 카드' }];
}

// ── 스타일 상수 ───────────────────────────────────────────────────────────

const S = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 99998,
        background: 'transparent',
    },
    panel: {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column' as const,
        zIndex: 99999,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        fontFamily: FONT_FAMILY,
        fontSize: 13,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid #f3f4f6',
        borderRadius: '12px 12px 0 0',
        background: '#fafafa',
        flexShrink: 0,
    },
    body: {
        overflowY: 'auto' as const,
        flex: 1,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px 14px',
        borderTop: '1px solid #f3f4f6',
        flexShrink: 0,
    },
    iconBtn: {
        width: 24,
        height: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 5,
        background: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 0,
    } as React.CSSProperties,
    deleteBtn: {
        width: 24,
        height: 24,
        border: '1px solid #fca5a5',
        borderRadius: 5,
        background: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 0,
        color: '#ef4444',
    } as React.CSSProperties,
    input: {
        flex: 1,
        padding: '5px 8px',
        border: '1px solid #e5e7eb',
        borderRadius: 5,
        fontSize: 12,
        color: '#111827',
        background: '#fff',
        fontFamily: FONT_FAMILY,
        outline: 'none',
        minWidth: 0,
        boxSizing: 'border-box' as const,
    },
    label: { fontSize: 11, fontWeight: 600, color: '#6B7280', minWidth: 40, flexShrink: 0 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
    addBtn: {
        width: '100%',
        padding: '8px',
        border: '1.5px dashed #c7d8f4',
        borderRadius: 8,
        background: '#f0f4ff',
        color: '#0046A4',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    } as React.CSSProperties,
    cancelBtn: {
        padding: '6px 14px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        background: '#fff',
        fontSize: 12,
        color: '#374151',
        cursor: 'pointer',
        fontWeight: 600,
    },
    applyBtn: {
        padding: '6px 16px',
        border: 'none',
        borderRadius: 6,
        background: '#0046A4',
        fontSize: 12,
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
    },
    check: { width: 14, height: 14, cursor: 'pointer', accentColor: '#0046A4' } as React.CSSProperties,
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

export default function InfoCardSlideEditor({ blockEl, onClose }: Props) {
    const [slides, setSlides] = useState<CardSlide[]>(() => parseSlides(blockEl));
    const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
    const dragStateRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

    useEffect(() => {
        setSlides(parseSlides(blockEl));
        setPanelPos(null);
        dragStateRef.current = null;
    }, [blockEl]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState) return;

            setPanelPos({
                left: Math.max(12, e.clientX - dragState.offsetX),
                top: Math.max(12, e.clientY - dragState.offsetY),
            });
        };

        const handleMouseUp = () => {
            dragStateRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const updateSlide = (idx: number, patch: Partial<CardSlide>) => {
        setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
    };

    const handleAdd = () => {
        setSlides((prev) => [...prev, { title: '새 카드' }]);
    };

    const handleDelete = (idx: number) => {
        if (slides.length <= 1) return;
        setSlides((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const next = [...slides];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setSlides(next);
    };

    const handleMoveDown = (idx: number) => {
        if (idx === slides.length - 1) return;
        const next = [...slides];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setSlides(next);
    };

    const handleApply = () => {
        applyToBlock(blockEl, slides);
        onClose();
    };

    const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('button')) return;

        const panelEl = e.currentTarget.parentElement as HTMLDivElement | null;
        if (!panelEl) return;

        const rect = panelEl.getBoundingClientRect();
        setPanelPos({ left: rect.left, top: rect.top });
        dragStateRef.current = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };
    };

    return (
        <>
            <div onClick={onClose} style={S.overlay} />
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    ...S.panel,
                    left: panelPos ? panelPos.left : S.panel.left,
                    top: panelPos ? panelPos.top : S.panel.top,
                    transform: panelPos ? 'none' : S.panel.transform,
                }}
            >
                {/* 헤더 */}
                <div onMouseDown={handleHeaderMouseDown} style={{ ...S.header, cursor: 'move' }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>정보 카드 편집</span>
                    <button
                        onClick={onClose}
                        style={{
                            width: 24,
                            height: 24,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            fontSize: 18,
                            padding: 0,
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* 본문 */}
                <div style={S.body}>
                    {slides.map((card, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                background: '#fafafa',
                                overflow: 'visible',
                            }}
                        >
                            {/* 카드 헤더 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 10px',
                                    borderBottom: '1px solid #f3f4f6',
                                }}
                            >
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>카드 {idx + 1}</span>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                    <button
                                        type="button"
                                        title="위로"
                                        disabled={idx === 0}
                                        onClick={() => handleMoveUp(idx)}
                                        style={{ ...S.iconBtn, opacity: idx === 0 ? 0.35 : 1 }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="11"
                                            height="11"
                                            fill="none"
                                            stroke="#374151"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        >
                                            <path d="m18 15-6-6-6 6" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        title="아래로"
                                        disabled={idx === slides.length - 1}
                                        onClick={() => handleMoveDown(idx)}
                                        style={{ ...S.iconBtn, opacity: idx === slides.length - 1 ? 0.35 : 1 }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="11"
                                            height="11"
                                            fill="none"
                                            stroke="#374151"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        title="카드 삭제"
                                        disabled={slides.length <= 1}
                                        onClick={() => handleDelete(idx)}
                                        style={{ ...S.deleteBtn, opacity: slides.length <= 1 ? 0.35 : 1 }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="11"
                                            height="11"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        >
                                            <path d="M18 6 6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* 슬롯 편집 */}
                            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {/* 태그 */}
                                <div style={S.row}>
                                    <span style={S.label}>태그</span>
                                    <input
                                        type="checkbox"
                                        checked={!!card.tag}
                                        onChange={(e) =>
                                            updateSlide(idx, { tag: e.target.checked ? '태그' : undefined })
                                        }
                                        style={S.check}
                                    />
                                    {card.tag !== undefined && (
                                        <input
                                            type="text"
                                            value={card.tag ?? ''}
                                            onChange={(e) => updateSlide(idx, { tag: e.target.value })}
                                            style={S.input}
                                            placeholder="태그 텍스트"
                                        />
                                    )}
                                </div>

                                {/* 더보기 */}
                                <div style={S.row}>
                                    <span style={S.label}>더보기</span>
                                    <input
                                        type="checkbox"
                                        checked={!!card.showMore}
                                        onChange={(e) => updateSlide(idx, { showMore: e.target.checked })}
                                        style={S.check}
                                    />
                                    {card.showMore && (
                                        <input
                                            type="text"
                                            value={card.moreHref ?? ''}
                                            onChange={(e) =>
                                                updateSlide(idx, { moreHref: e.target.value || undefined })
                                            }
                                            style={S.input}
                                            placeholder="https://..."
                                        />
                                    )}
                                </div>

                                {/* 제목 + 복사 */}
                                <div style={S.row}>
                                    <span style={S.label}>제목</span>
                                    <input
                                        type="text"
                                        value={card.title}
                                        onChange={(e) => updateSlide(idx, { title: e.target.value })}
                                        style={{ ...S.input, fontWeight: 600 }}
                                        placeholder="제목"
                                    />
                                    <label
                                        style={{
                                            fontSize: 10,
                                            color: '#6B7280',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!card.copyable}
                                            onChange={(e) => updateSlide(idx, { copyable: e.target.checked })}
                                            style={S.check}
                                        />
                                        복사
                                    </label>
                                </div>

                                {/* 부제목 */}
                                <div style={S.row}>
                                    <span style={S.label}>부제목</span>
                                    <input
                                        type="text"
                                        value={card.subtitle ?? ''}
                                        onChange={(e) => updateSlide(idx, { subtitle: e.target.value || undefined })}
                                        style={S.input}
                                        placeholder="부제목 (선택)"
                                    />
                                </div>

                                {/* 보조 텍스트 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={S.row}>
                                        <span style={S.label}>보조</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSlide(idx, {
                                                    infoLines: [...(card.infoLines ?? []), '새 텍스트'],
                                                })
                                            }
                                            style={{
                                                fontSize: 10,
                                                color: '#0046A4',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            + 행 추가
                                        </button>
                                    </div>
                                    {(card.infoLines ?? []).map((line, li) => (
                                        <div key={li} style={{ ...S.row, paddingLeft: 46 }}>
                                            <input
                                                type="text"
                                                value={line}
                                                onChange={(e) => {
                                                    const newLines = [...(card.infoLines ?? [])];
                                                    newLines[li] = e.target.value;
                                                    updateSlide(idx, { infoLines: newLines });
                                                }}
                                                style={S.input}
                                                placeholder="보조 텍스트"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateSlide(idx, {
                                                        infoLines: (card.infoLines ?? []).filter((_, i) => i !== li),
                                                    })
                                                }
                                                style={{ ...S.deleteBtn, width: 20, height: 20 }}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="9"
                                                    height="9"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                >
                                                    <path d="M18 6 6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* 하단 버튼 (0~3개) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={S.row}>
                                        <span style={S.label}>버튼</span>
                                        <button
                                            type="button"
                                            disabled={(card.buttons ?? []).length >= 3}
                                            onClick={() =>
                                                updateSlide(idx, {
                                                    buttons: [...(card.buttons ?? []), { label: '버튼' }],
                                                })
                                            }
                                            style={{
                                                fontSize: 10,
                                                color: '#0046A4',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: (card.buttons ?? []).length >= 3 ? 0.35 : 1,
                                            }}
                                        >
                                            + 버튼 추가 ({(card.buttons ?? []).length}/3)
                                        </button>
                                    </div>
                                    {(card.buttons ?? []).map((btn, bi) => (
                                        <div key={bi} style={{ ...S.row, paddingLeft: 46 }}>
                                            <input
                                                type="text"
                                                value={btn.label}
                                                onChange={(e) => {
                                                    const newBtns = [...(card.buttons ?? [])];
                                                    newBtns[bi] = { ...newBtns[bi], label: e.target.value };
                                                    updateSlide(idx, { buttons: newBtns });
                                                }}
                                                style={{ ...S.input, flex: '0 0 100px' }}
                                                placeholder="라벨"
                                            />
                                            <input
                                                type="text"
                                                value={btn.href ?? ''}
                                                onChange={(e) => {
                                                    const newBtns = [...(card.buttons ?? [])];
                                                    newBtns[bi] = { ...newBtns[bi], href: e.target.value || undefined };
                                                    updateSlide(idx, { buttons: newBtns });
                                                }}
                                                style={S.input}
                                                placeholder="https://..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateSlide(idx, {
                                                        buttons: (card.buttons ?? []).filter((_, i) => i !== bi),
                                                    })
                                                }
                                                style={{ ...S.deleteBtn, width: 20, height: 20 }}
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    width="9"
                                                    height="9"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                >
                                                    <path d="M18 6 6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 카드 추가 */}
                    <button type="button" onClick={handleAdd} style={S.addBtn}>
                        <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        카드 추가
                    </button>
                </div>

                {/* 푸터 */}
                <div style={S.footer}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>총 {slides.length}장</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={onClose} style={S.cancelBtn}>
                            취소
                        </button>
                        <button onClick={handleApply} style={S.applyBtn}>
                            적용
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
