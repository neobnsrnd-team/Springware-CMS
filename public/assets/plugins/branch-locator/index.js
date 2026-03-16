import { createColorSection } from '../_shared/color-picker.js';

/*
Usage:
<div data-cb-type="branch-locator">
    <div class="bl-map-area">
        <div class="bl-map-placeholder">
            <div class="bl-map-icon">📍</div>
            <p class="bl-map-text">지도를 불러오는 중...</p>
        </div>
        <div class="bl-search-bar">
            <input type="text" class="bl-search-input" placeholder="지역 또는 지점명 검색"/>
            <button class="bl-search-btn" aria-label="검색">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
        </div>
        <div class="bl-filter-bar">
            <button class="bl-filter-btn active" data-type="all">전체</button>
            <button class="bl-filter-btn" data-type="branch">영업점</button>
            <button class="bl-filter-btn" data-type="atm">ATM</button>
        </div>
    </div>
    <div class="bl-sheet">
        <div class="bl-sheet-handle"></div>
        <div class="bl-sheet-title">주변 영업점 · ATM</div>
        <div class="bl-sheet-list">
            <div class="bl-branch-item" data-type="branch">
                <div class="bl-branch-icon branch">영</div>
                <div class="bl-branch-info">
                    <span class="bl-branch-name">IBK 강남지점</span>
                    <span class="bl-branch-addr">서울 강남구 테헤란로 123</span>
                    <span class="bl-branch-hours">평일 09:00~16:00</span>
                </div>
                <a href="tel:1566-2566" class="bl-call-btn" aria-label="전화하기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg>
                </a>
            </div>
            <div class="bl-branch-item" data-type="atm">
                <div class="bl-branch-icon atm">ATM</div>
                <div class="bl-branch-info">
                    <span class="bl-branch-name">IBK ATM (강남역 2번출구)</span>
                    <span class="bl-branch-addr">서울 강남구 강남대로 396</span>
                    <span class="bl-branch-hours">24시간 운영</span>
                </div>
                <a href="tel:1566-2566" class="bl-call-btn" aria-label="전화하기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg>
                </a>
            </div>
        </div>
    </div>
</div>
*/

export default {
    name: 'branch-locator',
    displayName: '영업점/ATM 위치 안내',
    version: '1.0.0',

    settings: {
        mapHeight: {
            type: 'number',
            label: '지도 높이 (px)',
            default: 240,
            min: 180,
            max: 400,
            step: 20
        },
        apiEndpoint: {
            type: 'text',
            label: '영업점 API 엔드포인트',
            default: '/api/branches'
        },
        kakaoApiKey: {
            type: 'text',
            label: 'Kakao Maps API Key (선택)',
            default: ''
        },
        defaultLat: {
            type: 'text',
            label: '기본 위도',
            default: '37.5665'
        },
        defaultLng: {
            type: 'text',
            label: '기본 경도',
            default: '126.9780'
        },
        accentColor: {
            type: 'color',
            label: '강조 색상',
            default: '#0046A4'
        }
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            // ── 강조 색상 ──
            const accentColor = element.dataset.blAccent || element.style.getPropertyValue('--bl-accent').trim() || '#0046A4';
            container.appendChild(createColorSection([
                {
                    label: '강조 색상',
                    value: accentColor,
                    onChange: (v) => { element.dataset.blAccent = v; element.style.setProperty('--bl-accent', v); onChange?.(); },
                },
            ]));

            const infoDiv = document.createElement('div');
            infoDiv.style.cssText = 'background:#E8F0FC;border-radius:8px;padding:12px;font-size:13px;color:#0046A4;line-height:1.5;margin-bottom:12px;';
            infoDiv.innerHTML = '<strong>지도 연동 방법</strong><br>Kakao Maps API Key를 설정 패널에 입력하면 실제 지도가 표시됩니다.<br>영업점 데이터는 <code style="background:#fff;padding:2px 5px;border-radius:3px;">/api/branches</code>에서 불러옵니다.';
            container.appendChild(infoDiv);

            const list = element.querySelector('.bl-sheet-list');
            const items = list ? list.querySelectorAll('.bl-branch-item') : [];

            const createItemEditor = (item, index) => {
                const section = document.createElement('div');
                section.style.cssText = 'border:1px solid #ddd;border-radius:6px;margin-bottom:8px;background:#fff;overflow:hidden;';
                section.dataset.itemId = item.dataset.itemId || `bl-${Date.now()}-${index}`;
                item.dataset.itemId = section.dataset.itemId;

                const header = document.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;padding:8px 12px;background:#f9f9f9;cursor:pointer;';
                const titleSpan = document.createElement('span');
                titleSpan.textContent = item.querySelector('.bl-branch-name')?.textContent || `지점 ${index + 1}`;
                titleSpan.style.cssText = 'flex:1;font-weight:500;font-size:13px;';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<svg><use xlink:href="#icon-trash2"></use></svg>';
                deleteBtn.style.cssText = 'width:40px;background:transparent;color:#dc2626;';
                deleteBtn.onclick = (e) => { e.preventDefault(); item.remove(); section.remove(); onChange?.(); };

                header.appendChild(titleSpan);
                header.appendChild(deleteBtn);

                const body = document.createElement('div');
                body.style.cssText = 'padding:12px;display:none;';

                const makeField = (labelText, inputEl) => {
                    const wrap = document.createElement('div');
                    wrap.style.marginBottom = '8px';
                    const lbl = document.createElement('label');
                    lbl.textContent = labelText;
                    lbl.style.cssText = 'display:block;font-size:11px;color:#555;margin-bottom:3px;';
                    inputEl.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;';
                    wrap.appendChild(lbl);
                    wrap.appendChild(inputEl);
                    return wrap;
                };

                // Type
                const typeWrap = document.createElement('div');
                typeWrap.style.marginBottom = '8px';
                const typeLbl = document.createElement('label');
                typeLbl.textContent = '유형';
                typeLbl.style.cssText = 'display:block;font-size:11px;color:#555;margin-bottom:3px;';
                const typeSelect = document.createElement('select');
                typeSelect.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;';
                [['branch','영업점'],['atm','ATM']].forEach(([v,t]) => {
                    const o = document.createElement('option');
                    o.value = v; o.textContent = t;
                    o.selected = item.dataset.type === v;
                    typeSelect.appendChild(o);
                });
                typeSelect.addEventListener('change', () => {
                    item.dataset.type = typeSelect.value;
                    const iconEl = item.querySelector('.bl-branch-icon');
                    if (iconEl) {
                        iconEl.className = `bl-branch-icon ${typeSelect.value}`;
                        iconEl.textContent = typeSelect.value === 'atm' ? 'ATM' : '영';
                    }
                    onChange?.();
                });
                typeWrap.appendChild(typeLbl);
                typeWrap.appendChild(typeSelect);
                body.appendChild(typeWrap);

                // Name
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = item.querySelector('.bl-branch-name')?.textContent || '';
                nameInput.addEventListener('input', () => {
                    const el = item.querySelector('.bl-branch-name');
                    if (el) el.textContent = nameInput.value;
                    titleSpan.textContent = nameInput.value || `지점 ${index + 1}`;
                    onChange?.();
                });
                body.appendChild(makeField('지점명', nameInput));

                // Address
                const addrInput = document.createElement('input');
                addrInput.type = 'text';
                addrInput.value = item.querySelector('.bl-branch-addr')?.textContent || '';
                addrInput.addEventListener('input', () => {
                    const el = item.querySelector('.bl-branch-addr');
                    if (el) el.textContent = addrInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('주소', addrInput));

                // Hours
                const hoursInput = document.createElement('input');
                hoursInput.type = 'text';
                hoursInput.value = item.querySelector('.bl-branch-hours')?.textContent || '';
                hoursInput.addEventListener('input', () => {
                    const el = item.querySelector('.bl-branch-hours');
                    if (el) el.textContent = hoursInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('영업시간', hoursInput));

                // Phone
                const phoneInput = document.createElement('input');
                phoneInput.type = 'text';
                phoneInput.value = item.querySelector('.bl-call-btn')?.getAttribute('href')?.replace('tel:', '') || '';
                phoneInput.addEventListener('input', () => {
                    const el = item.querySelector('.bl-call-btn');
                    if (el) el.setAttribute('href', `tel:${phoneInput.value}`);
                    onChange?.();
                });
                body.appendChild(makeField('전화번호', phoneInput));

                header.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    body.style.display = body.style.display === 'block' ? 'none' : 'block';
                });

                section.appendChild(header);
                section.appendChild(body);
                return section;
            };

            const itemsContainer = document.createElement('div');
            items.forEach((item, i) => itemsContainer.appendChild(createItemEditor(item, i)));
            container.appendChild(itemsContainer);

            const addBtn = document.createElement('button');
            addBtn.textContent = '+ 지점 추가';
            addBtn.style.width = '100%';
            addBtn.onclick = (e) => {
                e.preventDefault();
                const newItem = document.createElement('div');
                newItem.className = 'bl-branch-item';
                newItem.dataset.type = 'branch';
                newItem.dataset.itemId = `bl-${Date.now()}`;
                newItem.innerHTML = `
                    <div class="bl-branch-icon branch">영</div>
                    <div class="bl-branch-info">
                        <span class="bl-branch-name">새 지점명</span>
                        <span class="bl-branch-addr">주소를 입력하세요</span>
                        <span class="bl-branch-hours">평일 09:00~16:00</span>
                    </div>
                    <a href="tel:1566-2566" class="bl-call-btn" aria-label="전화하기">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                `;
                if (list) list.appendChild(newItem);
                itemsContainer.appendChild(createItemEditor(newItem, itemsContainer.children.length));
                onChange?.();
            };
            container.appendChild(addBtn);

            return container;
        }
    },

    mount: function(element, options) {
        const accent = element.dataset.blAccent || element.style.getPropertyValue('--bl-accent').trim() || options.accentColor || '#0046A4';
        element.style.setProperty('--bl-accent', accent);

        // Map height
        const mapArea = element.querySelector('.bl-map-area');
        if (mapArea) mapArea.style.height = `${parseInt(options.mapHeight) || 240}px`;

        // Filter buttons
        const filterBtns = element.querySelectorAll('.bl-filter-btn');
        const branchItems = element.querySelectorAll('.bl-branch-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.type;
                branchItems.forEach(item => {
                    item.style.display = (type === 'all' || item.dataset.type === type) ? 'flex' : 'none';
                });
            });
        });

        // Bottom sheet drag behavior
        const sheet = element.querySelector('.bl-sheet');
        const handle = element.querySelector('.bl-sheet-handle');
        if (sheet && handle) {
            let startY = 0;
            let startHeight = 0;
            let isDragging = false;

            const onStart = (e) => {
                isDragging = true;
                startY = e.touches?.[0]?.clientY ?? e.clientY;
                startHeight = sheet.offsetHeight;
                sheet.style.transition = 'none';
            };
            const onMove = (e) => {
                if (!isDragging) return;
                const y = e.touches?.[0]?.clientY ?? e.clientY;
                const delta = startY - y;
                const maxH = element.offsetHeight * 0.8;
                const minH = 80;
                const newH = Math.max(minH, Math.min(maxH, startHeight + delta));
                sheet.style.height = `${newH}px`;
            };
            const onEnd = () => {
                isDragging = false;
                sheet.style.transition = 'height 0.3s ease';
                const h = sheet.offsetHeight;
                const snap = h < 160 ? 80 : h > element.offsetHeight * 0.5 ? element.offsetHeight * 0.7 : 200;
                sheet.style.height = `${snap}px`;
            };

            handle.addEventListener('touchstart', onStart, { passive: true });
            handle.addEventListener('mousedown', onStart);
            document.addEventListener('touchmove', onMove, { passive: true });
            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchend', onEnd);
            document.addEventListener('mouseup', onEnd);
        }

        // Try to load branch data from API
        const apiEndpoint = options.apiEndpoint || '/api/branches';
        fetch(apiEndpoint)
            .then(r => r.json())
            .then(data => {
                if (!Array.isArray(data) || !data.length) return;
                const list = element.querySelector('.bl-sheet-list');
                if (!list) return;
                list.innerHTML = '';
                data.forEach(branch => {
                    const item = document.createElement('div');
                    item.className = 'bl-branch-item';
                    item.dataset.type = branch.type || 'branch';
                    item.innerHTML = `
                        <div class="bl-branch-icon ${branch.type || 'branch'}">${branch.type === 'atm' ? 'ATM' : '영'}</div>
                        <div class="bl-branch-info">
                            <span class="bl-branch-name">${branch.name || ''}</span>
                            <span class="bl-branch-addr">${branch.address || ''}</span>
                            <span class="bl-branch-hours">${branch.hours || ''}</span>
                        </div>
                        <a href="tel:${branch.phone || '1566-2566'}" class="bl-call-btn" aria-label="전화하기">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg>
                        </a>
                    `;
                    list.appendChild(item);
                });
            })
            .catch(() => {}); // keep placeholder data

        // Kakao Maps integration (if API key provided)
        if (options.kakaoApiKey) {
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${options.kakaoApiKey}&autoload=false`;
            script.onload = () => {
                if (!window.kakao?.maps) return;
                window.kakao.maps.load(() => {
                    const mapContainer = element.querySelector('.bl-map-placeholder');
                    if (!mapContainer) return;
                    mapContainer.innerHTML = '';
                    const mapDiv = document.createElement('div');
                    mapDiv.style.cssText = 'width:100%;height:100%;';
                    mapContainer.appendChild(mapDiv);
                    new window.kakao.maps.Map(mapDiv, {
                        center: new window.kakao.maps.LatLng(
                            parseFloat(options.defaultLat) || 37.5665,
                            parseFloat(options.defaultLng) || 126.9780
                        ),
                        level: 4
                    });
                });
            };
            document.head.appendChild(script);
        }

        return {};
    },

    unmount: function(element, instance) {
    }
};
