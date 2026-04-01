// src/components/edit/FlexListEditor.tsx
// flex-list 가변형 멀티 컬럼 컴포넌트 편집 모달 (Issue #234)
// 행 추가·삭제·순서변경, 컬럼 추가·삭제, 타입 토글, 너비 선택, 아이콘 프리셋, 텍스트 행 관리

'use client';

import { useState, useCallback } from 'react';

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface FlexListColumn {
    type: 'icon' | 'text';
    width: 'fixed' | 'flex' | 'auto';
    icon?: string;
    iconBg?: string;
    lines?: string[];
}

interface FlexListRow {
    columns: FlexListColumn[];
}

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── 아이콘 프리셋 ────────────────────────────────────────────────────────

const ICON_PRESETS: { key: string; label: string; svg: string }[] = [
    {
        key: 'card',
        label: '카드',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    },
    {
        key: 'transfer',
        label: '이체',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l-4-4 4-4"/><path d="M3 13h13"/><path d="M17 7l4 4-4 4"/><path d="M21 11H8"/></svg>',
    },
    {
        key: 'account',
        label: '계좌',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
    },
    {
        key: 'savings',
        label: '적금',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.8 9 1.5 9 1 9"/></svg>',
    },
    {
        key: 'loan',
        label: '대출',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
    },
    {
        key: 'insurance',
        label: '보험',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    },
    {
        key: 'shopping',
        label: '쇼핑',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    },
    {
        key: 'notification',
        label: '알림',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    },
    {
        key: 'calendar',
        label: '달력',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    },
    {
        key: 'check',
        label: '체크',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    },
    {
        key: 'arrow',
        label: '화살표',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
    },
    {
        key: 'won',
        label: '원화',
        svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 16 4-12 4 12 4-16"/><path d="M3 10h18"/><path d="M3 14h18"/></svg>',
    },
];

// 마이그레이션 스크립트와 동일한 아이콘 SVG (size 20)
const ICONS_20: Record<string, string> = {
    card: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    transfer:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l-4-4 4-4"/><path d="M3 13h13"/><path d="M17 7l4 4-4 4"/><path d="M21 11H8"/></svg>',
    account:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
    savings:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.8 9 1.5 9 1 9"/></svg>',
    loan: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
    insurance:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    shopping:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    notification:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    calendar:
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
    won: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 16 4-12 4 12 4-16"/><path d="M3 10h18"/><path d="M3 14h18"/></svg>',
};

// ── HTML 빌더 (마이그레이션 스크립트와 동기화) ──────────────────────────

function buildIconHtml(iconKey: string, bgColor: string): string {
    const svg = ICONS_20[iconKey] ?? ICONS_20['check'];
    return (
        `<span data-fl-type="icon" data-fl-icon="${iconKey}" data-fl-icon-bg="${bgColor}"` +
        ` style="flex:0 0 40px;width:40px;height:40px;border-radius:50%;` +
        `background:${bgColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">` +
        svg +
        `</span>`
    );
}

function buildColumnHtml(col: FlexListColumn): string {
    if (col.type === 'icon') {
        return buildIconHtml(col.icon ?? 'check', col.iconBg ?? '#E8F0FC');
    }

    const widthStyle =
        col.width === 'fixed'
            ? 'flex:0 0 40px;'
            : col.width === 'auto'
              ? 'flex:0 0 auto;text-align:right;'
              : 'flex:1;min-width:0;';

    const lines = col.lines ?? ['텍스트'];
    const lineHtmls = lines.map((text, i) => {
        if (i === 0) {
            return `<span style="font-size:15px;font-weight:600;color:#1A1A2E;line-height:1.4;">${text}</span>`;
        }
        return `<span style="font-size:13px;color:#6B7280;line-height:1.4;">${text}</span>`;
    });

    return (
        `<span data-fl-type="text" data-fl-width="${col.width}"` +
        ` style="${widthStyle}display:flex;flex-direction:column;gap:2px;">` +
        lineHtmls.join('') +
        `</span>`
    );
}

function buildRowHtml(row: FlexListRow, isLast: boolean): string {
    const borderStyle = isLast ? '' : 'border-bottom:1px solid #E5E7EB;';
    const columnsHtml = row.columns.map((col) => buildColumnHtml(col)).join('');

    return (
        `<a href="#" style="display:flex;align-items:center;gap:12px;` +
        `padding:16px 20px;${borderStyle}text-decoration:none;">` +
        columnsHtml +
        `</a>`
    );
}

// ── DOM 조작 함수 ────────────────────────────────────────────────────────

function applyToBlock(blockEl: HTMLElement, rows: FlexListRow[]) {
    blockEl.setAttribute('data-fl-rows', JSON.stringify(rows));

    // 기존 <a> 행 제거
    blockEl.querySelectorAll(':scope > a').forEach((el) => el.remove());

    // 새 행 삽입
    const html = rows.map((row, i) => buildRowHtml(row, i === rows.length - 1)).join('');
    blockEl.insertAdjacentHTML('beforeend', html);
}

/**
 * blockEl에서 현재 행/컬럼 데이터 파싱
 *
 * 우선순위:
 * 1. DOM (실제 <a> 행 존재 시) — ContentBuilder 인라인 편집 결과 반영
 * 2. data-fl-rows 속성 — DOM 파싱 실패 또는 구버전 블록
 */
function parseRows(blockEl: HTMLElement): FlexListRow[] {
    const anchors = blockEl.querySelectorAll<HTMLElement>(':scope > a');

    // DOM에서 직접 파싱 — data-fl-* 속성 기반 (인라인 편집 내용 반영)
    if (anchors.length > 0) {
        const rows: FlexListRow[] = Array.from(anchors).map((anchor) => {
            const colSpans = anchor.querySelectorAll<HTMLElement>(':scope > span[data-fl-type]');
            const columns: FlexListColumn[] = Array.from(colSpans).map((span) => {
                const type = span.getAttribute('data-fl-type');

                if (type === 'icon') {
                    return {
                        type: 'icon' as const,
                        width: 'fixed' as const,
                        icon: span.getAttribute('data-fl-icon') || 'check',
                        iconBg: span.getAttribute('data-fl-icon-bg') || '#E8F0FC',
                    };
                }

                // 텍스트 컬럼 — 내부 <span> 행에서 텍스트 추출
                const lineSpans = span.querySelectorAll<HTMLElement>(':scope > span');
                const lines =
                    lineSpans.length > 0
                        ? Array.from(lineSpans).map((ls) => ls.textContent?.trim() ?? '')
                        : [span.textContent?.trim() ?? '텍스트'];

                const width = (span.getAttribute('data-fl-width') || 'flex') as 'fixed' | 'flex' | 'auto';

                return { type: 'text' as const, width, lines };
            });

            return {
                columns:
                    columns.length > 0
                        ? columns
                        : [{ type: 'text' as const, width: 'flex' as const, lines: ['텍스트'] }],
            };
        });

        if (rows.length > 0) return rows;
    }

    // 폴백: data-fl-rows JSON
    const raw = blockEl.getAttribute('data-fl-rows');
    if (raw) {
        try {
            return JSON.parse(raw) as FlexListRow[];
        } catch {
            // 파싱 실패
        }
    }

    return [{ columns: [{ type: 'text', width: 'flex', lines: ['텍스트'] }] }];
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
        width: 520,
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
    } as React.CSSProperties,
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

const WIDTH_LABELS: Record<string, string> = {
    fixed: '고정 (40px)',
    flex: '유연 (flex)',
    auto: '자동 (auto)',
};

// ── 컬럼 편집 서브컴포넌트 ──────────────────────────────────────────────

function ColumnEditor({
    col,
    colIdx,
    onUpdate,
    onDelete,
    canDelete,
}: {
    col: FlexListColumn;
    colIdx: number;
    onUpdate: (colIdx: number, col: FlexListColumn) => void;
    onDelete: (colIdx: number) => void;
    canDelete: boolean;
}) {
    const [showIconPicker, setShowIconPicker] = useState(false);

    return (
        <div
            style={{
                padding: '8px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
            }}
        >
            {/* 컬럼 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', minWidth: 24 }}>C{colIdx + 1}</span>

                {/* 타입 토글 */}
                <select
                    value={col.type}
                    onChange={(e) => {
                        const type = e.target.value as 'icon' | 'text';
                        if (type === 'icon') {
                            onUpdate(colIdx, { type, width: 'fixed', icon: 'check', iconBg: '#E8F0FC' });
                        } else {
                            onUpdate(colIdx, { type, width: 'flex', lines: ['텍스트'] });
                        }
                    }}
                    style={{
                        padding: '3px 6px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    <option value="icon">아이콘</option>
                    <option value="text">텍스트</option>
                </select>

                {/* 너비 선택 */}
                <select
                    value={col.width}
                    onChange={(e) => onUpdate(colIdx, { ...col, width: e.target.value as 'fixed' | 'flex' | 'auto' })}
                    style={{
                        padding: '3px 6px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    {Object.entries(WIDTH_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v}
                        </option>
                    ))}
                </select>

                {/* 삭제 */}
                <button
                    type="button"
                    title="컬럼 삭제"
                    disabled={!canDelete}
                    onClick={() => onDelete(colIdx)}
                    style={{ ...S.deleteBtn, marginLeft: 'auto', opacity: canDelete ? 1 : 0.35 }}
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

            {/* 아이콘 컬럼 상세 */}
            {col.type === 'icon' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        style={{
                            padding: '4px 8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 4,
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: 11,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <span
                            dangerouslySetInnerHTML={{
                                __html: ICON_PRESETS.find((p) => p.key === col.icon)?.svg ?? '',
                            }}
                        />
                        {ICON_PRESETS.find((p) => p.key === col.icon)?.label ?? '선택'}
                    </button>

                    <input
                        type="color"
                        value={col.iconBg ?? '#E8F0FC'}
                        onChange={(e) => onUpdate(colIdx, { ...col, iconBg: e.target.value })}
                        title="배경색"
                        style={{
                            width: 26,
                            height: 26,
                            border: '1px solid #e5e7eb',
                            borderRadius: 4,
                            padding: 1,
                            cursor: 'pointer',
                        }}
                    />

                    {showIconPicker && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, 1fr)',
                                gap: 4,
                                width: '100%',
                                padding: '6px 0',
                            }}
                        >
                            {ICON_PRESETS.map((preset) => (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => {
                                        onUpdate(colIdx, { ...col, icon: preset.key });
                                        setShowIconPicker(false);
                                    }}
                                    style={{
                                        padding: '6px 2px',
                                        border: col.icon === preset.key ? '2px solid #0046A4' : '1px solid #e5e7eb',
                                        borderRadius: 6,
                                        background: col.icon === preset.key ? '#E8F0FC' : '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontSize: 9,
                                        color: '#6B7280',
                                    }}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: preset.svg }} />
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 텍스트 컬럼 상세 */}
            {col.type === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(col.lines ?? ['텍스트']).map((line, lineIdx) => (
                        <div key={lineIdx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 10, color: '#9ca3af', minWidth: 14 }}>L{lineIdx + 1}</span>
                            <input
                                type="text"
                                value={line}
                                onChange={(e) => {
                                    const newLines = [...(col.lines ?? ['텍스트'])];
                                    newLines[lineIdx] = e.target.value;
                                    onUpdate(colIdx, { ...col, lines: newLines });
                                }}
                                style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontFamily: FONT_FAMILY,
                                    outline: 'none',
                                    minWidth: 0,
                                }}
                                placeholder="텍스트"
                            />
                            <button
                                type="button"
                                title="행 삭제"
                                disabled={(col.lines ?? []).length <= 1}
                                onClick={() => {
                                    const newLines = (col.lines ?? ['텍스트']).filter((_, i) => i !== lineIdx);
                                    onUpdate(colIdx, { ...col, lines: newLines });
                                }}
                                style={{
                                    ...S.deleteBtn,
                                    width: 20,
                                    height: 20,
                                    opacity: (col.lines ?? []).length <= 1 ? 0.35 : 1,
                                }}
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
                    <button
                        type="button"
                        onClick={() => onUpdate(colIdx, { ...col, lines: [...(col.lines ?? ['텍스트']), '새 텍스트'] })}
                        style={{
                            fontSize: 11,
                            color: '#0046A4',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            padding: '2px 0',
                        }}
                    >
                        + 텍스트 행 추가
                    </button>
                </div>
            )}
        </div>
    );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────

export default function FlexListEditor({ blockEl, onClose }: Props) {
    const [rows, setRows] = useState<FlexListRow[]>(() => parseRows(blockEl));

    const updateColumn = useCallback((rowIdx: number, colIdx: number, col: FlexListColumn) => {
        setRows((prev) =>
            prev.map((row, ri) =>
                ri === rowIdx ? { ...row, columns: row.columns.map((c, ci) => (ci === colIdx ? col : c)) } : row,
            ),
        );
    }, []);

    const deleteColumn = useCallback((rowIdx: number, colIdx: number) => {
        setRows((prev) =>
            prev.map((row, ri) =>
                ri === rowIdx ? { ...row, columns: row.columns.filter((_, ci) => ci !== colIdx) } : row,
            ),
        );
    }, []);

    const addColumn = useCallback((rowIdx: number) => {
        setRows((prev) =>
            prev.map((row, ri) =>
                ri === rowIdx
                    ? { ...row, columns: [...row.columns, { type: 'text', width: 'flex', lines: ['새 텍스트'] }] }
                    : row,
            ),
        );
    }, []);

    const handleAddRow = () => {
        setRows((prev) => [...prev, { columns: [{ type: 'text', width: 'flex', lines: ['새 항목'] }] }]);
    };

    const handleDeleteRow = (idx: number) => {
        if (rows.length <= 1) return;
        setRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const next = [...rows];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        setRows(next);
    };

    const handleMoveDown = (idx: number) => {
        if (idx === rows.length - 1) return;
        const next = [...rows];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        setRows(next);
    };

    const handleApply = () => {
        applyToBlock(blockEl, rows);
        onClose();
    };

    return (
        <>
            <div onClick={onClose} style={S.overlay} />

            <div onClick={(e) => e.stopPropagation()} style={S.panel}>
                {/* 헤더 */}
                <div style={S.header}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>가변 리스트 편집</span>
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
                <div
                    style={{
                        padding: '8px 14px',
                        background: '#f0f4ff',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: 11,
                        color: '#4b6baf',
                        flexShrink: 0,
                    }}
                >
                    행(Row)을 추가·삭제하고, 각 행 내 컬럼(Column)의 타입·너비·내용을 편집합니다.
                </div>

                {/* 본문 */}
                <div style={S.body}>
                    {rows.map((row, rowIdx) => (
                        <div
                            key={rowIdx}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                background: '#fafafa',
                                overflow: 'visible',
                            }}
                        >
                            {/* 행 헤더 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 10px',
                                    borderBottom: '1px solid #f3f4f6',
                                }}
                            >
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>행 {rowIdx + 1}</span>
                                <span style={{ fontSize: 10, color: '#9ca3af' }}>({row.columns.length}컬럼)</span>

                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                    <button
                                        type="button"
                                        title="위로"
                                        disabled={rowIdx === 0}
                                        onClick={() => handleMoveUp(rowIdx)}
                                        style={{ ...S.iconBtn, opacity: rowIdx === 0 ? 0.35 : 1 }}
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
                                        disabled={rowIdx === rows.length - 1}
                                        onClick={() => handleMoveDown(rowIdx)}
                                        style={{ ...S.iconBtn, opacity: rowIdx === rows.length - 1 ? 0.35 : 1 }}
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
                                        title="컬럼 추가"
                                        disabled={row.columns.length >= 4}
                                        onClick={() => addColumn(rowIdx)}
                                        style={{
                                            ...S.iconBtn,
                                            opacity: row.columns.length >= 4 ? 0.35 : 1,
                                            color: '#0046A4',
                                            border: '1px solid #c7d8f4',
                                        }}
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
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        title="행 삭제"
                                        disabled={rows.length <= 1}
                                        onClick={() => handleDeleteRow(rowIdx)}
                                        style={{ ...S.deleteBtn, opacity: rows.length <= 1 ? 0.35 : 1 }}
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

                            {/* 컬럼 목록 */}
                            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {row.columns.map((col, colIdx) => (
                                    <ColumnEditor
                                        key={colIdx}
                                        col={col}
                                        colIdx={colIdx}
                                        onUpdate={(ci, c) => updateColumn(rowIdx, ci, c)}
                                        onDelete={(ci) => deleteColumn(rowIdx, ci)}
                                        canDelete={row.columns.length > 1}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* 행 추가 */}
                    <button type="button" onClick={handleAddRow} style={S.addBtn}>
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
                        행 추가
                    </button>
                </div>

                {/* 푸터 */}
                <div style={S.footer}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>총 {rows.length}개 행</span>
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
