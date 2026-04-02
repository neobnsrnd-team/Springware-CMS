// scripts/migrate-flex-list-to-html.ts
// flex-list 가변형 멀티 컬럼 컴포넌트 등록/업데이트 (Issue #234, #244 링크, #245 이미지, #246 스타일, #256 정렬)
// 실행: npx tsx scripts/migrate-flex-list-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent, createComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── 데이터 모델 ──────────────────────────────────────────────────────────

interface FlexListLine {
    text: string;
    align?: 'left' | 'center' | 'right'; // 수평 정렬 (기본 left)
}

interface FlexListColumn {
    type: 'icon' | 'text' | 'image';
    width: 'fixed' | 'flex' | 'auto' | 'custom'; // 고정(40px) / 유연(flex:1) / 자동(auto) / 커스텀(%)
    icon?: string;        // type=icon: 아이콘 키
    iconBg?: string;      // 아이콘 배경색
    lines?: FlexListLine[]; // type=text: 텍스트 행 배열
    href?: string;        // linkMode=column일 때 개별 링크 URL
    imageSrc?: string;    // type=image: 이미지 URL
    customWidth?: string; // width=custom일 때 값 (예: '30%', '120px')
}

interface FlexListRow {
    columns: FlexListColumn[];
    linkMode?: 'row' | 'column' | 'none'; // 행 전체 / 컬럼 개별 / 링크 없음
    rowHref?: string;                       // linkMode=row일 때 URL
    bgColor?: string;   // 행 배경색 (기본 투명)
    padding?: string;   // 행 패딩 (기본 '16px 20px')
    gap?: string;       // 컬럼 간격 (기본 '12px')
    border?: {
        show: boolean;  // 구분선 표시 여부 (기본 true)
        color?: string; // 구분선 색상 (기본 '#E5E7EB')
        width?: number; // 구분선 굵기 px (기본 1)
    };
}

// ── 프리셋 아이콘 SVG ────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
    card: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l-4-4 4-4"/><path d="M3 13h13"/><path d="M17 7l4 4-4 4"/><path d="M21 11H8"/></svg>',
    account: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
    savings: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.8 9 1.5 9 1 9"/></svg>',
    loan: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
    insurance: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    shopping: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    notification: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
    won: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0046A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 16 4-12 4 12 4-16"/><path d="M3 10h18"/><path d="M3 14h18"/></svg>',
};

// ── href 보안 처리 ───────────────────────────────────────────────────────

function sanitizeHref(url: string): string {
    const trimmed = url.trim();
    // 허용 프로토콜: http, https, 상대경로(/), 앵커(#)
    if (/^(https?:\/\/|\/|#)/.test(trimmed)) {
        return trimmed.replace(/"/g, '&quot;');
    }
    return '#';
}

/** 이미지 URL 보안 처리 — javascript:, data: 차단 */
function sanitizeImageSrc(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:\/\/|\/|uploads\/)/.test(trimmed)) {
        return trimmed.replace(/"/g, '&quot;');
    }
    return '';
}

// ── 이미지 HTML 빌더 ────────────────────────────────────────────────────

function buildImageHtml(src: string, width: 'fixed' | 'flex' | 'auto' | 'custom'): string {
    const safeSrc = sanitizeImageSrc(src);
    const widthStyle =
        width === 'fixed' ? 'flex:0 0 40px;width:40px;height:40px;' :
        width === 'auto'  ? 'flex:0 0 auto;width:48px;height:48px;' :
                            'flex:1;min-width:0;height:48px;';

    return (
        `<span data-fl-type="image" data-fl-width="${width}" data-fl-image-src="${safeSrc}"` +
        ` style="${widthStyle}display:flex;align-items:center;justify-content:center;flex-shrink:0;">` +
        (safeSrc
            ? `<img src="${safeSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="" />`
            : `<span style="width:100%;height:100%;background:#F3F4F6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:11px;">이미지</span>`) +
        `</span>`
    );
}

// ── 아이콘 HTML 빌더 ─────────────────────────────────────────────────────

function buildIconHtml(iconKey: string, bgColor: string, width?: 'fixed' | 'flex' | 'auto' | 'custom', customWidth?: string): string {
    const svg = ICONS[iconKey] ?? ICONS['check'];
    const size = (width === 'custom' && customWidth) ? customWidth : '40px';
    const flexBasis = (width === 'custom' && customWidth) ? customWidth : '40px';
    return (
        `<span data-fl-type="icon" data-fl-icon="${iconKey}" data-fl-icon-bg="${bgColor}"` +
        (width === 'custom' && customWidth ? ` data-fl-width="custom" data-fl-custom-width="${customWidth}"` : '') +
        ` style="flex:0 0 ${flexBasis};width:${size};height:${size};border-radius:50%;` +
        `background:${bgColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">` +
        svg +
        `</span>`
    );
}

// ── 컬럼 HTML 빌더 ──────────────────────────────────────────────────────

function buildColumnHtml(col: FlexListColumn): string {
    if (col.type === 'image') {
        return buildImageHtml(col.imageSrc ?? '', col.width);
    }

    const widthStyle =
        col.width === 'custom' && col.customWidth ? `flex:0 0 ${col.customWidth};min-width:0;` :
        col.width === 'fixed' ? 'flex:0 0 40px;' :
        col.width === 'auto'  ? 'flex:0 0 auto;text-align:right;' :
                                'flex:1;min-width:0;';
    const customWidthAttr = col.width === 'custom' && col.customWidth ? ` data-fl-custom-width="${col.customWidth}"` : '';

    if (col.type === 'icon') {
        return buildIconHtml(col.icon ?? 'check', col.iconBg ?? '#E8F0FC', col.width, col.customWidth);
    }

    // 텍스트 컬럼 — 다층 행
    const lines: FlexListLine[] = (col.lines ?? [{ text: '텍스트' }]).map((l) =>
        typeof l === 'string' ? { text: l } : l,
    );
    const lineHtmls = lines.map((line, i) => {
        const alignStyle = line.align && line.align !== 'left' ? `text-align:${line.align};` : '';
        if (i === 0) {
            return `<span style="font-size:15px;font-weight:600;color:#1A1A2E;line-height:1.4;${alignStyle}">${line.text}</span>`;
        }
        return `<span style="font-size:13px;color:#6B7280;line-height:1.4;${alignStyle}">${line.text}</span>`;
    });

    return (
        `<span data-fl-type="text" data-fl-width="${col.width}"${customWidthAttr}` +
        ` style="${widthStyle}display:flex;flex-direction:column;gap:2px;">` +
        lineHtmls.join('') +
        `</span>`
    );
}

// ── 컬럼 래퍼 HTML (개별 링크용) ────────────────────────────────────────

function wrapColumnWithLink(colHtml: string, href?: string): string {
    if (!href) return colHtml;
    return `<a href="${sanitizeHref(href)}" data-fl-col-link style="text-decoration:none;display:contents;">${colHtml}</a>`;
}

// ── 행(Row) HTML 빌더 ───────────────────────────────────────────────────

function buildRowHtml(row: FlexListRow, isLast: boolean): string {
    // 구분선 스타일 — border 설정 또는 기본값
    const borderShow = row.border?.show !== false;
    const borderColor = row.border?.color ?? '#E5E7EB';
    const borderWidth = row.border?.width ?? 1;
    const borderStyle = (!isLast && borderShow) ? `border-bottom:${borderWidth}px solid ${borderColor};` : '';

    // 행 스타일 — 패딩, 간격, 배경색
    const pad = row.padding ?? '16px 20px';
    const gap = row.gap ?? '12px';
    const bg = row.bgColor ? `background:${row.bgColor};` : '';

    // 데이터 속성 (파싱용)
    const dataAttrs =
        (row.bgColor ? ` data-fl-bg="${row.bgColor}"` : '') +
        (row.padding ? ` data-fl-padding="${row.padding}"` : '') +
        (row.gap ? ` data-fl-gap="${row.gap}"` : '') +
        (row.border ? ` data-fl-border-show="${row.border.show}" data-fl-border-color="${row.border.color ?? '#E5E7EB'}" data-fl-border-width="${row.border.width ?? 1}"` : '');

    const linkMode = row.linkMode ?? 'none';
    const flexStyle = `display:flex;align-items:center;gap:${gap};padding:${pad};${borderStyle}${bg}text-decoration:none;`;

    if (linkMode === 'row' && row.rowHref) {
        const columnsHtml = row.columns.map((col) => buildColumnHtml(col)).join('');
        return `<a href="${sanitizeHref(row.rowHref)}" data-fl-link-mode="row"${dataAttrs} style="${flexStyle}">${columnsHtml}</a>`;
    }

    if (linkMode === 'column') {
        const columnsHtml = row.columns.map((col) =>
            wrapColumnWithLink(buildColumnHtml(col), col.href),
        ).join('');
        return `<div data-fl-link-mode="column"${dataAttrs} style="${flexStyle}">${columnsHtml}</div>`;
    }

    const columnsHtml = row.columns.map((col) => buildColumnHtml(col)).join('');
    return `<a href="#" data-fl-link-mode="none"${dataAttrs} style="${flexStyle}">${columnsHtml}</a>`;
}

// ── 전체 HTML 조립 ───────────────────────────────────────────────────────

function buildFlexListHtml(rows: FlexListRow[], componentId: string, extraStyle: string): string {
    const rowsJson = JSON.stringify(rows).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

    const rowsHtml = rows.map((row, i) => buildRowHtml(row, i === rows.length - 1)).join('');

    return (
        `<div data-component-id="${componentId}" data-spw-block` +
        ` data-fl-rows="${rowsJson}"` +
        ` style="font-family:${FONT_FAMILY};background:#ffffff;${extraStyle}">` +
        rowsHtml +
        `</div>`
    );
}

// ── 프리셋 데이터 ────────────────────────────────────────────────────────

// 프리셋 1: 2컬럼 리스트 (아이콘 + 텍스트 3단)
const PRESET_2COL: FlexListRow[] = [
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'card', iconBg: '#E8F0FC' },
            { type: 'text', width: 'flex', lines: [{ text: '신용카드 이용대금 결제' }, { text: '우리은행 1002-***-1234' }, { text: '2024.01.15' }] },
        ],
    },
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'transfer', iconBg: '#E8F0FC' },
            { type: 'text', width: 'flex', lines: [{ text: '이체 완료 알림' }, { text: '홍길동님에게 50,000원 이체' }, { text: '2024.01.14' }] },
        ],
    },
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'notification', iconBg: '#E8F0FC' },
            { type: 'text', width: 'flex', lines: [{ text: '적금 만기 안내' }, { text: 'IBK 자유적금 만기 D-7' }, { text: '2024.01.13' }] },
        ],
    },
];

// 프리셋 2: 3컬럼 리스트 (아이콘 + 텍스트 2단 + 금액/상태)
const PRESET_3COL: FlexListRow[] = [
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'shopping', iconBg: '#E8F0FC' },
            { type: 'text', width: 'flex', lines: [{ text: '스타벅스 코리아' }, { text: '01.15 14:30 · 본인' }] },
            { type: 'text', width: 'auto', lines: [{ text: '-4,500원' }, { text: '승인완료' }] },
        ],
    },
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'shopping', iconBg: '#E8F0FC' },
            { type: 'text', width: 'flex', lines: [{ text: '네이버페이' }, { text: '01.14 11:20 · 본인' }] },
            { type: 'text', width: 'auto', lines: [{ text: '-32,000원' }, { text: '승인완료' }] },
        ],
    },
    {
        columns: [
            { type: 'icon', width: 'fixed', icon: 'transfer', iconBg: '#FEF3C7' },
            { type: 'text', width: 'flex', lines: [{ text: '홍길동' }, { text: '01.13 09:15 · 이체' }] },
            { type: 'text', width: 'auto', lines: [{ text: '+500,000원' }, { text: '입금' }] },
        ],
    },
];

// 프리셋 3: 텍스트 전용 (라벨 + 값)
const PRESET_TEXT: FlexListRow[] = [
    {
        columns: [
            { type: 'text', width: 'flex', lines: [{ text: '예금주' }] },
            { type: 'text', width: 'auto', lines: [{ text: '홍길동' }] },
        ],
    },
    {
        columns: [
            { type: 'text', width: 'flex', lines: [{ text: '계좌번호' }] },
            { type: 'text', width: 'auto', lines: [{ text: '110-***-123456' }] },
        ],
    },
    {
        columns: [
            { type: 'text', width: 'flex', lines: [{ text: '상품명' }] },
            { type: 'text', width: 'auto', lines: [{ text: 'IBK 자유적금' }] },
        ],
    },
    {
        columns: [
            { type: 'text', width: 'flex', lines: [{ text: '가입일' }] },
            { type: 'text', width: 'auto', lines: [{ text: '2024.01.01' }] },
        ],
    },
    {
        columns: [
            { type: 'text', width: 'flex', lines: [{ text: '만기일' }] },
            { type: 'text', width: 'auto', lines: [{ text: '2025.01.01' }] },
        ],
    },
];

// ── 3 프리셋 × 3 viewmode = 9 variant ──────────────────────────────────

interface Preset {
    key: string;
    label: string;
    description: string;
    rows: FlexListRow[];
}

const PRESETS: Preset[] = [
    { key: 'flex-list-2col', label: '가변 리스트 (2컬럼)', description: '아이콘 + 텍스트 리스트', rows: PRESET_2COL },
    { key: 'flex-list-3col', label: '가변 리스트 (3컬럼)', description: '아이콘 + 텍스트 + 금액 리스트', rows: PRESET_3COL },
    { key: 'flex-list-text', label: '가변 리스트 (텍스트)', description: '라벨 + 값 텍스트 리스트', rows: PRESET_TEXT },
];

const VIEW_MODES = ['mobile', 'web', 'responsive'] as const;

const EXTRA_STYLES: Record<string, string> = {
    mobile: '',
    web: 'max-width:480px;margin:0 auto;',
    responsive: 'width:100%;box-sizing:border-box;',
};

interface Variant {
    id: string;
    html: string;
    viewMode: typeof VIEW_MODES[number];
    label: string;
    description: string;
    presetKey: string;
}

const VARIANTS: Variant[] = PRESETS.flatMap((preset) =>
    VIEW_MODES.map((viewMode) => ({
        id: `${preset.key}-${viewMode}`,
        html: buildFlexListHtml(preset.rows, `${preset.key}-${viewMode}`, EXTRA_STYLES[viewMode]),
        viewMode,
        label: preset.label,
        description: preset.description,
        presetKey: preset.key,
    })),
);

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
                    id:          variant.presetKey,
                    label:       variant.label,
                    description: variant.description,
                    preview:     '/assets/minimalist-blocks/preview/ibk-flex-list.svg',
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
                componentThumbnail: '/assets/minimalist-blocks/preview/ibk-flex-list.svg',
                data: {
                    id:          variant.presetKey,
                    label:       variant.label,
                    description: variant.description,
                    preview:     '/assets/minimalist-blocks/preview/ibk-flex-list.svg',
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
