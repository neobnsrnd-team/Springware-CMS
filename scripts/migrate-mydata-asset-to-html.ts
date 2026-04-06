// scripts/migrate-mydata-asset-to-html.ts
// 마이데이터 자산 요약 컴포넌트 DB 등록 (Issue #288)

import 'dotenv/config';
import { getComponentById, updateComponent, createComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const FONT = "-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif";
const THUMBNAIL = '/assets/minimalist-blocks/preview/ibk-mydata-asset.svg';

// ── 공통 내부 HTML ─────────────────────────────────────────────────────────

function buildInner(): string {
    // 초기 conic-gradient: 예금·적금(59%) #0046A4 / 투자(28%) #10B981 / 연금(13%) #F59E0B / 대출(10%) #EF4444
    // 비율 합계: 자산 절댓값 기준 (25M+12M+5.5M+5M = 47.5M)
    const donutStyle =
        'width:96px;height:96px;border-radius:50%;' +
        'background:conic-gradient(#0046A4 0% 52.6%,#10B981 52.6% 77.9%,#F59E0B 77.9% 89.5%,#EF4444 89.5% 100%);' +
        'position:relative;flex-shrink:0;';

    return (
        // 헤더
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px 10px;">` +
            `<span data-ma-title style="font-size:15px;font-weight:700;color:#1A1A2E;">내 자산 현황</span>` +
            `<span data-ma-date data-ma-date-visible="true" style="padding:2px 10px;border-radius:4px;background:#E8F0FC;color:#0046A4;font-size:12px;font-weight:600;">2024.04.06</span>` +
        `</div>` +

        // 도넛 + 총자산
        `<div style="display:flex;align-items:center;gap:20px;padding:6px 16px 14px;">` +
            // 도넛 차트
            `<div data-ma-chart style="${donutStyle}">` +
                `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">` +
                    `<div style="width:60px;height:60px;border-radius:50%;background:#ffffff;"></div>` +
                `</div>` +
            `</div>` +
            // 총자산 + 범례
            `<div style="flex:1;min-width:0;">` +
                `<div style="margin-bottom:8px;">` +
                    `<span style="font-size:12px;color:#6B7280;">총 자산</span><br/>` +
                    `<span data-ma-total style="font-size:16px;font-weight:700;color:#1A1A2E;">42,500,000 원</span>` +
                `</div>` +
                // 범례 (자동 생성됨 — 에디터 적용 시 재생성)
                `<div data-ma-legend style="display:flex;flex-wrap:wrap;gap:4px 12px;">` +
                    `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6B7280;"><span style="width:8px;height:8px;border-radius:2px;background:#0046A4;flex-shrink:0;display:inline-block;"></span>예금·적금 53%</span>` +
                    `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6B7280;"><span style="width:8px;height:8px;border-radius:2px;background:#10B981;flex-shrink:0;display:inline-block;"></span>투자 25%</span>` +
                    `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6B7280;"><span style="width:8px;height:8px;border-radius:2px;background:#F59E0B;flex-shrink:0;display:inline-block;"></span>연금 12%</span>` +
                    `<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:#6B7280;"><span style="width:8px;height:8px;border-radius:2px;background:#EF4444;flex-shrink:0;display:inline-block;"></span>대출 11%</span>` +
                `</div>` +
            `</div>` +
        `</div>` +

        // 항목 목록
        `<div data-ma-rows style="padding:0 16px;">` +
            // 자산 항목
            `<div data-ma-row data-ma-row-type="asset" style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F3F4F6;">` +
                `<span style="display:flex;align-items:center;gap:6px;">` +
                    `<span data-ma-dot style="width:8px;height:8px;border-radius:50%;background:#0046A4;flex-shrink:0;display:inline-block;" data-ma-dot-color="#0046A4"></span>` +
                    `<span data-ma-label style="font-size:14px;color:#6B7280;">예금·적금</span>` +
                `</span>` +
                `<span style="display:flex;align-items:center;gap:8px;">` +
                    `<span data-ma-amount data-ma-amount-color="#1A1A2E" style="font-size:14px;font-weight:600;color:#1A1A2E;">25,000,000 원</span>` +
                    `<span data-ma-pct style="font-size:12px;color:#9CA3AF;min-width:32px;text-align:right;">53%</span>` +
                `</span>` +
            `</div>` +
            `<div data-ma-row data-ma-row-type="asset" style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F3F4F6;">` +
                `<span style="display:flex;align-items:center;gap:6px;">` +
                    `<span data-ma-dot style="width:8px;height:8px;border-radius:50%;background:#10B981;flex-shrink:0;display:inline-block;" data-ma-dot-color="#10B981"></span>` +
                    `<span data-ma-label style="font-size:14px;color:#6B7280;">투자</span>` +
                `</span>` +
                `<span style="display:flex;align-items:center;gap:8px;">` +
                    `<span data-ma-amount data-ma-amount-color="#1A1A2E" style="font-size:14px;font-weight:600;color:#1A1A2E;">12,000,000 원</span>` +
                    `<span data-ma-pct style="font-size:12px;color:#9CA3AF;min-width:32px;text-align:right;">25%</span>` +
                `</span>` +
            `</div>` +
            `<div data-ma-row data-ma-row-type="asset" style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F3F4F6;">` +
                `<span style="display:flex;align-items:center;gap:6px;">` +
                    `<span data-ma-dot style="width:8px;height:8px;border-radius:50%;background:#F59E0B;flex-shrink:0;display:inline-block;" data-ma-dot-color="#F59E0B"></span>` +
                    `<span data-ma-label style="font-size:14px;color:#6B7280;">연금</span>` +
                `</span>` +
                `<span style="display:flex;align-items:center;gap:8px;">` +
                    `<span data-ma-amount data-ma-amount-color="#1A1A2E" style="font-size:14px;font-weight:600;color:#1A1A2E;">5,500,000 원</span>` +
                    `<span data-ma-pct style="font-size:12px;color:#9CA3AF;min-width:32px;text-align:right;">12%</span>` +
                `</span>` +
            `</div>` +
            // 부채 항목
            `<div data-ma-row data-ma-row-type="debt" style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;">` +
                `<span style="display:flex;align-items:center;gap:6px;">` +
                    `<span data-ma-dot style="width:8px;height:8px;border-radius:50%;background:#EF4444;flex-shrink:0;display:inline-block;" data-ma-dot-color="#EF4444"></span>` +
                    `<span data-ma-label style="font-size:14px;color:#6B7280;">대출</span>` +
                `</span>` +
                `<span style="display:flex;align-items:center;gap:8px;">` +
                    `<span data-ma-amount data-ma-amount-color="#EF4444" style="font-size:14px;font-weight:600;color:#EF4444;">-5,000,000 원</span>` +
                    `<span data-ma-pct style="font-size:12px;color:#9CA3AF;min-width:32px;text-align:right;">11%</span>` +
                `</span>` +
            `</div>` +
        `</div>` +

        // 구분선 + 순자산
        `<div style="margin:0 16px;border-top:1px solid #F3F4F6;padding:10px 0;display:flex;justify-content:space-between;align-items:center;">` +
            `<span style="font-size:13px;font-weight:600;color:#1A1A2E;">순자산</span>` +
            `<span data-ma-net style="font-size:14px;font-weight:700;color:#0046A4;">37,500,000 원</span>` +
        `</div>` +

        // 버튼
        `<div style="padding:4px 16px 16px;">` +
            `<a data-ma-btn href="#" style="display:block;text-align:center;padding:11px 0;border-radius:8px;background:#0046A4;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">자산 상세 보기</a>` +
        `</div>`
    );
}

// ── variant HTML ──────────────────────────────────────────────────────────

const MOBILE_HTML =
    `<div data-component-id="mydata-asset-mobile" data-spw-block style="font-family:${FONT};background:#ffffff;border-radius:12px;margin:0 16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">${buildInner()}</div>`;

const WEB_HTML =
    `<div data-component-id="mydata-asset-web" data-spw-block style="font-family:${FONT};background:#ffffff;border-radius:12px;max-width:480px;margin:0 auto;box-shadow:0 1px 4px rgba(0,0,0,0.08);">${buildInner()}</div>`;

const RESPONSIVE_HTML =
    `<div data-component-id="mydata-asset-responsive" data-spw-block style="font-family:${FONT};background:#ffffff;border-radius:12px;width:100%;box-sizing:border-box;box-shadow:0 1px 4px rgba(0,0,0,0.08);">${buildInner()}</div>`;

const VARIANTS = [
    { id: 'mydata-asset-mobile',     html: MOBILE_HTML,     viewMode: 'mobile'     as const },
    { id: 'mydata-asset-web',        html: WEB_HTML,        viewMode: 'web'        as const },
    { id: 'mydata-asset-responsive', html: RESPONSIVE_HTML, viewMode: 'responsive' as const },
];

// ── 실행 ──────────────────────────────────────────────────────────────────

async function main() {
    for (const v of VARIANTS) {
        const existing = await getComponentById(v.id);
        if (existing) {
            await updateComponent({
                componentId:        v.id,
                componentType:      existing.COMPONENT_TYPE,
                viewMode:           existing.VIEW_MODE,
                componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
                data: { ...((existing.DATA ?? {}) as Record<string, unknown>), html: v.html },
                lastModifierId: 'system',
            });
            process.stdout.write(`[업데이트] ${v.id}\n`);
        } else {
            await createComponent({
                componentId:        v.id,
                componentType:      'finance',
                viewMode:           v.viewMode,
                componentThumbnail: THUMBNAIL,
                data: {
                    id:          v.id.replace(`-${v.viewMode}`, ''),
                    label:       '마이데이터 자산 요약',
                    description: '도넛 차트·자산/부채 항목·순자산 편집 가능한 마이데이터 자산 요약 카드',
                    preview:     THUMBNAIL,
                    html:        v.html,
                    viewMode:    v.viewMode,
                },
                createUserId:   'system',
                createUserName: '시스템',
            });
            process.stdout.write(`[생성] ${v.id}\n`);
        }
    }

    await closePool();
    process.stdout.write('완료\n');
}

main().catch((err: unknown) => {
    process.stderr.write(`실패: ${err}\n`);
    process.exit(1);
});
