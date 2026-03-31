// src/components/edit/BenefitCardEditor.tsx
// benefit-card 블록의 혜택 카드 항목을 추가·삭제·순서변경·내용수정하는 모달 에디터 (Issue #231)

'use client';

import { useState } from 'react';

interface CardItem {
    icon: string;
    title: string;
    desc: string;
}

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── 카드 HTML 빌더 (마이그레이션 스크립트와 동일) ───────────────────────────

function buildCard(card: CardItem): string {
    return (
        `<a href="#" style="display:block;text-decoration:none;flex:1;min-width:0;">` +
        `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:24px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;box-shadow:0 4px 20px rgba(0,70,164,0.08);height:100%;box-sizing:border-box;">` +
        `<div style="width:48px;height:48px;background:#E8F0FC;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">` +
        `<span style="font-size:24px;line-height:1;">${card.icon}</span>` +
        `</div>` +
        `<div style="font-size:16px;font-weight:700;color:#0046A4;line-height:1.3;word-break:keep-all;">${card.title}</div>` +
        `<div style="font-size:12px;color:#6B7280;line-height:1.4;word-break:keep-all;">${card.desc}</div>` +
        `</div>` +
        `</a>`
    );
}

// mobile 뷰어용 scroll-snap 변환 인라인 스크립트 (마이그레이션 스크립트와 동기화)
const SCROLL_SCRIPT =
    `<script>` +
    `(function(){` +
    `if(window.builderRuntime)return;` +
    `var root=document.currentScript&&document.currentScript.parentElement;` +
    `if(!root)return;` +
    `var track=root.querySelector('[data-bc-track]');` +
    `if(!track)return;` +
    `track.style.cssText='display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;gap:0;padding:4px 0 8px;';` +
    `var slides=Array.from(track.querySelectorAll('[data-bc-slide]'));` +
    `slides.forEach(function(s){` +
    `s.style.cssText='flex-shrink:0;width:80%;scroll-snap-align:start;padding:0 8px;box-sizing:border-box;';` +
    `});` +
    `})();` +
    `<\/script>`;

// ── DOM 조작 함수 ────────────────────────────────────────────────────────────

/** blockEl DOM을 새 카드 데이터로 갱신 */
function applyToBlock(blockEl: HTMLElement, cards: CardItem[]) {
    // 카드 데이터를 속성에 저장 (재편집 시 파싱용)
    blockEl.setAttribute('data-bc-cards', JSON.stringify(cards));

    const compId = blockEl.getAttribute('data-component-id') ?? '';
    const container = blockEl.querySelector<HTMLElement>('[data-bc-container]');
    if (!container) return;

    if (compId.endsWith('-mobile')) {
        // mobile: data-bc-track 내 slide 목록 교체 + 스크립트 재주입
        const track = container.querySelector<HTMLElement>('[data-bc-track]');
        if (track) {
            track.innerHTML = cards
                .map((card) => `<div data-bc-slide style="width:100%;">${buildCard(card)}</div>`)
                .join('');
        }
        // 스크립트 재주입
        blockEl.querySelectorAll('script').forEach((el) => el.remove());
        blockEl.insertAdjacentHTML('beforeend', SCROLL_SCRIPT);
    } else if (compId.endsWith('-web')) {
        // web: flex row 컨테이너 내 카드 직접 교체
        container.innerHTML = cards.map((card) => buildCard(card)).join('');
    } else if (compId.endsWith('-responsive')) {
        // responsive: flex-wrap 컨테이너 내 래퍼 div 교체
        container.innerHTML = cards
            .map(
                (card) =>
                    `<div style="flex:1;min-width:calc(50% - 6px);box-sizing:border-box;">${buildCard(card)}</div>`,
            )
            .join('');
    }
}

/** blockEl에서 현재 카드 데이터 파싱 */
function parseCards(blockEl: HTMLElement): CardItem[] {
    // data-bc-cards 속성 우선 사용
    const raw = blockEl.getAttribute('data-bc-cards');
    if (raw) {
        try {
            return JSON.parse(raw) as CardItem[];
        } catch {
            // 파싱 실패 시 DOM에서 직접 읽기
        }
    }

    // 폴백: DOM에서 추출
    const slides = blockEl.querySelectorAll(
        '[data-bc-slide] a, [data-bc-container] > a, [data-bc-container] > div > a',
    );
    return Array.from(slides).map((el) => {
        const spans = el.querySelectorAll('span, div');
        return {
            icon: (spans[0] as HTMLElement)?.textContent?.trim() ?? '💰',
            title: (spans[1] as HTMLElement)?.textContent?.trim() ?? '',
            desc: (spans[2] as HTMLElement)?.textContent?.trim() ?? '',
        };
    });
}

// ── 스타일 상수 ──────────────────────────────────────────────────────────────

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
        width: 480,
        maxHeight: '82vh',
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
    guide: {
        padding: '8px 14px',
        background: '#f0f4ff',
        borderBottom: '1px solid #e5e7eb',
        fontSize: 11,
        color: '#4b6baf',
        flexShrink: 0,
    },
    body: {
        overflowY: 'auto' as const,
        flex: 1,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
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
    itemCard: {
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        background: '#fafafa',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
    },
    itemHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    iconBtn: {
        width: 26,
        height: 26,
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
        width: 26,
        height: 26,
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
        marginLeft: 'auto',
    } as React.CSSProperties,
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: 600,
        color: '#6b7280',
        width: 36,
        flexShrink: 0,
    },
    input: {
        flex: 1,
        padding: '5px 9px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 13,
        color: '#111827',
        background: '#fff',
        boxSizing: 'border-box' as const,
        fontFamily: FONT_FAMILY,
        outline: 'none',
        minWidth: 0,
    },
    iconInput: {
        width: 56,
        padding: '5px 9px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 20,
        textAlign: 'center' as const,
        background: '#fff',
        boxSizing: 'border-box' as const,
        outline: 'none',
        flexShrink: 0,
    },
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
};

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function BenefitCardEditor({ blockEl, onClose }: Props) {
    const [cards, setCards] = useState<CardItem[]>(() => parseCards(blockEl));

    const handleChange = (idx: number, field: keyof CardItem, value: string) => {
        setCards((prev) => prev.map((card, i) => (i === idx ? { ...card, [field]: value } : card)));
    };

    const handleAdd = () => {
        setCards((prev) => [...prev, { icon: '⭐', title: '새 혜택', desc: '혜택 설명을 입력하세요' }]);
    };

    const handleDelete = (idx: number) => {
        if (cards.length <= 1) return;
        setCards((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const next = [...cards];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setCards(next);
    };

    const handleMoveDown = (idx: number) => {
        if (idx === cards.length - 1) return;
        const next = [...cards];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setCards(next);
    };

    const handleApply = () => {
        applyToBlock(blockEl, cards);
        onClose();
    };

    return (
        <>
            {/* 오버레이 */}
            <div onClick={onClose} style={S.overlay} />

            {/* 패널 */}
            <div onClick={(e) => e.stopPropagation()} style={S.panel}>
                {/* 헤더 */}
                <div style={S.header}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>혜택 카드 편집</span>
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

                {/* 안내 */}
                <div style={S.guide}>혜택 카드를 추가·삭제·순서변경·내용수정합니다. 아이콘은 이모지를 입력하세요.</div>

                {/* 카드 목록 */}
                <div style={S.body}>
                    {cards.map((card, idx) => (
                        <div key={idx} style={S.itemCard}>
                            {/* 카드 헤더: 순서 + 이동 버튼 + 삭제 */}
                            <div style={S.itemHeader}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', minWidth: 20 }}>
                                    {idx + 1}
                                </span>
                                <button
                                    type="button"
                                    title="위로"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveUp(idx)}
                                    style={{ ...S.iconBtn, opacity: idx === 0 ? 0.35 : 1 }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="13"
                                        height="13"
                                        fill="none"
                                        stroke="#374151"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m18 15-6-6-6 6" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    title="아래로"
                                    disabled={idx === cards.length - 1}
                                    onClick={() => handleMoveDown(idx)}
                                    style={{ ...S.iconBtn, opacity: idx === cards.length - 1 ? 0.35 : 1 }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="13"
                                        height="13"
                                        fill="none"
                                        stroke="#374151"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    title="카드 삭제"
                                    disabled={cards.length <= 1}
                                    onClick={() => handleDelete(idx)}
                                    style={{ ...S.deleteBtn, opacity: cards.length <= 1 ? 0.35 : 1 }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="13"
                                        height="13"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* 아이콘 입력 */}
                            <div style={S.inputRow}>
                                <span style={S.label}>아이콘</span>
                                <input
                                    type="text"
                                    value={card.icon}
                                    onChange={(e) => handleChange(idx, 'icon', e.target.value)}
                                    style={S.iconInput}
                                    maxLength={4}
                                    placeholder="💰"
                                />
                                <span style={{ fontSize: 11, color: '#9ca3af' }}>이모지를 입력하세요</span>
                            </div>

                            {/* 제목 입력 */}
                            <div style={S.inputRow}>
                                <span style={S.label}>제목</span>
                                <input
                                    type="text"
                                    value={card.title}
                                    onChange={(e) => handleChange(idx, 'title', e.target.value)}
                                    style={S.input}
                                    placeholder="30,000원 캐시백"
                                />
                            </div>

                            {/* 설명 입력 */}
                            <div style={S.inputRow}>
                                <span style={S.label}>설명</span>
                                <input
                                    type="text"
                                    value={card.desc}
                                    onChange={(e) => handleChange(idx, 'desc', e.target.value)}
                                    style={S.input}
                                    placeholder="이벤트 참여 완료 시"
                                />
                            </div>
                        </div>
                    ))}

                    {/* 카드 추가 버튼 */}
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
                        혜택 카드 추가
                    </button>
                </div>

                {/* 푸터 */}
                <div style={S.footer}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>총 {cards.length}개 카드</span>
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
