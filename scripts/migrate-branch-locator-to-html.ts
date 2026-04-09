// scripts/migrate-branch-locator-to-html.ts
// branch-locator 컴포넌트 플러그인 → 순수 HTML 변환
// 지도 영역: iframe src="" placeholder (편집 패널에서 URL 입력)
// 필터/바텀시트: 인라인 스크립트 (뷰어 전용, window.builderRuntime 감지로 에디터 스킵)
// 실행: npx tsx scripts/migrate-branch-locator-to-html.ts

import 'dotenv/config';
import { getComponentById, updateComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT_FAMILY = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

const PHONE_SVG =
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">` +
        `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/>` +
    `</svg>`;

const SEARCH_SVG =
    `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">` +
        `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>` +
    `</svg>`;

interface BranchItem {
    type: 'branch' | 'atm';
    name: string;
    addr: string;
    hours: string;
    phone: string;
}

const DEFAULT_ITEMS: BranchItem[] = [
    { type: 'branch', name: '[금융사명] 강남지점',           addr: '서울 강남구 테헤란로 123',  hours: '평일 09:00~16:00', phone: '1566-2566' },
    { type: 'atm',    name: '[금융사명] ATM (강남역 2번출구)', addr: '서울 강남구 강남대로 396', hours: '24시간 운영',       phone: '1566-2566' },
];

function buildBranchItem(item: BranchItem, isLast: boolean): string {
    const iconBg  = item.type === 'atm' ? '#FF6600' : '#0046A4';
    const iconFs  = item.type === 'atm' ? '10px'    : '14px';
    const iconLbl = item.type === 'atm' ? 'ATM'     : '영';
    const border  = isLast ? 'none' : '1px solid #F3F4F6';
    return (
        `<div data-bl-item="${item.type}" style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:${border};min-height:64px;">` +
            `<div style="width:40px;height:40px;border-radius:12px;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:${iconFs};font-weight:800;letter-spacing:-0.5px;flex-shrink:0;color:#fff;">${iconLbl}</div>` +
            `<div style="flex:1;display:flex;flex-direction:column;gap:2px;min-width:0;">` +
                `<span data-bl-name style="font-size:14px;font-weight:600;color:#1A1A2E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</span>` +
                `<span data-bl-addr style="font-size:12px;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.addr}</span>` +
                `<span data-bl-hours style="font-size:11px;color:#9CA3AF;">${item.hours}</span>` +
            `</div>` +
            `<a href="tel:${item.phone}" style="width:44px;height:44px;border-radius:12px;background:#E8F0FC;color:#0046A4;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;">${PHONE_SVG}</a>` +
        `</div>`
    );
}

// 뷰어 전용 스크립트 — ViewClient.tsx에서 직접 처리
// 인라인 <script> 방식은 dangerouslySetInnerHTML 환경에서 파싱 에러를 유발하므로
// ViewClient에서 DOM 조작으로 동일한 로직을 실행합니다.

function buildHtml(componentId: string, extraStyle: string): string {
    const itemList = DEFAULT_ITEMS.map((item, i) => buildBranchItem(item, i === DEFAULT_ITEMS.length - 1)).join('');
    return (
        `<div data-component-id="${componentId}" data-spw-block style="font-family:${FONT_FAMILY};background:#F5F7FA;border-radius:20px;display:flex;flex-direction:column;min-height:420px;${extraStyle}">` +
            // ── 지도 영역 ──
            `<div style="position:relative;aspect-ratio:16/9;border-radius:20px 20px 0 0;flex-shrink:0;background:#E8EFF8;">` +
                // iframe: src="" 초기값, 편집 패널에서 지도 embed URL 입력
                `<iframe data-bl-map src="about:blank" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:20px 20px 0 0;" title="지도" allowfullscreen=""></iframe>` +
                // 플레이스홀더 (src 비어있을 때 표시)
                `<div data-bl-map-ph style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(160deg,#E8F0FC 0%,#D1E3F8 100%);">` +
                    `<span style="font-size:40px;">📍</span>` +
                    `<p style="font-size:13px;color:#6B7280;margin:0;font-weight:500;">블록을 클릭하면 지점 편집 패널이 열립니다</p>` +
                    `<p style="font-size:11px;color:#9CA3AF;margin:0;">Google Maps / Kakao 지도 embed URL을 입력하세요</p>` +
                `</div>` +
                // 검색바 (시각 요소)
                `<div style="position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;z-index:10;">` +
                    `<div style="flex:1;height:44px;border-radius:12px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.1);display:flex;align-items:center;padding:0 14px;">` +
                        `<span style="font-size:14px;color:#9CA3AF;">지역 또는 지점명 검색</span>` +
                    `</div>` +
                    `<div style="width:44px;height:44px;background:#0046A4;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 12px rgba(0,70,164,0.3);">${SEARCH_SVG}</div>` +
                `</div>` +
                // 필터 버튼
                `<div style="position:absolute;bottom:12px;left:12px;display:flex;gap:6px;z-index:10;">` +
                    `<button data-bl-filter="all" style="height:32px;padding:0 14px;border:none;border-radius:20px;background:#0046A4;color:#fff;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);">전체</button>` +
                    `<button data-bl-filter="branch" style="height:32px;padding:0 14px;border:none;border-radius:20px;background:#fff;color:#6B7280;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);">영업점</button>` +
                    `<button data-bl-filter="atm" style="height:32px;padding:0 14px;border:none;border-radius:20px;background:#fff;color:#6B7280;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.1);">ATM</button>` +
                `</div>` +
            `</div>` +
            // ── 바텀 시트 ──
            `<div data-bl-sheet style="background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,0.08);flex:1;display:flex;flex-direction:column;min-height:200px;">` +
                `<div data-bl-handle style="width:40px;height:4px;background:#D1D5DB;border-radius:2px;margin:12px auto 0;cursor:grab;flex-shrink:0;"></div>` +
                `<div style="font-size:15px;font-weight:700;color:#1A1A2E;padding:12px 20px 8px;flex-shrink:0;">주변 영업점 · ATM</div>` +
                `<div data-bl-list style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:12px;">${itemList}</div>` +
            `</div>` +
        `</div>`
    );
}

const VARIANTS = [
    { id: 'branch-locator-mobile',     html: buildHtml('branch-locator-mobile',     '') },
    { id: 'branch-locator-web',        html: buildHtml('branch-locator-web',        'width:100%;box-sizing:border-box;') },
    { id: 'branch-locator-responsive', html: buildHtml('branch-locator-responsive', 'width:100%;box-sizing:border-box;') },
];

async function main() {
    console.log('branch-locator 순수 HTML 변환 마이그레이션 시작...\n');

    for (const variant of VARIANTS) {
        const existing = await getComponentById(variant.id);
        if (!existing) {
            console.error(`❌ ${variant.id} — DB에서 찾을 수 없습니다. 건너뜁니다.`);
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
        console.log(`✅ ${variant.id} — 완료`);
    }

    await closePool();
    console.log('\n마이그레이션 완료.');
}

main().catch((err) => { console.error('마이그레이션 실패:', err); process.exit(1); });
