# Springware CMS — 기술 개요

## 1. 기술 스택

| 항목 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.5.4 | 메인 프레임워크 (App Router) |
| **React** | 19.1.0 | UI 라이브러리 |
| **TypeScript** | ^5 | 정적 타입 |
| **Tailwind CSS** | ^4 | 스타일링 |
| **@innovastudio/contentbuilder** | ^1.5.192 | 비주얼 웹 에디터 (핵심) |
| **@innovastudio/contentbuilder-runtime** | ^1.0.33 | 저장된 콘텐츠 렌더링 |
| **@fal-ai/client** | ^1.6.2 | FAL AI 이미지 생성 |
| **axios** | ^1.12.2 | HTTP 클라이언트 |
| **lucide-react** | ^0.544.0 | 아이콘 |

**Path Alias**: `@/*` → `./src/*`

### 1.1 Next.js의 라우팅 방식

App Router의 핵심 개념
- app/ 폴더 안의 page.tsx가 곧 url 경로
  - app/edit/page.tsx → /edit
  - app/api/builder/save/route.ts → /api/builder/save
- 기본적으로 서버에서 실행되는 서버 컴포넌트
  - 클라이언트에서 실행해야 하면 파일 맨 위에 'use clinet' 선언 필요
  - EditClient.tsx 1번째 줄이 'use client'인 이유가 이것
- layout.tsx — 여러 페이지가 공유하는 공통 레이아웃 (헤더/푸터 등)

쉽게 말하면 "Next.js가 파일/폴더 구조를 보고 URL을 자동으로 만들어주는 방식"이고, 이 프로젝트는 그 최신 버전(App Router)을 쓰고 있다.

---

## 2. API 라우트

### 2.1 콘텐츠 빌더 (`/api/builder/*`)

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/builder/load` | POST | `data/{bank}.json` HTML 로드 |
| `/api/builder/save` | POST | `data/{bank}.json` HTML 저장 |
| `/api/builder/upload` | POST | 에디터 내 파일 업로드 → `public/uploads/` |

**Bank ID 검증**: `/^[a-z0-9-]{1,64}$/` (디렉토리 트래버설 방지)

### 2.2 파일 관리 (`/api/manage/*`)

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/manage/files` | GET | 파일 목록 (페이지네이션 10개/페이지) |
| `/api/manage/folders` | GET | 폴더 트리 구조 (재귀) |
| `/api/manage/upload` | POST | 파일 업로드 (최대 100MB) |
| `/api/manage/delete` | DELETE | 파일/폴더 재귀 삭제 |
| `/api/manage/addfolder` | POST | 폴더 생성 |

### 2.3 AI 텍스트 생성

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/openrouter` | POST | OpenRouter API 프록시 (일반 + Function Calling) |
| `/api/openrouter/stream` | POST | OpenRouter 스트리밍 |
| `/api/openai` | POST | OpenAI API 프록시 |
| `/api/openai/stream` | POST | OpenAI 스트리밍 |

### 2.4 AI 이미지 생성 (`/api/assets/*`)

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/api/assets/request-fal` | POST | FAL 큐 등록 → `request_id` 반환 |
| `/api/assets/status-fal` | POST | 생성 상태 확인 (폴링용) |
| `/api/assets/result-fal` | POST | 완료된 이미지 결과 조회 + 로컬 저장 |
| `/api/assets/cleanup` | POST | 임시 데이터 정리 |

### 2.5 금융 데이터 (플레이스홀더)

| 엔드포인트 | 메서드 | 역할 | 캐시 |
|-----------|--------|------|------|
| `/api/exchange` | GET | 환율 정보 (USD, EUR, JPY, CNY, GBP, HKD) | 5분 |
| `/api/branches` | GET | 영업점/ATM 위치 | 1시간 |

> 현재 플레이스홀더 데이터. 프로덕션에서는 실제 API(한국수출입은행 등) 연동 필요.

---

## 3. AI 연동

### 3.1 현재 설정 (EditClient.tsx)

```typescript
// 기본 활성: OpenRouter
sendCommandUrl: '/api/openrouter'
sendCommandStreamUrl: '/api/openrouter/stream'
systemModel: 'openai/gpt-4o-mini'

// 비활성 (주석 처리): OpenAI
// sendCommandUrl: '/api/openai'
// sendCommandStreamUrl: '/api/openai/stream'
```

전환 방법: `EditClient.tsx`에서 두 블록의 주석을 토글

### 3.2 사용 가능한 모델 목록

**코드 생성 모델**
- Claude Opus 4.5 / Sonnet 4.5
- GPT-5, GPT-5.1, GPT-5 Mini
- Gemini 3 Pro, 2.5 Flash, 2.5 Pro
- Qwen 3 Coder, DeepSeek V3.1, Grok 4, Kimi K2, MiniMax M2, Mistral 계열

**채팅 모델**
- GPT-4o, GPT-4o Mini, GPT-5
- Claude Sonnet 4.5
- Gemini 2.5 계열, Mistral, DeepSeek, Grok

**기본값**: 코드 `google/gemini-3-pro-preview`, 채팅 `openai/gpt-5-mini`

**Function Calling**: 고정 모델 `anthropic/claude-3.5-sonnet` (모델 선택과 무관)

### 3.3 이미지 생성 (FAL)

```
요청 흐름:
1. POST /api/assets/request-fal  → request_id 반환
2. POST /api/assets/status-fal   → 상태 폴링 (5초 간격)
3. POST /api/assets/result-fal   → 이미지 다운로드 후 로컬 저장
```

이미지 저장: `public/uploads/ai-{random5}.{ext}`

---

## 4. 데이터 저장

### 4.1 콘텐츠

```
저장 위치: data/{bank}.json
포맷:
{
  "content": "<html>...</html>",
  "updated": "2026-03-12T10:30:00.000Z"
}
```

탭마다 독립 파일. `ibk` → `data/ibk.json`, `custom-xxx` → `data/custom-xxx.json`

> 프로덕션에서는 PostgreSQL/MongoDB 등 DB로 교체 필요.

### 4.2 업로드 파일

```
저장 위치: public/uploads/{path}/
정적 서빙: /uploads/{path}/filename
최대 크기: 100MB
```

> 프로덕션에서는 S3/CDN으로 교체 필요.

### 4.3 탭 목록

```
localStorage 키:
  cms-default-tabs  → 기본 탭 목록 (삭제 반영)
  cms-custom-tabs   → 사용자 추가 탭 목록
```

---

## 5. 환경변수 (.env)

```bash
OPENROUTER_API_KEY=    # AI 텍스트 생성 (기본)
OPENAI_API_KEY=        # AI 텍스트 생성 (대안)
FAL_API_KEY=           # AI 이미지 생성 (fal.ai)
GEMINI_API_KEY=        # Google GenAI (웹 버전)
UPLOAD_PATH=           # 업로드 경로 (기본: public/uploads/)
UPLOAD_URL=            # 업로드 URL prefix (기본: uploads/)
```

---

## 6. 금융 플러그인 목록

`public/assets/plugins/{name}/index.js + style.css` 형식으로 각각 존재. 사용 시 lazy-load.

### 금융 도메인 (9개)

| 플러그인 ID | 한글명 | 설명 |
|------------|--------|------|
| `app-header` | 상단 네비게이션 | 로고 + 햄버거 메뉴 |
| `product-menu` | 퀵뱅킹 메뉴 | 아이콘 그리드 (조회·이체·카드 등) |
| `product-gallery` | 금융 상품 갤러리 | 예금/적금/대출 스와이프 카드 |
| `exchange-board` | 환율 및 금융 지수 | USD·EUR·JPY·CNY 실시간 환율 |
| `branch-locator` | 영업점/ATM 위치 | 지도 + 바텀시트 영업점 목록 |
| `promo-banner` | 홍보 배너 | 스와이프 배너 |
| `media-video` | 미디어 | 유튜브 임베드 |
| `loan-calculator` | 금융 계산기 | 대출·예금·적금 탭 전환 계산기 |
| `auth-center` | 보안·인증센터 | 공동인증서·금융인증서·OTP·보안카드 |

### 일반 플러그인 (25개+)

logo-loop, click-counter, card-list, accordion, hero-animation, animated-stats, timeline, before-after-slider, more-info, social-share, pendulum, browser-mockup, hero-background, cta-buttons, media-slider, media-grid, particle-constellation, vector-force, aurora-glow, simple-stats, faq, callout-box, code, video-embed, swiper-slider

---

## 7. 보안

| 항목 | 처리 방식 |
|------|----------|
| **API 키** | 서버 `.env`에만 저장, 클라이언트 미노출 |
| **Bank ID** | `/^[a-z0-9-]{1,64}$/` 정규식 검증 |
| **파일 경로** | `..` 포함 검사 + `startsWith(baseDir)` 확인 |
| **파일명** | 특수문자 → `_` 새니타이징 |
| **파일 크기** | 100MB 제한 |
| **에러 응답** | 민감 정보 미노출 |

---

## 8. 에러 응답 패턴

ContentBuilder 라이브러리 규약으로 일부 API는 HTTP 200에 body.error를 사용.

```typescript
// ContentBuilder 규약 (라이브러리가 body.error 확인)
{ ok: false, error: "메시지" }      // HTTP 200

// 일반 Next.js 패턴
{ error: "메시지" }                  // HTTP 400 / 500
```

---

## 9. 주요 컴포넌트

### EditClient.tsx
- ContentBuilder / ContentBuilderRuntime 인스턴스 관리
- 탭(페이지) 관리: 추가·삭제·localStorage 영속화
- 블록 순서 변경 패널 (드래그앤드롭)
- 금융 컴포넌트 우측 패널
- 저장 / 미리보기 / HTML 보기

### FileBrowser.tsx
- 파일/폴더 탐색 (트리 + 카드 뷰)
- 드래그앤드롭 업로드, 다중 삭제, 폴더 생성
- 에디터와 `postMessage` 통신 (`ASSET_SELECTED` 이벤트)

### ViewClient.tsx
- 저장된 HTML을 `dangerouslySetInnerHTML`로 렌더링
- ContentBuilderRuntime으로 플러그인 활성화

---

## 10. 프로덕션 체크리스트

- [ ] 파일 기반 저장 → DB(PostgreSQL/MongoDB) 전환
- [ ] `public/uploads/` → S3/CDN 전환
- [ ] `/api/exchange` 실제 환율 API 연동
- [ ] `/api/branches` 실제 지점 DB 연동
- [ ] 인증/권한 레이어 추가 (현재 없음)
- [ ] FAL AI S3 저장 활성화
- [ ] 로깅 및 모니터링 구성
- [ ] HTTPS 설정
