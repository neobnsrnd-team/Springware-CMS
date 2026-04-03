// scripts/migrate-info-card-slide-to-html.ts
// info-card-slide 정보 카드 슬라이드 컴포넌트 등록/업데이트 (Issue #274)
// 실행: npx tsx scripts/migrate-info-card-slide-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent, createComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface CardButton {
    label: string;
    href?: string;
}

interface CardSlide {
    tag?: string;
    showMore?: boolean;
    moreHref?: string;
    title: string;
    copyable?: boolean;
    subtitle?: string;
    infoLines?: string[];
    buttons?: CardButton[];
}

// ── href 보안 처리 ───────────────────────────────────────────────────────

function sanitizeHref(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|#)/.test(trimmed)) {
        return trimmed.replace(/"/g, '&quot;');
    }
    return '#';
}

// ── 카드 HTML 빌더 ───────────────────────────────────────────────────────

function buildCardHtml(card: CardSlide, idx: number): string {
    // 상단: 태그 + 더보기
    const tagHtml = card.tag
        ? `<span style="display:inline-block;padding:4px 12px;border-radius:12px;background:#E8F0FC;color:#0046A4;font-size:12px;font-weight:600;">${card.tag}</span>`
        : '';
    const moreHtml = card.showMore
        ? `<a href="${sanitizeHref(card.moreHref || '#')}" style="color:#9CA3AF;font-size:18px;text-decoration:none;line-height:1;">⋮</a>`
        : '';
    const headerHtml = (tagHtml || moreHtml)
        ? `<div style="display:flex;align-items:center;justify-content:space-between;">${tagHtml}${moreHtml}</div>`
        : '';

    // 제목 + 복사 아이콘
    const copyBtnHtml = card.copyable
        ? `<button data-card-copy style="background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;display:flex;align-items:center;">` +
          `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>` +
          `</button>`
        : '';
    const titleHtml = `<div style="display:flex;align-items:center;gap:4px;">` +
        `<span data-card-title style="font-size:18px;font-weight:700;color:#1A1A2E;flex:1;">${card.title}</span>` +
        copyBtnHtml +
        `</div>`;

    // 부제목
    const subtitleHtml = card.subtitle
        ? `<span style="font-size:14px;color:#6B7280;">${card.subtitle}</span>`
        : '';

    // 보조 텍스트
    const infoHtml = (card.infoLines ?? [])
        .map((line) => `<span style="font-size:13px;color:#6B7280;text-align:right;">${line}</span>`)
        .join('');

    // 하단 버튼
    const buttonsHtml = (card.buttons ?? []).length > 0
        ? `<div style="display:flex;gap:8px;margin-top:4px;">` +
          (card.buttons ?? []).map((b) =>
              `<a href="${sanitizeHref(b.href || '#')}"` +
              ` style="flex:1;text-align:center;padding:10px;border-radius:8px;` +
              `background:#F5F7FA;color:#1A1A2E;font-size:13px;font-weight:600;text-decoration:none;">${b.label}</a>`,
          ).join('') +
          `</div>`
        : '';

    return (
        `<div data-card-item data-card-idx="${idx}"` +
        ` style="flex-shrink:0;width:100%;padding:0 8px;box-sizing:border-box;">` +
            `<div style="background:#fff;border:1px solid #E5E7EB;border-radius:16px;` +
            `padding:20px;display:flex;flex-direction:column;gap:12px;min-height:180px;">` +
                headerHtml +
                titleHtml +
                subtitleHtml +
                infoHtml +
                buttonsHtml +
            `</div>` +
        `</div>`
    );
}

// ── 인라인 스크립트 — scroll-snap 변환 + 복사 기능 ──────────────────────

const SLIDE_SCRIPT =
    `<script>` +
    `(function(){` +
    `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
    `if(!root||root.getAttribute('data-card-slide-inited')==='1')return;` +
    `if(root.closest('.is-builder'))return;` +
    `root.setAttribute('data-card-slide-inited','1');` +

    // scroll-snap 변환 — 세로 나열 → 가로 스와이프 + 가운데 정렬
    `var track=root.querySelector('[data-card-track]');` +
    `if(track){` +
    `track.style.cssText='display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;` +
    `-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;gap:0;padding:8px 5% 12px;';` +
    // 카드 높이 균등화 — 가장 높은 카드 기준
    `var maxH=0;` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight='0';` +
    `if(inner.scrollHeight>maxH)maxH=inner.scrollHeight;` +
    `});` +
    `track.querySelectorAll('[data-card-item] > div').forEach(function(inner){` +
    `inner.style.minHeight=maxH+'px';` +
    `});` +
    // 카드 너비 90% + snap center
    `track.querySelectorAll('[data-card-item]').forEach(function(card){` +
    `card.style.flex='0 0 90%';card.style.width='90%';card.style.scrollSnapAlign='center';` +
    `});` +
    `var styleId='ics-hide-'+Math.random().toString(36).slice(2,8);` +
    `track.setAttribute('data-ics-id',styleId);` +
    `var styleEl=document.createElement('style');` +
    `styleEl.textContent='[data-ics-id=\"'+styleId+'\"]::-webkit-scrollbar{display:none}';` +
    `root.appendChild(styleEl);` +
    `}` +

    // 복사 버튼
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

// ── 전체 HTML 조립 ───────────────────────────────────────────────────────

function buildInfoCardSlideHtml(slides: CardSlide[], componentId: string, extraStyle: string): string {
    const slidesJson = JSON.stringify(slides).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const cardsHtml = slides.map((card, i) => buildCardHtml(card, i)).join('');

    return (
        `<div data-component-id="${componentId}" data-spw-block` +
        ` data-card-slides="${slidesJson}"` +
        ` style="font-family:${FONT_FAMILY};background:#ffffff;${extraStyle}">` +
            `<div data-card-track style="display:flex;flex-direction:column;gap:12px;padding:8px 0;">` +
                cardsHtml +
            `</div>` +
            SLIDE_SCRIPT +
        `</div>`
    );
}

// ── 기본 프리셋 데이터 ───────────────────────────────────────────────────

const DEFAULT_SLIDES: CardSlide[] = [
    {
        tag: '이벤트',
        showMore: true,
        moreHref: '#',
        title: 'IBK 신용카드 혜택',
        copyable: true,
        subtitle: '연회비 무료 이벤트 진행 중',
        infoLines: ['유효기간: 2024.12.31'],
        buttons: [{ label: '자세히 보기' }, { label: '신청하기' }],
    },
    {
        tag: '안내',
        title: '체크카드 캐시백 안내',
        copyable: false,
        subtitle: '월 30만원 이상 이용 시 1% 캐시백',
        infoLines: ['적용일: 2024.01.01', '한도: 월 5,000원'],
        buttons: [{ label: '상세 조건 보기' }],
    },
    {
        tag: '혜택',
        showMore: true,
        title: '적금 우대금리 제공',
        copyable: true,
        subtitle: '최대 연 4.5% 금리 혜택',
        buttons: [{ label: '가입하기' }, { label: '금리 비교' }, { label: '상담 신청' }],
    },
];

// ── 3 variant ────────────────────────────────────────────────────────────

const VIEW_MODES = ['mobile', 'web', 'responsive'] as const;

const EXTRA_STYLES: Record<string, string> = {
    mobile: '',
    web: 'max-width:480px;margin:0 auto;',
    responsive: 'width:100%;box-sizing:border-box;',
};

const VARIANTS = VIEW_MODES.map((viewMode) => ({
    id: `info-card-slide-${viewMode}`,
    html: buildInfoCardSlideHtml(DEFAULT_SLIDES, `info-card-slide-${viewMode}`, EXTRA_STYLES[viewMode]),
    viewMode,
}));

const COMPONENT_LABEL = '정보 카드 슬라이드';
const COMPONENT_DESC = '좌우 스와이프 카드형 정보 UI';

// ── DB 등록 ───────────────────────────────────────────────────────────────

async function main() {
    for (const variant of VARIANTS) {
        const existing = await getComponentById(variant.id);

        if (existing) {
            await updateComponent({
                componentId:        variant.id,
                componentType:      existing.COMPONENT_TYPE,
                viewMode:           existing.VIEW_MODE,
                componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
                data: {
                    ...(existing.DATA ?? {}) as Record<string, unknown>,
                    id:          'info-card-slide',
                    label:       COMPONENT_LABEL,
                    description: COMPONENT_DESC,
                    preview:     '/assets/minimalist-blocks/preview/info-card-slide.svg',
                    html:        variant.html,
                    viewMode:    variant.viewMode,
                },
                lastModifierId: 'system',
            });
            console.log(`✅ ${variant.id} — UPDATE 완료`);
        } else {
            await createComponent({
                componentId:        variant.id,
                componentType:      'finance',
                viewMode:           variant.viewMode,
                componentThumbnail: '/assets/minimalist-blocks/preview/info-card-slide.svg',
                data: {
                    id:          'info-card-slide',
                    label:       COMPONENT_LABEL,
                    description: COMPONENT_DESC,
                    preview:     '/assets/minimalist-blocks/preview/info-card-slide.svg',
                    html:        variant.html,
                    viewMode:    variant.viewMode,
                },
                createUserId:   'system',
                createUserName: '시스템',
            });
            console.log(`✅ ${variant.id} — INSERT 완료`);
        }
    }
    await closePool();
}

main().catch((err: unknown) => { console.error('실패:', err); process.exit(1); });
