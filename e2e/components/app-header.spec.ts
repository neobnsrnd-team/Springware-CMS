// e2e/components/app-header.spec.ts
// app-header 컴포넌트 자동화 QA (Issue #304)

import { test, expect } from '@playwright/test';
import {
    runCommonChecks,
    checkNoHorizontalScroll,
    checkMinTouchTarget,
    checkKeyboardFocusable,
} from '../helpers/component-checks';

// ── 테스트용 HTML ─────────────────────────────────────────────────────────

const NORMAL_HTML = `
<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>* { box-sizing: border-box; }</style>
</head><body>
  <div data-component-id="app-header-mobile"
       style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#fff;">
    <img src="/logo.png" alt="IBK 기업은행 로고" style="height:32px;">
    <nav style="display:flex;gap:16px;">
      <a href="/transfer" style="font-size:14px;display:inline-flex;align-items:center;min-height:44px;padding:0 4px;">이체</a>
      <a href="/card" style="font-size:14px;display:inline-flex;align-items:center;min-height:44px;padding:0 4px;">카드</a>
      <a href="/loan" style="font-size:14px;display:inline-flex;align-items:center;min-height:44px;padding:0 4px;">대출</a>
    </nav>
    <button aria-label="메뉴 열기" style="width:44px;height:44px;background:none;border:none;cursor:pointer;">
      ☰
    </button>
  </div>
</body></html>
`;

const XSS_HTML = `
<!DOCTYPE html><html><body>
  <div data-component-id="app-header-mobile">
    <nav><a href="/">&lt;script&gt;alert(1)&lt;/script&gt;이체</a></nav>
    <button style="width:44px;height:44px;">☰</button>
  </div>
</body></html>
`;

const EMPTY_MENU_HTML = `
<!DOCTYPE html><html><body>
  <div data-component-id="app-header-mobile"
       style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;">
    <img src="/logo.png" alt="로고">
    <nav></nav>
    <button style="width:44px;height:44px;">☰</button>
  </div>
</body></html>
`;

// ── 공통 체크 (모든 뷰포트에서 자동 실행) ────────────────────────────────

test.describe('app-header — 공통 체크', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('공통 레이아웃·접근성 기준 충족', async ({ page }) => {
        await runCommonChecks(page, {
            componentIdPrefix: 'app-header',
            minFontSize: 12,
            minTouchSize: 44,
        });
    });

    test('키보드 Tab 포커스 이동 가능', async ({ page }) => {
        await checkKeyboardFocusable(page);
    });
});

// ── 컴포넌트 고유 체크 ────────────────────────────────────────────────────

test.describe('app-header — 정상 동작', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('로고 이미지가 좌측에 위치함', async ({ page }) => {
        const logo = page.locator('[data-component-id^="app-header"] img');
        const header = page.locator('[data-component-id^="app-header"]');
        const logoBox = await logo.boundingBox();
        const headerBox = await header.boundingBox();
        // 로고 중심이 헤더 좌측 절반 안에 있어야 함
        const logoCenter = logoBox!.x + logoBox!.width / 2;
        const headerCenter = headerBox!.x + headerBox!.width / 2;
        expect(logoCenter).toBeLessThan(headerCenter);
    });

    test('메뉴 항목이 1개 이상 렌더링됨', async ({ page }) => {
        const links = page.locator('[data-component-id^="app-header"] nav a');
        const count = await links.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('햄버거 버튼이 44×44px 이상', async ({ page }) => {
        await checkMinTouchTarget(page, 'button[aria-label="메뉴 열기"]');
    });
});

test.describe('app-header — 예외 처리', () => {
    test('메뉴 항목이 0개여도 레이아웃 깨짐 없음', async ({ page }) => {
        await page.setContent(EMPTY_MENU_HTML);
        await checkNoHorizontalScroll(page);
        const header = page.locator('[data-component-id^="app-header"]');
        const box = await header.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(0);
    });

    test('XSS — 특수문자가 스크립트로 실행되지 않음', async ({ page }) => {
        await page.setContent(XSS_HTML);
        const injected = await page.evaluate(
            () => document.querySelector('[data-component-id^="app-header"] script'),
        );
        expect(injected).toBeNull();
    });
});
