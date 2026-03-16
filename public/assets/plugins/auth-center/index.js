import { createColorSection } from '../_shared/color-picker.js';

/*
Usage:
<div data-cb-type="auth-center">
    <div class="ac-header">
        <h3 class="ac-title">인증센터</h3>
        <p class="ac-desc">안전한 금융거래를 위한 인증 서비스</p>
    </div>
    <div class="ac-cards">
        <a href="#" class="ac-card" data-type="cert" data-item-id="ac-1">
            <div class="ac-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div class="ac-card-content">
                <span class="ac-card-title">공동인증서</span>
                <span class="ac-card-desc">발급 · 갱신 · 복사</span>
            </div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="finance-cert" data-item-id="ac-2">
            <div class="ac-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="ac-card-content">
                <span class="ac-card-title">금융인증서</span>
                <span class="ac-card-desc">클라우드 기반 인증</span>
            </div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="otp" data-item-id="ac-3">
            <div class="ac-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 7h6"/><path d="M9 11h6"/></svg>
            </div>
            <div class="ac-card-content">
                <span class="ac-card-title">OTP</span>
                <span class="ac-card-desc">일회용 비밀번호 생성기</span>
            </div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="security-card" data-item-id="ac-4">
            <div class="ac-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div class="ac-card-content">
                <span class="ac-card-title">보안카드</span>
                <span class="ac-card-desc">보안카드 분실 · 재발급</span>
            </div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
    </div>
    <div class="ac-notice">
        <svg class="ac-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        <p class="ac-notice-text">IBK기업은행은 절대 개인정보, 보안카드 번호 전체를 요구하지 않습니다.</p>
    </div>
</div>
*/

const AUTH_TYPES = {
    cert: {
        title: '공동인증서',
        desc: '발급 · 갱신 · 복사',
        iconSvg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
    },
    'finance-cert': {
        title: '금융인증서',
        desc: '클라우드 기반 인증',
        iconSvg: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
    },
    otp: {
        title: 'OTP',
        desc: '일회용 비밀번호 생성기',
        iconSvg: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 7h6"/><path d="M9 11h6"/>'
    },
    'security-card': {
        title: '보안카드',
        desc: '보안카드 분실 · 재발급',
        iconSvg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>'
    },
    biometric: {
        title: '생체인증',
        desc: '지문 · 안면인식 등록',
        iconSvg: '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 10a3 3 0 1 1 6 0"/>'
    }
};

const ARROW_SVG = '<svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>';

export default {
    name: 'auth-center',
    displayName: '보안 · 인증센터',
    version: '1.0.0',

    settings: {
        accentColor: {
            type: 'color',
            label: '강조 색상',
            default: '#0046A4'
        },
        showNotice: {
            type: 'boolean',
            label: '보안 안내 문구 표시',
            default: true
        },
        noticeText: {
            type: 'text',
            label: '보안 안내 문구',
            default: 'IBK기업은행은 절대 개인정보, 보안카드 번호 전체를 요구하지 않습니다.'
        }
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            // ── 강조 색상 ──
            const accentColor = element.dataset.acAccent || element.style.getPropertyValue('--ac-accent').trim() || '#0046A4';
            container.appendChild(createColorSection([
                {
                    label: '강조 색상',
                    value: accentColor,
                    onChange: (v) => { element.dataset.acAccent = v; element.style.setProperty('--ac-accent', v); onChange?.(); },
                },
            ]));

            // Header edit
            const headerSection = document.createElement('div');
            headerSection.style.marginBottom = '16px';
            headerSection.innerHTML = '<div style="font-size:13px;font-weight:600;color:#333;margin-bottom:8px;">위젯 헤더</div>';

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

            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = element.querySelector('.ac-title')?.textContent || '인증센터';
            titleInput.addEventListener('input', () => {
                const el = element.querySelector('.ac-title');
                if (el) el.textContent = titleInput.value;
                onChange?.();
            });
            headerSection.appendChild(makeField('제목', titleInput));

            const descInput = document.createElement('input');
            descInput.type = 'text';
            descInput.value = element.querySelector('.ac-desc')?.textContent || '';
            descInput.addEventListener('input', () => {
                const el = element.querySelector('.ac-desc');
                if (el) el.textContent = descInput.value;
                onChange?.();
            });
            headerSection.appendChild(makeField('설명', descInput));
            container.appendChild(headerSection);

            // Cards editor
            const cardsSection = document.createElement('div');
            cardsSection.style.cssText = 'border-top:1px solid #eee;padding-top:16px;';
            cardsSection.innerHTML = '<div style="font-size:13px;font-weight:600;color:#333;margin-bottom:8px;">인증 서비스 카드</div>';

            const cardsEl = element.querySelector('.ac-cards');
            const cards = cardsEl ? cardsEl.querySelectorAll('.ac-card') : [];

            const createCardEditor = (card, index) => {
                const section = document.createElement('div');
                section.style.cssText = 'border:1px solid #ddd;border-radius:6px;margin-bottom:8px;background:#fff;overflow:hidden;';
                section.dataset.itemId = card.dataset.itemId || `ac-${Date.now()}-${index}`;
                card.dataset.itemId = section.dataset.itemId;

                const header = document.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;padding:8px 12px;background:#f9f9f9;cursor:pointer;';
                const titleSpan = document.createElement('span');
                titleSpan.textContent = card.querySelector('.ac-card-title')?.textContent || `서비스 ${index + 1}`;
                titleSpan.style.cssText = 'flex:1;font-weight:500;font-size:13px;';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<svg><use xlink:href="#icon-trash2"></use></svg>';
                deleteBtn.style.cssText = 'width:40px;background:transparent;color:#dc2626;';
                deleteBtn.onclick = (e) => { e.preventDefault(); card.remove(); section.remove(); onChange?.(); };

                header.appendChild(titleSpan);
                header.appendChild(deleteBtn);

                const body = document.createElement('div');
                body.style.cssText = 'padding:12px;display:none;';

                // Type select
                const typeWrap = document.createElement('div');
                typeWrap.style.marginBottom = '8px';
                const typeLbl = document.createElement('label');
                typeLbl.textContent = '서비스 유형';
                typeLbl.style.cssText = 'display:block;font-size:11px;color:#555;margin-bottom:3px;';
                const typeSelect = document.createElement('select');
                typeSelect.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;';
                Object.entries(AUTH_TYPES).forEach(([v, t]) => {
                    const o = document.createElement('option');
                    o.value = v; o.textContent = t.title;
                    o.selected = card.dataset.type === v;
                    typeSelect.appendChild(o);
                });
                typeSelect.addEventListener('change', () => {
                    card.dataset.type = typeSelect.value;
                    const meta = AUTH_TYPES[typeSelect.value];
                    if (meta) {
                        const titleEl = card.querySelector('.ac-card-title');
                        const descEl = card.querySelector('.ac-card-desc');
                        const iconEl = card.querySelector('.ac-card-icon svg');
                        if (titleEl) titleEl.textContent = meta.title;
                        if (descEl) descEl.textContent = meta.desc;
                        if (iconEl) iconEl.innerHTML = meta.iconSvg;
                        titleSpan.textContent = meta.title;
                        cardTitleInput.value = meta.title;
                        cardDescInput.value = meta.desc;
                    }
                    onChange?.();
                });
                typeWrap.appendChild(typeLbl);
                typeWrap.appendChild(typeSelect);
                body.appendChild(typeWrap);

                const cardTitleInput = document.createElement('input');
                cardTitleInput.type = 'text';
                cardTitleInput.value = card.querySelector('.ac-card-title')?.textContent || '';
                cardTitleInput.addEventListener('input', () => {
                    const el = card.querySelector('.ac-card-title');
                    if (el) el.textContent = cardTitleInput.value;
                    titleSpan.textContent = cardTitleInput.value || `서비스 ${index + 1}`;
                    onChange?.();
                });
                body.appendChild(makeField('서비스 이름', cardTitleInput));

                const cardDescInput = document.createElement('input');
                cardDescInput.type = 'text';
                cardDescInput.value = card.querySelector('.ac-card-desc')?.textContent || '';
                cardDescInput.addEventListener('input', () => {
                    const el = card.querySelector('.ac-card-desc');
                    if (el) el.textContent = cardDescInput.value;
                    onChange?.();
                });
                body.appendChild(makeField('설명', cardDescInput));

                const linkInput = document.createElement('input');
                linkInput.type = 'text';
                linkInput.placeholder = 'https://...';
                linkInput.value = card.getAttribute('href') || '#';
                linkInput.addEventListener('input', () => {
                    card.setAttribute('href', linkInput.value || '#');
                    onChange?.();
                });
                body.appendChild(makeField('링크 URL', linkInput));

                header.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    body.style.display = body.style.display === 'block' ? 'none' : 'block';
                });

                section.appendChild(header);
                section.appendChild(body);
                return section;
            };

            const cardsContainer = document.createElement('div');
            cards.forEach((card, i) => cardsContainer.appendChild(createCardEditor(card, i)));
            cardsSection.appendChild(cardsContainer);

            const addBtn = document.createElement('button');
            addBtn.textContent = '+ 인증 서비스 추가';
            addBtn.style.width = '100%';
            addBtn.onclick = (e) => {
                e.preventDefault();
                const newCard = document.createElement('a');
                newCard.href = '#';
                newCard.className = 'ac-card';
                newCard.dataset.type = 'cert';
                newCard.dataset.itemId = `ac-${Date.now()}`;
                const meta = AUTH_TYPES['cert'];
                newCard.innerHTML = `
                    <div class="ac-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${meta.iconSvg}</svg>
                    </div>
                    <div class="ac-card-content">
                        <span class="ac-card-title">${meta.title}</span>
                        <span class="ac-card-desc">${meta.desc}</span>
                    </div>
                    ${ARROW_SVG}
                `;
                if (cardsEl) cardsEl.appendChild(newCard);
                cardsContainer.appendChild(createCardEditor(newCard, cardsContainer.children.length));
                onChange?.();
            };
            cardsSection.appendChild(addBtn);
            container.appendChild(cardsSection);

            // Notice edit
            const noticeSection = document.createElement('div');
            noticeSection.style.cssText = 'border-top:1px solid #eee;padding-top:16px;margin-top:16px;';
            noticeSection.innerHTML = '<div style="font-size:13px;font-weight:600;color:#333;margin-bottom:8px;">보안 안내 문구</div>';
            const noticeInput = document.createElement('textarea');
            noticeInput.value = element.querySelector('.ac-notice-text')?.textContent || '';
            noticeInput.rows = 3;
            noticeInput.style.cssText = 'width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;resize:vertical;';
            noticeInput.addEventListener('input', () => {
                const el = element.querySelector('.ac-notice-text');
                if (el) el.textContent = noticeInput.value;
                onChange?.();
            });
            noticeSection.appendChild(noticeInput);
            container.appendChild(noticeSection);

            return container;
        }
    },

    mount: function(element, options) {
        const accent = element.dataset.acAccent || element.style.getPropertyValue('--ac-accent').trim() || options.accentColor || '#0046A4';
        element.style.setProperty('--ac-accent', accent);

        // Notice visibility
        const notice = element.querySelector('.ac-notice');
        if (notice) notice.style.display = options.showNotice !== false ? 'flex' : 'none';
        if (options.noticeText) {
            const noticeEl = element.querySelector('.ac-notice-text');
            if (noticeEl) noticeEl.textContent = options.noticeText;
        }

        // Prevent default for # links in preview
        element.querySelectorAll('.ac-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const href = card.getAttribute('href');
                if (!href || href === '#') e.preventDefault();
            });
        });

        return {};
    },

    unmount: function(element, instance) {
    }
};
