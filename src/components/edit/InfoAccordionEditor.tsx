// src/components/edit/InfoAccordionEditor.tsx
// info-accordion 블록의 항목(토글)을 추가·삭제·순서변경·내용편집하는 모달 에디터

'use client';

import { useState } from 'react';

interface AccordionItem {
    title: string;
    content: string;
}

interface Props {
    blockEl: HTMLElement;
    onClose: () => void;
}

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

const CHEVRON_SVG = `<svg class="ia-chevron" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" width="16" height="16"
     style="flex-shrink:0;transition:transform 0.25s ease;">
    <path d="m6 9 6 6 6-6"/>
</svg>`;

const ACCORDION_SCRIPT =
    `<script>` +
    `(function(){` +
    `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
    `if(!root||root.getAttribute('data-accordion-inited')==='1')return;` +
    `root.setAttribute('data-accordion-inited','1');` +
    `root.querySelectorAll('.ia-header').forEach(function(btn){` +
    `btn.addEventListener('click',function(){` +
    `var item=btn.closest('.ia-item');` +
    `var body=item.querySelector('.ia-body');` +
    `var chev=btn.querySelector('.ia-chevron');` +
    `var open=item.getAttribute('data-open')==='1';` +
    `if(open){item.setAttribute('data-open','0');body.style.maxHeight='0';chev.style.transform='rotate(0deg)';}` +
    `else{item.setAttribute('data-open','1');body.style.maxHeight='9999px';chev.style.transform='rotate(180deg)';}` +
    `});` +
    `});` +
    `var firstHeader=root.querySelector('.ia-header');` +
    `if(firstHeader){firstHeader.click();}` +
    `})();` +
    `</script>`;

/** 항목 배열 → 아코디언 항목 HTML 조각 생성 */
function buildItemsHtml(items: AccordionItem[]): string {
    return items
        .map(
            (item) =>
                `<div class="ia-item" data-open="0" style="border-bottom:1px solid #E5E7EB;">` +
                `<button type="button" class="ia-header" style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:none;border:none;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;">` +
                `<span style="font-size:15px;font-weight:600;color:#1A1A2E;line-height:1.3;">${item.title}</span>` +
                CHEVRON_SVG +
                `</button>` +
                `<div class="ia-body" style="max-height:0;overflow:hidden;transition:max-height 0.3s ease;">` +
                `<div style="padding:4px 20px 20px;font-size:13px;color:#374151;line-height:1.7;">` +
                item.content +
                `</div>` +
                `</div>` +
                `</div>`,
        )
        .join('');
}

/** blockEl DOM을 새 항목 데이터로 갱신 */
function applyToBlock(blockEl: HTMLElement, items: AccordionItem[]) {
    // data-accordion-items 속성 갱신 (에디터가 다시 열릴 때 최신 데이터 읽기용)
    blockEl.setAttribute('data-accordion-items', JSON.stringify(items));

    // 기존 아코디언 항목 + 스크립트 제거 후 재삽입
    blockEl.querySelectorAll('.ia-item, script').forEach((el) => el.remove());
    blockEl.insertAdjacentHTML('beforeend', buildItemsHtml(items) + ACCORDION_SCRIPT);

    // data-accordion-inited 초기화 — 스크립트 재실행 시 guard 통과하도록
    blockEl.removeAttribute('data-accordion-inited');
}

/** blockEl에서 현재 항목 데이터 파싱 */
function parseItems(blockEl: HTMLElement): AccordionItem[] {
    const raw = blockEl.getAttribute('data-accordion-items');
    if (raw) {
        try {
            return JSON.parse(raw) as AccordionItem[];
        } catch {
            // 파싱 실패 시 DOM에서 직접 읽기
        }
    }
    // data-accordion-items 없을 경우 DOM에서 추출 (하위 호환)
    return Array.from(blockEl.querySelectorAll('.ia-item')).map((item) => ({
        title: item.querySelector('span')?.textContent?.trim() ?? '',
        content: item.querySelector('.ia-body div')?.innerHTML ?? '',
    }));
}

// ── 스타일 상수 ───────────────────────────────────────────────────────────────

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
        borderRadius: 8,
        background: '#fafafa',
        overflow: 'hidden' as const,
    },
    itemHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 10px',
        background: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb',
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
    label: {
        fontSize: 11,
        fontWeight: 600,
        color: '#6b7280',
        display: 'block',
        marginBottom: 4,
    },
    input: {
        width: '100%',
        padding: '7px 10px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 13,
        color: '#111827',
        background: '#fff',
        boxSizing: 'border-box' as const,
        fontFamily: FONT_FAMILY,
        outline: 'none',
    },
    textarea: {
        width: '100%',
        padding: '7px 10px',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 12,
        color: '#374151',
        background: '#fff',
        boxSizing: 'border-box' as const,
        fontFamily: FONT_FAMILY,
        outline: 'none',
        resize: 'vertical' as const,
        minHeight: 72,
        lineHeight: 1.6,
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

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function InfoAccordionEditor({ blockEl, onClose }: Props) {
    const [items, setItems] = useState<AccordionItem[]>(() => parseItems(blockEl));
    const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

    const handleTitleChange = (idx: number, value: string) => {
        setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, title: value } : item)));
    };

    const handleContentChange = (idx: number, value: string) => {
        setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, content: value } : item)));
    };

    const handleAdd = () => {
        const newItems = [...items, { title: '새 항목', content: '· 내용을 입력해 주세요.' }];
        setItems(newItems);
        setExpandedIdx(newItems.length - 1);
    };

    const handleDelete = (idx: number) => {
        if (items.length <= 1) return;
        const newItems = items.filter((_, i) => i !== idx);
        setItems(newItems);
        setExpandedIdx((prev) => {
            if (prev === null) return null;
            if (prev === idx) return null;
            return prev > idx ? prev - 1 : prev;
        });
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const newItems = [...items];
        [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
        setItems(newItems);
        setExpandedIdx(idx - 1);
    };

    const handleMoveDown = (idx: number) => {
        if (idx === items.length - 1) return;
        const newItems = [...items];
        [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
        setItems(newItems);
        setExpandedIdx(idx + 1);
    };

    const handleApply = () => {
        applyToBlock(blockEl, items);
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
                    <span style={{ fontWeight: 700, color: '#111827' }}>이용안내 항목 편집</span>
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

                {/* 항목 목록 */}
                <div style={S.body}>
                    {items.map((item, idx) => (
                        <div key={idx} style={S.itemCard}>
                            {/* 항목 헤더 */}
                            <div style={S.itemHeader}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', minWidth: 18 }}>
                                    {idx + 1}
                                </span>

                                {/* 순서 변경 버튼 */}
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
                                    disabled={idx === items.length - 1}
                                    onClick={() => handleMoveDown(idx)}
                                    style={{ ...S.iconBtn, opacity: idx === items.length - 1 ? 0.35 : 1 }}
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

                                {/* 펼침/접힘 토글 */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                    style={{
                                        flex: 1,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#1A1A2E',
                                        padding: '0 4px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {item.title || '(제목 없음)'}
                                </button>

                                {/* 삭제 버튼 */}
                                <button
                                    type="button"
                                    title="항목 삭제"
                                    disabled={items.length <= 1}
                                    onClick={() => handleDelete(idx)}
                                    style={{ ...S.deleteBtn, opacity: items.length <= 1 ? 0.35 : 1 }}
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

                            {/* 항목 편집 폼 (펼침 상태) */}
                            {expandedIdx === idx && (
                                <div
                                    style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}
                                >
                                    <div>
                                        <label style={S.label}>제목</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => handleTitleChange(idx, e.target.value)}
                                            style={S.input}
                                            placeholder="항목 제목"
                                        />
                                    </div>
                                    <div>
                                        <label style={S.label}>본문 (HTML)</label>
                                        <textarea
                                            value={item.content}
                                            onChange={(e) => handleContentChange(idx, e.target.value)}
                                            style={S.textarea}
                                            placeholder="본문 HTML을 입력하세요. 예: <p>· 내용</p>"
                                        />
                                        <p
                                            style={{
                                                fontSize: 11,
                                                color: '#9ca3af',
                                                margin: '4px 0 0',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {'<p>· 텍스트</p>'} · {'<strong>강조</strong>'} · {'<table>'}표{'</table>'}{' '}
                                            사용 가능
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* 항목 추가 버튼 */}
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
                        항목 추가
                    </button>
                </div>

                {/* 푸터 */}
                <div style={S.footer}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>총 {items.length}개 항목</span>
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
