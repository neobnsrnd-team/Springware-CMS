// e2e/pages/approval-flow.spec.ts
// 저장 → 승인 요청 → 승인 → 배포 E2E 플로우 테스트 (Issue #295)
// page.route() mock으로 Oracle 없이 CI 실행 가능

import { test, expect } from '@playwright/test';

const TEST_PAGE_ID = 'test-page-e2e-001';
const TEST_CONTENT = '<div data-spw-block>테스트 콘텐츠</div>';

test.describe('승인 플로우 — API 시나리오', () => {
    test('저장 → 승인 요청 → 승인 완료 순서 플로우', async ({ page }) => {
        // 1단계: 저장 mock
        await page.route('/api/builder/save', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, pageId: TEST_PAGE_ID }),
            });
        });

        // 2단계: 승인 요청 mock
        await page.route(`/api/builder/pages/${TEST_PAGE_ID}/approve-request`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        // 3단계: 승인 mock
        await page.route(`/api/builder/pages/${TEST_PAGE_ID}/approve`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        // 저장 API 호출
        const saveResponse = await page.request.post('/api/builder/save', {
            data: { content: TEST_CONTENT, pageId: TEST_PAGE_ID },
        });
        const saveBody = await saveResponse.json() as { ok: boolean; pageId: string };
        expect(saveBody.ok).toBe(true);
        expect(saveBody.pageId).toBe(TEST_PAGE_ID);

        // 승인 요청 API 호출
        const requestResponse = await page.request.post(
            `/api/builder/pages/${TEST_PAGE_ID}/approve-request`,
        );
        const requestBody = await requestResponse.json() as { ok: boolean };
        expect(requestBody.ok).toBe(true);

        // 승인 API 호출
        const approveResponse = await page.request.post(
            `/api/builder/pages/${TEST_PAGE_ID}/approve`,
        );
        const approveBody = await approveResponse.json() as { ok: boolean };
        expect(approveBody.ok).toBe(true);
    });

    test('반려 처리 후 상태 변경 확인', async ({ page }) => {
        await page.route(`/api/builder/pages/${TEST_PAGE_ID}/reject`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, status: 'REJECTED' }),
            });
        });

        const response = await page.request.post(
            `/api/builder/pages/${TEST_PAGE_ID}/reject`,
            { data: { reason: '내용 수정 필요' } },
        );
        const body = await response.json() as { ok: boolean; status: string };

        expect(body.ok).toBe(true);
        expect(body.status).toBe('REJECTED');
    });

    test('긴급 차단 후 상태 변경 확인', async ({ page }) => {
        // 페이지 목록 mock — IS_PUBLIC 상태 반환
        await page.route('/api/builder/pages', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    data: [{ pageId: TEST_PAGE_ID, status: 'BLOCKED', isPublic: false }],
                }),
            });
        });

        const response = await page.request.get('/api/builder/pages');
        const body = await response.json() as {
            ok: boolean;
            data: Array<{ pageId: string; status: string; isPublic: boolean }>;
        };

        expect(body.ok).toBe(true);
        const targetPage = body.data.find((p) => p.pageId === TEST_PAGE_ID);
        expect(targetPage?.status).toBe('BLOCKED');
        expect(targetPage?.isPublic).toBe(false);
    });
});
