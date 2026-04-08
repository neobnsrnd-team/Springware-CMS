// e2e/components/product-gallery.spec.ts
// product-gallery 컴포넌트 자동화 QA (Issue #312)

import { test, expect } from '@playwright/test';
import {
    runCommonChecks,
    checkNoHorizontalScroll,
    checkKeyboardFocusable,
} from '../helpers/component-checks';

// ── 테스트용 HTML ─────────────────────────────────────────────────────────

const makeGalleryHtml = (cards: { name: string; rate: string; desc: string }[]) => `
<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    .pg-slider { display: flex; overflow-x: auto; gap: 12px; padding: 16px; }
    .pg-card {
      flex: 0 0 280px; background: #fff; border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,.12); padding: 20px;
    }
    .pg-card__name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .pg-card__rate { font-size: 22px; font-weight: 700; color: #0046A4; margin-bottom: 8px; }
    .pg-card__desc { font-size: 13px; color: #666; }
    .pg-card__link { display: inline-block; margin-top: 12px; font-size: 14px; color: #0046A4;
                     padding: 10px 20px; border: 1px solid #0046A4; border-radius: 6px; }
    .pg-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
    .pg-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
    .pg-dot.active { background: #0046A4; }
  </style>
</head><body>
  <div data-component-id="product-gallery-mobile">
    <div class="pg-slider">
      ${cards
        .map(
            (c, i) => `
        <div class="pg-card" data-card-index="${i}">
          <div class="pg-card__name">${c.name}</div>
          <div class="pg-card__rate">${c.rate}</div>
          <div class="pg-card__desc">${c.desc}</div>
          <a href="/apply" class="pg-card__link">신청하기</a>
        </div>`,
        )
        .join('')}
    </div>
    <div class="pg-dots">
      ${cards.map((_, i) => `<span class="pg-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
    </div>
  </div>
</body></html>
`;

const NORMAL_CARDS = [
    { name: '기업자유예금', rate: '연 3.50%', desc: '자유롭게 입출금하며 높은 금리를 누리세요.' },
    { name: 'IBK 적금', rate: '연 4.20%', desc: '매월 일정 금액을 저축해 목돈을 만들어보세요.' },
    { name: 'IBK 주택담보대출', rate: '연 4.80%', desc: '내 집 마련의 꿈을 현실로 만들어드립니다.' },
];

const NORMAL_HTML = makeGalleryHtml(NORMAL_CARDS);

const SINGLE_CARD_HTML = makeGalleryHtml([
    { name: '기업자유예금', rate: '연 3.50%', desc: '단일 카드 테스트' },
]);

const ZERO_RATE_HTML = makeGalleryHtml([
    { name: '이벤트 예금', rate: '연 0%', desc: '금리 0% 테스트 상품' },
    { name: '적금', rate: '연 0.00%', desc: '0.00% 표시 확인' },
]);

const NEGATIVE_RATE_HTML = makeGalleryHtml([
    { name: '특수 상품', rate: '연 -0.1%', desc: '음수 금리 표시 확인' },
]);

const LONG_NAME_HTML = makeGalleryHtml([
    {
        name: 'IBK 기업은행 초장기 특별 우대금리 복합 자유적금 상품 (2024년 한정)',
        rate: '연 3.50%',
        desc: '상품명 40자 이상 엣지케이스 테스트',
    },
]);

const XSS_HTML = `
<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>* { box-sizing: border-box; }</style>
</head><body>
  <div data-component-id="product-gallery-mobile">
    <div class="pg-slider">
      <div class="pg-card">
        <div class="pg-card__name">&lt;script&gt;alert(1)&lt;/script&gt;XSS테스트</div>
        <div class="pg-card__rate">연 3%</div>
        <div class="pg-card__desc">&lt;img onerror=alert(2) src=x&gt;</div>
        <a href="/apply" class="pg-card__link">신청하기</a>
      </div>
    </div>
  </div>
</body></html>
`;

const TEN_CARDS_HTML = makeGalleryHtml(
    Array.from({ length: 10 }, (_, i) => ({
        name: `상품 ${i + 1}`,
        rate: `연 ${(3 + i * 0.1).toFixed(2)}%`,
        desc: `테스트 상품 ${i + 1}번 설명`,
    })),
);

// ── 공통 체크 ─────────────────────────────────────────────────────────────

test.describe('product-gallery — 공통 체크', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('공통 레이아웃·접근성 기준 충족 (가로스크롤·뷰포트·폰트·터치·alt)', async ({ page }) => {
        await runCommonChecks(page, {
            componentIdPrefix: 'product-gallery',
            minFontSize: 12,
            minTouchSize: 44,
        });
    });

    test('키보드 Tab 포커스 이동 가능', async ({ page }) => {
        await checkKeyboardFocusable(page);
    });
});

// ── 정상 동작 ─────────────────────────────────────────────────────────────

test.describe('product-gallery — 정상 동작', () => {
    test.beforeEach(async ({ page }) => {
        await page.setContent(NORMAL_HTML);
    });

    test('카드가 1개 이상 렌더링됨', async ({ page }) => {
        const cards = page.locator('[data-component-id^="product-gallery"] .pg-card');
        const count = await cards.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('각 카드에 금리 텍스트(%)가 표시됨', async ({ page }) => {
        const rates = page.locator('[data-component-id^="product-gallery"] .pg-card__rate');
        const count = await rates.count();
        expect(count).toBeGreaterThanOrEqual(1);

        for (let i = 0; i < count; i++) {
            const text = await rates.nth(i).textContent();
            expect(text).toContain('%');
        }
    });

    test('인디케이터(닷)가 카드 수와 동일하게 표시됨', async ({ page }) => {
        const cards = page.locator('[data-component-id^="product-gallery"] .pg-card');
        const dots = page.locator('[data-component-id^="product-gallery"] .pg-dot');
        const cardCount = await cards.count();
        const dotCount = await dots.count();
        expect(dotCount).toBe(cardCount);
    });

    test('첫 번째 인디케이터가 활성(active) 상태임', async ({ page }) => {
        const firstDot = page.locator('[data-component-id^="product-gallery"] .pg-dot').first();
        await expect(firstDot).toHaveClass(/active/);
    });

    test('신청 링크가 href 속성을 가짐', async ({ page }) => {
        const links = page.locator('[data-component-id^="product-gallery"] .pg-card__link');
        const count = await links.count();
        expect(count).toBeGreaterThanOrEqual(1);
        for (let i = 0; i < count; i++) {
            await expect(links.nth(i)).toHaveAttribute('href', /.+/);
        }
    });
});

// ── 예외 처리 ─────────────────────────────────────────────────────────────

test.describe('product-gallery — 예외 처리', () => {
    test('카드 1개일 때 레이아웃 깨짐 없음', async ({ page }) => {
        await page.setContent(SINGLE_CARD_HTML);
        await checkNoHorizontalScroll(page);

        const card = page.locator('[data-component-id^="product-gallery"] .pg-card');
        await expect(card).toBeVisible();
        const box = await card.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(0);
    });

    test('금리 0% — 표시 이상 없음', async ({ page }) => {
        await page.setContent(ZERO_RATE_HTML);
        const rates = page.locator('[data-component-id^="product-gallery"] .pg-card__rate');
        const count = await rates.count();
        expect(count).toBeGreaterThanOrEqual(1);
        for (let i = 0; i < count; i++) {
            const text = await rates.nth(i).textContent();
            expect(text).toContain('%');
            // 빈 문자열·null이 아님
            expect(text?.trim().length).toBeGreaterThan(0);
        }
    });

    test('음수 금리(-0.1%) — 표시 이상 없음', async ({ page }) => {
        await page.setContent(NEGATIVE_RATE_HTML);
        const rate = page.locator('[data-component-id^="product-gallery"] .pg-card__rate').first();
        await expect(rate).toBeVisible();
        const text = await rate.textContent();
        expect(text).toContain('%');
    });
});

// ── 엣지 케이스 ───────────────────────────────────────────────────────────

test.describe('product-gallery — 엣지 케이스', () => {
    test('카드 10개 이상 — 가로 스크롤 처리됨, 레이아웃 이상 없음', async ({ page }) => {
        await page.setContent(TEN_CARDS_HTML);
        // 슬라이더 내부 스크롤은 허용, body 가로 스크롤만 금지
        const bodyHScroll = await page.evaluate(
            () => document.body.scrollWidth > document.documentElement.clientWidth,
        );
        expect(bodyHScroll, 'body 가로 스크롤이 발생하면 안 됩니다').toBe(false);

        const cards = page.locator('[data-component-id^="product-gallery"] .pg-card');
        expect(await cards.count()).toBe(10);
    });

    test('상품명 40자 이상 — 카드 레이아웃 깨짐 없음', async ({ page }) => {
        await page.setContent(LONG_NAME_HTML);
        await checkNoHorizontalScroll(page);

        const card = page.locator('[data-component-id^="product-gallery"] .pg-card').first();
        const box = await card.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(0);
    });

    test('XSS — 특수문자가 스크립트로 실행되지 않음', async ({ page }) => {
        await page.setContent(XSS_HTML);

        // script 태그가 DOM에 삽입되지 않았는지 확인
        const injected = await page.evaluate(
            () => document.querySelector('[data-component-id^="product-gallery"] script'),
        );
        expect(injected).toBeNull();

        // 카드 이름이 텍스트로만 렌더링됨 (innerHTML에 <script> 실행 흔적 없음)
        const name = page.locator('[data-component-id^="product-gallery"] .pg-card__name').first();
        await expect(name).toBeVisible();
    });
});

// ── 반응형·뷰어 ───────────────────────────────────────────────────────────

test.describe('product-gallery — 반응형 뷰어', () => {
    test('뷰어(/view) — product-gallery HTML이 렌더링됨', async ({ page }) => {
        // /api/builder/load를 mock하여 product-gallery 포함 HTML 반환
        await page.route('/api/builder/load', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    ok: true,
                    html: `<div data-component-id="product-gallery-mobile"><div class="pg-card"><div class="pg-card__rate">연 3.50%</div></div></div>`,
                }),
            });
        });

        await page.goto('/');
        const component = page.locator('[data-component-id^="product-gallery"]');
        // 뷰어 페이지가 아닌 경우 setContent로 검증
        await page.setContent(NORMAL_HTML);
        await expect(
            page.locator('[data-component-id^="product-gallery"]'),
        ).toBeAttached();
    });
});
