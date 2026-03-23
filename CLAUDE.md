# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 언어 및 커뮤니케이션 원칙

- **모든 코드 주석, 변수명(의미 단위), UI 텍스트, 에디터 라벨은 한국어 기반으로 작성**
- 사용자와의 대화, 코드 설명, 문서 작성 모두 한국어로 응답
- 영문 라이브러리 API·타입명은 그대로 유지 (Next.js, TypeScript 등)

## Project Overview

Springware CMS — ContentBuilder.js 기반 비주얼 웹 콘텐츠 빌더 CMS.
Next.js 15.5.4 (App Router), React 19, TypeScript, Tailwind CSS 4. Path alias: `@/*` → `./src/*`

## 프로젝트 설명
1. 금융권 특화 웹 에디터
2. 목적:개발자가 아닌 사람도 쉽게 웹 에디터를 이용하여 화면을 만들 수 있다.
3. 웹 에디터로 만드는 화면은 모바일 앱 화면
4. 금융권 특화로, 금융권 모바일 앱 화면을 만들기 용이한 컴포넌트들으르 제공한다.
5. 각 컴포넌트들을 에디터로 드래그앤드랍한 뒤 컴포넌트의 색, 글씨 등 간단한 수정만으로 금융권 모바일 앱을 위한 화면을 만들 수 있는 에디터를 만드는 것을 목표로 한다.


## File Structure

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (Geist 폰트, 다크모드 CSS 변수)
│   ├── globals.css             # Tailwind + .btns 에디터 버튼 스타일
│   ├── page.tsx                # / — 랜딩 페이지 (Link → /edit)
│   ├── edit/
│   │   ├── page.tsx            # 서버 컴포넌트 (단순 래퍼)
│   │   ├── EditClient.tsx      # ★ 핵심 — ContentBuilder 인스턴스 생성, 플러그인 등록, AI 모델 설정, 저장/미리보기
│   │   ├── EditClientLoader.tsx # EditClient 동적 로더 (SSR 방지용 dynamic import 래퍼)
│   │   ├── ComponentPanel.tsx  # 우측 패널 — 금융 컴포넌트 탭 UI
│   │   ├── finance-component-data.ts # 금융 컴포넌트 데이터 (IBK 데모 포함)
│   │   └── ko.ts               # ContentBuilder 한국어 로컬라이제이션
│   ├── view/
│   │   ├── page.tsx            # 서버 컴포넌트 — DB에서 html 읽어서 prop 전달
│   │   └── ViewClient.tsx      # ContentBuilderRuntime으로 저장된 HTML 렌더링 (dangerouslySetInnerHTML)
│   ├── files/
│   │   └── page.tsx            # FileBrowser에 API 엔드포인트 주입
│   └── api/
│       ├── builder/
│       │   ├── load/route.ts   # POST — DB에서 HTML 로드
│       │   ├── save/route.ts   # POST — HTML을 DB에 저장 ({content, updated})
│       │   └── upload/route.ts # POST — FormData 파일 → public/uploads/ 저장, URL 반환
│       ├── manage/
│       │   ├── files/route.ts  # GET — 파일 목록 (페이지네이션 10개/페이지, 디렉토리 우선 정렬)
│       │   ├── folders/route.ts# GET — 재귀 폴더 트리 구조 반환
│       │   ├── upload/route.ts # POST — 파일 업로드 (최대 100MB)
│       │   ├── delete/route.ts # DELETE — 파일/폴더 재귀 삭제
│       │   └── addfolder/route.ts # POST — 새 폴더 생성
│       ├── openrouter/
│       │   ├── route.ts        # POST — OpenRouter API 프록시 (일반 + Function Calling)
│       │   └── stream/route.ts # POST — OpenRouter 스트리밍 응답
│       ├── openai/
│       │   ├── route.ts        # POST — OpenAI API 프록시 (Responses/Chat 엔드포인트)
│       │   └── stream/route.ts # POST — OpenAI 스트리밍 응답
│       ├── fal/
│       │   ├── request/route.ts      # POST — FAL AI 이미지 생성 큐 등록
│       │   ├── status/route.ts       # POST — 요청 상태 확인
│       │   ├── result/route.ts       # POST — 생성된 이미지 결과 조회
│       │   └── cleanup/route.ts      # POST — 임시 데이터 정리
│       ├── exchange/route.ts   # GET — 환율 데이터 (exchange-board 컴포넌트용)
│       ├── branches/route.ts   # GET — 영업점/ATM 위치 데이터 (branch-locator 컴포넌트용)
│       ├── components/route.ts # GET — 등록된 컴포넌트 목록
│       └── health/route.ts     # GET — 헬스 체크
├── components/
│   └── files/                  # 파일 브라우저 컴포넌트 (모두 'use client')
│       ├── FileBrowser.tsx     # ★ 메인 — 상태 관리, 업로드, 삭제, 무한스크롤, postMessage 통신
│       ├── Sidebar.tsx         # 좌측 사이드바 (폴더 트리 래퍼)
│       ├── FolderTree.tsx      # 재귀 폴더 트리 렌더링 (level prop으로 들여쓰기)
│       ├── FileCard.tsx        # 파일/폴더 카드 (이미지 프리뷰, 선택 체크박스)
│       ├── Breadcrumbs.tsx     # 경로 탐색 (path 세그먼트 클릭)
│       ├── CreateFolderModal.tsx    # 폴더 생성 모달
│       ├── DeleteConfirmModal.tsx   # 삭제 확인 모달
│       └── UploadProgressList.tsx   # 업로드 진행률 표시
├── db/                         # Oracle DB 레이어
│   ├── connection.ts           # Oracle DB 커넥션 풀 관리
│   ├── types.ts                # DB 타입 정의
│   ├── ddl/
│   │   ├── V1__init_schema.sql # 초기 스키마 DDL
│   │   └── V1__triggers.sql    # DB 트리거
│   ├── queries/
│   │   ├── page.sql.ts         # 페이지 쿼리
│   │   ├── component.sql.ts    # 컴포넌트 쿼리
│   │   ├── component-map.sql.ts# 컴포넌트 매핑 쿼리
│   │   ├── page-history.sql.ts # 페이지 이력 쿼리
│   │   ├── file-send.sql.ts    # 파일 전송 쿼리
│   │   └── server.sql.ts       # 서버 쿼리
│   ├── repository/
│   │   ├── page.repository.ts  # 페이지 데이터 접근 레이어
│   │   ├── component.repository.ts  # 컴포넌트 데이터 접근 레이어
│   │   └── file-send.repository.ts  # 파일 전송 데이터 접근 레이어
│   └── seed/
│       ├── run-seed.ts         # 시드 실행 진입점
│       ├── seed-basic-blocks.ts# 기본 블록 시드 데이터
│       └── seed-components.ts  # 컴포넌트 시드 데이터
├── types/
│   ├── contentbuilder-runtime.d.ts  # ContentBuilderRuntime 타입 선언
│   └── oracledb.d.ts           # oracledb 모듈 타입 보강
data/                           # 로컬 개발용 JSON 파일 (레거시/백업)
└── index.json                  # 저장된 콘텐츠 ({content: "<html>", updated: "ISO날짜"})
public/
├── uploads/                    # 업로드된 파일 (정적 서빙)
├── runtime/                    # ContentBuilder 런타임 라이브러리
│   ├── contentbuilder-runtime.esm.js / .min.js / .css
│   ├── contentbuilder-blocks-runtime.esm.js / .min.js / .css
│   └── contentbuilder-interactive-runtime.esm.js / .min.js / .css
└── assets/
    ├── minimalist-blocks/      # ContentBuilder 스니펫 (content-plugins.js 등)
    ├── plugins/<name>/         # 플러그인별 index.js + style.css (50개+, 런타임 lazy-load)
    ├── scripts/                # 서드파티 스크립트 (glide, glightbox, slick, tabs, formbuilderai 등)
    ├── fonts/                  # Google Fonts 프리뷰 이미지 (300개+)
    └── modules/                # 빌더 모달 HTML (form-builder, slider-builder, media-grid-builder 등)
scripts/
└── seed-pages.ts               # 페이지 시드 스크립트 (직접 실행용)
migrations/                     # DB 마이그레이션 파일 디렉토리
docs/                           # 프로젝트 문서
├── guide/                      # 실무 가이드 (어떻게 할 것인가)
│   └── 컴포넌트-개발-가이드.md  # 신규 컴포넌트 구현 순서 및 코드 패턴
├── reference/                  # 참조 자료 (무엇인가)
│   ├── 기술-개요.md             # 기술 스택, API 목록, 데이터 저장 방식
│   ├── UI-스타일-가이드.md      # 색상·타이포·간격·컴포넌트별 스타일 토큰
│   └── UI-용어-정의.md          # 에디터 UI 영역 명칭 및 소통 용어
└── convention/                 # 팀 규칙 (어떤 규칙으로 개발하는가)
    └── 코딩-컨벤션.md           # 네이밍, 타입, API 구조, 에러 처리 등
```

## Component Details

### EditClient.tsx (핵심 파일)
- `useRef`로 ContentBuilder + ContentBuilderRuntime 인스턴스 관리, unmount시 destroy
- ContentBuilder 옵션: upload 핸들러, AI 엔드포인트, 모델 목록, 이미지 생성 설정, filePicker
- Runtime은 `window.builderRuntime`에 전역 등록 (에디터 내부에서 플러그인 미리보기용)
- 하단 고정 버튼: HTML 보기 / Preview (새 탭 /view) / Save
- AI 설정: OpenRouter 단일 사용 (`/api/openrouter`) — OpenAI 직접 연결 설정 블록 제거됨
- `ko.ts`로 ContentBuilder UI 한국어 번역 주입

### EditClientLoader.tsx
- `dynamic(() => import('./EditClient'), { ssr: false })` 래퍼
- ContentBuilder가 브라우저 전용이므로 SSR 비활성화 처리

### ComponentPanel.tsx
- 우측 패널의 금융 컴포넌트 탭 UI (드래그·클릭으로 캔버스에 블록 추가)
- `finance-component-data.ts`에서 컴포넌트 메타데이터 import

### FileBrowser.tsx (파일 관리 메인)
- Props: `apiEndpoints` (5개 API 경로), `className`
- 내부 상태: currentPath, files, folderTree, selectedFiles, uploads, pagination
- 에디터와 통신: 파일 클릭시 `window.opener.postMessage({type: 'ASSET_SELECTED', url})` 전송
- 드래그앤드롭 업로드, 다중 선택 삭제, 폴더 생성

### ViewClient.tsx
- 서버에서 받은 html을 `dangerouslySetInnerHTML`로 렌더링
- ContentBuilderRuntime 초기화 → `runtime.init()` → 플러그인 활성화

### DB 레이어 (src/db/)
- `connection.ts`: oracledb 커넥션 풀 싱글턴, `initPool()` / `getConnection()` / `closePool()` 제공
- `repository/*.ts`: SQL 쿼리를 추상화한 데이터 접근 레이어 (page, component, file-send)
- `queries/*.sql.ts`: 각 도메인별 SQL 문자열 상수 모음
- `ddl/`: Flyway 스타일 버전 네이밍 SQL (V1__init_schema.sql, V1__triggers.sql)

## 기능별 구현 위치

| 기능 | 파일 |
|---|---|
| 에디터 초기화·플러그인 등록 | `src/app/edit/EditClient.tsx` |
| 에디터 SSR 방지 로딩 | `src/app/edit/EditClientLoader.tsx` |
| 금융 컴포넌트 패널 UI | `src/app/edit/ComponentPanel.tsx` |
| 금융 컴포넌트 HTML 데이터 | `src/app/edit/finance-component-data.ts` |
| ContentBuilder 한국어 번역 | `src/app/edit/ko.ts` |
| 저장된 HTML 렌더링(뷰어) | `src/app/view/ViewClient.tsx` |
| 페이지 저장 API | `src/app/api/builder/save/route.ts` → `src/db/repository/page.repository.ts#updatePage/createPage` |
| 페이지 불러오기 API | `src/app/api/builder/load/route.ts` → `src/db/repository/page.repository.ts#getPageById` + `getLatestHistory` |
| 에디터 내 파일 업로드 | `src/app/api/builder/upload/route.ts` |
| AI 코드 생성 (일반) | `src/app/api/openrouter/route.ts` (기본 모델: `openai/gpt-4o-mini`) |
| AI 코드 생성 (스트리밍) | `src/app/api/openrouter/stream/route.ts` |
| AI 이미지 생성 | `src/app/api/fal/request` → `status` → `result` (FAL AI 큐 방식) |
| 환율 데이터 | `src/app/api/exchange/route.ts` |
| 영업점/ATM 위치 데이터 | `src/app/api/branches/route.ts` |
| 파일 브라우저 상태·업로드·삭제 | `src/components/files/FileBrowser.tsx` |
| 파일 브라우저 API (목록/업로드/삭제/폴더) | `src/app/api/manage/` |
| Oracle DB 커넥션 풀·트랜잭션 | `src/db/connection.ts` (`getConnection`, `withTransaction`, `clobBind`) |
| 페이지 DB CRUD | `src/db/repository/page.repository.ts` |
| 컴포넌트 DB CRUD | `src/db/repository/component.repository.ts` |

## Key Patterns

- **데이터 저장**: Oracle DB 기반 (`src/db/repository/page.repository.ts`). `data/index.json`은 로컬 개발용 레거시 파일
- **파일 업로드**: `public/uploads/`에 저장, 정적 서빙. 프로덕션에서는 S3 등으로 교체 필요
- **AI 프록시**: API 키를 서버에 보관, 클라이언트는 `/api/openrouter` 등으로 요청
- **Function Calling**: `anthropic/claude-3.5-sonnet` 고정 (모델 선택과 무관)
- **API 에러 응답**: HTTP 200 + JSON body에 error 필드 (ContentBuilder 라이브러리 규약)
- **보안**: 파일 관리 API에 디렉토리 트래버설 방지 (`..` 포함 체크), 파일명 새니타이징
- **플러그인**: `public/assets/plugins/<name>/`에 각각 index.js + style.css, 사용시에만 lazy-load
- **에디터↔파일 피커 통신**: `window.postMessage` (`ASSET_SELECTED` 이벤트)
- **SSR 방지**: ContentBuilder는 브라우저 전용 — `EditClientLoader.tsx`에서 `dynamic(..., { ssr: false })` 처리
- **한국어 로컬라이제이션**: `ko.ts`에서 ContentBuilder UI 문자열 전부 한국어로 오버라이드

## 에디터 사용 방법 (한글 가이드)

### 블록 추가하기
1. `http://localhost:3000/edit` 접속
2. 우측 패널 **"금융 컴포넌트"** 탭: 금융 도메인 전용 컴포넌트 8종을 드래그 또는 `+` 클릭으로 캔버스에 추가
3. 에디터 캔버스에서 `+` 버튼 클릭 → ContentBuilder 기본 피커(텍스트·이미지·레이아웃 등 일반 블록)

### 금융 컴포넌트 목록 (우측 패널 — 금융 컴포넌트 탭)
> **IBK 기업은행은 데모 예시입니다.** 실제 사용 시 `finance-component-data.ts`의 HTML 내용을 해당 금융사 브랜드에 맞게 교체합니다.

| 컴포넌트 | 설명 |
|---|---|
| 상단 네비게이션 | 로고·메뉴·햄버거 헤더 (데모: IBK/하나/KB 링크) |
| 퀵뱅킹 메뉴 | 아이콘 그리드 (조회·이체·카드·예금·대출 등) |
| 금융 상품 갤러리 | 스와이프 카드 (예금·적금·대출 금리 표시) |
| 환율 및 금융 지수 | USD·EUR·JPY·CNY 실시간 환율 + 환전 신청 버튼 |
| 영업점/ATM 위치 | 지도 영역 + 바텀시트 영업점 목록 |
| 홍보 배너 & 미디어 | 스와이프 배너 + 유튜브 영상 임베드 |
| 금융 계산기 | 대출·예금·적금 탭 전환 계산기 |
| 보안·인증센터 | 공동인증서·금융인증서·OTP·보안카드 |

### 블록 내용 편집하기
- 블록 클릭 → 우측 패널에서 **연필(✏) 아이콘** 클릭 → 항목 편집 (이름·링크·설명 수정, 항목 추가/삭제)
- 블록 클릭 → 우측 패널에서 **톱니바퀴(⚙) 아이콘** 클릭 → 색상·레이아웃 등 설정 변경

### 저장 및 미리보기
- 하단 **`Save`** 버튼: 현재 콘텐츠를 `data/index.json`에 저장
- 하단 **`Preview`** 버튼: 저장 후 `/view` 페이지를 새 탭으로 열어 실제 렌더링 확인
- 하단 **`HTML`** 버튼: 생성된 HTML 코드 직접 확인·편집

### 컴포넌트 파일 구조
- `src/app/edit/finance-component-data.ts` — 금융 컴포넌트 데이터 (우측 패널용, IBK 데모 포함)
- `public/assets/minimalist-blocks/content-plugins.js` — ContentBuilder 기본 블록 (텍스트·이미지·레이아웃 등)

## Environment Variables (.env)

```
OPENROUTER_API_KEY    # AI 코드 생성 (기본 프로바이더)
OPENAI_API_KEY        # AI 대안 프로바이더
FAL_API_KEY           # AI 이미지 생성 (fal.ai)
GEMINI_API_KEY        # Google GenAI (웹 버전)
UPLOAD_PATH           # 업로드 경로 (기본: public/uploads/)
UPLOAD_URL            # 업로드 URL (기본: uploads/)
```
