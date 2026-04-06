// src/components/edit/LoanStatusEditor.tsx
// 대출 현황 카드 편집 모달 (Issue #283)

'use client';

import { useState, useCallback, useEffect } from 'react';

// ── 유틸 ──────────────────────────────────────────────────────────────────

const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] ?? m);

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

// ── 타입 ──────────────────────────────────────────────────────────────────

interface LoanRow {
    label: string;
    value: string;
    valueColor: string; // hex
    isDue: boolean; // data-ls-due 여부 (납부일 행 강조용)
}

export interface LoanStatusEditorProps {
    blockEl: HTMLElement;
    onClose: () => void;
}

// ── 블록 파싱 ─────────────────────────────────────────────────────────────

function parseBlock(blockEl: HTMLElement): { loanName: string; btnLabel: string; btnHref: string; rows: LoanRow[] } {
    const badge = blockEl.querySelector<HTMLElement>('[data-ls-badge]');
    const loanName = badge?.textContent?.trim() ?? 'IBK 신용대출';

    const btn = blockEl.querySelector<HTMLElement>('[data-ls-btn]');
    const btnLabel = btn?.textContent?.trim() ?? '상환하기';
    const btnHref = btn?.getAttribute('href') ?? '#';

    const rowEls = blockEl.querySelectorAll<HTMLElement>('[data-ls-row]');
    const rows: LoanRow[] = Array.from(rowEls).map((row) => {
        const labelEl = row.querySelector<HTMLElement>('[data-ls-label]');
        const valueEl = row.querySelector<HTMLElement>('[data-ls-value]');
        return {
            label: labelEl?.textContent?.trim() ?? '',
            value: valueEl?.textContent?.trim() ?? '',
            valueColor: rgbToHex(valueEl?.style.color ?? ''),
            isDue: row.hasAttribute('data-ls-due'),
        };
    });

    return { loanName, btnLabel, btnHref, rows };
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

export default function LoanStatusEditor({ blockEl, onClose }: LoanStatusEditorProps) {
    const parsed = parseBlock(blockEl);

    // ── state ──
    const [loanName, setLoanName] = useState(parsed.loanName);
    const [btnLabel, setBtnLabel] = useState(parsed.btnLabel);
    const [btnHref, setBtnHref] = useState(parsed.btnHref);
    const [rows, setRows] = useState<LoanRow[]>(parsed.rows);

    // ── callback ──
    const handleApply = useCallback(() => {
        // 대출명 뱃지 (textContent는 XSS 방지 내장 — escapeHtml 불필요)
        const badge = blockEl.querySelector<HTMLElement>('[data-ls-badge]');
        if (badge) badge.textContent = loanName;

        // 버튼 레이블·링크
        const btn = blockEl.querySelector<HTMLElement>('[data-ls-btn]');
        if (btn) {
            btn.textContent = btnLabel;
            btn.setAttribute('href', btnHref);
        }

        // 행 목록 — 마지막 행만 border 없음 (위치 기준, isDue 무관)
        const rowContainer = blockEl.querySelector<HTMLElement>('[data-ls-rows]');
        if (rowContainer) {
            rowContainer.innerHTML = rows
                .map((row, idx) => {
                    const isLast = idx === rows.length - 1;
                    const borderStyle = isLast ? '' : 'border-bottom:1px solid #F3F4F6;';
                    const dueAttr = row.isDue ? ' data-ls-due' : '';
                    return (
                        `<div data-ls-row${dueAttr} style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${borderStyle}">` +
                        `<span data-ls-label style="font-size:14px;color:#6B7280;">${escapeHtml(row.label)}</span>` +
                        `<span data-ls-value style="font-size:14px;font-weight:600;color:${row.valueColor};">${escapeHtml(row.value)}</span>` +
                        `</div>`
                    );
                })
                .join('');
        }

        onClose();
    }, [blockEl, loanName, btnLabel, btnHref, rows, onClose]);

    // ── effect ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // ── 행 편집 헬퍼 ──
    const updateRow = (idx: number, patch: Partial<LoanRow>) =>
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

    const addRow = () =>
        setRows((prev) => [...prev, { label: '항목', value: '값', valueColor: '#1A1A2E', isDue: false }]);

    const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

    // ── 렌더 ──
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    width: 420,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    fontFamily: "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>
                    대출 현황 카드 편집
                </h3>

                {/* 대출명 */}
                <label style={{ display: 'block', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>대출명</span>
                    <input
                        type="text"
                        value={loanName}
                        onChange={(e) => setLoanName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: '1px solid #E5E7EB',
                            fontSize: 14,
                            boxSizing: 'border-box',
                        }}
                    />
                </label>

                {/* 행 목록 */}
                <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 8 }}>항목</span>
                    {rows.map((row, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                            <input
                                type="text"
                                value={row.label}
                                onChange={(e) => updateRow(idx, { label: e.target.value })}
                                placeholder="레이블"
                                style={{
                                    flex: 1,
                                    padding: '7px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #E5E7EB',
                                    fontSize: 13,
                                }}
                            />
                            <input
                                type="text"
                                value={row.value}
                                onChange={(e) => updateRow(idx, { value: e.target.value })}
                                placeholder="값"
                                style={{
                                    flex: 1,
                                    padding: '7px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #E5E7EB',
                                    fontSize: 13,
                                }}
                            />
                            <input
                                type="color"
                                value={row.valueColor}
                                onChange={(e) => updateRow(idx, { valueColor: e.target.value })}
                                title="값 색상"
                                style={{
                                    width: 32,
                                    height: 32,
                                    padding: 2,
                                    border: '1px solid #E5E7EB',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                }}
                            />
                            <button
                                onClick={() => removeRow(idx)}
                                style={{
                                    width: 28,
                                    height: 28,
                                    border: 'none',
                                    borderRadius: 4,
                                    background: '#FEE2E2',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    fontSize: 16,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addRow}
                        style={{
                            width: '100%',
                            padding: '7px 0',
                            borderRadius: 6,
                            border: '1px dashed #D1D5DB',
                            background: 'transparent',
                            color: '#6B7280',
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        + 항목 추가
                    </button>
                </div>

                {/* 버튼 텍스트·링크 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <label style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                            버튼 텍스트
                        </span>
                        <input
                            type="text"
                            value={btnLabel}
                            onChange={(e) => setBtnLabel(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: 6,
                                border: '1px solid #E5E7EB',
                                fontSize: 14,
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                    <label style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                            링크 (URL)
                        </span>
                        <input
                            type="text"
                            value={btnHref}
                            onChange={(e) => setBtnHref(e.target.value)}
                            placeholder="#"
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: 6,
                                border: '1px solid #E5E7EB',
                                fontSize: 14,
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 8,
                            border: '1px solid #E5E7EB',
                            background: '#fff',
                            color: '#6B7280',
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleApply}
                        style={{
                            flex: 2,
                            padding: '10px 0',
                            borderRadius: 8,
                            border: 'none',
                            background: '#0046A4',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        적용
                    </button>
                </div>
            </div>
        </div>
    );
}
