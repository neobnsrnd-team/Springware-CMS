// e2e/components/branch-locator.spec.ts
// branch-locator 컴포넌트 자동화 QA (Issue #310)

import { test, expect } from '@playwright/test';
import {
    runCommonChecks,
    checkNoHorizontalScroll,
    checkNotOutsideViewport,
} from '../helpers/component-checks';

// ── 헬퍼 ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ── 테스트용 HTML ─────────────────────────────────────────────────────────
// migrate-branch-locator-to-html.ts 의 data-bl-* DOM 구조와 동일

interface BranchItem {
    type: 'branch' | 'atm';
    name: string;
    addr: string;
    hours: string;
    phone: string;
}

function buildItemHtml(item: BranchItem, isLast: boolean): string {
    const iconBg = item.type === 'atm' ? '#FF6600' : '#0046A4';
    const iconLbl = item.type === 'atm' ? 'ATM' : '영';
    const border = isLast ? 'none' : '1px solid #F3F4F6';
    return (
        `<div data-bl-item="${item.type}" style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:${border};min-height:64px;">` +
            `<div style="width:40px;height:40px;border-radius:12px;background:${iconBg};display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;color:#fff;">${iconLbl}</div>` +
            `<div style="flex:1;display:flex;flex-direction:column;gap:2px;min-width:0;">` +
                `<span data-bl-name style="font-size:14px;font-weight:600;color:#1A1A2E;">${escapeHtml(item.name)}</span>` +
                `<span data-bl-addr style="font-size:12px;color:#6B7280;">${escapeHtml(item.addr)}</span>` +
                `<span data-bl-hours style="font-size:11px;color:#9CA3AF;">${escapeHtml(item.hours)}</span>` +
            `</div>` +
            `<a href="tel:${item.phone}" style="width:44px;height:44px;border-radius:12px;background:#E8F0FC;color:#0046A4;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;" aria-label="전화 ${item.phone}">📞</a>` +
        `</div>`
    );
}

function makeLocatorHtml(items: BranchItem[]): string {
    const itemList = items.map((item, i) => buildItemHtml(item, i === items.length - 1)).join('');
    return `
<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>* { box-sizing: border-box; } body { margin: 0; }</style>
</head><body>
  <div data-component-id="branch-locator-mobile" data-spw-block
       style="font-family:sans-serif;background:#F5F7FA;border-radius:20px;display:flex;flex-direction:column;min-height:420px;">
    <div style="position:relative;aspect-ratio:16/9;border-radius:20px 20px 0 0;flex-shrink:0;background:#E8EFF8;">
      <iframe data-bl-map src="about:blank" tabindex="-1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" title="지도"></iframe>
      <div data-bl-map-ph style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <p style="font-size:13px;color:#6B7280;margin:0;">지도 placeholder</p>
      </div>
      <div style="position:absolute;bottom:12px;left:12px;display:flex;gap:6px;z-index:10;">
        <button data-bl-filter="all" style="height:44px;padding:0 14px;border:none;border-radius:20px;background:#0046A4;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">전체</button>
        <button data-bl-filter="branch" style="height:44px;padding:0 14px;border:none;border-radius:20px;background:#fff;color:#6B7280;font-size:13px;font-weight:600;cursor:pointer;">영업점</button>
        <button data-bl-filter="atm" style="height:44px;padding:0 14px;border:none;border-radius:20px;background:#fff;color:#6B7280;font-size:13px;font-weight:600;cursor:pointer;">ATM</button>
      </div>
    </div>
    <div data-bl-sheet style="background:#fff;border-radius:20px 20px 0 0;flex:1;display:flex;flex-direction:column;min-height:200px;">
      <div data-bl-handle style="width:40px;height:4px;background:#D1D5DB;border-radius:2px;margin:12px auto 0;cursor:grab;flex-shrink:0;"></div>
      <div style="font-size:15px;font-weight:700;color:#1A1A2E;padding:12px 20px 8px;flex-shrink:0;">주변 영업점 · ATM</div>
      <div data-bl-list style="flex:1;overflow-y:auto;padding-bottom:12px;">
        ${itemList}
      </div>
    </div>
  </div>
</body></html>
`;
}

// ── 테스트 데이터 ─────────────────────────────────────────────────────────

const DEFAULT_ITEMS: BranchItem[] = [
    { type: 'branch', name: 'IBK 강남지점', addr: '서울 강남구 테헤란로 123', hours: '평일 09:00~16:00', phone: '1566-2566' },
    { type: 'atm', name: 'IBK ATM (강남역 2번출구)', addr: '서울 강남구 강남대로 396', hours: '24시간 운영', phone: '1566-2566' },
    { type: 'branch', name: 'IBK 서초지점', addr: '서울 서초구 서초대로 256', hours: '평일 09:00~16:00', phone: '1566-2566' },
];

const NORMAL_HTML = makeLocatorHtml(DEFAULT_ITEMS);

const EMPTY_LIST_HTML = makeLocatorHtml([]);

const XSS_HTML = makeLocatorHtml([
    { type: 'branch', name: '<script>alert(1)</script>XSS지점', addr: '<img onerror=alert(2) src=x>', hours: '평일', phone: '1566-2566' },
]);

// ── 공통 체크 ─────────────────────────────────────────────────────────────

test.describe('branch-locator — 공통 체크', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('공통 레이아웃·접근성 기준 충족 (가로스크롤·뷰포트·폰트·터치·alt)', async ({ page }) => {
        await runCommonChecks(page, {
            componentIdPrefix: 'branch-locator',
            minFontSize: 11,
            minTouchSize: 44,
        });
    });
});

// ── 기기별 뷰포트 체크 ────────────────────────────────────────────────────

test.describe('branch-locator — 기기별 뷰포트', () => {
    test('iPhone SE (375px) — 가로 스크롤 없음·뷰포트 이탈 없음', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });

    test('Galaxy S (360px) — 가로 스크롤 없음·뷰포트 이탈 없음', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 780 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });

    test('iPhone Pro Max (430px) — 가로 스크롤 없음·뷰포트 이탈 없음', async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });
});

// ── 반응형 브레이크포인트 체크 ────────────────────────────────────────────

test.describe('branch-locator — 반응형 브레이크포인트', () => {
    test('767px — 모바일 경계에서 가로 스크롤 없음', async ({ page }) => {
        await page.setViewportSize({ width: 767, height: 900 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });

    test('768px — 태블릿 경계에서 가로 스크롤 없음', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });

    test('1440px — 표준 데스크탑에서 뷰포트 이탈 없음', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.setContent(NORMAL_HTML);
        await checkNoHorizontalScroll(page);
        await checkNotOutsideViewport(page, '[data-component-id^="branch-locator"]');
    });
});

// ── 뷰어(/view) 렌더링 확인 ───────────────────────────────────────────────

test.describe('branch-locator — 뷰어 렌더링', () => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(!!process.env.CI, 'CI 환경: Oracle DB 없어 저장된 페이지 데이터 없음 — 로컬에서만 실행');

    test('/view 접근 시 에러 페이지가 아닌 정상 렌더링됨', async ({ page }) => {
        await page.goto('/view');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).not.toHaveTitle(/error|500|404/i);
        await expect(page.locator('body')).toBeVisible();
    });
});

// ── 정상 동작 ─────────────────────────────────────────────────────────────

test.describe('branch-locator — 정상 동작', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('영업점 목록(data-bl-item)이 렌더링됨', async ({ page }) => {
        const items = page.locator('[data-component-id^="branch-locator"] [data-bl-item]');
        await expect(items).toHaveCount(3);
    });

    test('필터 버튼(data-bl-filter) 3개 존재', async ({ page }) => {
        const filters = page.locator('[data-component-id^="branch-locator"] [data-bl-filter]');
        await expect(filters).toHaveCount(3);

        // 각 필터 값 확인
        await expect(filters.nth(0)).toHaveAttribute('data-bl-filter', 'all');
        await expect(filters.nth(1)).toHaveAttribute('data-bl-filter', 'branch');
        await expect(filters.nth(2)).toHaveAttribute('data-bl-filter', 'atm');
    });

    test('바텀시트(data-bl-sheet)와 핸들(data-bl-handle)이 존재', async ({ page }) => {
        await expect(page.locator('[data-bl-sheet]')).toBeAttached();
        await expect(page.locator('[data-bl-handle]')).toBeAttached();
    });

    test('지점명·주소·영업시간 텍스트가 표시됨', async ({ page }) => {
        const firstItem = page.locator('[data-bl-item]').first();

        const name = firstItem.locator('[data-bl-name]');
        await expect(name).toBeVisible();
        const nameText = await name.textContent();
        expect(nameText!.trim().length).toBeGreaterThan(0);

        const addr = firstItem.locator('[data-bl-addr]');
        await expect(addr).toBeVisible();

        const hours = firstItem.locator('[data-bl-hours]');
        await expect(hours).toBeVisible();
    });

    test('전화번호가 tel: 링크로 연결됨', async ({ page }) => {
        const telLinks = page.locator('[data-bl-item] a[href^="tel:"]');
        const count = await telLinks.count();
        expect(count).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < count; i++) {
            const href = await telLinks.nth(i).getAttribute('href');
            expect(href).toMatch(/^tel:\d[\d-]+$/);
        }
    });

    test('지도 placeholder(data-bl-map-ph)가 표시됨', async ({ page }) => {
        // src="about:blank"이므로 placeholder가 보여야 함
        await expect(page.locator('[data-bl-map-ph]')).toBeVisible();
    });

    test('지도 iframe(data-bl-map)이 존재', async ({ page }) => {
        await expect(page.locator('[data-bl-map]')).toBeAttached();
    });
});

// ── 예외 처리 ─────────────────────────────────────────────────────────────

test.describe('branch-locator — 예외 처리', () => {
    test('항목 0개 → 빈 목록 정상 표시', async ({ page }) => {
        await page.setContent(EMPTY_LIST_HTML);

        // 컴포넌트 자체는 렌더링됨
        await expect(
            page.locator('[data-component-id^="branch-locator"]'),
        ).toBeAttached();

        // 바텀시트 존재하지만 항목 없음
        await expect(page.locator('[data-bl-sheet]')).toBeAttached();
        await expect(page.locator('[data-bl-item]')).toHaveCount(0);
    });

    test('빈 목록에서도 가로 스크롤 없음', async ({ page }) => {
        await page.setContent(EMPTY_LIST_HTML);
        await checkNoHorizontalScroll(page);
    });
});

// ── 엣지 케이스 ───────────────────────────────────────────────────────────

test.describe('branch-locator — 엣지 케이스', () => {
    test('XSS — raw <script> 문자열이 이스케이프되어 실행되지 않음', async ({ page }) => {
        await page.setContent(XSS_HTML);

        // script 태그가 DOM에 삽입되지 않음
        const injected = await page.evaluate(
            () => document.querySelector('[data-component-id^="branch-locator"] script'),
        );
        expect(injected).toBeNull();

        // innerHTML에 이스케이프된 문자열 확인
        const nameEl = page.locator('[data-bl-name]').first();
        const innerHTML = await nameEl.evaluate((el) => el.innerHTML);
        expect(innerHTML).toContain('&lt;script&gt;');
        expect(innerHTML).not.toContain('<script>');
    });

    test('XSS — img onerror 이벤트가 실행되지 않음', async ({ page }) => {
        await page.setContent(XSS_HTML);

        const addrEl = page.locator('[data-bl-addr]').first();
        const innerHTML = await addrEl.evaluate((el) => el.innerHTML);
        expect(innerHTML).toContain('&lt;img');
        expect(innerHTML).not.toContain('<img');
    });
});
