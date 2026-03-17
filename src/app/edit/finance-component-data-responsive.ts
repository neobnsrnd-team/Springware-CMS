// 금융 도메인 컴포넌트 — 반응형(Responsive) 버전
// 데스크톱(넓은 화면)과 모바일(좁은 화면) 모두에서 최적화된 레이아웃을 제공
// 동일한 data-cb-type, CSS 클래스 프리픽스, data-item-id를 유지하며
// 미디어 쿼리를 통해 레이아웃만 변경

import type { FinanceComponent } from './finance-component-data';

export const FINANCE_COMPONENTS_RESPONSIVE: FinanceComponent[] = [
    {
        id: 'app-header',
        viewMode: 'responsive',
        label: '최상단 헤더',
        description: 'IBK 로고 + 햄버거 메뉴 버튼 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-app-header.svg',
        html: `
<div data-cb-type="app-header" class="responsive-layout">
    <style>
        [data-cb-type="app-header"].responsive-layout .ah-nav-links { display: none; }
        @media (min-width: 768px) {
            [data-cb-type="app-header"].responsive-layout .ah-nav-links { display: flex; gap: 24px; align-items: center; }
            [data-cb-type="app-header"].responsive-layout .ah-inner { display: flex; align-items: center; justify-content: space-between; }
            [data-cb-type="app-header"].responsive-layout .ah-hamburger { display: none; }
        }
        @media (max-width: 767px) {
            [data-cb-type="app-header"].responsive-layout .ah-hamburger { display: block; }
        }
    </style>
    <div class="ah-inner">
        <a href="#" class="ah-logo">
            <img class="ah-logo-img" src="" alt="은행 로고" />
            <span class="ah-logo-text">IBK기업은행</span>
        </a>
        <nav class="ah-nav-links">
            <a href="#" class="ah-nav-link">개인뱅킹</a>
            <a href="#" class="ah-nav-link">기업뱅킹</a>
            <a href="#" class="ah-nav-link">금융상품</a>
            <a href="#" class="ah-nav-link">고객센터</a>
        </nav>
        <button class="ah-hamburger" aria-label="메뉴">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
    </div>
</div>
`,
    },
    {
        id: 'product-gallery',
        viewMode: 'responsive',
        label: '금융 상품 갤러리',
        description: '예금·적금·대출 카드 (반응형 그리드)',
        preview: '/assets/minimalist-blocks/preview/ibk-product-gallery.svg',
        html: `
<div data-cb-type="product-gallery" class="responsive-layout">
    <style>
        [data-cb-type="product-gallery"].responsive-layout .pg-track {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
        }
        [data-cb-type="product-gallery"].responsive-layout .pg-slide {
            width: auto;
        }
        [data-cb-type="product-gallery"].responsive-layout .pg-dots { display: none; }
    </style>
    <div class="pg-header">
        <h3 class="pg-title">주요 금융상품</h3>
    </div>
    <div class="pg-track">
        <div class="pg-slide" data-type="savings" data-item-id="pg-1">
            <div class="pg-type-badge">적금</div>
            <div class="pg-product-name">IBK D-Day 적금</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">4.5</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최고 금리 (연)</div>
            <div class="pg-detail">기간 1~36개월 · 월 최대 100만원</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
        <div class="pg-slide" data-type="deposit" data-item-id="pg-2">
            <div class="pg-type-badge">예금</div>
            <div class="pg-product-name">IBK평생한가족예금</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">3.8</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최고 금리 (연)</div>
            <div class="pg-detail">기간 6~36개월 · 1인 1계좌</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
        <div class="pg-slide" data-type="loan" data-item-id="pg-3">
            <div class="pg-type-badge">대출</div>
            <div class="pg-product-name">IBK 기업대출</div>
            <div class="pg-rate-wrap"><span class="pg-rate-value">4.2</span><span class="pg-rate-unit">%</span></div>
            <div class="pg-rate-label">최저 금리 (연)</div>
            <div class="pg-detail">한도 최대 10억 · 거치 최대 3년</div>
            <a href="#" class="pg-cta">자세히 보기</a>
        </div>
    </div>
    <div class="pg-dots"></div>
</div>
`,
    },
    {
        id: 'exchange-board',
        viewMode: 'responsive',
        label: '환율 및 금융 지수',
        description: 'USD·EUR·JPY·CNY 실시간 환율 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-exchange-board.svg',
        html: `
<div data-cb-type="exchange-board" class="responsive-layout">
    <div class="eb-header">
        <span class="eb-title">실시간 환율</span>
        <span class="eb-updated">로딩 중...</span>
    </div>
    <div class="eb-list"></div>
    <div class="eb-footer">
        <a href="#" class="eb-exchange-btn">환전 신청</a>
    </div>
</div>
`,
    },
    {
        id: 'branch-locator',
        viewMode: 'responsive',
        label: '영업점/ATM 위치',
        description: '지도 + 영업점 목록 (반응형 레이아웃)',
        preview: '/assets/minimalist-blocks/preview/ibk-branch-locator.svg',
        html: `
<div data-cb-type="branch-locator" class="responsive-layout">
    <style>
        @media (min-width: 768px) {
            [data-cb-type="branch-locator"].responsive-layout {
                display: flex;
                flex-direction: row;
                gap: 16px;
            }
            [data-cb-type="branch-locator"].responsive-layout .bl-map-area {
                flex: 1;
                min-height: 400px;
            }
            [data-cb-type="branch-locator"].responsive-layout .bl-sheet {
                flex: 0 0 360px;
                position: static;
                border-radius: 8px;
            }
        }
        @media (max-width: 767px) {
            [data-cb-type="branch-locator"].responsive-layout {
                display: flex;
                flex-direction: column;
            }
        }
    </style>
    <div class="bl-map-area">
        <div class="bl-map-placeholder">
            <div class="bl-map-icon">📍</div>
            <p class="bl-map-text">Kakao Maps API Key를 설정하면 지도가 표시됩니다</p>
        </div>
        <div class="bl-search-bar">
            <input type="text" class="bl-search-input" placeholder="지역 또는 지점명 검색"/>
            <button class="bl-search-btn" aria-label="검색"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>
        </div>
        <div class="bl-filter-bar">
            <button class="bl-filter-btn active" data-type="all">전체</button>
            <button class="bl-filter-btn" data-type="branch">영업점</button>
            <button class="bl-filter-btn" data-type="atm">ATM</button>
        </div>
    </div>
    <div class="bl-sheet">
        <div class="bl-sheet-handle"></div>
        <div class="bl-sheet-title">주변 영업점 · ATM</div>
        <div class="bl-sheet-list">
            <div class="bl-branch-item" data-type="branch" data-item-id="bl-1">
                <div class="bl-branch-icon branch">영</div>
                <div class="bl-branch-info">
                    <span class="bl-branch-name">IBK 강남지점</span>
                    <span class="bl-branch-addr">서울 강남구 테헤란로 123</span>
                    <span class="bl-branch-hours">평일 09:00~16:00</span>
                </div>
                <a href="tel:1566-2566" class="bl-call-btn" aria-label="전화하기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg></a>
            </div>
            <div class="bl-branch-item" data-type="atm" data-item-id="bl-2">
                <div class="bl-branch-icon atm">ATM</div>
                <div class="bl-branch-info">
                    <span class="bl-branch-name">IBK ATM (강남역 2번출구)</span>
                    <span class="bl-branch-addr">서울 강남구 강남대로 396</span>
                    <span class="bl-branch-hours">24시간 운영</span>
                </div>
                <a href="tel:1566-2566" class="bl-call-btn" aria-label="전화하기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.71h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 18 2 2 0 0 1 22 16.92z"/></svg></a>
            </div>
        </div>
    </div>
</div>
`,
    },
    {
        id: 'promo-banner',
        viewMode: 'responsive',
        label: '홍보 배너',
        description: '스와이프 슬라이드 배너 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-promo-banner.svg',
        html: `
<div data-cb-type="promo-banner" class="responsive-layout">
    <div class="pb-banner-section">
        <div class="pb-track">
            <div class="pb-slide" data-item-id="pb-1">
                <div class="pb-slide-bg" style="background:linear-gradient(135deg,#0046A4 0%,#0066CC 100%)"></div>
                <div class="pb-slide-content">
                    <span class="pb-badge">이벤트</span>
                    <h3 class="pb-slide-title">특별 금리 혜택</h3>
                    <p class="pb-slide-desc">IBK 적금 가입 시 최고 4.5% 금리</p>
                    <a href="#" class="pb-slide-cta">자세히 보기</a>
                </div>
            </div>
            <div class="pb-slide" data-item-id="pb-2">
                <div class="pb-slide-bg" style="background:linear-gradient(135deg,#FF6600 0%,#FF8C42 100%)"></div>
                <div class="pb-slide-content">
                    <span class="pb-badge">신상품</span>
                    <h3 class="pb-slide-title">기업 맞춤 대출</h3>
                    <p class="pb-slide-desc">중소기업 전용 최저 4.2% 특별 금리</p>
                    <a href="#" class="pb-slide-cta">신청하기</a>
                </div>
            </div>
        </div>
        <div class="pb-dots"></div>
        <div class="pb-counter"><span class="pb-current">1</span> / <span class="pb-total">2</span></div>
    </div>
</div>
`,
    },
    {
        id: 'media-video',
        viewMode: 'responsive',
        label: '미디어 홍보',
        description: '유튜브 영상 홍보 컴포넌트 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-media-video.svg',
        html: `
<div data-cb-type="media-video" class="responsive-layout">
    <style>
        @media (min-width: 768px) {
            [data-cb-type="media-video"].responsive-layout {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                gap: 24px;
            }
            [data-cb-type="media-video"].responsive-layout .mv-label {
                flex: 0 0 200px;
                padding-top: 16px;
            }
            [data-cb-type="media-video"].responsive-layout .mv-wrap {
                flex: 1;
            }
        }
        @media (max-width: 767px) {
            [data-cb-type="media-video"].responsive-layout {
                display: flex;
                flex-direction: column;
            }
        }
    </style>
    <div class="mv-label">IBK 소개 영상</div>
    <div class="mv-wrap">
        <iframe src="https://www.youtube.com/embed/TSxZRHwZam8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="IBK 소개 영상"></iframe>
    </div>
</div>
`,
    },
    {
        id: 'loan-calculator',
        viewMode: 'responsive',
        label: '금융 계산기',
        description: '대출·예금·적금 탭 계산기 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-loan-calculator.svg',
        html: `
<div data-cb-type="loan-calculator" class="responsive-layout">
    <style>
        @media (min-width: 768px) {
            [data-cb-type="loan-calculator"].responsive-layout .lc-body {
                display: flex;
                flex-direction: row;
                gap: 32px;
            }
            [data-cb-type="loan-calculator"].responsive-layout .lc-body .lc-panel {
                flex: 1;
            }
            [data-cb-type="loan-calculator"].responsive-layout .lc-body .lc-result {
                flex: 0 0 320px;
            }
        }
        @media (max-width: 767px) {
            [data-cb-type="loan-calculator"].responsive-layout .lc-body {
                display: flex;
                flex-direction: column;
            }
        }
    </style>
    <div class="lc-tabs">
        <button class="lc-tab active" data-type="loan">대출</button>
        <button class="lc-tab" data-type="deposit">예금</button>
        <button class="lc-tab" data-type="savings">적금</button>
    </div>
    <div class="lc-body">
        <div class="lc-panel" data-type="loan">
            <div class="lc-field">
                <label class="lc-label">대출금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="principal" value="10000" min="100" max="500000" step="100"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="principal" min="100" max="500000" step="100" value="10000"/>
                <div class="lc-range-labels"><span>100만원</span><span>50억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="5.0" min="0.1" max="30" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="rate" min="0.1" max="30" step="0.1" value="5.0"/>
                <div class="lc-range-labels"><span>0.1%</span><span>30%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">대출기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="12" min="1" max="360" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="360" step="1" value="12"/>
                <div class="lc-range-labels"><span>1개월</span><span>30년</span></div>
            </div>
        </div>
        <div class="lc-panel" data-type="deposit" style="display:none">
            <div class="lc-field">
                <label class="lc-label">예치금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="principal" value="1000" min="10" max="1000000" step="10"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="principal" min="10" max="1000000" step="10" value="1000"/>
                <div class="lc-range-labels"><span>10만원</span><span>100억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="3.5" min="0.1" max="20" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="rate" min="0.1" max="20" step="0.1" value="3.5"/>
                <div class="lc-range-labels"><span>0.1%</span><span>20%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">예치기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="12" min="1" max="60" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="60" step="1" value="12"/>
                <div class="lc-range-labels"><span>1개월</span><span>60개월</span></div>
            </div>
        </div>
        <div class="lc-panel" data-type="savings" style="display:none">
            <div class="lc-field">
                <label class="lc-label">월 납입금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="monthly" value="100" min="1" max="10000" step="1"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="monthly" min="1" max="10000" step="1" value="100"/>
                <div class="lc-range-labels"><span>1만원</span><span>1억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="4.0" min="0.1" max="20" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="range" min="0.1" max="20" step="0.1" value="4.0"/>
                <div class="lc-range-labels"><span>0.1%</span><span>20%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">적금기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="24" min="1" max="60" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="60" step="1" value="24"/>
                <div class="lc-range-labels"><span>1개월</span><span>60개월</span></div>
            </div>
        </div>
        <div class="lc-result">
            <div class="lc-result-item">
                <span class="lc-result-label lc-label-monthly">월 납입금</span>
                <span class="lc-result-value lc-val-monthly">0원</span>
            </div>
            <div class="lc-result-item">
                <span class="lc-result-label lc-label-interest">총 이자</span>
                <span class="lc-result-value lc-val-interest">0원</span>
            </div>
            <div class="lc-result-item lc-result-total">
                <span class="lc-result-label lc-label-total">총 상환금액</span>
                <span class="lc-result-value lc-val-total">0원</span>
            </div>
        </div>
        <a href="#" class="lc-apply-btn">상담 신청하기</a>
    </div>
</div>
`,
    },
    {
        id: 'product-menu',
        viewMode: 'responsive',
        label: '상품 메뉴',
        description: '예금·대출·펀드 등 그리드 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-product-menu.svg',
        html: `
<div data-cb-type="product-menu" class="responsive-layout">
    <style>
        [data-cb-type="product-menu"].responsive-layout .pm-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
        }
    </style>
    <div class="pm-header">
        <span class="pm-title edit">상품</span>
    </div>
    <div class="pm-grid">
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg></div>
            <span class="pm-label edit">예금</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H4v12h8"/><path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="M18 16v2l1 1"/></svg></div>
            <span class="pm-label edit">대출</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
            <span class="pm-label edit">펀드</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>
            <span class="pm-label edit">신탁</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M15 8s2 1 2 4-2 4-2 4"/><path d="M9 8s-2 1-2 4 2 4 2 4"/></svg></div>
            <span class="pm-label edit">외환</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></svg></div>
            <span class="pm-label edit">보험</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
            <span class="pm-label edit">카드</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="6 9 9 12 13 8 17 11"/></svg></div>
            <span class="pm-label edit">ISA</span>
        </a>
        <a href="#" class="pm-item">
            <div class="pm-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <span class="pm-label edit">퇴직연금</span>
        </a>
    </div>
</div>
`,
    },
    {
        id: 'auth-center',
        viewMode: 'responsive',
        label: '보안·인증센터',
        description: '공동인증서·금융인증서·OTP·보안카드 (반응형 그리드)',
        preview: '/assets/minimalist-blocks/preview/ibk-auth-center.svg',
        html: `
<div data-cb-type="auth-center" class="responsive-layout">
    <style>
        [data-cb-type="auth-center"].responsive-layout .ac-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 12px;
        }
    </style>
    <div class="ac-header">
        <h3 class="ac-title">인증센터</h3>
        <p class="ac-desc">안전한 금융거래를 위한 인증 서비스</p>
    </div>
    <div class="ac-cards">
        <a href="#" class="ac-card" data-type="cert" data-item-id="ac-1">
            <div class="ac-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
            <div class="ac-card-content"><span class="ac-card-title">공동인증서</span><span class="ac-card-desc">발급 · 갱신 · 복사</span></div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="finance-cert" data-item-id="ac-2">
            <div class="ac-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
            <div class="ac-card-content"><span class="ac-card-title">금융인증서</span><span class="ac-card-desc">클라우드 기반 인증</span></div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="otp" data-item-id="ac-3">
            <div class="ac-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 7h6"/><path d="M9 11h6"/></svg></div>
            <div class="ac-card-content"><span class="ac-card-title">OTP</span><span class="ac-card-desc">일회용 비밀번호 생성기</span></div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
        <a href="#" class="ac-card" data-type="security-card" data-item-id="ac-4">
            <div class="ac-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg></div>
            <div class="ac-card-content"><span class="ac-card-title">보안카드</span><span class="ac-card-desc">보안카드 분실 · 재발급</span></div>
            <svg class="ac-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m9 18 6-6-6-6"/></svg>
        </a>
    </div>
    <div class="ac-notice">
        <svg class="ac-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        <p class="ac-notice-text">금융기관은 절대 개인정보, 보안카드 번호 전체를 요구하지 않습니다.</p>
    </div>
</div>
`,
    },
    {
        id: 'site-footer',
        viewMode: 'responsive',
        label: '사이트 푸터',
        description: '약관·연락처·SNS·TOP 버튼 (반응형)',
        preview: '/assets/minimalist-blocks/preview/ibk-site-footer.svg',
        html: `
<div data-cb-type="site-footer" class="responsive-layout">
    <style>
        @media (min-width: 768px) {
            [data-cb-type="site-footer"].responsive-layout .sf-inner {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                gap: 16px;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-links {
                flex: 1 1 100%;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-contact {
                flex: 1;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-copyright {
                flex: 1;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-bottom {
                flex: 1 1 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-selects {
                display: flex;
                gap: 12px;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-social {
                flex: 1 1 100%;
                display: flex;
                justify-content: center;
                gap: 12px;
            }
        }
        @media (max-width: 767px) {
            [data-cb-type="site-footer"].responsive-layout .sf-inner {
                display: flex;
                flex-direction: column;
            }
            [data-cb-type="site-footer"].responsive-layout .sf-selects {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        }
    </style>
    <div class="sf-inner">
        <div class="sf-links">
            <a href="#" class="sf-link sf-link-bold">개인정보 처리방침</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">신용정보활용체제</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">전자민원접수(칭찬·불만·제안)</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">권익위 부패·공익신고</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">보호금융상품등록부</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">상품공시실</a><br/>
            <a href="#" class="sf-link">위치기반서비스 이용약관</a><span class="sf-sep">|</span>
            <a href="#" class="sf-link">고객센터</a>
        </div>
        <p class="sf-contact edit">국내1588-2588,1566-2566(보이스피싱신고 8번)/해외 82-31-888-800</p>
        <p class="sf-copyright edit">Copyright. IBK(INDUSTRIAL BANK OF KOREA) All rights reserved.</p>
        <div class="sf-bottom">
            <div class="sf-selects">
                <select class="sf-select">
                    <option>IBK 관련사이트</option>
                    <option>IBK 기업은행</option>
                    <option>IBK 캐피탈</option>
                </select>
                <select class="sf-select">
                    <option>IBK 관계사</option>
                    <option>IBK 증권</option>
                    <option>IBK 보험</option>
                </select>
            </div>
            <a href="#top" class="sf-top-btn" aria-label="상단으로">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m18 15-6-6-6 6"/></svg>
            </a>
        </div>
        <div class="sf-social">
            <a href="#" class="sf-social-icon sf-yt" aria-label="유튜브">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" fill="white"/></svg>
            </a>
            <a href="#" class="sf-social-icon sf-fb" aria-label="페이스북">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" fill="white"/></svg>
            </a>
            <a href="#" class="sf-social-icon sf-ig" aria-label="인스타그램">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="white"/></svg>
            </a>
            <a href="#" class="sf-social-icon sf-blog" aria-label="블로그">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white"><path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/></svg>
            </a>
        </div>
    </div>
</div>
`,
    },
];
