// src/components/edit/PointRewardEditor.tsx
// 포인트·리워드 현황 컴포넌트 편집 모달 (Issue #280)
// 헤더 제목 · 가변 행(라벨/값) · 소멸 예정 강조색 · 버튼 2개 편집

'use client';

import { useState, useCallback, useEffect } from 'react';

// ── 유틸리티 ─────────────────────────────────────────────────────────────

/** XSS 방지 — innerHTML 삽입 전 특수문자 이스케이프 */
const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] ?? m);

/** rgb(r,g,b) → #RRGGBB 변환 — <input type="color">는 hex 필요 */
const rgbToHex = (rgb: string): string => {
    if (!rgb || !rgb.startsWith('rgb')) return rgb || '#E53E3E';
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return '#E53E3E';
    return (
        '#' +
        parts
            .slice(0, 3)
            .map((x) => Number(x).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
    );
};

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface PointRow {
    label: string;
    value: string;
    isExpire: boolean; // 소멸 예정 강조 여부
    expireColor: string; // 강조 색상 (isExpire=true 일 때 사용)
}

interface PointButton {
    text: string;
    href: string;
    variant: 'primary' | 'secondary';
}

export interface PointRewardEditorProps {
    blockEl: HTMLElement;
    onClose: () => void;
}

// ── DOM → 상태 파싱 ──────────────────────────────────────────────────────

function parseBlock(blockEl: HTMLElement): {
    header: string;
    rows: PointRow[];
    btn1: PointButton;
    btn2: PointButton;
} {
    const headerEl = blockEl.querySelector<HTMLElement>('[data-pr-header]');
    const header = headerEl?.textContent?.trim() ?? 'IBK 포인트';

    const rowEls = blockEl.querySelectorAll<HTMLElement>('[data-pr-row]');
    const rows: PointRow[] = Array.from(rowEls).map((rowEl) => {
        const isExpire = rowEl.hasAttribute('data-pr-expire');
        const valueEl = rowEl.querySelector<HTMLElement>('[data-pr-value]');
        return {
            label: rowEl.querySelector<HTMLElement>('[data-pr-label]')?.textContent?.trim() ?? '',
            value: valueEl?.textContent?.trim() ?? '',
            isExpire,
            expireColor: isExpire ? rgbToHex(valueEl?.style.color || '#E53E3E') : '#E53E3E',
        };
    });

    const btn1El = blockEl.querySelector<HTMLAnchorElement>('[data-pr-btn="primary"]');
    const btn2El = blockEl.querySelector<HTMLAnchorElement>('[data-pr-btn="secondary"]');

    return {
        header,
        rows,
        btn1: {
            text: btn1El?.textContent?.trim() ?? '현금 전환',
            href: btn1El?.getAttribute('href') ?? '#',
            variant: 'primary',
        },
        btn2: {
            text: btn2El?.textContent?.trim() ?? '쇼핑 사용',
            href: btn2El?.getAttribute('href') ?? '#',
            variant: 'secondary',
        },
    };
}

// ── href 보안 처리 ───────────────────────────────────────────────────────

function sanitizeHref(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|#)/.test(trimmed)) return trimmed.replace(/"/g, '&quot;');
    return '#';
}

// ── DOM 적용 ─────────────────────────────────────────────────────────────

function applyToBlock(blockEl: HTMLElement, header: string, rows: PointRow[], btn1: PointButton, btn2: PointButton) {
    // 헤더
    const headerEl = blockEl.querySelector<HTMLElement>('[data-pr-header]');
    if (headerEl) headerEl.textContent = header;

    // 기존 행 전체 교체
    const rowsContainer = blockEl.querySelector<HTMLElement>('[data-pr-rows]');
    if (rowsContainer) {
        rowsContainer.innerHTML = rows
            .map((row, i) => {
                const isLast = i === rows.length - 1;
                const borderStyle = isLast ? '' : 'border-bottom:1px solid #F3F4F6;';
                const valueColor = row.isExpire ? row.expireColor : '#1A1A2E';
                const expireAttr = row.isExpire ? ' data-pr-expire' : '';
                return (
                    `<div data-pr-row${expireAttr} style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${borderStyle}">` +
                    `<span data-pr-label style="font-size:14px;color:#6B7280;">${escapeHtml(row.label)}</span>` +
                    `<span data-pr-value style="font-size:14px;font-weight:600;color:${valueColor};">${escapeHtml(row.value)}</span>` +
                    `</div>`
                );
            })
            .join('');
    }

    // 버튼
    const btn1El = blockEl.querySelector<HTMLAnchorElement>('[data-pr-btn="primary"]');
    const btn2El = blockEl.querySelector<HTMLAnchorElement>('[data-pr-btn="secondary"]');
    if (btn1El) {
        btn1El.textContent = btn1.text;
        btn1El.setAttribute('href', sanitizeHref(btn1.href));
    }
    if (btn2El) {
        btn2El.textContent = btn2.text;
        btn2El.setAttribute('href', sanitizeHref(btn2.href));
    }
}

// ── 공통 스타일 상수 ─────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    fontSize: 13,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1A1A2E',
};

const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    marginBottom: 3,
    display: 'block',
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#374151',
    margin: '14px 0 6px',
};

// ── 컴포넌트 ─────────────────────────────────────────────────────────────

export default function PointRewardEditor({ blockEl, onClose }: PointRewardEditorProps) {
    const parsed = parseBlock(blockEl);

    // 1. state
    const [header, setHeader] = useState(parsed.header);
    const [rows, setRows] = useState<PointRow[]>(parsed.rows);
    const [btn1, setBtn1] = useState<PointButton>(parsed.btn1);
    const [btn2, setBtn2] = useState<PointButton>(parsed.btn2);

    // 3. callback
    const handleApply = useCallback(() => {
        applyToBlock(blockEl, header, rows, btn1, btn2);
        onClose();
    }, [blockEl, header, rows, btn1, btn2, onClose]);

    // 5. effect
    // ESC 닫기
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    // 행 조작
    const updateRow = (idx: number, patch: Partial<PointRow>) =>
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

    const addRow = () =>
        setRows((prev) => [...prev, { label: '항목', value: '0 P', isExpire: false, expireColor: '#E53E3E' }]);

    const deleteRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const moveRow = (idx: number, dir: -1 | 1) => {
        const next = idx + dir;
        if (next < 0 || next >= rows.length) return;
        setRows((prev) => {
            const arr = [...prev];
            [arr[idx], arr[next]] = [arr[next], arr[idx]];
            return arr;
        });
    };

    return (
        <>
            {/* 오버레이 */}
            <div
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.35)' }}
            />

            {/* 패널 */}
            <div
                style={{
                    position: 'fixed',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 380,
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 99999,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                }}
            >
                {/* 헤더 */}
                <div
                    style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid #f3f4f6',
                        background: '#fafafa',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>포인트·리워드 편집</span>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#6b7280' }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 본문 스크롤 영역 */}
                <div style={{ padding: '14px 14px 10px', overflowY: 'auto', flex: 1 }}>
                    {/* 헤더 제목 */}
                    <p style={sectionTitleStyle}>헤더 제목</p>
                    <input
                        type="text"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        style={inputStyle}
                        placeholder="IBK 포인트"
                    />

                    {/* 행 목록 */}
                    <p style={sectionTitleStyle}>항목 목록</p>
                    {rows.map((row, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                padding: '10px 10px 8px',
                                marginBottom: 8,
                                background: '#fafafa',
                            }}
                        >
                            {/* 행 헤더 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 6,
                                }}
                            >
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>항목 {idx + 1}</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    <button
                                        type="button"
                                        onClick={() => moveRow(idx, -1)}
                                        disabled={idx === 0}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 4,
                                            padding: '1px 5px',
                                            cursor: 'pointer',
                                            fontSize: 11,
                                            color: '#374151',
                                        }}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveRow(idx, 1)}
                                        disabled={idx === rows.length - 1}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 4,
                                            padding: '1px 5px',
                                            cursor: 'pointer',
                                            fontSize: 11,
                                            color: '#374151',
                                        }}
                                    >
                                        ▼
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteRow(idx)}
                                        disabled={rows.length <= 1}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #fca5a5',
                                            borderRadius: 4,
                                            padding: '1px 6px',
                                            cursor: 'pointer',
                                            fontSize: 11,
                                            color: '#ef4444',
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* 라벨 / 값 */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>라벨</label>
                                    <input
                                        type="text"
                                        value={row.label}
                                        onChange={(e) => updateRow(idx, { label: e.target.value })}
                                        style={inputStyle}
                                        placeholder="항목명"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>값</label>
                                    <input
                                        type="text"
                                        value={row.value}
                                        onChange={(e) => updateRow(idx, { value: e.target.value })}
                                        style={inputStyle}
                                        placeholder="12,500 P"
                                    />
                                </div>
                            </div>

                            {/* 소멸 예정 토글 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 12,
                                        color: '#374151',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={row.isExpire}
                                        onChange={(e) => updateRow(idx, { isExpire: e.target.checked })}
                                    />
                                    소멸 예정 강조
                                </label>
                                {row.isExpire && (
                                    <input
                                        type="color"
                                        value={row.expireColor}
                                        onChange={(e) => updateRow(idx, { expireColor: e.target.value })}
                                        title="강조 색상"
                                        style={{
                                            width: 26,
                                            height: 22,
                                            padding: 1,
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* 행 추가 버튼 */}
                    <button
                        type="button"
                        onClick={addRow}
                        style={{
                            width: '100%',
                            padding: '7px 0',
                            fontSize: 13,
                            color: '#0046A4',
                            background: '#E8F0FC',
                            border: '1px dashed #0046A4',
                            borderRadius: 8,
                            cursor: 'pointer',
                            marginBottom: 4,
                        }}
                    >
                        + 항목 추가
                    </button>

                    {/* 버튼 1 */}
                    <p style={sectionTitleStyle}>버튼 1 (기본)</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>텍스트</label>
                            <input
                                type="text"
                                value={btn1.text}
                                onChange={(e) => setBtn1((b) => ({ ...b, text: e.target.value }))}
                                style={inputStyle}
                                placeholder="현금 전환"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>링크</label>
                            <input
                                type="text"
                                value={btn1.href}
                                onChange={(e) => setBtn1((b) => ({ ...b, href: e.target.value }))}
                                style={inputStyle}
                                placeholder="#"
                            />
                        </div>
                    </div>

                    {/* 버튼 2 */}
                    <p style={sectionTitleStyle}>버튼 2 (보조)</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>텍스트</label>
                            <input
                                type="text"
                                value={btn2.text}
                                onChange={(e) => setBtn2((b) => ({ ...b, text: e.target.value }))}
                                style={inputStyle}
                                placeholder="쇼핑 사용"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>링크</label>
                            <input
                                type="text"
                                value={btn2.href}
                                onChange={(e) => setBtn2((b) => ({ ...b, href: e.target.value }))}
                                style={inputStyle}
                                placeholder="#"
                            />
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div
                    style={{
                        padding: '10px 14px 14px',
                        borderTop: '1px solid #f3f4f6',
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '7px 18px',
                            fontSize: 13,
                            borderRadius: 7,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            color: '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            padding: '7px 18px',
                            fontSize: 13,
                            fontWeight: 600,
                            borderRadius: 7,
                            border: 'none',
                            background: '#0046A4',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        적용
                    </button>
                </div>
            </div>
        </>
    );
}
