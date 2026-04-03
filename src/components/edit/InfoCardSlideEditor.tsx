// src/components/edit/InfoCardSlideEditor.tsx
// info-card-slide 정보 카드 슬라이드 편집 모달 (Issue #274)
// 카드 추가·삭제·순서변경, 슬롯별 편집 (태그/제목/복사/부제목/보조텍스트/버튼)

'use client';

import { useState } from 'react';
import { buildCardHtml, SLIDE_SCRIPT, INFO_CARD_FONT_FAMILY } from '@/lib/info-card-slide';
import type { CardSlide } from '@/lib/info-card-slide';

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = INFO_CARD_FONT_FAMILY;

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
    // 1순위: data-card-slides JSON
    const raw = blockEl.getAttribute('data-card-slides');
    if (raw) {
        try {
            return JSON.parse(raw) as CardSlide[];
        } catch {
            // 파싱 실패 시 DOM 폴백
        }
    }

    // 2순위: DOM에서 추출
    const items = blockEl.querySelectorAll('[data-card-item]');
    if (items.length > 0) {
        return Array.from(items).map((item) => {
            // 태그
            const tagEl = item.querySelector('span[style*="border-radius:12px"]');
            const tag = tagEl?.textContent?.trim() || undefined;
            // 더보기
            const moreEl = item.querySelector('a[style*="font-size:18px"]');
            const showMore = !!moreEl;
            const moreHref = moreEl?.getAttribute('href') || undefined;
            // 제목 + 복사
            const title = item.querySelector('[data-card-title]')?.textContent?.trim() ?? '제목';
            const copyable = !!item.querySelector('[data-card-copy]');
            // 부제목
            const subtitleEl = item.querySelector('span[style*="font-size:14px"]');
            const subtitle = subtitleEl?.textContent?.trim() || undefined;
            // 보조 텍스트
            const infoEls = item.querySelectorAll('span[style*="text-align:right"]');
            const infoLines =
                infoEls.length > 0 ? Array.from(infoEls).map((el) => el.textContent?.trim() ?? '') : undefined;
            // 하단 버튼
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

    return [{ title: '새 카드' }];
}

// ── 스타일 상수 ───────────────────────────────────────────────────────────

const S = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 99998,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
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

    return (
        <>
            <div onClick={onClose} style={S.overlay} />
            <div onClick={(e) => e.stopPropagation()} style={S.panel}>
                {/* 헤더 */}
                <div style={S.header}>
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
