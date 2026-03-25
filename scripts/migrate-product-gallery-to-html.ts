// scripts/migrate-product-gallery-to-html.ts
// product-gallery 컴포넌트를 data-cb-type 플러그인 구조에서 순수 HTML로 변환
// 슬라이더: CSS scroll-snap + 인라인 IIFE 스크립트로 구현 (data-cb-type 의존 없음)
// DB SPW_CMS_COMPONENT의 product-gallery-mobile / web / responsive DATA.html 필드 업데이트
// 실행: npx tsx scripts/migrate-product-gallery-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// 상품 유형별 강조 색상
const CARD_COLORS: Record<string, { accent: string; accentLight: string }> = {
    savings: { accent: '#0046A4', accentLight: '#E8F0FC' },
    deposit: { accent: '#0046A4', accentLight: '#E8F0FC' },
    loan:    { accent: '#FF6600', accentLight: '#FFF3EC' },
};

// 기본 상품 카드 데이터 (index.js Usage 주석 기준)
const CARDS = [
    {
        type: 'savings',
        badge: '적금',
        productName: 'IBK D-Day 적금',
        rateValue: '4.5',
        rateLabel: '최고 금리 (연)',
        detail: '기간 1~36개월 · 월 최대 100만원',
        ctaHref: '#',
    },
    {
        type: 'deposit',
        badge: '예금',
        productName: 'IBK평생한가족예금',
        rateValue: '3.8',
        rateLabel: '최고 금리 (연)',
        detail: '기간 6~36개월 · 1인 1계좌',
        ctaHref: '#',
    },
    {
        type: 'loan',
        badge: '대출',
        productName: 'IBK 기업대출',
        rateValue: '4.2',
        rateLabel: '최저 금리 (연)',
        detail: '한도 최대 10억 · 거치 최대 3년',
        ctaHref: '#',
    },
] as const;

// 카드 HTML 생성 — style.css 스타일을 inline으로 이식, ::before 장식은 <div>로 대체
function buildCard(card: (typeof CARDS)[number], itemId: string): string {
    const { accent, accentLight } = CARD_COLORS[card.type];
    return (
        `<div data-type="${card.type}" data-item-id="${itemId}" style="background:#fff;border-radius:16px;padding:24px 20px;display:flex;flex-direction:column;gap:6px;box-shadow:0 4px 20px rgba(0,70,164,0.08);position:relative;overflow:hidden;height:100%;box-sizing:border-box;">` +
            `<div style="position:absolute;top:0;right:0;width:120px;height:120px;background:linear-gradient(135deg,${accentLight} 0%,transparent 70%);border-radius:0 16px 0 100%;pointer-events:none;"></div>` +
            `<div style="display:inline-flex;align-items:center;background:${accentLight};color:${accent};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;width:fit-content;letter-spacing:0.5px;">${card.badge}</div>` +
            `<div style="font-size:20px;font-weight:700;color:#1A1A2E;line-height:1.3;margin-top:4px;">${card.productName}</div>` +
            `<div style="display:flex;align-items:baseline;gap:2px;margin-top:8px;">` +
                `<span style="font-size:40px;font-weight:800;color:${accent};line-height:1;letter-spacing:-1px;">${card.rateValue}</span>` +
                `<span style="font-size:22px;font-weight:700;color:${accent};">%</span>` +
            `</div>` +
            `<div style="font-size:12px;color:#6B7280;font-weight:500;">${card.rateLabel}</div>` +
            `<div style="font-size:13px;color:#6B7280;padding:10px 0;border-top:1px solid #F3F4F6;margin-top:4px;">${card.detail}</div>` +
            `<a href="${card.ctaHref}" style="display:flex;align-items:center;justify-content:center;background:${accent};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px;border-radius:12px;margin-top:8px;min-height:48px;-webkit-tap-highlight-color:transparent;">자세히 보기</a>` +
        `</div>`
    );
}

// 슬라이더 초기화 인라인 스크립트 — IIFE로 스코프 격리, data-cb-type 의존 없음
// ContentBuilder 에디터 컨텍스트(window.ContentBuilder 존재)에서는 슬라이더 비활성화
// → 에디터에서는 정적 카드 나열, 뷰어(/view)에서만 슬라이드 동작
const SLIDER_SCRIPT =
    `<script>` +
    `(function(){` +
        `if(window.ContentBuilder)return;` +
        `var r=document.currentScript&&document.currentScript.parentElement;` +
        `if(!r)return;` +
        `var track=r.querySelector('[data-pg-track]');` +
        `var dotsEl=r.querySelector('[data-pg-dots]');` +
        `if(!track)return;` +
        `var slides=Array.from(track.querySelectorAll('[data-pg-slide]'));` +
        `if(!slides.length)return;` +
        `var cur=0;` +
        `function dot(i){return dotsEl&&dotsEl.children[i];}` +
        `function updateDots(i){` +
            `if(!dotsEl)return;` +
            `Array.from(dotsEl.children).forEach(function(d,j){` +
                `d.style.background=j===i?'#0046A4':'rgba(0,70,164,0.25)';` +
            `});` +
        `}` +
        `function goTo(i){` +
            `cur=i;` +
            `track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});` +
            `updateDots(i);` +
        `}` +
        `if(dotsEl){` +
            `slides.forEach(function(_,i){` +
                `var d=document.createElement('button');` +
                `d.setAttribute('aria-label','슬라이드 '+(i+1));` +
                `d.style.cssText='width:8px;height:8px;border-radius:50%;border:none;padding:0;cursor:pointer;margin:0 4px;flex-shrink:0;background:'+(i===0?'#0046A4':'rgba(0,70,164,0.25)')+';';` +
                `d.addEventListener('click',function(){goTo(i);});` +
                `dotsEl.appendChild(d);` +
            `});` +
        `}` +
        `var t;` +
        `track.addEventListener('scroll',function(){` +
            `clearTimeout(t);` +
            `t=setTimeout(function(){` +
                `var i=Math.round(track.scrollLeft/track.clientWidth);` +
                `if(i!==cur){cur=i;updateDots(i);}` +
            `},80);` +
        `},{passive:true});` +
        `var timer=setInterval(function(){goTo((cur+1)%slides.length);},4000);` +
        `track.addEventListener('touchstart',function(){clearInterval(timer);},{passive:true,once:true});` +
    `})();` +
    `<\/script>`;

// ── mobile variant ──────────────────────────────────────────────────────────
// 390px 기준 모바일: 가로 scroll-snap 슬라이더 (1장씩)
const PRODUCT_GALLERY_MOBILE_HTML =
    `<div data-component-id="product-gallery-mobile" data-spw-block style="font-family:${FONT_FAMILY};background:#F5F7FA;border-radius:20px;position:relative;">` +
        `<div style="padding:20px 20px 12px;">` +
            `<h3 style="font-size:18px;font-weight:700;color:#1A1A2E;margin:0;">주요 금융상품</h3>` +
        `</div>` +
        `<div data-pg-track style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;padding:4px 0 8px;">` +
            CARDS.map((card, i) =>
                `<div data-pg-slide style="flex-shrink:0;width:100%;scroll-snap-align:start;padding:0 20px;box-sizing:border-box;">${buildCard(card, `pg-${i + 1}`)}</div>`,
            ).join('') +
        `</div>` +
        `<div data-pg-dots style="display:flex;justify-content:center;align-items:center;padding:12px 0 16px;"></div>` +
        SLIDER_SCRIPT +
    `</div>`;

// ── web variant ─────────────────────────────────────────────────────────────
// 데스크탑: 카드 가로 3열 고정 그리드, max-width 중앙 정렬 (슬라이더 불필요)
const PRODUCT_GALLERY_WEB_HTML =
    `<div data-component-id="product-gallery-web" data-spw-block style="font-family:${FONT_FAMILY};background:#F5F7FA;border-radius:20px;position:relative;max-width:960px;margin:0 auto;">` +
        `<div style="padding:20px 20px 12px;">` +
            `<h3 style="font-size:18px;font-weight:700;color:#1A1A2E;margin:0;">주요 금융상품</h3>` +
        `</div>` +
        `<div style="display:flex;flex-direction:row;gap:12px;padding:4px 20px 20px;">` +
            CARDS.map((card, i) =>
                `<div style="flex:1;min-width:0;">${buildCard(card, `pg-${i + 1}`)}</div>`,
            ).join('') +
        `</div>` +
    `</div>`;

// ── responsive variant ──────────────────────────────────────────────────────
// 모바일·웹 공용: 가로 scroll-snap 슬라이더 (1장씩), 100% 너비
const PRODUCT_GALLERY_RESPONSIVE_HTML =
    `<div data-component-id="product-gallery-responsive" data-spw-block style="font-family:${FONT_FAMILY};background:#F5F7FA;border-radius:20px;position:relative;width:100%;box-sizing:border-box;">` +
        `<div style="padding:20px 20px 12px;">` +
            `<h3 style="font-size:18px;font-weight:700;color:#1A1A2E;margin:0;">주요 금융상품</h3>` +
        `</div>` +
        `<div data-pg-track style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;padding:4px 0 8px;">` +
            CARDS.map((card, i) =>
                `<div data-pg-slide style="flex-shrink:0;width:100%;scroll-snap-align:start;padding:0 20px;box-sizing:border-box;">${buildCard(card, `pg-${i + 1}`)}</div>`,
            ).join('') +
        `</div>` +
        `<div data-pg-dots style="display:flex;justify-content:center;align-items:center;padding:12px 0 16px;"></div>` +
        SLIDER_SCRIPT +
    `</div>`;

const VARIANTS: Array<{ id: string; html: string }> = [
    { id: 'product-gallery-mobile',     html: PRODUCT_GALLERY_MOBILE_HTML },
    { id: 'product-gallery-web',        html: PRODUCT_GALLERY_WEB_HTML },
    { id: 'product-gallery-responsive', html: PRODUCT_GALLERY_RESPONSIVE_HTML },
];

async function main() {
    console.log('product-gallery 컴포넌트 순수 HTML 변환 마이그레이션 시작...\n');

    for (const variant of VARIANTS) {
        const existing = await getComponentById(variant.id);
        if (!existing) {
            console.error(`❌ ${variant.id} — DB에서 컴포넌트를 찾을 수 없습니다. 건너뜁니다.`);
            continue;
        }

        const currentData = (existing.DATA ?? {}) as Record<string, unknown>;

        await updateComponent({
            componentId:        variant.id,
            componentType:      existing.COMPONENT_TYPE,
            viewMode:           existing.VIEW_MODE,
            componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
            data: {
                ...currentData,
                html: variant.html,
            },
            lastModifierId: 'system',
        });

        console.log(`✅ ${variant.id} — 완료`);
    }

    await closePool();
    console.log('\n마이그레이션 완료.');
}

main().catch((err) => {
    console.error('마이그레이션 실패:', err);
    process.exit(1);
});
