'use client';

import React, { useState, useRef } from 'react';
import { FINANCE_COMPONENTS, FinanceComponent } from './finance-component-data';
import type { ParsedBlock, BasicBlock } from './EditClient';

interface Props {
    /** 컴포넌트를 캔버스에 삽입 */
    onInsert: (html: string) => void;
    /** 현재 캔버스 블록 목록 */
    blocks: ParsedBlock[];
    /** 블록 이동 (from 인덱스 → to 인덱스) */
    onMoveBlock: (from: number, to: number) => void;
    /** 블록 삭제 (인덱스) */
    onDelete: (idx: number) => void;
    /** 순서 탭에서 블록 클릭 시 캔버스에서 해당 블록 활성화 */
    onActivate: (idx: number) => void;
    /** content-plugins.js에서 읽어온 기본 블록 목록 */
    basicBlocks: BasicBlock[];
    /** 현재 페이지의 뷰 모드 — 해당 모드의 컴포넌트만 표시 */
    viewMode: 'mobile' | 'web' | 'responsive';
    /** 패널에서 외부 드래그 시작/종료 알림 */
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

type Tab = 'finance' | 'basic' | 'order';

const BASIC_THUMB_BASE = '/assets/minimalist-blocks/';

// 카테고리 번호 → 한글 이름 매핑
const CATEGORY_LABELS: Record<string, string> = {
    '120': '텍스트', '119': '버튼', '102': '사진', '103': '프로필',
    '101': '헤드라인', '118': '기사', '104': '상품', '106': '프로세스',
    '107': '가격표', '108': '스킬', '109': '성과', '110': '인용',
    '111': '파트너', '113': '404', '114': '준비중', '115': 'FAQ',
    '116': '문의', '117': '소개',
};

export default function ComponentPanel({
    onInsert,
    blocks,
    onMoveBlock,
    onDelete,
    onActivate,
    basicBlocks,
    viewMode,
    onDragStart,
    onDragEnd,
}: Props) {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('finance');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [hoveredOrderIdx, setHoveredOrderIdx] = useState<number | null>(null);

    // ── 탭: 금융 컴포넌트 ─ 캔버스 드래그 핸들러 ─────────────────────────
    function handleCompDragStart(e: React.DragEvent, comp: FinanceComponent) {
        e.dataTransfer.setData('text/plain', comp.html);
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart?.();
    }

    // ── 탭: 기본 블록 ─ 드래그 핸들러 ────────────────────────────────────
    function handleBasicDragStart(e: React.DragEvent, block: BasicBlock) {
        e.dataTransfer.setData('text/plain', block.html);
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart?.();
    }

    // ── 탭: 블록 순서 ─ 드래그 핸들러 ────────────────────────────────────
    // • dragBlockIdx: 드래그 중인 아이템 인덱스 (ref — DnD 도중 re-render 없이 접근)
    // • draggingIdx : 드래그 중인 아이템 인덱스 (state — 시각 표시용, dragStart 직후 설정)
    // • insertBeforeIdx : 삽입 예정 위치 (state — 구분선 표시용)
    // • insertIdxRef : insertBeforeIdx의 ref 사본 (rAF 콜백 내에서 최신값 비교용)
    // • rafRef : requestAnimationFrame ID (throttle)
    const dragBlockIdx = useRef<number | null>(null);
    const insertIdxRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
    const [insertBeforeIdx, setInsertBeforeIdx] = useState<number | null>(null);

    function handleBlockDragStart(e: React.DragEvent, idx: number) {
        dragBlockIdx.current = idx;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/x-block-idx', String(idx));
        // 드래그 ghost 캡처 이후 re-render — setTimeout 0으로 지연
        setTimeout(() => setDraggingIdx(idx), 0);
    }

    function handleBlockDragEnd() {
        dragBlockIdx.current = null;
        insertIdxRef.current = null;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        setDraggingIdx(null);
        setInsertBeforeIdx(null);
    }

    // 컨테이너 레벨 dragOver — 마우스 Y로 삽입 위치 계산, rAF throttle
    function handleOrderDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (rafRef.current) return;
        const y = e.clientY;
        const items = Array.from(
            (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[data-order-item]')
        );
        const rects = items.map(el => el.getBoundingClientRect());
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            let pos = items.length; // 기본: 맨 끝
            for (let i = 0; i < rects.length; i++) {
                if (y < rects[i].top + rects[i].height / 2) { pos = i; break; }
            }
            if (insertIdxRef.current !== pos) {
                insertIdxRef.current = pos;
                setInsertBeforeIdx(pos);
            }
        });
    }

    function handleOrderDrop(e: React.DragEvent) {
        e.preventDefault();
        const raw = e.dataTransfer.getData('text/x-block-idx');
        const from = raw !== '' ? parseInt(raw, 10) : dragBlockIdx.current;
        const to = insertIdxRef.current;
        dragBlockIdx.current = null;
        insertIdxRef.current = null;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        setDraggingIdx(null);
        setInsertBeforeIdx(null);
        if (from === null || to === null || isNaN(from as number)) return;
        onMoveBlock(from as number, to);
    }

    // ── 공용 스타일 ────────────────────────────────────────────────────
    const PANEL_W = 264;
    const COLLAPSED_W = 40;

    return (
        <aside
            style={{
                position: 'fixed',
                top: '52px',
                right: 0,
                bottom: 0,
                width: collapsed ? `${COLLAPSED_W}px` : `${PANEL_W}px`,
                background: '#f9fafb',
                borderLeft: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 90,
                transition: 'width 0.2s ease',
                overflow: 'hidden',
            }}
        >
            {/* ── 패널 헤더 ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 10px',
                borderBottom: '1px solid #e5e7eb',
                background: '#ffffff',
                flexShrink: 0,
                gap: '6px',
            }}>
                {!collapsed && (
                    /* ── 탭 버튼 (3개) ── */
                    <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                        {([
                            { key: 'finance', label: '금융' },
                            { key: 'basic',   label: '기본 블록' },
                            { key: 'order',   label: `순서${blocks.length > 0 ? ` (${blocks.length})` : ''}` },
                        ] as { key: Tab; label: string }[]).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    flex: 1,
                                    padding: '4px 2px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: activeTab === tab.key ? '#0046A4' : 'transparent',
                                    color: activeTab === tab.key ? '#ffffff' : '#6b7280',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* 접기/펴기 버튼 */}
                <button
                    onClick={() => setCollapsed(v => !v)}
                    title={collapsed ? '패널 펼치기' : '패널 접기'}
                    style={{
                        flexShrink: 0,
                        width: '28px',
                        height: '28px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                    }}
                >
                    <svg
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        width={14} height={14}
                        style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            {!collapsed && (
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* ══ 탭 1: 금융 컴포넌트 ══ */}
                    {activeTab === 'finance' && (
                        <div style={{
                            flex: 1, minHeight: 0, overflowY: 'auto',
                            padding: '10px',
                            display: 'flex', flexDirection: 'column', gap: '6px',
                        }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                                드래그하거나 + 클릭하여 캔버스에 추가
                            </p>

                            {FINANCE_COMPONENTS.filter(c => c.viewMode === viewMode).map(comp => (
                                <div
                                    key={comp.id}
                                    draggable
                                    onDragStart={e => handleCompDragStart(e, comp)}
                                    onDragEnd={() => onDragEnd?.()}
                                    onMouseEnter={() => setHoveredId(comp.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    title={comp.description}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 10px',
                                        background: hoveredId === comp.id ? '#eff6ff' : '#ffffff',
                                        border: `1px solid ${hoveredId === comp.id ? '#0046A4' : '#e5e7eb'}`,
                                        borderRadius: '8px',
                                        cursor: 'grab',
                                        userSelect: 'none',
                                        boxShadow: hoveredId === comp.id
                                            ? '0 2px 8px rgba(0,70,164,0.10)'
                                            : '0 1px 2px rgba(0,0,0,0.04)',
                                        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                                    }}
                                >
                                    {/* 미리보기 썸네일 */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={comp.preview}
                                        alt={comp.label}
                                        draggable={false}
                                        style={{
                                            width: '52px', height: '40px',
                                            objectFit: 'cover',
                                            borderRadius: '5px',
                                            border: '1px solid #e5e7eb',
                                            background: '#f3f4f6',
                                            flexShrink: 0,
                                        }}
                                    />

                                    {/* 텍스트 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '12px', fontWeight: 700,
                                            color: hoveredId === comp.id ? '#0046A4' : '#111827',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            transition: 'color 0.12s',
                                        }}>
                                            {comp.label}
                                        </div>
                                        <div style={{
                                            fontSize: '10px', color: '#6b7280', marginTop: '2px',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {comp.description}
                                        </div>
                                    </div>

                                    {/* 추가 버튼 */}
                                    <button
                                        onClick={e => { e.stopPropagation(); onInsert(comp.html); }}
                                        title="캔버스 끝에 추가"
                                        style={{
                                            flexShrink: 0, width: '26px', height: '26px',
                                            border: `1px solid ${hoveredId === comp.id ? '#0046A4' : '#d1d5db'}`,
                                            borderRadius: '50%',
                                            background: hoveredId === comp.id ? '#0046A4' : '#f9fafb',
                                            color: hoveredId === comp.id ? '#ffffff' : '#6b7280',
                                            cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.12s', padding: 0,
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
                                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ══ 탭 2: 기본 블록 ══ */}
                    {activeTab === 'basic' && (
                        <div style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                                드래그하거나 + 클릭하여 캔버스에 추가
                            </p>

                            {basicBlocks.length === 0 ? (
                                <div style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#9ca3af', fontSize: '12px', padding: '20px', textAlign: 'center',
                                }}>
                                    로딩 중...
                                </div>
                            ) : (
                                /* 2열 그리드로 썸네일 표시 */
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '6px',
                                }}>
                                    {basicBlocks.filter(b => b.viewMode === viewMode).map((block, idx) => (
                                        <BasicBlockCard
                                            key={idx}
                                            block={block}
                                            onDragStart={handleBasicDragStart}
                                            onDragEnd={() => onDragEnd?.()}
                                            onInsert={onInsert}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ 탭 3: 블록 순서 변경 ══ */}
                    {activeTab === 'order' && (
                        <div
                            onDragOver={handleOrderDragOver}
                            onDrop={handleOrderDrop}
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                padding: '10px',
                                display: 'flex', flexDirection: 'column', gap: '6px',
                            }}
                        >
                            {blocks.length === 0 ? (
                                <div style={{
                                    flex: 1, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#9ca3af', fontSize: '12px', textAlign: 'center', gap: '8px',
                                    padding: '20px',
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={32} height={32} style={{ opacity: 0.4 }}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="3" y1="15" x2="21" y2="15" />
                                    </svg>
                                    캔버스에 컴포넌트를 추가하면<br />여기서 순서를 조정할 수 있습니다
                                </div>
                            ) : (
                                <>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                                        드래그하여 순서 변경
                                    </p>
                                    {blocks.map((block, idx) => {
                                        const isDragging = draggingIdx === idx;
                                        // 삽입 구분선: 해당 인덱스 앞에 표시 (no-op 위치 제외)
                                        const showLine = draggingIdx !== null
                                            && insertBeforeIdx === idx
                                            && draggingIdx !== idx
                                            && draggingIdx !== idx - 1;
                                        return (
                                            <React.Fragment key={block.id}>
                                                {/* 삽입 위치 구분선 */}
                                                {showLine && (
                                                    <div style={{
                                                        height: '3px',
                                                        background: '#0046A4',
                                                        borderRadius: '2px',
                                                        flexShrink: 0,
                                                        margin: '-2px 2px',
                                                    }} />
                                                )}
                                                <div
                                                    data-order-item
                                                    draggable
                                                    onDragStart={e => handleBlockDragStart(e, idx)}
                                                    onDragEnd={handleBlockDragEnd}
                                                    onMouseEnter={() => setHoveredOrderIdx(idx)}
                                                    onMouseLeave={() => setHoveredOrderIdx(null)}
                                                    onClick={() => onActivate(idx)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 10px',
                                                        background: isDragging ? '#f0f4ff' : '#ffffff',
                                                        border: isDragging
                                                            ? '1.5px dashed #93c5fd'
                                                            : `1px solid #e5e7eb`,
                                                        borderRadius: '8px',
                                                        cursor: 'grab',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                        userSelect: 'none',
                                                        opacity: isDragging ? 0.45 : 1,
                                                        transition: 'opacity 0.1s',
                                                    }}
                                                >
                                                    <div style={{ flexShrink: 0, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                                        <DragDots />
                                                    </div>

                                                    {block.preview ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={block.preview}
                                                            alt={block.label}
                                                            draggable={false}
                                                            style={{ width: '36px', height: '28px', objectFit: 'contain', flexShrink: 0, borderRadius: '3px', background: '#f3f4f6' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '36px', height: '28px', flexShrink: 0, borderRadius: '3px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5} width={14} height={14}>
                                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {block.label}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                                                            {idx + 1} / {blocks.length}
                                                        </div>
                                                    </div>

                                                    {/* 삭제 버튼 (호버 시 표시) */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); onDelete(idx); }}
                                                        title="블록 삭제"
                                                        style={{
                                                            flexShrink: 0,
                                                            width: '22px',
                                                            height: '22px',
                                                            border: '1px solid #fca5a5',
                                                            borderRadius: '6px',
                                                            background: hoveredOrderIdx === idx ? '#fee2e2' : '#ffffff',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: 0,
                                                            opacity: hoveredOrderIdx === idx ? 1 : 0,
                                                            transition: 'opacity 0.15s, background 0.15s',
                                                        }}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    {/* 맨 끝 삽입 구분선 */}
                                    {draggingIdx !== null
                                        && insertBeforeIdx === blocks.length
                                        && draggingIdx !== blocks.length - 1 && (
                                        <div style={{
                                            height: '3px',
                                            background: '#0046A4',
                                            borderRadius: '2px',
                                            flexShrink: 0,
                                            margin: '-2px 2px',
                                        }} />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

/** 기본 블록 카드 (2열 그리드용) */
function BasicBlockCard({
    block,
    onDragStart,
    onDragEnd,
    onInsert,
}: {
    block: BasicBlock;
    onDragStart: (e: React.DragEvent, block: BasicBlock) => void;
    onDragEnd: () => void;
    onInsert: (html: string) => void;
}) {
    const [hovered, setHovered] = useState(false);
    const thumbSrc = BASIC_THUMB_BASE + block.thumbnail;

    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, block)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title="드래그하거나 클릭하여 추가"
            style={{
                background: '#ffffff',
                border: `1px solid ${hovered ? '#0046A4' : '#e5e7eb'}`,
                borderRadius: '6px',
                cursor: 'grab',
                overflow: 'hidden',
                boxShadow: hovered ? '0 2px 6px rgba(0,70,164,0.12)' : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                userSelect: 'none',
                position: 'relative',
            }}
        >
            {/* 썸네일 */}
            <div style={{ height: '64px', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={thumbSrc}
                    alt=""
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,70,164,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} />
                )}
            </div>

            {/* 카테고리 이름 */}
            <div style={{
                padding: '3px 6px',
                fontSize: '10px',
                color: '#6b7280',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
            }}>
                {CATEGORY_LABELS[block.category] ?? block.category}
            </div>

            {/* 추가 버튼 */}
            <button
                onClick={e => { e.stopPropagation(); onInsert(block.html); }}
                title="클릭하여 캔버스 끝에 추가"
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    border: '1px solid #0046A4',
                    borderRadius: '50%',
                    background: hovered ? '#0046A4' : '#ffffff',
                    color: hovered ? '#ffffff' : '#0046A4',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s, background 0.15s',
                }}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
        </div>
    );
}

/** 드래그 핸들 점 아이콘 */
function DragDots() {
    return (
        <svg viewBox="0 0 10 18" width={10} height={18} fill="currentColor">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="7" cy="3" r="1.5" />
            <circle cx="3" cy="9" r="1.5" />
            <circle cx="7" cy="9" r="1.5" />
            <circle cx="3" cy="15" r="1.5" />
            <circle cx="7" cy="15" r="1.5" />
        </svg>
    );
}
