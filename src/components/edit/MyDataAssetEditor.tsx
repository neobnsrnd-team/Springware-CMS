// src/components/edit/MyDataAssetEditor.tsx
// 마이데이터 자산 요약 편집 모달 (Issue #288)

'use client';

import { useState, useCallback, useEffect } from 'react';

// ── 유틸 ──────────────────────────────────────────────────────────────────

const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] ?? m);

const rgbToHex = (rgb: string, fallback = '#1A1A2E'): string => {
    if (!rgb || !rgb.startsWith('rgb')) return /^#[0-9A-Fa-f]{6}$/.test(rgb) ? rgb : fallback;
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return fallback;
    return (
        '#' +
        parts
            .slice(0, 3)
            .map((x) => Number(x).toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
    );
};

/** "42,500,000 원" → 42500000 */
const parseAmount = (str: string): number => {
    const n = Math.round(Number(str.replace(/[^0-9.-]/g, '')));
    return isNaN(n) ? 0 : n;
};

/** 42500000 → "42,500,000 원" */
const formatAmount = (n: number): string => Math.abs(n).toLocaleString('ko-KR') + ' 원';

/**
 * 항목 배열 → conic-gradient 문자열
 * 부채 포함 — 절댓값 기준 비율 계산
 * 전체 합계가 0이면 단색 fallback 반환
 */
const buildConicGradient = (rows: AssetRow[]): string => {
    const total = rows.reduce((sum, r) => sum + Math.abs(r.amount), 0);
    if (total === 0) return 'conic-gradient(#E5E7EB 0% 100%)';

    let accumulated = 0;
    const stops = rows
        .map((r) => {
            const pct = (Math.abs(r.amount) / total) * 100;
            const from = accumulated;
            accumulated += pct;
            return `${r.color} ${from.toFixed(2)}% ${accumulated.toFixed(2)}%`;
        })
        .join(',');
    return `conic-gradient(${stops})`;
};

// ── 타입 ──────────────────────────────────────────────────────────────────

type RowType = 'asset' | 'debt';

interface AssetRow {
    type: RowType;
    label: string;
    amount: number; // 자산: 양수, 부채: 음수
    color: string; // hex
}

interface BtnConfig {
    label: string;
    href: string;
}

export interface MyDataAssetEditorProps {
    blockEl: HTMLElement;
    onClose: () => void;
}

// ── 블록 파싱 ─────────────────────────────────────────────────────────────

function parseBlock(blockEl: HTMLElement): {
    title: string;
    dateText: string;
    dateVisible: boolean;
    totalAmount: number;
    rows: AssetRow[];
    btn: BtnConfig;
} {
    const titleEl = blockEl.querySelector<HTMLElement>('[data-ma-title]');
    const title = titleEl?.textContent?.trim() ?? '내 자산 현황';

    const dateEl = blockEl.querySelector<HTMLElement>('[data-ma-date]');
    const dateText = dateEl?.textContent?.trim() ?? '';
    const dateVisible = dateEl?.getAttribute('data-ma-date-visible') !== 'false';

    const totalEl = blockEl.querySelector<HTMLElement>('[data-ma-total]');
    const totalAmount = parseAmount(totalEl?.textContent?.trim() ?? '0');

    const rowEls = blockEl.querySelectorAll<HTMLElement>('[data-ma-row]');
    const rows: AssetRow[] = Array.from(rowEls).map((row) => {
        const rowType = (row.getAttribute('data-ma-row-type') ?? 'asset') as RowType;
        const labelEl = row.querySelector<HTMLElement>('[data-ma-label]');
        const amountEl = row.querySelector<HTMLElement>('[data-ma-amount]');
        const dotEl = row.querySelector<HTMLElement>('[data-ma-dot]');

        const rawAmount = parseAmount(amountEl?.textContent?.trim() ?? '0');
        const amount = rowType === 'debt' ? -Math.abs(rawAmount) : Math.abs(rawAmount);
        const color =
            dotEl?.getAttribute('data-ma-dot-color') ??
            rgbToHex(dotEl?.style.background ?? '', rowType === 'debt' ? '#EF4444' : '#0046A4');

        return { type: rowType, label: labelEl?.textContent?.trim() ?? '', amount, color };
    });

    const btnEl = blockEl.querySelector<HTMLAnchorElement>('[data-ma-btn]');
    const btn: BtnConfig = {
        label: btnEl?.textContent?.trim() ?? '자산 상세 보기',
        href: btnEl?.getAttribute('href') ?? '#',
    };

    return { title, dateText, dateVisible, totalAmount, rows, btn };
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────

export default function MyDataAssetEditor({ blockEl, onClose }: MyDataAssetEditorProps) {
    // parseBlock을 매 렌더마다 호출하지 않도록 useState 초기화 함수로 실행
    const [initialData] = useState(() => parseBlock(blockEl));

    // ── state ──
    const [title, setTitle] = useState(initialData.title);
    const [dateText, setDateText] = useState(initialData.dateText);
    const [dateVisible, setDateVisible] = useState(initialData.dateVisible);
    const [rows, setRows] = useState<AssetRow[]>(initialData.rows);
    const [btn, setBtn] = useState<BtnConfig>(initialData.btn);
    const [sortByAmount, setSortByAmount] = useState(false);

    // 총자산·순자산 실시간 자동 계산 (읽기 전용) — Math.round로 부동소수점 오차 방지
    const totalAsset = rows.filter((r) => r.type === 'asset').reduce((sum, r) => sum + Math.round(r.amount), 0);
    const netAsset = rows.reduce((sum, r) => sum + Math.round(r.amount), 0);

    // ── callback ──
    const handleApply = useCallback(() => {
        // 제목
        const titleEl = blockEl.querySelector<HTMLElement>('[data-ma-title]');
        if (titleEl) titleEl.textContent = title;

        // 기준일 뱃지
        const dateEl = blockEl.querySelector<HTMLElement>('[data-ma-date]');
        if (dateEl) {
            dateEl.textContent = dateText;
            dateEl.setAttribute('data-ma-date-visible', String(dateVisible));
            dateEl.style.display = dateVisible ? '' : 'none';
        }

        // 총자산 (자동 계산값 반영)
        const totalEl = blockEl.querySelector<HTMLElement>('[data-ma-total]');
        if (totalEl) totalEl.textContent = formatAmount(totalAsset);

        // 정렬 옵션 적용 — 자산만 금액 내림차순, 부채는 원래 순서 유지
        const sortedRows = sortByAmount
            ? [
                  ...rows.filter((r) => r.type === 'asset').sort((a, b) => b.amount - a.amount),
                  ...rows.filter((r) => r.type === 'debt'),
              ]
            : rows;

        // 항목 + 비율 계산
        const totalAbs = sortedRows.reduce((sum, r) => sum + Math.abs(r.amount), 0);
        const rowContainer = blockEl.querySelector<HTMLElement>('[data-ma-rows]');
        if (rowContainer) {
            rowContainer.innerHTML = sortedRows
                .map((row, idx) => {
                    const isLast = idx === rows.length - 1;
                    const borderStyle = isLast ? '' : 'border-bottom:1px solid #F3F4F6;';
                    const pct = totalAbs > 0 ? Math.round((Math.abs(row.amount) / totalAbs) * 100) : 0;
                    const amountStr = row.type === 'debt' ? `-${formatAmount(row.amount)}` : formatAmount(row.amount);
                    const amountColor = row.color;

                    return (
                        `<div data-ma-row data-ma-row-type="${row.type}" style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;${borderStyle}">` +
                        `<span style="display:flex;align-items:center;gap:6px;">` +
                        `<span data-ma-dot data-ma-dot-color="${row.color}" style="width:8px;height:8px;border-radius:50%;background:${row.color};flex-shrink:0;display:inline-block;"></span>` +
                        `<span data-ma-label style="font-size:14px;color:#6B7280;">${escapeHtml(row.label)}</span>` +
                        `</span>` +
                        `<span style="display:flex;align-items:center;gap:8px;">` +
                        `<span data-ma-amount data-ma-amount-color="${amountColor}" style="font-size:14px;font-weight:600;color:${amountColor};">${escapeHtml(amountStr)}</span>` +
                        `<span data-ma-pct style="font-size:12px;color:#9CA3AF;min-width:32px;text-align:right;">${pct}%</span>` +
                        `</span>` +
                        `</div>`
                    );
                })
                .join('');
        }

        // 도넛 차트
        const chartEl = blockEl.querySelector<HTMLElement>('[data-ma-chart]');
        if (chartEl) {
            const gradient = buildConicGradient(sortedRows);
            chartEl.style.background = gradient;
        }

        // 범례 재생성
        const legendEl = blockEl.querySelector<HTMLElement>('[data-ma-legend]');
        if (legendEl) {
            const totalAbsForLegend = totalAbs;
            legendEl.innerHTML = sortedRows
                .map((r) => {
                    const pct = totalAbsForLegend > 0 ? Math.round((Math.abs(r.amount) / totalAbsForLegend) * 100) : 0;
                    return (
                        `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6B7280;">` +
                        `<span style="width:8px;height:8px;border-radius:2px;background:${r.color};flex-shrink:0;display:inline-block;"></span>` +
                        `${escapeHtml(r.label)} ${pct}%` +
                        `</span>`
                    );
                })
                .join('');
        }

        // 순자산
        const netEl = blockEl.querySelector<HTMLElement>('[data-ma-net]');
        if (netEl) netEl.textContent = (netAsset < 0 ? '-' : '') + formatAmount(netAsset);

        // 버튼
        const btnEl = blockEl.querySelector<HTMLAnchorElement>('[data-ma-btn]');
        if (btnEl) {
            btnEl.textContent = btn.label;
            const safeHref = btn.href.trim().toLowerCase().startsWith('javascript:') ? '#' : btn.href;
            btnEl.setAttribute('href', safeHref);
        }

        onClose();
    }, [blockEl, title, dateText, dateVisible, totalAsset, rows, btn, netAsset, sortByAmount, onClose]);

    // ── effect ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // ── 행 편집 헬퍼 ──
    const updateRow = (idx: number, patch: Partial<AssetRow>) =>
        setRows((prev) => prev.map((r, i) => (i === idx ? ({ ...r, ...patch } as AssetRow) : r)));

    const addRow = (type: RowType) =>
        setRows((prev) => [
            ...prev,
            type === 'debt'
                ? { type: 'debt', label: '부채', amount: -1000000, color: '#EF4444' }
                : { type: 'asset', label: '자산', amount: 1000000, color: '#6B7280' },
        ]);

    const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

    const moveRowUp = (idx: number) =>
        setRows((prev) => {
            if (idx === 0) return prev;
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });

    const moveRowDown = (idx: number) =>
        setRows((prev) => {
            if (idx === prev.length - 1) return prev;
            const next = [...prev];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return next;
        });

    // ── 스타일 공통 ──
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid #E5E7EB',
        fontSize: 13,
        boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        fontSize: 13,
        color: '#6B7280',
        display: 'block',
        marginBottom: 4,
    };
    const sectionStyle: React.CSSProperties = { marginBottom: 16 };

    // 미리보기용 순자산 표시
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
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 24,
                    width: 480,
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    fontFamily: "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif",
                }}
            >
                {/* 헤더: 제목 + 닫기 버튼 */}
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
                >
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>
                        마이데이터 자산 요약 편집
                    </h3>
                    <button
                        onClick={onClose}
                        title="닫기"
                        style={{
                            width: 28,
                            height: 28,
                            border: 'none',
                            borderRadius: 4,
                            background: 'transparent',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            fontSize: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* 제목 */}
                <div style={sectionStyle}>
                    <span style={labelStyle}>제목</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                </div>

                {/* 기준일 뱃지 */}
                <div style={{ ...sectionStyle, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <label style={{ flex: 1 }}>
                        <span style={labelStyle}>기준일</span>
                        <input
                            type="text"
                            value={dateText}
                            onChange={(e) => setDateText(e.target.value)}
                            disabled={!dateVisible}
                            placeholder="예: 2024.04.06"
                            style={{ ...inputStyle, opacity: dateVisible ? 1 : 0.4 }}
                        />
                    </label>
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            paddingBottom: 8,
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={dateVisible}
                            onChange={(e) => setDateVisible(e.target.checked)}
                            style={{ width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 13, color: '#6B7280' }}>표시</span>
                    </label>
                </div>

                {/* 자산/부채 항목 */}
                <div style={sectionStyle}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                        }}
                    >
                        <span style={labelStyle}>항목</span>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={sortByAmount}
                                onChange={(e) => setSortByAmount(e.target.checked)}
                                style={{ width: 14, height: 14 }}
                            />
                            <span style={{ fontSize: 12, color: '#6B7280' }}>자산 금액순 정렬</span>
                        </label>
                    </div>
                    {rows.map((row, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: 8,
                                padding: '8px 10px',
                                borderRadius: 6,
                                border: `1px solid ${row.type === 'debt' ? '#FEE2E2' : '#F3F4F6'}`,
                                background: row.type === 'debt' ? '#FFF8F8' : '#FAFAFA',
                            }}
                        >
                            {/* 행 헤더: 타입 뱃지 + 레이블 입력 + 이동 + 삭제 */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                                <button
                                    onClick={() =>
                                        updateRow(idx, {
                                            type: row.type === 'asset' ? 'debt' : 'asset',
                                            amount: row.type === 'asset' ? -Math.abs(row.amount) : Math.abs(row.amount),
                                            color: row.type === 'asset' ? '#EF4444' : '#0046A4',
                                        })
                                    }
                                    title="자산/부채 전환"
                                    style={{
                                        padding: '2px 7px',
                                        borderRadius: 4,
                                        border: 'none',
                                        background: row.type === 'debt' ? '#FEE2E2' : '#E8F0FC',
                                        color: row.type === 'debt' ? '#DC2626' : '#0046A4',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                    }}
                                >
                                    {row.type === 'debt' ? '부채' : '자산'}
                                </button>
                                <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) => updateRow(idx, { label: e.target.value })}
                                    placeholder="항목명"
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: 6,
                                        border: '1px solid #E5E7EB',
                                        fontSize: 13,
                                    }}
                                />
                                <button
                                    onClick={() => moveRowUp(idx)}
                                    disabled={idx === 0}
                                    title="위로"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: '1px solid #E5E7EB',
                                        borderRadius: 4,
                                        background: '#fff',
                                        color: idx === 0 ? '#D1D5DB' : '#6B7280',
                                        cursor: idx === 0 ? 'default' : 'pointer',
                                        fontSize: 12,
                                        flexShrink: 0,
                                    }}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => moveRowDown(idx)}
                                    disabled={idx === rows.length - 1}
                                    title="아래로"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border: '1px solid #E5E7EB',
                                        borderRadius: 4,
                                        background: '#fff',
                                        color: idx === rows.length - 1 ? '#D1D5DB' : '#6B7280',
                                        cursor: idx === rows.length - 1 ? 'default' : 'pointer',
                                        fontSize: 12,
                                        flexShrink: 0,
                                    }}
                                >
                                    ▼
                                </button>
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
                                        flexShrink: 0,
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* 금액 + 색상 */}
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={Math.abs(row.amount)}
                                    onChange={(e) => {
                                        const abs = Math.round(Math.abs(Number(e.target.value) || 0));
                                        updateRow(idx, { amount: row.type === 'debt' ? -abs : abs });
                                    }}
                                    placeholder="금액 (원)"
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: 6,
                                        border: '1px solid #E5E7EB',
                                        fontSize: 13,
                                    }}
                                />
                                <span style={{ fontSize: 13, color: '#6B7280', flexShrink: 0 }}>원</span>
                                <input
                                    type="color"
                                    value={row.color}
                                    onChange={(e) => updateRow(idx, { color: e.target.value })}
                                    title="색상"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        padding: 2,
                                        border: '1px solid #E5E7EB',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                    }}
                                />
                                {/* 도넛 미리보기 색 점 */}
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: row.color,
                                        flexShrink: 0,
                                        display: 'inline-block',
                                    }}
                                />
                            </div>

                            {/* 금액 포맷 미리보기 */}
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                                {row.type === 'debt' ? '-' : ''}
                                {formatAmount(row.amount)}
                            </div>
                        </div>
                    ))}

                    {/* 항목 추가 버튼 */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            onClick={() => addRow('asset')}
                            style={{
                                flex: 1,
                                padding: '7px 0',
                                borderRadius: 6,
                                border: '1px dashed #0046A4',
                                background: 'transparent',
                                color: '#0046A4',
                                fontSize: 13,
                                cursor: 'pointer',
                            }}
                        >
                            + 자산 항목
                        </button>
                        <button
                            onClick={() => addRow('debt')}
                            style={{
                                flex: 1,
                                padding: '7px 0',
                                borderRadius: 6,
                                border: '1px dashed #EF4444',
                                background: 'transparent',
                                color: '#EF4444',
                                fontSize: 13,
                                cursor: 'pointer',
                            }}
                        >
                            + 부채 항목
                        </button>
                    </div>
                </div>

                {/* 순자산 (읽기 전용) */}
                {/* 총자산·순자산 자동 계산 (읽기 전용) */}
                <div
                    style={{
                        ...sectionStyle,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #E8F0FC',
                        background: '#F5F8FF',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
                        }}
                    >
                        <span style={{ fontSize: 13, color: '#6B7280' }}>총 자산 (자동 계산)</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>
                            {formatAmount(totalAsset)}
                        </span>
                    </div>
                    <div
                        style={{
                            borderTop: '1px solid #D1DFF5',
                            paddingTop: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span style={{ fontSize: 13, color: '#6B7280' }}>순자산 (자동 계산)</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: netAsset < 0 ? '#EF4444' : '#0046A4' }}>
                            {netAsset < 0 ? '-' : ''}
                            {formatAmount(netAsset)}
                        </span>
                    </div>
                </div>

                {/* 버튼 */}
                <div style={{ ...sectionStyle, display: 'flex', gap: 8 }}>
                    <label style={{ flex: 1 }}>
                        <span style={labelStyle}>버튼 텍스트</span>
                        <input
                            type="text"
                            value={btn.label}
                            onChange={(e) => setBtn((b) => ({ ...b, label: e.target.value }))}
                            style={inputStyle}
                        />
                    </label>
                    <label style={{ flex: 1 }}>
                        <span style={labelStyle}>버튼 링크</span>
                        <input
                            type="text"
                            value={btn.href}
                            onChange={(e) => setBtn((b) => ({ ...b, href: e.target.value }))}
                            placeholder="#"
                            style={inputStyle}
                        />
                    </label>
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
