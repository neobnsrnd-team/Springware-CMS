// e2e/pages/editor.spec.ts
// 에디터 페이지 E2E 테스트 — 금융 컴포넌트 미리보기 검증 (Issue #295)

import { test, expect } from '@playwright/test';
import { LABEL } from '../fixtures/locale';

test.describe('에디터 페이지 — 기본 UI', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/edit');
        // ContentBuilder 초기화 대기
        await page.waitForLoadState('networkidle');
    });

    test('에디터 캔버스 로드 확인', async ({ page }) => {
        // 에디터 body 렌더링 확인
        await expect(page.locator('body')).toBeVisible();
        // 에러 없이 로드됐는지 확인
        await expect(page).not.toHaveTitle(/error|500|404/i);
    });

    test('하단 액션 버튼 표시 확인', async ({ page }) => {
        // Save / Preview / HTML 버튼 확인
        await expect(page.getByRole('button', { name: LABEL.editor.save })).toBeVisible();
        await expect(page.getByRole('button', { name: LABEL.editor.preview })).toBeVisible();
        await expect(page.getByRole('button', { name: LABEL.editor.html })).toBeVisible();
    });
});

test.describe('뷰어 페이지 — 금융 컴포넌트 렌더링', () => {
    // 이벤트 배너 컴포넌트 HTML (뷰어에서 렌더링 검증용)
    const EVENT_BANNER_HTML = `
        <div data-component-id="event-banner-mobile" data-spw-block data-banner-interval="3000"
             data-banner-slides="[]"
             style="font-family:sans-serif;background:#ffffff;">
            <div data-banner-track style="display:flex;flex-direction:column;"></div>
            <div data-banner-pagination style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 0;">
                <button data-banner-prev>&#10094;</button>
                <span data-banner-indicator>1 / 1</span>
                <button data-banner-next>&#10095;</button>
                <button data-banner-pause>&#10073;&#10073;</button>
            </div>
        </div>
    `;

    test('이벤트 배너 — 페이지네이션 요소 렌더링 확인', async ({ page }) => {
        // 뷰어 API mock — 이벤트 배너 HTML 주입
        await page.route('/api/builder/load', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, content: EVENT_BANNER_HTML }),
            });
        });

        await page.goto('/view');
        await page.waitForLoadState('networkidle');

        // 페이지네이션 버튼 확인
        await expect(page.locator('[data-banner-prev]')).toBeVisible();
        await expect(page.locator('[data-banner-next]')).toBeVisible();
        await expect(page.locator('[data-banner-pause]')).toBeVisible();
        await expect(page.locator('[data-banner-indicator]')).toBeVisible();
    });

    test('레이아웃 이탈 감지 — 가로 스크롤 없음 확인', async ({ page }) => {
        await page.goto('/view');
        await page.waitForLoadState('networkidle');

        // 가로 스크롤이 발생하지 않아야 함 (document.body.scrollWidth <= viewport.width)
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
    });
});

test.describe('뷰어 페이지 — 뷰포트별 스크린샷 비교', () => {
    test('모바일(390px) 뷰어 스크린샷 기준 비교', async ({ page }) => {
        await page.goto('/view');
        await page.waitForLoadState('networkidle');

        // 스크린샷 기준 이미지와 비교 (최초 실행 시 기준 이미지 생성)
        await expect(page).toHaveScreenshot('viewer-mobile.png', {
            fullPage: true,
            maxDiffPixelRatio: 0.02,    // 2% 이내 픽셀 차이 허용
        });
    });
});
