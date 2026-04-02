// src/components/edit/FilterChipGroupEditor.tsx
// filter-chip-group 필터 칩 항목 편집 모달 (Issue #227)
// 칩 추가·삭제·순서변경·이름수정, 활성 색상 변경

'use client';

import { useState } from 'react';

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface ChipItem {
    label: string;
}

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── chevron SVG ──────────────────────────────────────────────────────────

const CHEVRON_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform 0.25s ease;"><path d="m6 9 6 6 6-6"/></svg>`;

// ── 칩 HTML 빌더 (마이그레이션 스크립트와 동기화) ────────────────────────

function buildChipHtml(chip: ChipItem, idx: number, activeColor: string): string {
    const isActive = idx === 0;
    const activeStyle = isActive
        ? `background:${activeColor};color:#fff;border:none;`
        : 'background:#fff;color:#666;border:1px solid #ddd;';
    return (
        `<button data-chip data-chip-idx="${idx}"` +
        ` ${isActive ? 'data-chip-active="true"' : ''}` +
        ` style="display:inline-block;border-radius:20px;padding:8px 16px;font-size:14px;` +
        `white-space:nowrap;cursor:pointer;flex-shrink:0;font-family:${FONT_FAMILY};${activeStyle}"` +
        `>${chip.label}</button>`
    );
}

// ── 인라인 토글 스크립트 (마이그레이션 스크립트와 동기화) ────────────────

const TOGGLE_SCRIPT =
    `<script>` +
    `(function(){` +
    `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
    `if(!root||root.getAttribute('data-chip-group-inited')==='1')return;` +
    `if(root.closest('.is-builder'))return;` +
    `root.setAttribute('data-chip-group-inited','1');` +
    `var container=root.querySelector('[data-chip-container]');` +
    `var toggleBtn=root.querySelector('[data-chip-toggle]');` +
    `var chevron=toggleBtn&&toggleBtn.querySelector('svg');` +
    `var expanded=false;` +
    `var activeColor=root.getAttribute('data-chip-active-color')||'#7C5CFC';` +
    `var styleId='fcg-hide-'+Math.random().toString(36).slice(2,8);` +
    `container.setAttribute('data-fcg-id',styleId);` +
    `var styleEl=document.createElement('style');` +
    `styleEl.textContent='[data-fcg-id=\"'+styleId+'\"]::-webkit-scrollbar{display:none}';` +
    `root.appendChild(styleEl);` +
    `function toggle(){` +
    `expanded=!expanded;` +
    `if(expanded){` +
    `container.style.overflowX='visible';` +
    `container.style.whiteSpace='normal';` +
    `container.style.flexWrap='wrap';` +
    `if(chevron)chevron.style.transform='rotate(180deg)';` +
    `}else{` +
    `container.style.overflowX='auto';` +
    `container.style.whiteSpace='nowrap';` +
    `container.style.flexWrap='nowrap';` +
    `if(chevron)chevron.style.transform='rotate(0deg)';` +
    `}` +
    `}` +
    `if(toggleBtn)toggleBtn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggle();});` +
    `root.querySelectorAll('[data-chip]').forEach(function(chip){` +
    `chip.addEventListener('click',function(e){` +
    `e.preventDefault();` +
    `root.querySelectorAll('[data-chip]').forEach(function(c){` +
    `c.removeAttribute('data-chip-active');` +
    `c.style.background='#fff';` +
    `c.style.color='#666';` +
    `c.style.border='1px solid #ddd';` +
    `});` +
    `chip.setAttribute('data-chip-active','true');` +
    `chip.style.background=activeColor;` +
    `chip.style.color='#fff';` +
    `chip.style.border='none';` +
    `});` +
    `});` +
    `})();` +
    `</script>`;

// ── DOM 조작 함수 ────────────────────────────────────────────────────────

function applyToBlock(blockEl: HTMLElement, chips: ChipItem[], activeColor: string) {
    blockEl.setAttribute('data-chip-items', JSON.stringify(chips));
    blockEl.setAttribute('data-chip-active-color', activeColor);

    const container = blockEl.querySelector<HTMLElement>('[data-chip-container]');
    if (container) {
        // 기존 칩 + 토글 버튼 제거
        container.innerHTML = '';
        // 칩 재생성
        const chipsHtml = chips.map((chip, i) => buildChipHtml(chip, i, activeColor)).join('');
        const toggleHtml =
            `<button data-chip-toggle style="flex-shrink:0;background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;">` +
            CHEVRON_SVG +
            `</button>`;
        container.innerHTML = chipsHtml + toggleHtml;
        // 접힌 상태로 리셋
        container.style.overflowX = 'auto';
        container.style.whiteSpace = 'nowrap';
        container.style.flexWrap = 'nowrap';
    }

    // 스크립트 재주입
    blockEl.querySelectorAll('script').forEach((el) => el.remove());
    blockEl.querySelectorAll('style').forEach((el) => el.remove());
    blockEl.removeAttribute('data-chip-group-inited');
    blockEl.insertAdjacentHTML('beforeend', TOGGLE_SCRIPT);
}

function parseChips(blockEl: HTMLElement): ChipItem[] {
    // 1순위: DOM에서 직접 읽기 (인라인 편집 반영)
    const chipEls = blockEl.querySelectorAll('[data-chip]');
    if (chipEls.length > 0) {
        return Array.from(chipEls).map((el) => ({
            label: el.textContent?.trim() ?? '',
        }));
    }
    // 2순위: data-chip-items JSON
    const raw = blockEl.getAttribute('data-chip-items');
    if (raw) {
        try {
            return JSON.parse(raw) as ChipItem[];
        } catch {
            // 파싱 실패
        }
    }
    return [{ label: '전체' }];
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
        width: 440,
        maxHeight: '80vh',
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
        gap: 6,
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
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#fafafa',
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
    input: {
        flex: 1,
        padding: '6px 10px',
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

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

export default function FilterChipGroupEditor({ blockEl, onClose }: Props) {
    const [chips, setChips] = useState<ChipItem[]>(() => parseChips(blockEl));
    const [activeColor, setActiveColor] = useState(() => blockEl.getAttribute('data-chip-active-color') || '#7C5CFC');

    const handleLabelChange = (idx: number, value: string) => {
        setChips((prev) => prev.map((chip, i) => (i === idx ? { ...chip, label: value } : chip)));
    };

    const handleAdd = () => {
        setChips((prev) => [...prev, { label: '새 칩' }]);
    };

    const handleDelete = (idx: number) => {
        if (chips.length <= 1) return;
        setChips((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const next = [...chips];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setChips(next);
    };

    const handleMoveDown = (idx: number) => {
        if (idx === chips.length - 1) return;
        const next = [...chips];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setChips(next);
    };

    const handleApply = () => {
        applyToBlock(blockEl, chips, activeColor);
        onClose();
    };

    return (
        <>
            <div onClick={onClose} style={S.overlay} />

            <div onClick={(e) => e.stopPropagation()} style={S.panel}>
                {/* 헤더 */}
                <div style={S.header}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>필터 칩 편집</span>
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

                {/* 활성 색상 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        background: '#f0f4ff',
                        borderBottom: '1px solid #e5e7eb',
                        flexShrink: 0,
                    }}
                >
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>활성 색상</span>
                    <input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        style={{
                            width: 28,
                            height: 28,
                            border: '1px solid #e5e7eb',
                            borderRadius: 6,
                            padding: 2,
                            cursor: 'pointer',
                        }}
                    />
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{activeColor}</span>
                </div>

                {/* 칩 목록 */}
                <div style={S.body}>
                    {chips.map((chip, idx) => (
                        <div key={idx} style={S.itemRow}>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#9ca3af',
                                    minWidth: 16,
                                    flexShrink: 0,
                                }}
                            >
                                {idx + 1}
                            </span>

                            {/* 순서 변경 */}
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
                                disabled={idx === chips.length - 1}
                                onClick={() => handleMoveDown(idx)}
                                style={{ ...S.iconBtn, opacity: idx === chips.length - 1 ? 0.35 : 1 }}
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

                            {/* 이름 입력 */}
                            <input
                                type="text"
                                value={chip.label}
                                onChange={(e) => handleLabelChange(idx, e.target.value)}
                                style={S.input}
                                placeholder="칩 이름"
                            />

                            {/* 삭제 */}
                            <button
                                type="button"
                                title="항목 삭제"
                                disabled={chips.length <= 1}
                                onClick={() => handleDelete(idx)}
                                style={{ ...S.deleteBtn, opacity: chips.length <= 1 ? 0.35 : 1 }}
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
                    ))}

                    {/* 추가 */}
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
                        칩 추가
                    </button>
                </div>

                {/* 푸터 */}
                <div style={S.footer}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>총 {chips.length}개 항목</span>
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
