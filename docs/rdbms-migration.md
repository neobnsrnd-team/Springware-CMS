# RDBMS 전환 설계

현재 파일 기반 데이터 관리를 RDBMS로 전환할 때의 구조 분석 및 설계 문서.

---

## 현재 코드의 데이터 관리 방식

| 데이터 | 저장 위치 | 형태 |
|--------|-----------|------|
| 탭 목록 (어떤 페이지가 있는지) | 브라우저 `localStorage` | JSON 배열 |
| 페이지 HTML 콘텐츠 | `data/*.json` (서버 파일) | `{ content, updated }` |
| 컴포넌트 정의 (구조/로직) | `public/assets/plugins/*/index.js` | 코드 파일 |
| 컴포넌트 설정값 (색상, 텍스트) | HTML 안의 `data-*` 속성 / inline style | HTML에 내장 |
| 업로드 파일 | `public/uploads/` | 파일시스템 |
| 승인 워크플로우 | ❌ 미구현 | — |

### 현재 저장 구조 예시

```
data/
├── ibk.json       → { "content": "<div data-cb-type='app-header'...>...", "updated": "2026-03-16T..." }
├── hana.json      → { "content": "...", "updated": "..." }
└── custom-xxx.json
```

---

## DB 테이블 ↔ 현재 코드 매핑

| DB 테이블 | 현재 코드 대응 | 현재 상태 |
|-----------|---------------|----------|
| `DFIN_CMS_COMPONENT` | `public/assets/plugins/*/index.js` | 파일로 하드코딩 |
| `DFIN_CML_COMPONENT_MAP` | `EditClient.tsx`의 `financeComponents` 배열 | 코드에 하드코딩 |
| `DFIN_CML_PAGE` | `data/*.json` | 파일 1개 = 페이지 1개 |
| `DFIN_CML_ASSET_INSTANCE` | HTML 안의 각 컴포넌트 블록 (`<div data-cb-type>`) | HTML에 구조 포함 |
| `DFIN_CML_TARGET_ASSET` (BRAND_ATT_1~N) | `data-*` 속성 / CSS 변수 | HTML 안에 내장 |
| `DFIN_CML_PAGE_ASSET` | HTML 내 블록 순서 | HTML 구조로 암묵적 관리 |
| `DFIN_CML_APPROVE` | ❌ 없음 | 미구현 |
| `DFIN_CML_ASSET_COMPONENT` | 플러그인 로드 목록 (`EditClient.tsx`) | 코드에 하드코딩 |

---

## RDBMS 전환 시 테이블 설계

### 페이지 (현재 `data/*.json`)

```sql
DFIN_CML_PAGE (
    PAGE_ID       VARCHAR(64)  PRIMARY KEY,  -- 'ibk', 'hana', 'custom-xxx'
    PAGE_NAME     VARCHAR(100) NOT NULL,     -- 탭 표시명
    STATUS        VARCHAR(20)  DEFAULT 'DRAFT',  -- DRAFT | PENDING | APPROVED
    HTML_CONTENT  TEXT,                      -- 전체 캔버스 HTML
    CREATE_DATE   TIMESTAMP    DEFAULT NOW(),
    UPDATED_DATE  TIMESTAMP
)
```

> 현재 `data/ibk.json`의 `content` → `HTML_CONTENT`, `updated` → `UPDATED_DATE`

---

### 컴포넌트 정의 (현재 `plugins/*.js` 파일)

```sql
DFIN_CMS_COMPONENT (
    COMPONENT_ID        VARCHAR(64)  PRIMARY KEY,  -- 'app-header', 'product-menu' 등
    COMPONENT_NAME      VARCHAR(100) NOT NULL,     -- '상단 헤더', '퀵뱅킹 메뉴'
    COMPONENT_THUMBNAIL VARCHAR(500),              -- 미리보기 이미지 URL
    PROJECT_LVL_YN      CHAR(1) DEFAULT 'N',       -- 금융 전용 여부 (Y/N)
    CREATE_DATE         TIMESTAMP DEFAULT NOW(),
    LAST_MODIFIED_DATE  TIMESTAMP
)
```

현재 금융 컴포넌트 8종 예시:

| COMPONENT_ID | COMPONENT_NAME | PROJECT_LVL_YN |
|---|---|---|
| `app-header` | 상단 헤더 | Y |
| `product-menu` | 퀵뱅킹 메뉴 | Y |
| `product-gallery` | 금융 상품 갤러리 | Y |
| `exchange-board` | 환율 보드 | Y |
| `branch-locator` | 영업점/ATM | Y |
| `promo-banner` | 홍보 배너 | Y |
| `loan-calculator` | 금융 계산기 | Y |
| `auth-center` | 보안인증센터 | Y |

---

### 컴포넌트 인스턴스 (현재 HTML 블록 하나하나)

```sql
DFIN_CML_ASSET_INSTANCE (
    INSTANCE_ID   VARCHAR(64)  PRIMARY KEY,
    PAGE_ID       VARCHAR(64)  REFERENCES DFIN_CML_PAGE(PAGE_ID),
    COMPONENT_ID  VARCHAR(64)  REFERENCES DFIN_CMS_COMPONENT(COMPONENT_ID),
    SORT_ORDER    INT          NOT NULL,   -- 페이지 내 블록 순서
    INSTANCE_HTML TEXT,                   -- 해당 블록의 HTML
    CREATE_DATE   TIMESTAMP    DEFAULT NOW(),
    UPDATED_DATE  TIMESTAMP
)
```

---

### 컴포넌트 속성값 (현재 `data-*` 속성 / CSS 변수)

```sql
DFIN_CML_TARGET_ASSET (
    INSTANCE_ID   VARCHAR(64)  REFERENCES DFIN_CML_ASSET_INSTANCE(INSTANCE_ID),
    BRAND_ATT_1   VARCHAR(100),   -- 강조 색상 (예: '#0046A4')
    BRAND_ATT_2   VARCHAR(100),   -- 제목 색상
    BRAND_ATT_3   VARCHAR(100),   -- 라벨 색상
    BRAND_ATT_4   VARCHAR(100),   -- 아이콘 색상
    BRAND_ATT_5   VARCHAR(100),   -- 아이콘 배경색
    -- ... 컴포넌트별 필요한 속성 수만큼 확장
    PRIMARY KEY (INSTANCE_ID)
)
```

현재 코드의 `data-*` 속성과 매핑:

| BRAND_ATT | 현재 코드 속성 | 대상 컴포넌트 |
|---|---|---|
| BRAND_ATT_1 | `data-ah-accent` | app-header |
| BRAND_ATT_1 | `data-pm-colors.title` | product-menu 제목색 |
| BRAND_ATT_2 | `data-pm-colors.label` | product-menu 라벨색 |
| BRAND_ATT_3 | `data-pm-colors.icon` | product-menu 아이콘색 |
| BRAND_ATT_4 | `data-pm-colors.iconBg` | product-menu 아이콘 배경 |
| BRAND_ATT_1 | `data-pb-color` | promo-banner 슬라이드 배경색 |

---

### 승인 워크플로우 (현재 미구현)

```sql
DFIN_CML_APPROVE (
    APPROVE_ID      VARCHAR(64)  PRIMARY KEY,
    PAGE_ID         VARCHAR(64)  REFERENCES DFIN_CML_PAGE(PAGE_ID),
    STATUS          VARCHAR(20)  NOT NULL,   -- REQUESTED | APPROVED | REJECTED
    REQUESTER       VARCHAR(100),
    APPROVER        VARCHAR(100),
    REQUEST_DATE    TIMESTAMP,
    APPROVE_DATE    TIMESTAMP,
    REJECT_REASON   TEXT
)
```

---

## 현재 구조 vs RDBMS 구조 비교

```
현재 (파일 기반)                     RDBMS 전환 후
─────────────────────────────────────────────────────────────────
data/ibk.json                    DFIN_CML_PAGE (PAGE_ID='ibk')
  └─ content: "<div              │
       data-cb-type='app-header' ├─ DFIN_CML_ASSET_INSTANCE (COMPONENT_ID='app-header')
       data-ah-accent='#FF0000'  │    └─ DFIN_CML_TARGET_ASSET (BRAND_ATT_1='#FF0000')
     >...</div>                  │
     <div                        └─ DFIN_CML_ASSET_INSTANCE (COMPONENT_ID='product-menu')
       data-cb-type='product-menu'     └─ DFIN_CML_TARGET_ASSET (BRAND_ATT_1~4=colors)
       data-pm-colors='...'
     >...</div>"
```

### 핵심 차이

| 항목 | 현재 (파일) | RDBMS |
|------|-------------|-------|
| 페이지 단위 | 파일 1개 | 행 1개 |
| 컴포넌트 속성 | HTML 안에 내장 | 별도 테이블로 분리 |
| 탭 목록 | localStorage (브라우저) | DFIN_CML_PAGE 테이블 |
| 승인 흐름 | ❌ 없음 | DFIN_CML_APPROVE |
| 다중 사용자 | ❌ 불가 | 가능 |
| 검색/필터 | ❌ 불가 | SQL로 가능 |

---

## 마이그레이션 전략

### 단계 1 — 최소 전환 (HTML 컬럼 방식)
`DFIN_CML_PAGE.HTML_CONTENT`에 현재 JSON의 `content`를 그대로 저장.
현재 코드 변경 최소화, `data/*.json` 파일 I/O만 DB 쿼리로 교체.

```typescript
// 현재
const raw = fs.readFileSync('data/ibk.json', 'utf-8');
const { content } = JSON.parse(raw);

// 전환 후
const { html_content } = await db.query(
    'SELECT html_content FROM dfin_cml_page WHERE page_id = $1', ['ibk']
);
```

### 단계 2 — 정규화 (인스턴스 분리)
HTML 파싱 → 블록별 `DFIN_CML_ASSET_INSTANCE` 행 생성.
속성값 추출 → `DFIN_CML_TARGET_ASSET` 분리 저장.

### 단계 3 — 완전 통합
승인 워크플로우(`DFIN_CML_APPROVE`), 다중 사용자, 버전 관리 추가.
