// scripts/migrate-filter-chip-group-to-html.ts
// filter-chip-group 필터 칩 그룹 컴포넌트 등록/업데이트 (Issue #227)
// 실행: npx tsx scripts/migrate-filter-chip-group-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent, createComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface ChipItem {
    label: string;
}

// ── 기본 데이터 ──────────────────────────────────────────────────────────

const DEFAULT_CHIPS: ChipItem[] = [
    { label: '전체' },
    { label: '찜한혜택' },
    { label: '종료된 이벤트' },
    { label: '응모현황' },
    { label: '정기결제' },
    { label: '트래블로그' },
    { label: 'QR결제' },
    { label: '쇼핑/무이자' },
    { label: '여행/해외' },
    { label: '문화/생활' },
    { label: '할인/캐쉬백' },
    { label: '응모/경품' },
];

const DEFAULT_ACTIVE_COLOR = '#7C5CFC';

// ── chevron SVG ──────────────────────────────────────────────────────────

const CHEVRON_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform 0.25s ease;"><path d="m6 9 6 6 6-6"/></svg>`;

// ── 칩 HTML 빌더 ─────────────────────────────────────────────────────────

function buildChipHtml(chip: ChipItem, idx: number, activeColor: string): string {
    const isActive = idx === 0;
    const activeStyle = isActive
        ? `background:${activeColor};color:#fff;border:none;`
        : 'background:#fff;color:#666;border:1px solid #ddd;';
    return (
        `<button data-chip data-chip-idx="${idx}"` +
        ` ${isActive ? 'data-chip-active="true"' : ''}` +
        ` style="display:inline-block;border-radius:20px;padding:8px 16px;font-size:14px;` +
        `white-space:nowrap;cursor:pointer;flex-shrink:0;font-family:${FONT_FAMILY};${activeStyle}"` +
        `>${chip.label}</button>`
    );
}

// ── 인라인 토글 스크립트 ─────────────────────────────────────────────────
// 에디터(.is-builder) 환경에서는 실행하지 않음 — /view에서만 동작

const TOGGLE_SCRIPT =
    `<script>` +
    `(function(){` +
        `var root=document.currentScript&&document.currentScript.closest('[data-spw-block]');` +
        `if(!root||root.getAttribute('data-chip-group-inited')==='1')return;` +
        `if(root.closest('.is-builder'))return;` +
        `root.setAttribute('data-chip-group-inited','1');` +

        // 요소 참조
        `var container=root.querySelector('[data-chip-container]');` +
        `var toggleBtn=root.querySelector('[data-chip-toggle]');` +
        `var chevron=toggleBtn&&toggleBtn.querySelector('svg');` +
        `var expanded=false;` +
        `var activeColor=root.getAttribute('data-chip-active-color')||'#7C5CFC';` +

        // 스크롤바 숨김
        `var styleId='fcg-hide-'+Math.random().toString(36).slice(2,8);` +
        `container.setAttribute('data-fcg-id',styleId);` +
        `var styleEl=document.createElement('style');` +
        `styleEl.textContent='[data-fcg-id=\"'+styleId+'\"]::-webkit-scrollbar{display:none}';` +
        `root.appendChild(styleEl);` +

        // 접기/펼치기 토글
        `function toggle(){` +
            `expanded=!expanded;` +
            `if(expanded){` +
                `container.style.overflowX='visible';` +
                `container.style.whiteSpace='normal';` +
                `container.style.flexWrap='wrap';` +
                `if(chevron)chevron.style.transform='rotate(180deg)';` +
            `}else{` +
                `container.style.overflowX='auto';` +
                `container.style.whiteSpace='nowrap';` +
                `container.style.flexWrap='nowrap';` +
                `if(chevron)chevron.style.transform='rotate(0deg)';` +
            `}` +
        `}` +
        `if(toggleBtn)toggleBtn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();toggle();});` +

        // 칩 선택
        `root.querySelectorAll('[data-chip]').forEach(function(chip){` +
            `chip.addEventListener('click',function(e){` +
                `e.preventDefault();` +
                `root.querySelectorAll('[data-chip]').forEach(function(c){` +
                    `c.removeAttribute('data-chip-active');` +
                    `c.style.background='#fff';` +
                    `c.style.color='#666';` +
                    `c.style.border='1px solid #ddd';` +
                `});` +
                `chip.setAttribute('data-chip-active','true');` +
                `chip.style.background=activeColor;` +
                `chip.style.color='#fff';` +
                `chip.style.border='none';` +
            `});` +
        `});` +
    `})();` +
    `</script>`;

// ── 전체 HTML 조립 ───────────────────────────────────────────────────────

function buildFilterChipGroupHtml(
    chips: ChipItem[],
    componentId: string,
    extraStyle: string,
    activeColor: string,
): string {
    const chipsJson = JSON.stringify(chips).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const chipsHtml = chips.map((chip, i) => buildChipHtml(chip, i, activeColor)).join('');

    return (
        `<div data-component-id="${componentId}" data-spw-block` +
        ` data-chip-items="${chipsJson}"` +
        ` data-chip-active-color="${activeColor}"` +
        ` style="font-family:${FONT_FAMILY};background:#ffffff;${extraStyle}">` +

            `<div data-chip-container style="display:flex;align-items:center;overflow-x:auto;white-space:nowrap;` +
            `gap:8px;padding:12px 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch;">` +
                chipsHtml +
                // 토글 버튼
                `<button data-chip-toggle style="flex-shrink:0;background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;">` +
                    CHEVRON_SVG +
                `</button>` +
            `</div>` +

            TOGGLE_SCRIPT +
        `</div>`
    );
}

// ── 3 variant ────────────────────────────────────────────────────────────

const VIEW_MODES = ['mobile', 'web', 'responsive'] as const;

const EXTRA_STYLES: Record<string, string> = {
    mobile: '',
    web: 'max-width:480px;margin:0 auto;',
    responsive: 'width:100%;box-sizing:border-box;',
};

const VARIANTS = VIEW_MODES.map((viewMode) => ({
    id: `filter-chip-group-${viewMode}`,
    html: buildFilterChipGroupHtml(DEFAULT_CHIPS, `filter-chip-group-${viewMode}`, EXTRA_STYLES[viewMode], DEFAULT_ACTIVE_COLOR),
    viewMode,
}));

const COMPONENT_LABEL = '필터 칩 그룹';
const COMPONENT_DESC = '접기/펼치기 가능한 필터 칩 버튼 그룹';

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
                    id:          'filter-chip-group',
                    label:       COMPONENT_LABEL,
                    description: COMPONENT_DESC,
                    preview:     '/assets/minimalist-blocks/preview/filter-chip-group.svg',
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
                componentThumbnail: '/assets/minimalist-blocks/preview/filter-chip-group.svg',
                data: {
                    id:          'filter-chip-group',
                    label:       COMPONENT_LABEL,
                    description: COMPONENT_DESC,
                    preview:     '/assets/minimalist-blocks/preview/filter-chip-group.svg',
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
