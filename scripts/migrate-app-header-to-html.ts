// scripts/migrate-app-header-to-html.ts
// app-header 컴포넌트를 data-cb-type 플러그인 구조에서 순수 HTML로 변환
// DB SPW_CMS_COMPONENT의 app-header-mobile / web / responsive DATA.html 필드 업데이트
// 실행: npx tsx scripts/migrate-app-header-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

// IBK 기본 로고 SVG (data URI) — public/assets/plugins/app-header/index.js DEFAULT_LOGO_SRC 동일값
const DEFAULT_LOGO_SRC =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'%3E" +
    "%3Crect width='34' height='34' rx='6' fill='%230046A4'/%3E" +
    "%3Ctext x='17' y='23' text-anchor='middle' fill='white' font-size='10' font-weight='900' font-family='sans-serif'%3EIBK%3C/text%3E" +
    "%3C/svg%3E";

// 공통 폰트 패밀리 (style.css에서 추출)
const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// ── mobile variant ──────────────────────────────────────────────────────────
// 375px 기준 모바일 헤더: 54px 높이, 좌우 패딩 14px
const APP_HEADER_MOBILE_HTML =
    `<div data-spw-block style="font-family:${FONT_FAMILY};background:#ffffff;border-bottom:2.5px solid #0046A4;">` +
        `<div style="position:relative;display:flex;align-items:center;justify-content:center;height:54px;padding:0 14px;">` +
            `<a href="#" style="display:flex;align-items:center;gap:8px;text-decoration:none;">` +
                `<img src="${DEFAULT_LOGO_SRC}" alt="은행 로고" style="width:34px;height:34px;object-fit:contain;border-radius:6px;flex-shrink:0;display:block;">` +
                `<span style="font-size:17px;font-weight:800;color:#1A1A2E;letter-spacing:-0.4px;white-space:nowrap;line-height:1;">IBK기업은행</span>` +
            `</a>` +
        `</div>` +
    `</div>`;

// ── web variant ─────────────────────────────────────────────────────────────
// 데스크탑 기준: 60px 높이, 좌우 패딩 24px, 최대 너비 1200px 중앙 정렬
const APP_HEADER_WEB_HTML =
    `<div data-spw-block style="font-family:${FONT_FAMILY};background:#ffffff;border-bottom:2.5px solid #0046A4;">` +
        `<div style="position:relative;display:flex;align-items:center;justify-content:center;height:60px;padding:0 24px;max-width:1200px;margin:0 auto;">` +
            `<a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;">` +
                `<img src="${DEFAULT_LOGO_SRC}" alt="은행 로고" style="width:38px;height:38px;object-fit:contain;border-radius:6px;flex-shrink:0;display:block;">` +
                `<span style="font-size:18px;font-weight:800;color:#1A1A2E;letter-spacing:-0.4px;white-space:nowrap;line-height:1;">IBK기업은행</span>` +
            `</a>` +
        `</div>` +
    `</div>`;

// ── responsive variant ──────────────────────────────────────────────────────
// 모바일·웹 공용: 54px 높이, box-sizing border-box, 100% 너비
const APP_HEADER_RESPONSIVE_HTML =
    `<div data-spw-block style="font-family:${FONT_FAMILY};background:#ffffff;border-bottom:2.5px solid #0046A4;width:100%;box-sizing:border-box;">` +
        `<div style="position:relative;display:flex;align-items:center;justify-content:center;height:54px;padding:0 14px;">` +
            `<a href="#" style="display:flex;align-items:center;gap:8px;text-decoration:none;">` +
                `<img src="${DEFAULT_LOGO_SRC}" alt="은행 로고" style="width:34px;height:34px;object-fit:contain;border-radius:6px;flex-shrink:0;display:block;">` +
                `<span style="font-size:17px;font-weight:800;color:#1A1A2E;letter-spacing:-0.4px;white-space:nowrap;line-height:1;">IBK기업은행</span>` +
            `</a>` +
        `</div>` +
    `</div>`;

const VARIANTS: Array<{ id: string; html: string }> = [
    { id: 'app-header-mobile',     html: APP_HEADER_MOBILE_HTML },
    { id: 'app-header-web',        html: APP_HEADER_WEB_HTML },
    { id: 'app-header-responsive', html: APP_HEADER_RESPONSIVE_HTML },
];

async function main() {
    console.log('app-header 컴포넌트 순수 HTML 변환 마이그레이션 시작...\n');

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

        console.log(`✅ ${variant.id} — 순수 HTML 변환 완료`);
    }

    await closePool();
    console.log('\n마이그레이션 완료.');
}

main().catch((err) => {
    console.error('마이그레이션 실패:', err);
    process.exit(1);
});
