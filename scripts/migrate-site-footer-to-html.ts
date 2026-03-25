// scripts/migrate-site-footer-to-html.ts
// site-footer 컴포넌트 순수 HTML 변환 + data-component-id 적용 (Issue #4 + #10)
// DB SPW_CMS_COMPONENT의 site-footer-mobile / web / responsive DATA.html 필드 업데이트
// 실행: npx tsx scripts/migrate-site-footer-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

// select 드롭다운 화살표 (style.css 원본 data URI)
const SELECT_ARROW_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat right 8px center";

function buildInner(innerPadding: string): string {
    return (
        `<div style="padding:${innerPadding};">` +
            // 링크 목록
            `<div style="display:flex;flex-wrap:wrap;gap:0;margin-bottom:10px;line-height:1.8;">` +
                `<a href="#" style="font-size:11px;color:#111827;text-decoration:none;white-space:nowrap;font-weight:700;">이용약관</a>` +
                `<span style="font-size:11px;color:#D1D5DB;padding:0 5px;">|</span>` +
                `<a href="#" style="font-size:11px;color:#111827;text-decoration:none;white-space:nowrap;font-weight:700;">개인정보처리방침</a>` +
                `<span style="font-size:11px;color:#D1D5DB;padding:0 5px;">|</span>` +
                `<a href="#" style="font-size:11px;color:#374151;text-decoration:none;white-space:nowrap;">신용정보처리방침</a>` +
                `<span style="font-size:11px;color:#D1D5DB;padding:0 5px;">|</span>` +
                `<a href="#" style="font-size:11px;color:#374151;text-decoration:none;white-space:nowrap;">금융소비자보호</a>` +
                `<span style="font-size:11px;color:#D1D5DB;padding:0 5px;">|</span>` +
                `<a href="#" style="font-size:11px;color:#374151;text-decoration:none;white-space:nowrap;">윤리경영</a>` +
                `<span style="font-size:11px;color:#D1D5DB;padding:0 5px;">|</span>` +
                `<a href="#" style="font-size:11px;color:#374151;text-decoration:none;white-space:nowrap;">사이트맵</a>` +
            `</div>` +
            // 연락처
            `<div style="font-size:11px;color:#374151;margin-bottom:6px;line-height:1.6;">` +
                `고객센터 : 0000-0000 (평일 09:00~18:00) | 인터넷뱅킹 : 0000-0000` +
            `</div>` +
            // 저작권
            `<div style="font-size:11px;color:#6B7280;margin-bottom:14px;line-height:1.5;">` +
                `[금융사명] [주소] | 대표이사 : [대표이사명]<br>` +
                `사업자등록번호 : 000-00-00000 | Copyright [금융사명]. All rights reserved.` +
            `</div>` +
            // 하단 바
            `<div style="display:flex;align-items:center;gap:8px;">` +
                `<div style="display:flex;gap:6px;flex:1;">` +
                    `<select style="flex:1;padding:7px 10px;border:1px solid #E5E7EB;border-radius:4px;font-size:11px;color:#374151;background:#fff ${SELECT_ARROW_URI};-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;">` +
                        `<option>계열사 바로가기</option>` +
                        `<option>계열사1</option>` +
                        `<option>계열사2</option>` +
                        `<option>계열사3</option>` +
                    `</select>` +
                    `<select style="flex:1;padding:7px 10px;border:1px solid #E5E7EB;border-radius:4px;font-size:11px;color:#374151;background:#fff ${SELECT_ARROW_URI};-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;">` +
                        `<option>패밀리사이트</option>` +
                        `<option>패밀리사이트1</option>` +
                        `<option>패밀리사이트2</option>` +
                    `</select>` +
                `</div>` +
                `<a href="#" style="width:36px;height:36px;border-radius:50%;background:#fff;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;text-decoration:none;color:#6B7280;flex-shrink:0;">` +
                    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 15l-6-6-6 6"/></svg>` +
                `</a>` +
            `</div>` +
        `</div>`
    );
}

// ── mobile variant ──────────────────────────────────────────────────────────
const SITE_FOOTER_MOBILE_HTML =
    `<div data-component-id="site-footer-mobile" data-spw-block style="font-family:${FONT_FAMILY};background:#F9FAFB;">` +
        buildInner('16px 16px 20px') +
    `</div>`;

// ── web variant ─────────────────────────────────────────────────────────────
const SITE_FOOTER_WEB_HTML =
    `<div data-component-id="site-footer-web" data-spw-block style="font-family:${FONT_FAMILY};background:#F9FAFB;">` +
        `<div style="max-width:1200px;margin:0 auto;">` +
            buildInner('24px 32px 28px') +
        `</div>` +
    `</div>`;

// ── responsive variant ──────────────────────────────────────────────────────
const SITE_FOOTER_RESPONSIVE_HTML =
    `<div data-component-id="site-footer-responsive" data-spw-block style="font-family:${FONT_FAMILY};background:#F9FAFB;width:100%;box-sizing:border-box;">` +
        buildInner('16px 16px 20px') +
    `</div>`;

const VARIANTS = [
    { id: 'site-footer-mobile',     html: SITE_FOOTER_MOBILE_HTML },
    { id: 'site-footer-web',        html: SITE_FOOTER_WEB_HTML },
    { id: 'site-footer-responsive', html: SITE_FOOTER_RESPONSIVE_HTML },
];

async function main() {
    for (const variant of VARIANTS) {
        const existing = await getComponentById(variant.id);
        if (!existing) {
            console.error(`❌ ${variant.id} — 찾을 수 없음`);
            continue;
        }
        await updateComponent({
            componentId:        variant.id,
            componentType:      existing.COMPONENT_TYPE,
            viewMode:           existing.VIEW_MODE,
            componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
            data: { ...(existing.DATA ?? {}) as Record<string, unknown>, html: variant.html },
            lastModifierId: 'system',
        });
        console.log(`✅ ${variant.id} 완료`);
    }
    await closePool();
}

main().catch((err) => { console.error('실패:', err); process.exit(1); });
