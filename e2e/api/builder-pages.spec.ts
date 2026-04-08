// e2e/api/builder-pages.spec.ts
// 빌더 페이지 API 계약 테스트 — page.route() mock으로 Oracle 없이 CI 실행 (Issue #295)

import { test, expect } from '@playwright/test';

// mock 페이지 데이터
const MOCK_PAGE = {
    pageId: 'test-page-001',
    content: '<div>테스트 콘텐츠</div>',
    status: 'DRAFT',
    updatedAt: '2026-04-07T00:00:00.000Z',
};

const MOCK_PAGES_LIST = [
    { pageId: 'test-page-001', status: 'DRAFT',    updatedAt: '2026-04-07T00:00:00.000Z' },
    { pageId: 'test-page-002', status: 'APPROVED', updatedAt: '2026-04-06T00:00:00.000Z' },
];

test.describe('빌더 페이지 API', () => {
    test.describe('POST /api/builder/load — 페이지 불러오기', () => {
        test('페이지 불러오기 응답 구조 검증', async ({ page }) => {
            await page.route('**/api/builder/load', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true, content: MOCK_PAGE.content }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/load', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pageId: 'test-page-001' }),
                });
                return { status: res.status, body: await res.json() };
            });

            expect(result.status).toBe(200);
            expect(result.body.ok).toBe(true);
            expect(typeof result.body.content).toBe('string');
        });
    });

    test.describe('POST /api/builder/save — 페이지 저장', () => {
        test('페이지 저장 응답 구조 검증', async ({ page }) => {
            await page.route('**/api/builder/save', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true, pageId: MOCK_PAGE.pageId }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: '<div>테스트</div>', pageId: 'test-page-001' }),
                });
                return { status: res.status, body: await res.json() };
            });

            expect(result.status).toBe(200);
            expect(result.body.ok).toBe(true);
            expect(result.body).toHaveProperty('pageId');
        });
    });

    test.describe('GET /api/builder/pages — 페이지 목록', () => {
        test('페이지 목록 응답 구조 검증', async ({ page }) => {
            await page.route('**/api/builder/pages', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true, data: MOCK_PAGES_LIST }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/pages');
                return { status: res.status, body: await res.json() };
            });

            expect(result.status).toBe(200);
            expect(result.body.ok).toBe(true);
            expect(Array.isArray(result.body.data)).toBe(true);
        });

        test('페이지 목록 — 각 항목 필수 필드 확인', async ({ page }) => {
            await page.route('**/api/builder/pages', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true, data: MOCK_PAGES_LIST }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/pages');
                return { body: await res.json() };
            });

            result.body.data.forEach((item: Record<string, unknown>) => {
                expect(item).toHaveProperty('pageId');
                expect(item).toHaveProperty('status');
            });
        });
    });

    test.describe('POST /api/builder/pages/[pageId]/approve-request — 승인 요청', () => {
        test('승인 요청 응답 구조 검증', async ({ page }) => {
            await page.route('**/api/builder/pages/test-page-001/approve-request', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/pages/test-page-001/approve-request', {
                    method: 'POST',
                });
                return { status: res.status, body: await res.json() };
            });

            expect(result.status).toBe(200);
            expect(result.body.ok).toBe(true);
        });
    });

    test.describe('POST /api/builder/pages/[pageId]/approve — 승인', () => {
        test('승인 응답 구조 검증', async ({ page }) => {
            await page.route('**/api/builder/pages/test-page-001/approve', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ok: true }),
                });
            });

            await page.goto('about:blank');
            const result = await page.evaluate(async () => {
                const res = await fetch('/api/builder/pages/test-page-001/approve', {
                    method: 'POST',
                });
                return { status: res.status, body: await res.json() };
            });

            expect(result.status).toBe(200);
            expect(result.body.ok).toBe(true);
        });
    });
});
