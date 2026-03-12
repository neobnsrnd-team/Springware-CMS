import { createColorSection } from '../_shared/color-picker.js';

/*
Usage:
<div data-cb-type="product-gallery">
    <div class="pg-header">
        <h3 class="pg-title">주요 금융상품</h3>
    </div>
    <div class="pg-track">
        <div class="pg-slide" data-type="savings" data-item-id="pg-1">
            <div class="pg-type-badge">적금</div>
            <div class="pg-product-name">IBK D-Day 적금</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">4.5</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최고 금리 (연)</div>
            <div class="pg-detail">기간 1~36개월 · 월 최대 100만원</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
        <div class="pg-slide" data-type="deposit" data-item-id="pg-2">
            <div class="pg-type-badge">예금</div>
            <div class="pg-product-name">IBK평생한가족예금</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">3.8</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최고 금리 (연)</div>
            <div class="pg-detail">기간 6~36개월 · 1인 1계좌</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
        <div class="pg-slide" data-type="loan" data-item-id="pg-3">
            <div class="pg-type-badge">대출</div>
            <div class="pg-product-name">IBK 기업대출</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">4.2</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최저 금리 (연)</div>
            <div class="pg-detail">한도 최대 10억 · 거치 최대 3년</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
    </div>
    <div class="pg-dots"></div>
</div>
*/

export default {
    name: 'product-gallery',
    displayName: '금융 상품 갤러리',
    version: '1.0.0',

    settings: {
        autoplay: {
            type: 'boolean',
            label: '자동 슬라이드',
            default: true
        },
        autoplayDelay: {
            type: 'number',
            label: '슬라이드 간격 (ms)',
            default: 4000,
            min: 1000,
            max: 10000,
            step: 500
        },
        showDots: {
            type: 'boolean',
            label: '페이지 점 표시',
            default: true
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
            const accentColor = element.style.getPropertyValue('--pg-accent').trim() || '#0046A4';
            container.appendChild(createColorSection([
                {
                    label: '강조 색상',
                    value: accentColor,
                    onChange: (v) => { element.style.setProperty('--pg-accent', v); onChange?.(); },
                },
            ]));

            const track = element.querySelector('.pg-track');
            const items = track ? track.querySelectorAll('.pg-slide') : [];

            const TYPE_MAP = { deposit: '예금', savings: '적금', loan: '대출', fund: '펀드' };

            const createItemEditor = (item, index) => {
                const section = document.createElement('div');
                section.style.cssText = 'border:1px solid #ddd;border-radius:6px;margin-bottom:8px;background:#fff;overflow:hidden;';
                section.dataset.itemId = item.dataset.itemId || `pg-${Date.now()}-${index}`;
                item.dataset.itemId = section.dataset.itemId;

                const header = document.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;padding:8px 12px;background:#f9f9f9;cursor:pointer;';

                const titleSpan = document.createElement('span');
                titleSpan.textContent = item.querySelector('.pg-product-name')?.textContent || `상품 ${index + 1}`;
                titleSpan.style.flex = '1';
                titleSpan.style.fontWeight = '500';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<svg><use xlink:href="#icon-trash2"></use></svg>';
                deleteBtn.style.cssText = 'width:40px;background:transparent;color:#dc2626;';
                deleteBtn.onclick = (e) => { e.preventDefault(); item.remove(); section.remove(); onChange?.(); };

                header.appendChild(titleSpan);
                header.appendChild(deleteBtn);

                const body = document.createElement('div');
                body.style.cssText = 'padding:12px;display:none;';

                const makeLabel = (text) => {
                    const l = document.createElement('label');
                    l.textContent = text;
                    l.style.cssText = 'display:block;font-size:12px;color:#555;margin-bottom:3px;margin-top:8px;';
                    return l;
                };

                const makeInput = (type, value, placeholder) => {
                    const inp = document.createElement('input');
                    inp.type = type;
                    inp.value = value || '';
                    if (placeholder) inp.placeholder = placeholder;
                    inp.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;';
                    return inp;
                };

                // Type
                body.appendChild(makeLabel('상품 유형'));
                const typeSelect = document.createElement('select');
                typeSelect.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;';
                Object.entries(TYPE_MAP).forEach(([v, t]) => {
                    const opt = document.createElement('option');
                    opt.value = v; opt.textContent = t;
                    opt.selected = item.dataset.type === v;
                    typeSelect.appendChild(opt);
                });
                typeSelect.addEventListener('change', () => {
                    item.dataset.type = typeSelect.value;
                    const badge = item.querySelector('.pg-type-badge');
                    if (badge) badge.textContent = TYPE_MAP[typeSelect.value];
                    onChange?.();
                });
                body.appendChild(typeSelect);

                // Name
                body.appendChild(makeLabel('상품명'));
                const nameInput = makeInput('text', item.querySelector('.pg-product-name')?.textContent, '상품명');
                nameInput.addEventListener('input', () => {
                    const el = item.querySelector('.pg-product-name');
                    if (el) el.textContent = nameInput.value;
                    titleSpan.textContent = nameInput.value || `상품 ${index + 1}`;
                    onChange?.();
                });
                body.appendChild(nameInput);

                // Rate
                body.appendChild(makeLabel('금리 (%)'));
                const rateInput = makeInput('text', item.querySelector('.pg-rate-value')?.textContent, '0.0');
                rateInput.addEventListener('input', () => {
                    const el = item.querySelector('.pg-rate-value');
                    if (el) el.textContent = rateInput.value;
                    onChange?.();
                });
                body.appendChild(rateInput);

                // Rate label
                body.appendChild(makeLabel('금리 설명'));
                const rateLabelInput = makeInput('text', item.querySelector('.pg-rate-label')?.textContent, '최고 금리 (연)');
                rateLabelInput.addEventListener('input', () => {
                    const el = item.querySelector('.pg-rate-label');
                    if (el) el.textContent = rateLabelInput.value;
                    onChange?.();
                });
                body.appendChild(rateLabelInput);

                // Detail
                body.appendChild(makeLabel('상품 설명'));
                const detailInput = makeInput('text', item.querySelector('.pg-detail')?.textContent, '상품 설명');
                detailInput.addEventListener('input', () => {
                    const el = item.querySelector('.pg-detail');
                    if (el) el.textContent = detailInput.value;
                    onChange?.();
                });
                body.appendChild(detailInput);

                // CTA link
                body.appendChild(makeLabel('링크 URL'));
                const linkInput = makeInput('text', item.querySelector('.pg-cta')?.getAttribute('href'), 'https://...');
                linkInput.addEventListener('input', () => {
                    const el = item.querySelector('.pg-cta');
                    if (el) el.setAttribute('href', linkInput.value || '#');
                    onChange?.();
                });
                body.appendChild(linkInput);

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
            addBtn.textContent = '+ 상품 추가';
            addBtn.style.width = '100%';
            addBtn.onclick = (e) => {
                e.preventDefault();
                const newItem = document.createElement('div');
                newItem.className = 'pg-slide';
                newItem.dataset.type = 'deposit';
                newItem.dataset.itemId = `pg-${Date.now()}`;
                newItem.innerHTML = `
                    <div class="pg-type-badge">예금</div>
                    <div class="pg-product-name">새 상품명</div>
                    <div class="pg-rate-wrap"><span class="pg-rate-value">0.0</span><span class="pg-rate-unit">%</span></div>
                    <div class="pg-rate-label">최고 금리 (연)</div>
                    <div class="pg-detail">상품 설명을 입력하세요</div>
                    <a href="#" class="pg-cta">자세히 보기</a>
                `;
                if (track) track.appendChild(newItem);
                itemsContainer.appendChild(createItemEditor(newItem, itemsContainer.children.length));
                onChange?.();
            };
            container.appendChild(addBtn);

            return container;
        }
    },

    mount: function(element, options) {
        const accent = element.style.getPropertyValue('--pg-accent').trim() || options.accentColor || '#0046A4';
        element.style.setProperty('--pg-accent', accent);

        const track = element.querySelector('.pg-track');
        if (!track) return {};

        const slides = track.querySelectorAll('.pg-slide');
        if (!slides.length) return {};

        const dotsContainer = element.querySelector('.pg-dots');
        let currentIndex = 0;
        let autoplayTimer = null;

        // Build dots
        if (dotsContainer && options.showDots !== false) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'pg-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `슬라이드 ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
        }

        const updateDots = () => {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.pg-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        const goTo = (index) => {
            currentIndex = Math.max(0, Math.min(index, slides.length - 1));
            track.scrollTo({ left: currentIndex * track.clientWidth, behavior: 'smooth' });
            updateDots();
        };

        let scrollTimer;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const idx = Math.round(track.scrollLeft / track.clientWidth);
                if (idx !== currentIndex) { currentIndex = idx; updateDots(); }
            }, 80);
        }, { passive: true });

        const startAutoplay = () => {
            autoplayTimer = setInterval(() => goTo((currentIndex + 1) % slides.length),
                parseInt(options.autoplayDelay) || 4000);
        };
        const stopAutoplay = () => clearInterval(autoplayTimer);

        if (options.autoplay !== false) {
            startAutoplay();
            track.addEventListener('touchstart', stopAutoplay, { passive: true });
            track.addEventListener('touchend', startAutoplay, { passive: true });
        }

        return { autoplayTimer };
    },

    unmount: function(element, instance) {
        if (instance?.autoplayTimer) clearInterval(instance.autoplayTimer);
    }
};
