
// 기본 로고 — IBK 파란 사각형 + 'IBK' 텍스트 (데이터 URI SVG)
const DEFAULT_LOGO_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'%3E" +
    "%3Crect width='34' height='34' rx='6' fill='%230046A4'/%3E" +
    "%3Ctext x='17' y='23' text-anchor='middle' fill='white' font-size='10' font-weight='900' font-family='sans-serif'%3EIBK%3C/text%3E" +
    "%3C/svg%3E";

export default {
    name: 'app-header',
    displayName: '최상단 헤더',
    version: '2.0.0',

    settings: {
        accentColor: {
            type: 'color',
            label: '포인트 색상',
            default: '#0046A4'
        }
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

            const S = {
                section: 'display:flex;flex-direction:column;gap:8px;padding-bottom:14px;border-bottom:1px solid #f3f4f6;',
                sectionTitle: 'font-size:11px;font-weight:700;color:#374151;letter-spacing:0.3px;',
                row: 'display:flex;align-items:center;gap:8px;',
                label: 'font-size:12px;color:#6b7280;width:72px;flex-shrink:0;',
                input: 'flex:1;padding:5px 9px;border:1px solid #e5e7eb;border-radius:5px;font-size:13px;outline:none;color:#111827;min-width:0;',
            };

            const makeRow = (labelText, inputEl) => {
                const row = document.createElement('div');
                row.style.cssText = S.row;
                const lbl = document.createElement('label');
                lbl.textContent = labelText;
                lbl.style.cssText = S.label;
                row.appendChild(lbl);
                row.appendChild(inputEl);
                return row;
            };

            // ── ① 로고 이미지 섹션 ──────────────────────────────────────
            const logoSection = document.createElement('div');
            logoSection.style.cssText = S.section;

            const logoTitle = document.createElement('div');
            logoTitle.textContent = '은행 로고';
            logoTitle.style.cssText = S.sectionTitle;
            logoSection.appendChild(logoTitle);

            const logoImgEl = element.querySelector('.ah-logo-img');

            // 미리보기
            const previewWrap = document.createElement('div');
            previewWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';

            const previewImg = document.createElement('img');
            previewImg.src = logoImgEl?.src || DEFAULT_LOGO_SRC;
            previewImg.style.cssText = 'width:40px;height:40px;object-fit:contain;border-radius:6px;border:1px solid #e5e7eb;background:#f9fafb;flex-shrink:0;';

            const previewLabel = document.createElement('span');
            previewLabel.textContent = '현재 로고';
            previewLabel.style.cssText = 'font-size:11px;color:#9ca3af;';

            previewWrap.appendChild(previewImg);
            previewWrap.appendChild(previewLabel);
            logoSection.appendChild(previewWrap);

            // URL 입력
            const logoUrlInput = document.createElement('input');
            logoUrlInput.type = 'url';
            logoUrlInput.placeholder = '이미지 URL 입력 (https://...)';
            logoUrlInput.value = (logoImgEl?.src && logoImgEl.src !== DEFAULT_LOGO_SRC && !logoImgEl.src.startsWith('data:')) ? logoImgEl.src : '';
            logoUrlInput.style.cssText = S.input;
            logoUrlInput.addEventListener('input', () => {
                const val = logoUrlInput.value.trim();
                const src = val || DEFAULT_LOGO_SRC;
                if (logoImgEl) logoImgEl.src = src;
                previewImg.src = src;
                onChange?.();
            });
            logoSection.appendChild(makeRow('이미지 URL:', logoUrlInput));

            // 파일 업로드 버튼
            const fileRow = document.createElement('div');
            fileRow.style.cssText = S.row;

            const fileLbl = document.createElement('label');
            fileLbl.textContent = '파일 선택:';
            fileLbl.style.cssText = S.label;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.cssText = 'display:none;';

            const fileBtn = document.createElement('button');
            fileBtn.textContent = '이미지 파일 선택';
            fileBtn.style.cssText =
                'flex:1;padding:5px 10px;border:1px solid #e5e7eb;border-radius:5px;' +
                'background:#f9fafb;font-size:12px;color:#374151;cursor:pointer;text-align:left;min-height:unset;';
            fileBtn.onclick = () => fileInput.click();

            fileInput.addEventListener('change', () => {
                const file = fileInput.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const src = ev.target?.result;
                    if (typeof src !== 'string') return;
                    if (logoImgEl) logoImgEl.src = src;
                    previewImg.src = src;
                    logoUrlInput.value = '';
                    onChange?.();
                };
                reader.readAsDataURL(file);
            });

            fileRow.appendChild(fileLbl);
            fileRow.appendChild(fileBtn);
            fileRow.appendChild(fileInput);
            logoSection.appendChild(fileRow);

            // 기본값 복원 버튼
            const resetBtn = document.createElement('button');
            resetBtn.textContent = '기본 로고로 초기화';
            resetBtn.style.cssText =
                'font-size:11px;padding:4px 8px;border:1px solid #e5e7eb;border-radius:5px;' +
                'background:#fff;color:#6b7280;cursor:pointer;width:fit-content;min-height:unset;';
            resetBtn.onclick = () => {
                if (logoImgEl) logoImgEl.src = DEFAULT_LOGO_SRC;
                previewImg.src = DEFAULT_LOGO_SRC;
                logoUrlInput.value = '';
                onChange?.();
            };
            logoSection.appendChild(resetBtn);

            wrap.appendChild(logoSection);

            // ── ② 은행명 섹션 ────────────────────────────────────────────
            const nameSection = document.createElement('div');
            nameSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

            const nameTitle = document.createElement('div');
            nameTitle.textContent = '은행 이름';
            nameTitle.style.cssText = S.sectionTitle;
            nameSection.appendChild(nameTitle);

            // 은행명 텍스트
            const logoTextEl = element.querySelector('.ah-logo-text');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = logoTextEl?.textContent?.trim() || 'IBK기업은행';
            nameInput.style.cssText = S.input;
            nameInput.addEventListener('input', () => {
                if (logoTextEl) logoTextEl.textContent = nameInput.value;
                onChange?.();
            });
            nameSection.appendChild(makeRow('은행명:', nameInput));

            wrap.appendChild(nameSection);

            return wrap;
        }
    },

    mount: function(element, options) {
        const accent = element.getAttribute('data-cb-accent-color') || element.dataset.ahAccent || element.style.getPropertyValue('--ah-accent').trim() || '#0046A4';
        element.style.setProperty('--ah-accent', accent);
        element.style.borderBottomColor = accent;

        // 로고 이미지 기본값 설정
        const logoImg = element.querySelector('.ah-logo-img');
        if (logoImg && (!logoImg.src || logoImg.src === window.location.href)) {
            logoImg.src = DEFAULT_LOGO_SRC;
        }

        // 에디터 내 링크 클릭 차단
        element.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', e => e.preventDefault());
        });

        return {};
    },

    unmount: function(element, instance) {}
};
