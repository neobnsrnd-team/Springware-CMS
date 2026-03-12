export default {
    name: 'site-footer',
    displayName: '사이트 푸터',
    version: '1.0.0',

    settings: {},

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.cssText = 'margin-bottom:16px;';

            const S = {
                row: 'display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;',
                label: 'font-size:12px;color:#6b7280;width:70px;flex-shrink:0;padding-top:6px;',
                textarea: 'flex:1;padding:5px 9px;border:1px solid #e5e7eb;border-radius:5px;font-size:12px;outline:none;color:#111827;resize:vertical;min-height:50px;line-height:1.5;font-family:inherit;',
                input: 'flex:1;padding:5px 9px;border:1px solid #e5e7eb;border-radius:5px;font-size:13px;outline:none;color:#111827;',
                sectionTitle: 'font-size:12px;font-weight:700;color:#374151;margin:14px 0 8px;border-top:1px solid #f3f4f6;padding-top:12px;',
            };

            // 연락처
            const contactEl = element.querySelector('.sf-contact');
            const contactRow = document.createElement('div');
            contactRow.style.cssText = S.row;
            const contactLbl = document.createElement('label');
            contactLbl.textContent = '연락처:';
            contactLbl.style.cssText = S.label;
            const contactTA = document.createElement('textarea');
            contactTA.value = contactEl?.textContent?.trim() || '';
            contactTA.style.cssText = S.textarea;
            contactTA.addEventListener('input', () => {
                if (contactEl) contactEl.textContent = contactTA.value;
                onChange?.();
            });
            contactRow.appendChild(contactLbl);
            contactRow.appendChild(contactTA);
            container.appendChild(contactRow);

            // 저작권
            const copyEl = element.querySelector('.sf-copyright');
            const copyRow = document.createElement('div');
            copyRow.style.cssText = S.row;
            const copyLbl = document.createElement('label');
            copyLbl.textContent = '저작권:';
            copyLbl.style.cssText = S.label;
            const copyTA = document.createElement('textarea');
            copyTA.value = copyEl?.textContent?.trim() || '';
            copyTA.style.cssText = S.textarea;
            copyTA.addEventListener('input', () => {
                if (copyEl) copyEl.textContent = copyTA.value;
                onChange?.();
            });
            copyRow.appendChild(copyLbl);
            copyRow.appendChild(copyTA);
            container.appendChild(copyRow);

            return container;
        }
    },

    mount: function(element, options) {
        // select 클릭 정상 동작 허용 (에디터 내 네비게이션만 차단)
        element.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', e => e.preventDefault());
        });
        return {};
    },

    unmount: function(element, instance) {}
};
