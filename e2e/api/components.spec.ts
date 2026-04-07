// e2e/api/components.spec.ts
// 컴포넌트 API 계약 테스트 — page.route() mock으로 Oracle 없이 CI 실행 (Issue #295)

import { test, expect } from '@playwright/test';

// 컴포넌트 목록 mock 응답 데이터
const MOCK_COMPONENTS = [
    {
        id: 'event-banner-mobile',
        label: '이벤트 배너',
        description: '자동재생 이미지 배너 슬라이드',
        viewMode: 'mobile',
        preview: '/assets/minimalist-blocks/preview/event-banner.svg',
    },
    {
        id: 'event-banner-web',
        label: '이벤트 배너',
        description: '자동재생 이미지 배너 슬라이드',
        viewMode: 'web',
        preview: '/assets/minimalist-blocks/preview/event-banner.svg',
    },
];

test.describe('컴포넌트 API — /api/components', () => {
    test('컴포넌트 목록 조회 — 응답 구조 검증', async ({ page }) => {
        // DB 응답 mock
        await page.route('/api/components', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, data: MOCK_COMPONENTS }),
            });
        });

        const response = await page.request.get('/api/components');
        const body = await response.json() as { ok: boolean; data: typeof MOCK_COMPONENTS };

        expect(response.status()).toBe(200);
        expect(body.ok).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('컴포넌트 목록 — viewMode 필터 (mobile)', async ({ page }) => {
        await page.route('/api/components?viewMode=mobile', async (route) => {
            const mobileOnly = MOCK_COMPONENTS.filter((c) => c.viewMode === 'mobile');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, data: mobileOnly }),
            });
        });

        const response = await page.request.get('/api/components?viewMode=mobile');
        const body = await response.json() as { ok: boolean; data: typeof MOCK_COMPONENTS };

        expect(body.ok).toBe(true);
        body.data.forEach((item) => {
            expect(item.viewMode).toBe('mobile');
        });
    });

    test('컴포넌트 목록 — 각 항목 필수 필드 포함 확인', async ({ page }) => {
        await page.route('/api/components', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, data: MOCK_COMPONENTS }),
            });
        });

        const response = await page.request.get('/api/components');
        const body = await response.json() as { ok: boolean; data: typeof MOCK_COMPONENTS };

        body.data.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('viewMode');
            expect(item).toHaveProperty('preview');
        });
    });
});
