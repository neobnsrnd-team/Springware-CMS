// scripts/migrate-info-card-slide-to-html.ts
// info-card-slide 정보 카드 슬라이드 컴포넌트 등록/업데이트 (Issue #274)
// 실행: npx tsx scripts/migrate-info-card-slide-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent, createComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';
import { buildCardHtml, SLIDE_SCRIPT, INFO_CARD_FONT_FAMILY } from '../src/lib/info-card-slide';
import type { CardSlide } from '../src/lib/info-card-slide';

const FONT_FAMILY = INFO_CARD_FONT_FAMILY;

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
