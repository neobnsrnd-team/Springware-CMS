import { createColorField, toHex } from '../_shared/color-picker.js';

/*
Usage:
<div data-cb-type="promo-banner">
    <div class="pb-banner-section">
        <div class="pb-track">
            <div class="pb-slide" data-item-id="pb-1">
                <div class="pb-slide-bg" style="background:linear-gradient(135deg,#0046A4 0%,#0066CC 100%)"></div>
                <div class="pb-slide-content">
                    <span class="pb-badge">이벤트</span>
                    <h3 class="pb-slide-title">특별 금리 혜택</h3>
                    <p class="pb-slide-desc">IBK 적금 가입 시 최고 4.5% 금리</p>
                    <a href="#" class="pb-slide-cta">자세히 보기</a>
                </div>
            </div>
        </div>
        <div class="pb-dots"></div>
        <div class="pb-counter"><span class="pb-current">1</span> / <span class="pb-total">2</span></div>
    </div>
</div>
*/

export default {
    name: 'promo-banner',
    displayName: '홍보 배너',
    version: '1.1.0',

    settings: {
        autoplay: {
            type: 'boolean',
            label: '자동 슬라이드',
            default: true
        },
        autoplayDelay: {
            type: 'number',
            label: '슬라이드 간격 (ms)',
            default: 5000,
            min: 2000,
            max: 15000,
            step: 500
        },
        showCounter: {
            type: 'boolean',
            label: '슬라이드 번호 표시',
            default: true
        },
        bannerHeight: {
            type: 'number',
            label: '배너 높이 (px)',
            default: 200,
            min: 140,
            max: 360,
            step: 10
        }
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            const track = element.querySelector('.pb-track');
            const items = track ? track.querySelectorAll('.pb-slide') : [];

            // 그라디언트 또는 단색 배경에서 hex 색상 추출
            // toHex()가 rgb() 형식도 처리하므로 hex/rgb 모두 대응
            const extractHex = (bg) => toHex(bg) || (bg || '').match(/#[0-9a-fA-F]{6}/)?.[0] || '#0046A4';

            const createItemEditor = (item, index) => {
                const section = document.createElement('div');
                section.style.cssText = 'border:1px solid #ddd;border-radius:6px;margin-bottom:8px;background:#fff;overflow:hidden;';
                section.dataset.itemId = item.dataset.itemId || `pb-${Date.now()}-${index}`;
                item.dataset.itemId = section.dataset.itemId;

                const header = document.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;padding:8px 12px;background:#f9f9f9;cursor:pointer;';
                const titleSpan = document.createElement('span');
                titleSpan.textContent = item.querySelector('.pb-slide-title')?.textContent || `슬라이드 ${index + 1}`;
                titleSpan.style.cssText = 'flex:1;font-weight:500;font-size:13px;';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<svg><use xlink:href="#icon-trash2"></use></svg>';
                deleteBtn.style.cssText = 'width:40px;background:transparent;color:#dc2626;';
                deleteBtn.onclick = (e) => { e.preventDefault(); item.remove(); section.remove(); onChange?.(); };

                header.appendChild(titleSpan);
                header.appendChild(deleteBtn);

                const body = document.createElement('div');
                body.className = 'pb-editor-body';
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

                // 배경 색상 선택
                const slideBg = item.querySelector('.pb-slide-bg');
                const currentBgColor = slideBg?.dataset.pbColor || extractHex(slideBg?.style.background || '');
                body.appendChild(createColorField({
                    label: '배경색',
                    value: currentBgColor,
                    onChange: (v) => {
                        if (slideBg) { slideBg.dataset.pbColor = v; slideBg.style.background = v; }
                        onChange?.();
                    },
                }));

                const badgeInput = document.createElement('input');
                badgeInput.type = 'text';
                badgeInput.value = item.querySelector('.pb-badge')?.textContent || '';
                badgeInput.addEventListener('input', () => {
                    const el = item.querySelector('.pb-badge');
                    if (el) el.textContent = badgeInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('배지 텍스트 (이벤트, 신상품 등)', badgeInput));

                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.value = item.querySelector('.pb-slide-title')?.textContent || '';
                titleInput.addEventListener('input', () => {
                    const el = item.querySelector('.pb-slide-title');
                    if (el) el.textContent = titleInput.value;
                    titleSpan.textContent = titleInput.value || `슬라이드 ${index + 1}`;
                    onChange?.();
                });
                body.appendChild(makeField('제목', titleInput));

                const descInput = document.createElement('input');
                descInput.type = 'text';
                descInput.value = item.querySelector('.pb-slide-desc')?.textContent || '';
                descInput.addEventListener('input', () => {
                    const el = item.querySelector('.pb-slide-desc');
                    if (el) el.textContent = descInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('설명', descInput));

                const ctaInput = document.createElement('input');
                ctaInput.type = 'text';
                ctaInput.value = item.querySelector('.pb-slide-cta')?.textContent || '';
                ctaInput.addEventListener('input', () => {
                    const el = item.querySelector('.pb-slide-cta');
                    if (el) el.textContent = ctaInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('버튼 텍스트', ctaInput));

                const linkInput = document.createElement('input');
                linkInput.type = 'text';
                linkInput.placeholder = 'https://...';
                linkInput.value = item.querySelector('.pb-slide-cta')?.getAttribute('href') || '#';
                linkInput.addEventListener('input', () => {
                    const el = item.querySelector('.pb-slide-cta');
                    if (el) el.setAttribute('href', linkInput.value || '#');
                    onChange?.();
                });
                body.appendChild(makeField('링크 URL', linkInput));

                header.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    const isOpening = body.style.display !== 'block';
                    // 아코디언: 다른 슬라이드 편집 패널 모두 닫기
                    itemsContainer.querySelectorAll('.pb-editor-body').forEach(b => { b.style.display = 'none'; });
                    body.style.display = isOpening ? 'block' : 'none';
                    if (isOpening) {
                        // 자동재생 멈추고 해당 슬라이드로 이동
                        element._pbPause?.();
                        element._pbGoTo?.(index);
                    } else {
                        // 모두 닫히면 자동재생 재개
                        element._pbResume?.();
                    }
                });

                section.appendChild(header);
                section.appendChild(body);
                return section;
            };

            const itemsContainer = document.createElement('div');
            items.forEach((item, i) => itemsContainer.appendChild(createItemEditor(item, i)));
            container.appendChild(itemsContainer);

            const addBtn = document.createElement('button');
            addBtn.textContent = '+ 슬라이드 추가';
            addBtn.style.width = '100%';
            addBtn.onclick = (e) => {
                e.preventDefault();
                const count = itemsContainer.children.length;
                const DEFAULT_BG_COLORS = ['#0046A4', '#FF6600', '#059669', '#7C3AED', '#DC2626'];
                const bg = DEFAULT_BG_COLORS[count % DEFAULT_BG_COLORS.length];
                const newItem = document.createElement('div');
                newItem.className = 'pb-slide';
                newItem.dataset.itemId = `pb-${Date.now()}`;
                newItem.innerHTML = `
                    <div class="pb-slide-bg" style="background:${bg}"></div>
                    <div class="pb-slide-content">
                        <span class="pb-badge">이벤트</span>
                        <h3 class="pb-slide-title">새 배너 제목</h3>
                        <p class="pb-slide-desc">배너 설명 텍스트를 입력하세요</p>
                        <a href="#" class="pb-slide-cta">자세히 보기</a>
                    </div>
                `;
                if (track) track.appendChild(newItem);
                itemsContainer.appendChild(createItemEditor(newItem, count));
                onChange?.();
            };
            container.appendChild(addBtn);

            return container;
        }
    },

    mount: function(element, options) {
        const track = element.querySelector('.pb-track');
        if (!track) return {};

        const slides = track.querySelectorAll('.pb-slide');
        const dotsContainer = element.querySelector('.pb-dots');
        const counterCurrent = element.querySelector('.pb-current');
        const counterTotal = element.querySelector('.pb-total');
        let currentIndex = 0;
        let autoplayTimer = null;

        // 배너 높이 설정
        const h = parseInt(options.bannerHeight) || 200;
        track.style.height = `${h}px`;

        // 슬라이드 번호 표시
        if (counterTotal) counterTotal.textContent = slides.length;
        if (!options.showCounter) {
            const counter = element.querySelector('.pb-counter');
            if (counter) counter.style.display = 'none';
        }

        // 점 내비게이션 생성
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'pb-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `슬라이드 ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
        }

        const updateUI = () => {
            dotsContainer?.querySelectorAll('.pb-dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentIndex);
            });
            if (counterCurrent) counterCurrent.textContent = currentIndex + 1;
        };

        const goTo = (index) => {
            currentIndex = ((index % slides.length) + slides.length) % slides.length;
            track.scrollTo({ left: currentIndex * track.clientWidth, behavior: 'smooth' });
            updateUI();
        };

        let scrollTimer;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                const idx = Math.round(track.scrollLeft / track.clientWidth);
                if (idx !== currentIndex) { currentIndex = idx; updateUI(); }
            }, 80);
        }, { passive: true });

        const startAutoplay = () => {
            autoplayTimer = setInterval(() => goTo(currentIndex + 1), parseInt(options.autoplayDelay) || 5000);
        };
        const stopAutoplay = () => clearInterval(autoplayTimer);

        if (options.autoplay !== false) {
            startAutoplay();
            track.addEventListener('touchstart', stopAutoplay, { passive: true });
            track.addEventListener('touchend', startAutoplay, { passive: true });
        }

        // 에디터 패널에서 슬라이드 선택 시 해당 슬라이드로 이동 + 자동재생 제어
        element._pbGoTo = goTo;
        element._pbPause = stopAutoplay;
        element._pbResume = () => { if (options.autoplay !== false) startAutoplay(); };

        return { autoplayTimer };
    },

    unmount: function(element, instance) {
        if (instance?.autoplayTimer) clearInterval(instance.autoplayTimer);
        delete element._pbGoTo;
        delete element._pbPause;
        delete element._pbResume;
    }
};
