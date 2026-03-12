import { createColorSection } from '../_shared/color-picker.js';

// 기본 아이콘 SVG 모음
const PRODUCT_ICONS = {
    deposit:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><path d="M14 15h.01"/><path d="M18 15h.01"/></svg>`,
    loan:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H4v12h8"/><path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="M18 16v2l1 1"/></svg>`,
    fund:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    trust:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    forex:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M15 8s2 1 2 4-2 4-2 4"/><path d="M9 8s-2 1-2 4 2 4 2 4"/></svg>`,
    insurance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg>`,
    card:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    isa:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="6 9 9 12 13 8 17 11"/></svg>`,
    pension:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    transfer:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    stock:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    new:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
};

const ICON_LABELS = {
    deposit: '예금', loan: '대출', fund: '펀드', trust: '신탁',
    forex: '외환', insurance: '보험', card: '카드', isa: 'ISA',
    pension: '연금', transfer: '이체', stock: '증권', new: '기타',
};

const PICKER_ICON_KEYS = ['deposit','loan','fund','trust','forex','insurance','card','isa','pension','transfer','stock','new'];
const DEFAULT_ICON_KEYS = ['deposit','loan','fund','trust','forex','insurance','card','isa','pension'];

const GRIP_SVG = `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.3"/><circle cx="7" cy="2" r="1.3"/><circle cx="3" cy="7" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="3" cy="12" r="1.3"/><circle cx="7" cy="12" r="1.3"/></svg>`;

// 활성 피커 (전역 — 동시에 하나만 열림)
let _activePicker = null;
let _activeCloseHandler = null;

function closePicker() {
    if (_activePicker) { _activePicker.remove(); _activePicker = null; }
    if (_activeCloseHandler) { document.removeEventListener('click', _activeCloseHandler); _activeCloseHandler = null; }
}

export default {
    name: 'product-menu',
    displayName: '상품 메뉴',
    version: '2.2.0',

    settings: {},

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.cssText = 'margin-bottom:16px;';

            const S = {
                mainRow:  'display:flex;align-items:center;gap:6px;margin-bottom:10px;',
                lbl:      'font-size:11px;color:#6b7280;width:36px;flex-shrink:0;',
                input:    'flex:1;padding:5px 8px;border:1px solid #e5e7eb;border-radius:5px;font-size:13px;outline:none;color:#111827;min-width:0;',
                secTitle: 'font-size:12px;font-weight:700;color:#374151;margin:10px 0 8px;border-top:1px solid #f3f4f6;padding-top:10px;',
                itemCard: 'background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin-bottom:6px;cursor:default;transition:opacity 0.15s;',
                iconBtn:  'width:44px;height:44px;border-radius:8px;border:1.5px solid #d1d5db;cursor:pointer;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#fff;position:relative;',
                row:      'display:flex;align-items:center;gap:6px;',
                grip:     'width:18px;flex-shrink:0;color:#9ca3af;cursor:grab;display:flex;align-items:center;justify-content:center;',
                delBtn:   'width:28px;height:28px;flex-shrink:0;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;min-height:unset;',
                addBtn:   'width:100%;padding:8px;background:#f0f4ff;border:1.5px dashed #0046A4;border-radius:8px;color:#0046A4;font-size:13px;font-weight:600;cursor:pointer;margin-top:4px;',
            };

            // ── 아이콘 미리보기 업데이트 헬퍼 ──
            const refreshIconBtn = (iconBtn, pmItem) => {
                iconBtn.innerHTML = '';
                const iconWrap = pmItem.querySelector('.pm-icon-wrap');
                const img = iconWrap?.querySelector('img');
                if (img) {
                    const thumb = document.createElement('img');
                    thumb.src = img.src;
                    thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;';
                    iconBtn.appendChild(thumb);
                } else {
                    const svgClone = iconWrap?.querySelector('svg')?.cloneNode(true);
                    if (svgClone) {
                        svgClone.setAttribute('width', '22');
                        svgClone.setAttribute('height', '22');
                        svgClone.style.cssText = 'stroke:#374151;flex-shrink:0;';
                        iconBtn.appendChild(svgClone);
                    }
                }
                // 편집 힌트 오버레이
                const hint = document.createElement('div');
                hint.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,70,164,0.5);border-radius:6px;color:#fff;font-size:9px;font-weight:700;opacity:0;transition:opacity 0.12s;pointer-events:none;';
                hint.textContent = '변경';
                iconBtn.appendChild(hint);
                iconBtn._hint = hint;
            };

            // ── 아이콘 피커 팝업 생성 ──
            const openIconPicker = (pmItem, iconBtn) => {
                closePicker();

                const picker = document.createElement('div');
                picker.style.cssText = 'position:fixed;z-index:99999;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px;box-shadow:0 6px 24px rgba(0,0,0,0.14);width:208px;';

                // 섹션 제목
                const pickerTitle = document.createElement('div');
                pickerTitle.textContent = '아이콘 선택';
                pickerTitle.style.cssText = 'font-size:11px;font-weight:700;color:#6b7280;margin-bottom:8px;letter-spacing:0.3px;';
                picker.appendChild(pickerTitle);

                // SVG 아이콘 그리드 (3열)
                const iconGrid = document.createElement('div');
                iconGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px;';

                PICKER_ICON_KEYS.forEach(key => {
                    const svg = PRODUCT_ICONS[key];
                    const cell = document.createElement('button');
                    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border-radius:8px;border:1.5px solid transparent;background:#f9fafb;cursor:pointer;min-height:unset;transition:all 0.12s;';
                    cell.title = ICON_LABELS[key] || key;

                    const svgWrap = document.createElement('div');
                    svgWrap.innerHTML = svg;
                    const svgEl = svgWrap.querySelector('svg');
                    if (svgEl) { svgEl.setAttribute('width', '22'); svgEl.setAttribute('height', '22'); svgEl.style.stroke = '#374151'; }
                    cell.appendChild(svgWrap);

                    const lbl = document.createElement('span');
                    lbl.textContent = ICON_LABELS[key] || key;
                    lbl.style.cssText = 'font-size:9px;color:#6b7280;line-height:1;';
                    cell.appendChild(lbl);

                    cell.addEventListener('mouseenter', () => { cell.style.borderColor = '#0046A4'; cell.style.background = '#ebf4ff'; if (svgEl) svgEl.style.stroke = '#0046A4'; });
                    cell.addEventListener('mouseleave', () => { cell.style.borderColor = 'transparent'; cell.style.background = '#f9fafb'; if (svgEl) svgEl.style.stroke = '#374151'; });

                    cell.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const iconWrap = pmItem.querySelector('.pm-icon-wrap');
                        if (iconWrap) iconWrap.innerHTML = svg;
                        refreshIconBtn(iconBtn, pmItem);
                        closePicker();
                        onChange?.();
                    };
                    iconGrid.appendChild(cell);
                });
                picker.appendChild(iconGrid);

                // 구분선
                const divider = document.createElement('div');
                divider.style.cssText = 'border-top:1px solid #f3f4f6;margin-bottom:8px;';
                picker.appendChild(divider);

                // 이미지 업로드 버튼
                const uploadRow = document.createElement('div');
                uploadRow.style.cssText = 'display:flex;align-items:center;gap:6px;';

                const uploadLabel = document.createElement('div');
                uploadLabel.textContent = '이미지 업로드';
                uploadLabel.style.cssText = 'font-size:11px;font-weight:700;color:#6b7280;margin-bottom:6px;letter-spacing:0.3px;';
                picker.appendChild(uploadLabel);

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
                fileInput.addEventListener('change', async () => {
                    // DOM에서 정리
                    if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
                    const file = fileInput.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                        const res = await fetch('/api/builder/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        const url = data.url?.replace(/\\/g, '/');
                        if (url) {
                            const iconWrap = pmItem.querySelector('.pm-icon-wrap');
                            if (iconWrap) iconWrap.innerHTML = `<img src="${url}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" />`;
                            refreshIconBtn(iconBtn, pmItem);
                            onChange?.();
                        }
                    } catch(err) {
                        console.error('이미지 업로드 실패', err);
                    }
                });

                const uploadBtn = document.createElement('button');
                uploadBtn.style.cssText = 'width:100%;padding:7px;border:1.5px dashed #d1d5db;border-radius:8px;background:#fff;font-size:12px;color:#374151;cursor:pointer;display:flex;align-items:center;gap:6px;justify-content:center;min-height:unset;transition:border-color 0.12s;';
                uploadBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>직접 업로드`;
                uploadBtn.addEventListener('mouseenter', () => { uploadBtn.style.borderColor = '#0046A4'; uploadBtn.style.color = '#0046A4'; });
                uploadBtn.addEventListener('mouseleave', () => { uploadBtn.style.borderColor = '#d1d5db'; uploadBtn.style.color = '#374151'; });
                uploadBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // closePicker 이전에 body에 붙여야 파일 선택창이 열림
                    document.body.appendChild(fileInput);
                    closePicker();
                    fileInput.click();
                };
                picker.appendChild(uploadBtn);

                // 위치 계산 (fixed)
                document.body.appendChild(picker);
                const rect = iconBtn.getBoundingClientRect();
                let top  = rect.bottom + 6;
                let left = rect.left;
                // 오른쪽 화면 밖으로 나가지 않도록
                if (left + 208 > window.innerWidth - 8) left = window.innerWidth - 216;
                // 아래쪽 화면 밖으로 나가지 않도록
                if (top + 260 > window.innerHeight - 8) top = rect.top - 266;
                picker.style.top  = top  + 'px';
                picker.style.left = left + 'px';

                _activePicker = picker;
                _activeCloseHandler = (ev) => {
                    if (!picker.contains(ev.target) && ev.target !== iconBtn) closePicker();
                };
                setTimeout(() => document.addEventListener('click', _activeCloseHandler), 0);
            };

            // ── 제목 ──
            const titleEl = element.querySelector('.pm-title');
            const titleRow = document.createElement('div');
            titleRow.style.cssText = S.mainRow;
            const titleLbl = document.createElement('label');
            titleLbl.textContent = '제목';
            titleLbl.style.cssText = S.lbl;
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = titleEl?.textContent?.trim() || '상품';
            titleInput.style.cssText = S.input;
            titleInput.addEventListener('input', () => {
                if (titleEl) titleEl.textContent = titleInput.value;
                onChange?.();
            });
            titleRow.appendChild(titleLbl);
            titleRow.appendChild(titleInput);
            container.appendChild(titleRow);

            // ── 색상 설정 ──
            // 현재 인라인 스타일에서 색상 읽기 (없으면 기본값)
            const currentColors = {
                title:  titleEl?.style.color || '#0046A4',
                label:  element.querySelector('.pm-label')?.style.color || '#0046A4',
                icon:   element.querySelector('.pm-icon-wrap svg')?.style.stroke || '#374151',
                iconBg: element.querySelector('.pm-icon-wrap')?.style.background || '#F3F4F6',
            };

            // 색상을 DOM에 일괄 적용 (새 항목 추가 시에도 사용)
            const applyColorToScope = (scope) => {
                if (!scope) return;
                const t = scope.querySelector?.('.pm-title') || (scope === element ? titleEl : null);
                if (t) t.style.color = currentColors.title;
                scope.querySelectorAll?.('.pm-label').forEach(el => el.style.color = currentColors.label);
                scope.querySelectorAll?.('.pm-icon-wrap').forEach(el => el.style.background = currentColors.iconBg);
                scope.querySelectorAll?.('.pm-icon-wrap svg').forEach(svg => {
                    svg.style.stroke = currentColors.icon;
                    svg.style.color  = currentColors.icon;
                });
            };
            applyColorToScope(element); // 에디터 열릴 때 초기 적용

            container.appendChild(createColorSection([
                {
                    label: '제목색',
                    value: currentColors.title,
                    onChange: (v) => { currentColors.title = v; if (titleEl) titleEl.style.color = v; onChange?.(); },
                },
                {
                    label: '라벨색',
                    value: currentColors.label,
                    onChange: (v) => { currentColors.label = v; element.querySelectorAll('.pm-label').forEach(el => el.style.color = v); onChange?.(); },
                },
                {
                    label: '아이콘색',
                    value: currentColors.icon,
                    onChange: (v) => {
                        currentColors.icon = v;
                        element.querySelectorAll('.pm-icon-wrap svg').forEach(svg => { svg.style.stroke = v; svg.style.color = v; });
                        onChange?.();
                    },
                },
                {
                    label: '아이콘 배경',
                    value: currentColors.iconBg,
                    onChange: (v) => { currentColors.iconBg = v; element.querySelectorAll('.pm-icon-wrap').forEach(el => el.style.background = v); onChange?.(); },
                },
            ]));

            // ── 항목 목록 ──
            const secTitle = document.createElement('div');
            secTitle.textContent = '상품 항목';
            secTitle.style.cssText = S.secTitle;
            container.appendChild(secTitle);

            const itemsWrap = document.createElement('div');
            container.appendChild(itemsWrap);

            // ── 드래그 상태 ──
            let dragFromIdx = null;
            let insertIdx   = null;
            let sepEl       = null;
            let rafId       = null;

            const getCards = () => Array.from(itemsWrap.querySelectorAll('.pm-editor-card'));

            const reorderGrid = (from, to) => {
                const grid = element.querySelector('.pm-grid');
                if (!grid || from === to || from === to - 1) return;
                const items = Array.from(grid.querySelectorAll('.pm-item'));
                const next = items.filter((_, i) => i !== from);
                const insertAt = from < to ? to - 1 : to;
                next.splice(insertAt, 0, items[from]);
                next.forEach(item => grid.appendChild(item));
            };

            itemsWrap.addEventListener('dragstart', (e) => {
                const card = e.target.closest('.pm-editor-card');
                if (!card) return;
                dragFromIdx = getCards().indexOf(card);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => { card.style.opacity = '0.4'; card.style.border = '1.5px dashed #0046A4'; }, 0);
            });

            itemsWrap.addEventListener('dragend', () => {
                getCards().forEach(c => { c.style.opacity = ''; c.style.border = ''; });
                sepEl?.remove(); sepEl = null;
                dragFromIdx = null; insertIdx = null;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            });

            itemsWrap.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (dragFromIdx === null || rafId) return;
                const y = e.clientY;
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    const cards = getCards();
                    let pos = cards.length;
                    for (let i = 0; i < cards.length; i++) {
                        const r = cards[i].getBoundingClientRect();
                        if (y < r.top + r.height / 2) { pos = i; break; }
                    }
                    if (insertIdx === pos) return;
                    insertIdx = pos;
                    if (!sepEl) {
                        sepEl = document.createElement('div');
                        sepEl.style.cssText = 'height:2px;background:#0046A4;border-radius:2px;margin:2px 0;pointer-events:none;';
                    }
                    pos >= cards.length ? itemsWrap.appendChild(sepEl) : itemsWrap.insertBefore(sepEl, cards[pos]);
                });
            });

            itemsWrap.addEventListener('drop', (e) => {
                e.preventDefault();
                if (dragFromIdx === null || insertIdx === null) return;
                const from = dragFromIdx, to = insertIdx;
                dragFromIdx = null; insertIdx = null;
                sepEl?.remove(); sepEl = null;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                reorderGrid(from, to);
                renderAll();
                onChange?.();
            });

            // ── 항목 카드 생성 ──
            const buildItemCard = (pmItem) => {
                const card = document.createElement('div');
                card.className = 'pm-editor-card';
                card.style.cssText = S.itemCard;
                card.draggable = true;

                // 그립 핸들
                const grip = document.createElement('div');
                grip.style.cssText = S.grip;
                grip.innerHTML = GRIP_SVG;
                grip.title = '드래그하여 순서 변경';

                // 아이콘 버튼 (클릭 → 피커 팝업)
                const iconBtn = document.createElement('div');
                iconBtn.style.cssText = S.iconBtn;
                iconBtn.title = '아이콘 변경';
                refreshIconBtn(iconBtn, pmItem);

                iconBtn.addEventListener('mouseenter', () => { if (iconBtn._hint) iconBtn._hint.style.opacity = '1'; });
                iconBtn.addEventListener('mouseleave', () => { if (iconBtn._hint) iconBtn._hint.style.opacity = '0'; });
                iconBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openIconPicker(pmItem, iconBtn);
                });

                // 라벨 입력
                const labelEl = pmItem.querySelector('.pm-label');
                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = labelEl?.textContent?.trim() || '';
                labelInput.placeholder = '항목명';
                labelInput.style.cssText = S.input;
                labelInput.addEventListener('input', () => { if (labelEl) labelEl.textContent = labelInput.value; onChange?.(); });
                labelInput.addEventListener('mousedown', (e) => e.stopPropagation());

                // URL 입력
                const urlInput = document.createElement('input');
                urlInput.type = 'text';
                urlInput.value = pmItem.getAttribute('href') || '#';
                urlInput.placeholder = 'URL';
                urlInput.style.cssText = S.input + 'width:80px;flex:0 0 80px;font-size:11px;color:#6b7280;';
                urlInput.addEventListener('input', () => { pmItem.setAttribute('href', urlInput.value || '#'); onChange?.(); });
                urlInput.addEventListener('mousedown', (e) => e.stopPropagation());

                // 삭제 버튼
                const delBtn = document.createElement('button');
                delBtn.style.cssText = S.delBtn;
                delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
                delBtn.title = '항목 삭제';
                delBtn.onclick = (e) => { e.preventDefault(); pmItem.remove(); card.remove(); onChange?.(); };

                const row = document.createElement('div');
                row.style.cssText = S.row;
                row.appendChild(grip);
                row.appendChild(iconBtn);
                row.appendChild(labelInput);
                row.appendChild(urlInput);
                row.appendChild(delBtn);
                card.appendChild(row);
                return card;
            };

            // 항목 전체 렌더링
            const renderAll = () => {
                itemsWrap.innerHTML = '';
                element.querySelectorAll('.pm-item').forEach(item => itemsWrap.appendChild(buildItemCard(item)));
            };
            renderAll();

            // ── 항목 추가 버튼 ──
            const addBtn = document.createElement('button');
            addBtn.textContent = '+ 항목 추가';
            addBtn.style.cssText = S.addBtn;
            addBtn.onclick = (e) => {
                e.preventDefault();
                const grid = element.querySelector('.pm-grid');
                if (!grid) return;
                const count = grid.querySelectorAll('.pm-item').length;
                const iconKey = DEFAULT_ICON_KEYS[count % DEFAULT_ICON_KEYS.length];
                const svgHtml = PRODUCT_ICONS[iconKey] || PRODUCT_ICONS.new;
                const newItem = document.createElement('a');
                newItem.href = '#';
                newItem.className = 'pm-item';
                newItem.innerHTML = `<div class="pm-icon-wrap">${svgHtml}</div><span class="pm-label edit">새 항목</span>`;
                grid.appendChild(newItem);
                // 현재 색상을 새 항목에도 적용
                applyColorToScope(newItem);
                itemsWrap.appendChild(buildItemCard(newItem));
                onChange?.();
            };
            container.appendChild(addBtn);

            return container;
        }
    },

    mount: function(element, options) {
        element.querySelectorAll('a.pm-item').forEach(a => {
            a.addEventListener('click', e => { if (a.getAttribute('href') === '#') e.preventDefault(); });
        });
        return {};
    },

    unmount: function(element, instance) {
        closePicker();
    }
};
