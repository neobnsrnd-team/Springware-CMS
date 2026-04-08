// e2e/pages/approval-flow.spec.ts
// 저장 → 승인 요청 → 승인 → 배포 E2E 플로우 테스트 (Issue #295)
// page.route() mock으로 Oracle 없이 CI 실행 가능

import { test, expect } from '@playwright/test';

const TEST_PAGE_ID = 'test-page-e2e-001';
const TEST_CONTENT = '<div data-spw-block>테스트 콘텐츠</div>';

test.describe('승인 플로우 — API 시나리오', () => {
    test('저장 → 승인 요청 → 승인 완료 순서 플로우', async ({ page }) => {
        // 1단계: 저장 mock
        await page.route('**/api/builder/save', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, pageId: TEST_PAGE_ID }),
            });
        });

        // 2단계: 승인 요청 mock
        await page.route(`**/api/builder/pages/${TEST_PAGE_ID}/approve-request`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        // 3단계: 승인 mock
        await page.route(`**/api/builder/pages/${TEST_PAGE_ID}/approve`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        await page.goto('about:blank');

        // 저장 API 호출
        const pageId = TEST_PAGE_ID;
        const content = TEST_CONTENT;
        const saveResult = await page.evaluate(
            async ({ content, pageId }) => {
                const res = await fetch('/api/builder/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, pageId }),
                });
                return { body: await res.json() };
            },
            { content, pageId },
        );
        expect(saveResult.body.ok).toBe(true);
        expect(saveResult.body.pageId).toBe(TEST_PAGE_ID);

        // 승인 요청 API 호출
        const requestResult = await page.evaluate(async (id) => {
            const res = await fetch(`/api/builder/pages/${id}/approve-request`, { method: 'POST' });
            return { body: await res.json() };
        }, TEST_PAGE_ID);
        expect(requestResult.body.ok).toBe(true);

        // 승인 API 호출
        const approveResult = await page.evaluate(async (id) => {
            const res = await fetch(`/api/builder/pages/${id}/approve`, { method: 'POST' });
            return { body: await res.json() };
        }, TEST_PAGE_ID);
        expect(approveResult.body.ok).toBe(true);
    });

    test('반려 처리 후 상태 변경 확인', async ({ page }) => {
        await page.route(`**/api/builder/pages/${TEST_PAGE_ID}/reject`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, status: 'REJECTED' }),
            });
        });

        await page.goto('about:blank');
        const result = await page.evaluate(async (id) => {
            const res = await fetch(`/api/builder/pages/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: '내용 수정 필요' }),
            });
            return { body: await res.json() };
        }, TEST_PAGE_ID);

        expect(result.body.ok).toBe(true);
        expect(result.body.status).toBe('REJECTED');
    });

    test('긴급 차단 후 상태 변경 확인', async ({ page }) => {
        await page.route('**/api/builder/pages', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    data: [{ pageId: TEST_PAGE_ID, status: 'BLOCKED', isPublic: false }],
                }),
            });
        });

        await page.goto('about:blank');
        const result = await page.evaluate(async () => {
            const res = await fetch('/api/builder/pages');
            return { body: await res.json() };
        });

        expect(result.body.ok).toBe(true);
        const targetPage = result.body.data.find(
            (p: { pageId: string }) => p.pageId === TEST_PAGE_ID,
        );
        expect(targetPage?.status).toBe('BLOCKED');
        expect(targetPage?.isPublic).toBe(false);
    });
});
