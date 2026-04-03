// src/lib/info-card-slide.ts
// info-card-slide 컴포넌트 공용 타입·빌더·스크립트
// InfoCardSlideEditor.tsx 와 migrate-info-card-slide-to-html.ts 에서 공유

// ── 데이터 모델 ──────────────────────────────────────────────────────────

export interface CardButton {
    label: string;
    href?: string;
}

export interface CardSlide {
    tag?: string;
    showMore?: boolean;
    moreHref?: string;
    title: string;
    copyable?: boolean;
    subtitle?: string;
    infoLines?: string[];
    buttons?: CardButton[];
}

// ── 상수 ─────────────────────────────────────────────────────────────────

export const INFO_CARD_FONT_FAMILY =
    "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── href 보안 처리 ───────────────────────────────────────────────────────

export function sanitizeHref(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|#)/.test(trimmed)) {
        return trimmed.replace(/"/g, '&quot;');
    }
    return '#';
}

// ── HTML 특수문자 이스케이프 — XSS 방지 ──────────────────────────────────

export function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── 카드 HTML 빌더 ───────────────────────────────────────────────────────

export function buildCardHtml(card: CardSlide, idx: number): string {
    const tagHtml = card.tag
        ? `<span style="display:inline-block;padding:4px 12px;border-radius:12px;background:#E8F0FC;color:#0046A4;font-size:12px;font-weight:600;">${escapeHtml(card.tag)}</span>`
        : '';
    const moreHtml = card.showMore
        ? `<a href="${sanitizeHref(card.moreHref || '#')}" style="color:#9CA3AF;font-size:18px;text-decoration:none;line-height:1;">⋮</a>`
        : '';
    const headerHtml =
        tagHtml || moreHtml
            ? `<div style="display:flex;align-items:center;justify-content:space-between;">${tagHtml}${moreHtml}</div>`
            : '';

    const copyBtnHtml = card.copyable
        ? `<button data-card-copy style="background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;display:flex;align-items:center;">` +
          `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>` +
          `</button>`
        : '';
    const titleHtml =
        `<div style="display:flex;align-items:center;gap:4px;">` +
        `<span data-card-title style="font-size:18px;font-weight:700;color:#1A1A2E;flex:1;">${escapeHtml(card.title)}</span>` +
        copyBtnHtml +
        `</div>`;

    const subtitleHtml = card.subtitle
        ? `<span style="font-size:14px;color:#6B7280;">${escapeHtml(card.subtitle)}</span>`
        : '';

    const infoHtml = (card.infoLines ?? [])
        .map((line) => `<span style="font-size:13px;color:#6B7280;text-align:right;">${escapeHtml(line)}</span>`)
        .join('');

    const buttonsHtml =
        (card.buttons ?? []).length > 0
            ? `<div style="display:flex;gap:8px;margin-top:4px;">` +
              (card.buttons ?? [])
                  .map(
                      (b) =>
                          `<a href="${sanitizeHref(b.href || '#')}"` +
                          ` style="flex:1;text-align:center;padding:10px;border-radius:8px;background:#F5F7FA;color:#1A1A2E;font-size:13px;font-weight:600;text-decoration:none;">${escapeHtml(b.label)}</a>`,
                  )
                  .join('') +
              `</div>`
            : '';

    return (
        `<div data-card-item data-card-idx="${idx}"` +
        ` style="flex-shrink:0;width:100%;padding:0 8px;box-sizing:border-box;">` +
        `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;min-height:180px;">` +
        headerHtml +
        titleHtml +
        subtitleHtml +
        infoHtml +
        buttonsHtml +
        `</div></div>`
    );
}

// ── 인라인 스크립트 (뷰어용 scroll-snap + 복사 기능) ─────────────────────

export const SLIDE_SCRIPT =
    `<script>` +
    `(function(){` +
    `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
    `if(!root||root.getAttribute('data-card-slide-inited')==='1')return;` +
    `if(root.closest('.is-builder'))return;` +
    `root.setAttribute('data-card-slide-inited','1');` +
    `var track=root.querySelector('[data-card-track]');` +
    `if(track){` +
    `track.style.cssText='display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;` +
    `-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;gap:0;padding:8px 0 12px;scroll-padding:0 4%;';` +
    `var maxH=0;` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight='0';` +
    `if(inner.scrollHeight>maxH)maxH=inner.scrollHeight;` +
    `});` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight=maxH+'px';` +
    `});` +
    `track.querySelectorAll('[data-card-item]').forEach(function(card){` +
    `card.style.flex='0 0 92%';card.style.width='92%';card.style.scrollSnapAlign='center';` +
    `});` +
    `track.querySelectorAll('[data-card-item] a').forEach(function(btn){` +
    `if(!btn.style.borderRadius)return;` +
    `btn.style.whiteSpace='nowrap';btn.style.overflow='hidden';` +
    `var fs=13;while(btn.scrollWidth>btn.clientWidth&&fs>9){fs--;btn.style.fontSize=fs+'px';}` +
    `});` +
    `if(!track.getAttribute('data-ics-id')){` +
    `var styleId='ics-hide-'+Math.random().toString(36).slice(2,8);` +
    `track.setAttribute('data-ics-id',styleId);` +
    `var styleEl=document.createElement('style');` +
    `styleEl.textContent='[data-ics-id=\"'+styleId+'\"]::-webkit-scrollbar{display:none}';` +
    `root.appendChild(styleEl);` +
    `}` +
    `}` +
    `root.querySelectorAll('[data-card-copy]').forEach(function(btn){` +
    `btn.addEventListener('click',function(e){` +
    `e.preventDefault();` +
    `var card=btn.closest('[data-card-item]');` +
    `var titleEl=card&&card.querySelector('[data-card-title]');` +
    `if(titleEl&&navigator.clipboard){` +
    `navigator.clipboard.writeText(titleEl.textContent||'');` +
    `var svg=btn.querySelector('svg');` +
    `if(svg){svg.setAttribute('stroke','#059669');setTimeout(function(){svg.setAttribute('stroke','#9CA3AF');},1500);}` +
    `}` +
    `});` +
    `});` +
    `})();` +
    `</script>`;
