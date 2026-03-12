# Springware CMS — 코드 변경 정리

> 깃허브 초기 커밋(08515e1) 기준으로 원본 코드와 신규 구현 코드를 비교 정리합니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 기반 라이브러리 | ContentBuilder.js (`@innovastudio/contentbuilder`) |
| 프레임워크 | Next.js 15.5 App Router + React 19 + TypeScript |
| 스타일 | Tailwind CSS 4 |
| 목표 | IBK 기업은행 스타일 금융 특화 모바일 컴포넌트 통합 CMS |

---

## 2. 원본 코드 (깃허브에서 가져온 코드)

초기 커밋에 포함된 파일 기준입니다.

### 2-1. 핵심 구조

```
contentbuilder-next/
├── src/app/
│   ├── layout.tsx              # 루트 레이아웃 (Geist 폰트)
│   ├── globals.css             # Tailwind + .btns 버튼 스타일
│   ├── page.tsx                # 랜딩 페이지 → /edit 링크
│   ├── edit/
│   │   ├── page.tsx            # 서버 컴포넌트 (단순 래퍼)
│   │   └── EditClient.tsx      # ContentBuilder 에디터 (원본)
│   ├── view/
│   │   ├── page.tsx            # data/index.json 읽어서 html 전달
│   │   └── ViewClient.tsx      # ContentBuilderRuntime으로 렌더링
│   ├── files/
│   │   └── page.tsx            # 파일 브라우저
│   └── api/
│       ├── builder/load/       # POST — data/index.json 로드
│       ├── builder/save/       # POST — data/index.json 저장
│       ├── builder/upload/     # POST — 파일 업로드
│       ├── manage/             # 파일 관리 API (목록/폴더/삭제)
│       ├── openrouter/         # OpenRouter AI 프록시
│       ├── openai/             # OpenAI AI 프록시
│       └── assets/             # FAL AI 이미지 생성
├── public/assets/
│   ├── minimalist-blocks/
│   │   └── content-plugins.js  # 기본 제공 스니펫 (8,573줄)
│   └── plugins/                # 기본 플러그인 26종
│       ├── logo-loop/
│       ├── click-counter/
│       ├── card-list/
│       ├── accordion/
│       ├── hero-animation/
│       ├── animated-stats/
│       ├── timeline/
│       ├── before-after-slider/
│       ├── more-info/
│       ├── social-share/
│       ├── pendulum/
│       ├── browser-mockup/
│       ├── hero-background/
│       ├── cta-buttons/
│       ├── media-slider/
│       ├── media-grid/
│       ├── particle-constellation/
│       ├── vector-force/
│       ├── aurora-glow/
│       ├── simple-stats/
│       ├── faq/
│       ├── callout-box/
│       ├── code/
│       ├── video-embed/
│       └── swiper-slider/
└── data/
    └── index.json              # 단일 저장 파일
```

### 2-2. 원본 EditClient.tsx 주요 특징

- ContentBuilder 인스턴스를 `useRef`로 관리
- ContentBuilderRuntime을 `window.builderRuntime`으로 전역 등록
- 스니펫은 `content-plugins.js` 단일 파일만 로드
- 저장/미리보기/HTML 버튼이 화면 좌하단 고정(`position: fixed; bottom`)
- 단일 페이지만 관리 (`data/index.json`)
- AI: OpenRouter 기본, OpenAI 주석 처리

```tsx
// 원본 JSX 레이아웃
return (
    <>
    <div className="container" style={{ maxWidth: '980px', margin: '140px auto' }} />
    <div className="btns">
        <button onClick={handleViewHtml}>HTML</button>
        <button onClick={handlePreview}>Preview</button>
        <button onClick={handleSave}>Save</button>
    </div>
    </>
);
```

### 2-3. 원본 API 특징

- `load/route.ts`: 고정 경로 `data/index.json`만 읽음
- `save/route.ts`: 고정 경로 `data/index.json`에만 저장
- 은행/페이지 구분 없음

---

## 3. 신규 구현 코드

### 3-1. 새로 생성한 파일

#### IBK 금융 플러그인 8종

각 플러그인은 `public/assets/plugins/<name>/index.js` + `style.css` 구조입니다.

| 플러그인 | 파일 위치 | 설명 |
|---|---|---|
| `top-nav` | `plugins/top-nav/` | 은행별 데모 링크 네비게이션 + 모바일 햄버거 드로어 |
| `quick-banking` | `plugins/quick-banking/` | 조회·이체·카드·예금·대출 등 아이콘 그리드 |
| `product-gallery` | `plugins/product-gallery/` | CSS scroll-snap 금융상품 카드 슬라이더 |
| `exchange-board` | `plugins/exchange-board/` | 환율 게시판 (살 때/팔 때, 등락 표시) |
| `branch-locator` | `plugins/branch-locator/` | 영업점·ATM 위치 + Bottom Sheet 드래그 |
| `promo-banner` | `plugins/promo-banner/` | 터치 스와이프 배너 + 유튜브 embed |
| `loan-calculator` | `plugins/loan-calculator/` | 대출·예금·적금 탭 전환 계산기 |
| `auth-center` | `plugins/auth-center/` | 공동인증서·금융인증서·OTP·보안카드 |

**플러그인 공통 구조:**

```js
export default {
    name: 'plugin-name',
    displayName: '한글 표시명',
    version: '1.0.0',

    settings: { /* 컬러, URL 등 설정값 */ },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            // 에디터 우측 패널에 표시할 편집 UI 반환
        }
    },

    mount: function(element, options) {
        // 뷰 페이지에서 실행 — 인라인 데이터 업데이트, 이벤트 등록
        return {}; // unmount에서 참조할 인스턴스
    },

    unmount: function(element, instance) {
        // 정리 (타이머 해제 등)
    }
};
```

#### SVG 썸네일 8종

블록 패널에서 컴포넌트를 시각적으로 구분하기 위한 커스텀 미리보기 이미지입니다.

```
public/assets/minimalist-blocks/preview/
├── ibk-top-nav.svg
├── ibk-quick-banking.svg
├── ibk-product-gallery.svg
├── ibk-exchange-board.svg
├── ibk-branch-locator.svg
├── ibk-promo-banner.svg
├── ibk-loan-calculator.svg
└── ibk-auth-center.svg
```

#### 백엔드 API 2종

| 파일 | 엔드포인트 | 역할 |
|---|---|---|
| `src/app/api/exchange/route.ts` | `GET /api/exchange` | 환율 플레이스홀더 데이터 반환 (USD/EUR/JPY/CNY/GBP/HKD) |
| `src/app/api/branches/route.ts` | `GET /api/branches` | 영업점·ATM 목록 반환 (type, q 파라미터 필터) |

---

### 3-2. 수정한 파일

#### `src/app/edit/page.tsx`

**변경 전:** 단순 `<EditClient />` 래퍼

**변경 후:**
- `searchParams`에서 `bank` 파라미터 추출
- `key={bank}`로 은행 변경 시 EditClient 강제 리마운트
- `<Suspense>` 래퍼 추가

```tsx
// 변경 후
export default async function Edit({ searchParams }) {
    const params = await searchParams;
    const bank = params.bank || 'ibk';
    return (
        <Suspense>
            <EditClient key={bank} bank={bank} />
        </Suspense>
    );
}
```

---

#### `src/app/edit/EditClient.tsx`

**변경 전:** 단일 페이지 에디터, 버튼 좌하단 고정

**변경 후 주요 변경사항:**

1. **상단 네비바 추가** — 은행별 탭 + 액션 버튼을 상단 고정 바로 이동
2. **은행 파라미터(`bank`) 지원** — `load`/`save` API 호출 시 `bank` 전달
3. **IBK 플러그인 8종 Runtime 등록**
4. **`onChange` + `onSnippetAdd` 콜백** — 블록 추가 시 Runtime `reinitialize()` 호출 (300ms 디바운스)
5. **미리보기 URL** — `/view` → `/view?bank={bank}`

```
변경 전 레이아웃:        변경 후 레이아웃:
┌──────────────────┐    ┌──────────────────────────────┐
│  ContentBuilder  │    │ [Springware] IBK|하나|KB|...  [HTML][미리보기][저장] │
│  툴바 (자체)     │    ├──────────────────────────────┤
│                  │    │  ContentBuilder 툴바 (자체)  │
│  캔버스          │    │                              │
│                  │    │  캔버스 (드래그앤드랍)       │
│                  │    │                              │
│ [HTML][Preview]  │    └──────────────────────────────┘
│ [Save] ← 좌하단  │
└──────────────────┘
```

---

#### `src/app/api/builder/load/route.ts`

**변경 전:** 고정 `data/index.json` 읽기

**변경 후:**
- `body.bank` 파라미터로 파일 선택
- 파일 없으면 에러 대신 빈 콘텐츠 반환 (첫 방문 처리)

```ts
// 허용 은행 목록 (디렉토리 트래버설 방지)
const VALID_BANKS = ['ibk', 'hana', 'kb', 'shinhan', 'woori', 'nh'];
const bank = VALID_BANKS.includes(body.bank) ? body.bank : 'ibk';
const filePath = `data/${bank}.json`;
```

---

#### `src/app/api/builder/save/route.ts`

**변경 전:** 고정 `data/index.json` 저장

**변경 후:** `bank` 파라미터에 따라 `data/{bank}.json`에 분리 저장

```
data/
├── ibk.json      ← IBK demo 저장
├── hana.json     ← 하나 demo 저장
├── kb.json       ← KB demo 저장
├── shinhan.json  ← 신한 demo 저장
├── woori.json    ← 우리 demo 저장
└── nh.json       ← NH농협 demo 저장
```

---

#### `src/app/view/page.tsx`

**변경 전:** 고정 `data/index.json` 읽기

**변경 후:** `?bank=` 쿼리 파라미터로 해당 은행 JSON 파일 읽기

---

#### `src/app/view/ViewClient.tsx`

**변경 전:** IBK 플러그인 미등록 (기본 26종만)

**변경 후:** IBK 플러그인 8종 Runtime에 추가 등록

---

#### `public/assets/minimalist-blocks/content-plugins.js`

**변경 전:** 기본 스니펫 8,573줄 (IBK 컴포넌트 없음)

**변경 후:**
- `var data_basic` 배열 **최상단**에 IBK 스니펫 8종 삽입 (블록 패널 상단에 표시)
- 각 스니펫은 커스텀 SVG 썸네일 참조 (`preview/ibk-*.svg`)
- 스니펫 HTML에 **실제 데이터 인라인 포함** (에디터에서 바로 확인 가능)

**exchange-board 스니펫 변경 예시:**
```html
<!-- 변경 전: 비어있어 에디터에서 빈 박스로 보임 -->
<div data-cb-type="exchange-board">
    <div class="eb-list"></div>  <!-- 비어있음 -->
</div>

<!-- 변경 후: 환율 데이터 인라인으로 포함 -->
<div data-cb-type="exchange-board">
    <div class="eb-list">
        <div class="eb-item" data-currency="USD">
            <span class="eb-buy">1,325.50</span>
            <span class="eb-sell">1,296.50</span>
            <div class="eb-change up">▲ 3.50</div>
        </div>
        <!-- EUR, JPY, CNY ... -->
    </div>
</div>
```

---

#### `public/assets/plugins/exchange-board/index.js`

v1.0.0 → v2.0.0 전면 재작성

**변경 전:**
- `mount()`가 `.eb-list`를 비우고 JS로 전체 재렌더
- 에디터에서 빈 박스로 보임
- 에디터 패널: 제목/URL만 편집 가능

**변경 후:**
- `mount()`는 인라인 데이터를 **업데이트만** (대체 X)
- 에디터 패널에서 통화별 살 때/팔 때/등락 직접 편집
- 통화 추가 (GBP, HKD, VND, AUD 등)
- `↻ API에서 최신 환율 가져오기` 버튼으로 `/api/exchange` 연동

---

## 4. 아키텍처 요약

```
[에디터 /edit?bank=ibk]
        │
        ├─ 상단 네비바 (React JSX)
        │   └─ IBK | 하나 | KB | 신한 | 우리 | NH농협 탭
        │
        ├─ ContentBuilder 에디터 캔버스
        │   └─ 스니펫 패널 (content-plugins.js)
        │       └─ IBK 컴포넌트 8종 (패널 최상단)
        │
        └─ ContentBuilderRuntime (window.builderRuntime)
            └─ 플러그인 lazy-load (CSS + JS)
                ├─ onChange → reinitialize() [디바운스 300ms]
                └─ onSnippetAdd → reinitialize()

[저장 /api/builder/save]
        └─ data/{bank}.json 분리 저장

[미리보기 /view?bank=ibk]
        └─ data/{bank}.json 읽기
            └─ ContentBuilderRuntime.init()
                └─ 플러그인 mount() 실행 (실시간 환율 fetch 등)
```

---

## 5. 환경 변수

```env
OPENROUTER_API_KEY    # AI 코드 생성 (기본)
OPENAI_API_KEY        # AI 대안 프로바이더
FAL_API_KEY           # AI 이미지 생성 (fal.ai)
GEMINI_API_KEY        # Google GenAI
UPLOAD_PATH           # 업로드 경로 (기본: public/uploads/)
UPLOAD_URL            # 업로드 URL (기본: uploads/)
```

---

## 6. 로컬 실행

```bash
cd contentbuilder-next
npm install
npm run dev
# → http://localhost:3000/edit
```

| URL | 설명 |
|---|---|
| `/edit?bank=ibk` | IBK 데모 편집 |
| `/edit?bank=hana` | 하나 데모 편집 |
| `/view?bank=ibk` | IBK 데모 미리보기 |
| `/files` | 파일 브라우저 |

---

## 7. 추후 개선 필요 사항

| 항목 | 현재 | 권장 (프로덕션) |
|---|---|---|
| 데이터 저장 | 파일 기반 (`data/*.json`) | DB (PostgreSQL 등) |
| 파일 업로드 | `public/uploads/` 정적 서빙 | S3 / CDN |
| 환율 데이터 | 플레이스홀더 (`/api/exchange`) | 한국수출입은행 API 연동 |
| 영업점 데이터 | 플레이스홀더 (`/api/branches`) | 실제 영업점 DB 연동 |
| 지도 | 텍스트 안내 | Kakao Maps API Key 설정 |
| 인증 | 없음 | 에디터 접근 제한 필요 |
