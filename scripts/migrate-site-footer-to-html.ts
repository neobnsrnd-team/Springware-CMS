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

// SNS 아이콘 SVG (fill="white")
const SNS_ICONS: Record<string, { cls: string; bg: string; svg: string }> = {
    youtube: {
        cls: 'sf-yt',
        bg: '#FF0000',
        svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M23 7s-.3-2-1.2-2.7c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.1c-.6 0-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.2v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.7c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.4 12 21.5 12 21.5s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.7 1.2-2.7 1.2-2.7s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l6.6 3.6-6.6 3.5z"/></svg>',
    },
    facebook: {
        cls: 'sf-fb',
        bg: '#1877F2',
        svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
    },
    instagram: {
        cls: 'sf-ig',
        bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)',
        svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.3 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9C23.8 2.7 21.4.3 17 .1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>',
    },
    blog: {
        cls: 'sf-blog',
        bg: '#03C75A',
        svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>',
    },
};

function buildSnsIcon(key: keyof typeof SNS_ICONS, href = '#'): string {
    const icon = SNS_ICONS[key];
    return (
        `<a href="${href}" style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;background:${icon.bg};">` +
            icon.svg +
        `</a>`
    );
}

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
                `고객센터 : 1566-2566 (평일 09:00~18:00) | 인터넷뱅킹 : 1544-1522` +
            `</div>` +
            // 저작권
            `<div style="font-size:11px;color:#6B7280;margin-bottom:14px;line-height:1.5;">` +
                `IBK기업은행 서울특별시 중구 을지로 79 (을지로2가) | 대표이사 : 김성태<br>` +
                `사업자등록번호 : 104-81-12809 | Copyright IBK Industrial Bank of Korea. All rights reserved.` +
            `</div>` +
            // 하단 바
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">` +
                `<div style="display:flex;gap:6px;flex:1;">` +
                    `<select style="flex:1;padding:7px 10px;border:1px solid #E5E7EB;border-radius:4px;font-size:11px;color:#374151;background:#fff ${SELECT_ARROW_URI};-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;">` +
                        `<option>계열사 바로가기</option>` +
                        `<option>IBK투자증권</option>` +
                        `<option>IBK캐피탈</option>` +
                        `<option>IBK저축은행</option>` +
                    `</select>` +
                    `<select style="flex:1;padding:7px 10px;border:1px solid #E5E7EB;border-radius:4px;font-size:11px;color:#374151;background:#fff ${SELECT_ARROW_URI};-webkit-appearance:none;appearance:none;cursor:pointer;font-family:inherit;">` +
                        `<option>패밀리사이트</option>` +
                        `<option>IBK창공</option>` +
                        `<option>IBK나눔재단</option>` +
                    `</select>` +
                `</div>` +
                `<a href="#" style="width:36px;height:36px;border-radius:50%;background:#fff;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;text-decoration:none;color:#6B7280;flex-shrink:0;">` +
                    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 15l-6-6-6 6"/></svg>` +
                `</a>` +
            `</div>` +
            // SNS 아이콘
            `<div style="display:flex;align-items:center;gap:8px;padding-top:2px;">` +
                buildSnsIcon('youtube') +
                buildSnsIcon('facebook') +
                buildSnsIcon('instagram') +
                buildSnsIcon('blog') +
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
