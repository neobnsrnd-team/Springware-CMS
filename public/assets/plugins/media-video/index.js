/*
Usage:
<div data-cb-type="media-video">
    <div class="mv-label">IBK 소개 영상</div>
    <div class="mv-wrap">
        <iframe src="https://www.youtube.com/embed/TSxZRHwZam8" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen title="IBK 소개 영상"></iframe>
    </div>
</div>
*/

export default {
    name: 'media-video',
    displayName: '미디어 홍보',
    version: '1.1.0',

    settings: {},

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            const S = {
                label: 'display:block;font-size:11px;color:#555;margin-bottom:3px;',
                input: 'width:100%;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;box-sizing:border-box;margin-bottom:10px;',
            };

            const makeField = (labelText, inputEl) => {
                const wrap = document.createElement('div');
                const lbl = document.createElement('label');
                lbl.textContent = labelText;
                lbl.style.cssText = S.label;
                inputEl.style.cssText = S.input;
                wrap.appendChild(lbl);
                wrap.appendChild(inputEl);
                return wrap;
            };

            // 영상 제목
            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.value = element.querySelector('.mv-label')?.textContent || 'IBK 소개 영상';
            labelInput.addEventListener('input', () => {
                const el = element.querySelector('.mv-label');
                if (el) el.textContent = labelInput.value;
                onChange?.();
            });
            container.appendChild(makeField('영상 제목', labelInput));

            // 유튜브 URL
            const iframe = element.querySelector('.mv-wrap iframe');
            const currentSrc = iframe?.getAttribute('src') || '';
            const currentId = currentSrc.match(/embed\/([^?]+)/)?.[1] || '';

            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.placeholder = 'https://www.youtube.com/watch?v=... 또는 https://youtu.be/...';
            urlInput.value = currentId ? `https://www.youtube.com/watch?v=${currentId}` : '';
            urlInput.addEventListener('input', () => {
                const url = urlInput.value.trim();
                const vid = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
                const iframeEl = element.querySelector('.mv-wrap iframe');
                if (iframeEl && vid) {
                    iframeEl.setAttribute('src', `https://www.youtube.com/embed/${vid}`);
                }
                onChange?.();
            });
            container.appendChild(makeField('유튜브 URL', urlInput));

            return container;
        }
    },

    mount: function(element, options) {
        return {};
    },

    unmount: function() {}
};
