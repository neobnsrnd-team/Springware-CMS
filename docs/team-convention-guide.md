# Springware CMS 팀 컨벤션 가이드

> **Springware CMS** — 금융권 특화 비주얼 웹 콘텐츠 빌더
> Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · OracleDB

---

## 목차

**[Part 1: 프로젝트 시작하기](#part-1-프로젝트-시작하기)**

1. [환경 설정 및 실행](#1-환경-설정-및-실행)
2. [기술 스택](#2-기술-스택)

**[Part 2: 프로젝트 구조](#part-2-프로젝트-구조)** 3. [폴더 구조](#3-폴더-구조) 4. [각 디렉토리 역할](#4-각-디렉토리-역할) 5. [파일 및 폴더 네이밍](#5-파일-및-폴더-네이밍)

**[Part 3: 코드 컨벤션](#part-3-코드-컨벤션)** 6. [컴포넌트 작성 규칙](#6-컴포넌트-작성-규칙) 7. [TypeScript 사용 규칙](#7-typescript-사용-규칙) 8. [API 라우트 작성 규칙](#8-api-라우트-작성-규칙) 9. [공유 유틸리티 (lib/)](#9-공유-유틸리티-lib) 10. [Import 정렬 규칙](#10-import-정렬-규칙) 11. [상태 관리 패턴](#11-상태-관리-패턴) 12. [스타일링 규칙](#12-스타일링-규칙) 13. [에러 처리 규칙](#13-에러-처리-규칙) 14. [주석 규칙](#14-주석-규칙)

**[Part 4: GitHub 컨벤션](#part-4-github-컨벤션)** 15. [브랜치 전략](#15-브랜치-전략) 16. [커밋 메시지](#16-커밋-메시지) 17. [이슈 작성](#17-이슈-작성) 18. [Pull Request](#18-pull-request) 19. [코드 리뷰](#19-코드-리뷰)

**[Part 5: 개발 도구](#part-5-개발-도구)** 20. [코드 포매팅 (Prettier + ESLint)](#20-코드-포매팅-prettier--eslint) 21. [VSCode 설정](#21-vscode-설정) 22. [Git Hooks (husky + lint-staged)](#22-git-hooks-husky--lint-staged)

---

# Part 1: 프로젝트 시작하기

## 1. 환경 설정 및 실행

### 필수 설치

| 도구                  | 버전 | 비고                                    |
| --------------------- | ---- | --------------------------------------- |
| Node.js               | 20+  | LTS 권장                                |
| npm                   | 10+  | Node.js에 포함                          |
| Oracle Instant Client | 19+  | Thick 모드 필요 (구버전 Oracle XE 지원) |

### 최초 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 각 값을 채움 (팀 리드에게 값 요청)

# 3. DB 시드 (최초 1회)
npm run seed

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수 (.env)

```bash
# --- DB (필수) ---
ORACLE_USER=            # Oracle 사용자명
ORACLE_PASSWORD=        # Oracle 비밀번호
ORACLE_HOST=            # Oracle 호스트 (예: localhost)
ORACLE_PORT=            # Oracle 포트 (예: 1521)
ORACLE_SERVICE=         # Oracle 서비스명 (예: XE)
ORACLE_SCHEMA=          # Oracle 스키마명

# --- AI (선택) ---
OPENROUTER_API_KEY=     # OpenRouter API 키 (AI 코드 생성)
OPENAI_API_KEY=         # OpenAI API 키 (대안)
FAL_API_KEY=            # FAL AI API 키 (이미지 생성)

# --- 업로드 (선택, 기본값 있음) ---
UPLOAD_PATH=            # 기본: public/uploads/
UPLOAD_URL=             # 기본: uploads/
```

### npm scripts

```bash
npm run dev         # 개발 서버 (localhost:3000)
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버
npm run lint        # ESLint 검사
npm run format      # Prettier 자동 포매팅
npm run format:check # Prettier 검사 (CI용)
npm run seed        # DB 시드 데이터 삽입
```

---

## 2. 기술 스택

| 영역           | 기술                      | 용도                      |
| -------------- | ------------------------- | ------------------------- |
| **프레임워크** | Next.js 15.5 (App Router) | SSR + API Routes          |
| **UI**         | React 19                  | 컴포넌트 기반 UI          |
| **언어**       | TypeScript (strict)       | 타입 안전성               |
| **스타일**     | Tailwind CSS 4            | 유틸리티 기반 스타일링    |
| **DB**         | OracleDB (oracledb)       | 금융 데이터 저장          |
| **에디터**     | ContentBuilder.js         | 비주얼 웹 빌더 라이브러리 |
| **아이콘**     | Lucide React              | SVG 아이콘                |
| **Path alias** | `@/*` → `./src/*`         | 절대 경로 import          |

---

# Part 2: 프로젝트 구조

## 3. 폴더 구조

Next.js 공식 권장 **"전략 A: app 외부에 프로젝트 파일 보관"** 을 따릅니다.
핵심 원칙: **`app/`은 라우팅만, 나머지는 역할별 디렉토리에.**

```
src/
├── app/                              # 라우팅 전용
│   ├── api/                          # API 라우트
│   │   ├── builder/                  #   에디터 관련 (load, save, pages, upload)
│   │   ├── manage/                   #   파일 관리 (files, folders, upload, delete, addfolder)
│   │   ├── assets/                   #   AI 이미지 생성 (FAL)
│   │   ├── openai/                   #   OpenAI 프록시
│   │   ├── openrouter/               #   OpenRouter 프록시
│   │   ├── branches/route.ts
│   │   ├── components/route.ts
│   │   ├── exchange/route.ts
│   │   └── health/route.ts
│   │
│   ├── edit/                         # /edit — 에디터 페이지
│   │   ├── page.tsx                  #   서버 컴포넌트 래퍼
│   │   ├── loading.tsx               #   로딩 스켈레톤
│   │   └── error.tsx                 #   에러 바운더리
│   ├── view/                         # /view — 미리보기 페이지
│   │   └── page.tsx
│   ├── files/                        # /files — 파일 브라우저
│   │   └── page.tsx
│   │
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── globals.css                   # 전역 스타일
│   ├── not-found.tsx                 # 404 페이지
│   └── page.tsx                      # / — 랜딩 페이지
│
├── components/                       # 모든 React UI 컴포넌트
│   ├── edit/                         #   에디터 관련
│   │   ├── EditClient.tsx            #   ★ 핵심 에디터 컴포넌트
│   │   ├── EditClientLoader.tsx
│   │   └── ComponentPanel.tsx        #   금융 컴포넌트 패널
│   ├── view/                         #   미리보기 관련
│   │   └── ViewClient.tsx
│   ├── files/                        #   파일 브라우저 관련
│   │   ├── FileBrowser.tsx
│   │   ├── FileCard.tsx
│   │   ├── FolderTree.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── CreateFolderModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── UploadProgressList.tsx
│   └── ui/                           #   공통 UI (버튼, 모달 등)
│
├── data/                             # 정적 데이터 / 설정
│   ├── finance-component-data.ts     #   금융 컴포넌트 데이터
│   └── ko.ts                         #   에디터 한국어 번역
│
├── hooks/                            # 커스텀 React 훅
│
├── lib/                              # 유틸리티 / 헬퍼 함수
│   ├── api-response.ts               #   API 응답 헬퍼 (successResponse, errorResponse)
│   ├── upload.ts                     #   업로드 유틸 (normalizeUploadUrl, UPLOAD_PATH)
│   ├── env.ts                        #   환경변수 중앙 관리
│   ├── constants.ts                  #   비즈니스 상수
│   └── current-user.ts              #   현재 사용자 정보
│
├── db/                               # 데이터베이스 계층
│   ├── connection.ts                 #   커넥션 풀 관리
│   ├── types.ts                      #   DB 엔티티 타입
│   ├── ddl/                          #   스키마 정의 (DDL)
│   ├── queries/                      #   SQL 쿼리 (TypeScript)
│   ├── repository/                   #   데이터 접근 계층
│   └── seed/                         #   시드 데이터
│
└── types/                            # 글로벌 타입 선언
    ├── global.d.ts                   #   Window 전역 타입 확장
    ├── contentbuilder-runtime.d.ts
    └── oracledb.d.ts
```

---

## 4. 각 디렉토리 역할

> **"이 파일 어디에 만들지?"** 에 대한 답

| 만들려는 파일             | 넣는 곳                   | 예시                               |
| ------------------------- | ------------------------- | ---------------------------------- |
| 새 페이지 (URL)           | `app/[경로]/page.tsx`     | `app/dashboard/page.tsx`           |
| API 엔드포인트            | `app/api/[경로]/route.ts` | `app/api/users/route.ts`           |
| React 컴포넌트            | `components/[도메인]/`    | `components/edit/Toolbar.tsx`      |
| 여러 곳에서 쓰는 공통 UI  | `components/ui/`          | `components/ui/Button.tsx`         |
| 유틸리티 함수             | `lib/`                    | `lib/format-date.ts`               |
| 커스텀 React 훅           | `hooks/`                  | `hooks/useDebounce.ts`             |
| 정적 데이터 / 설정        | `data/`                   | `data/bank-list.ts`                |
| DB 쿼리 추가              | `db/queries/`             | `db/queries/user.sql.ts`           |
| DB 접근 함수 추가         | `db/repository/`          | `db/repository/user.repository.ts` |
| DB 타입 추가              | `db/types.ts`             | `interface CmsUser { ... }`        |
| 외부 라이브러리 타입 확장 | `types/`                  | `types/some-lib.d.ts`              |
| 환경변수 추가             | `lib/env.ts`              | `export const NEW_KEY = ...`       |

### 핵심 원칙

- **`app/` 폴더에는 Next.js 특수 파일만** 둔다 (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`)
- **컴포넌트는 반드시 `components/`에** — 예외 없음
- **`as any` 쓰기 전에 `types/`에서 타입 확장을 시도**
- **공유되는 로직은 `lib/`에** — API 라우트 안에 유틸 함수를 직접 정의하지 않음

---

## 5. 파일 및 폴더 네이밍

| 대상                | 규칙                        | 예시                                 |
| ------------------- | --------------------------- | ------------------------------------ |
| React 컴포넌트 파일 | **PascalCase.tsx**          | `EditClient.tsx`, `FileCard.tsx`     |
| 그 외 모든 .ts 파일 | **kebab-case.ts**           | `api-response.ts`, `page.sql.ts`     |
| 폴더명              | **kebab-case**              | `components/edit/`, `db/repository/` |
| API 라우트 파일     | **route.ts** (Next.js 고정) | `app/api/builder/save/route.ts`      |

```
컴포넌트 → PascalCase.tsx
그 외 .ts → kebab-case.ts
폴더 → 항상 kebab-case
```

---

# Part 3: 코드 컨벤션

## 6. 컴포넌트 작성 규칙

### 함수 선언 — `function` + `export default`

```tsx
// Good
export default function FileCard({ file, isSelected }: FileCardProps) {
  return <div>...</div>;
}

// Bad — 화살표 함수 컴포넌트
const FileCard = ({ file }: FileCardProps) => <div>...</div>;
export default FileCard;
```

### 'use client' — 파일 최상단 (import 이전)

```tsx
"use client";

import React, { useState } from "react";
```

### Props 타입명 — `[컴포넌트명]Props`

```tsx
// Good
interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
}

// Bad — 단순 Props (파일 간 이름 충돌 가능)
interface Props { ... }
```

### 파일 내부 구조 순서

```tsx
'use client';

// 1. import
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// 2. 타입 / 인터페이스
interface MyComponentProps { ... }

// 3. 상수
const PANEL_WIDTH = 264;

// 4. 컴포넌트 함수
export default function MyComponent({ prop }: MyComponentProps) {
  // 4-1. useState / useRef
  const [state, setState] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // 4-2. useMemo (파생 상태)
  const derived = useMemo(() => ..., [dep]);

  // 4-3. useCallback (콜백)
  const handleClick = useCallback(() => { ... }, [dep]);

  // 4-4. useEffect (부수 효과)
  useEffect(() => { ... }, [dep]);

  // 4-5. 헬퍼 함수
  function formatValue(val: string) { ... }

  // 4-6. JSX
  return <div>...</div>;
}
```

---

## 7. TypeScript 사용 규칙

### interface vs type

| 용도            | 키워드      | 예시                                     |
| --------------- | ----------- | ---------------------------------------- |
| 객체 구조       | `interface` | `interface CmsPage { ... }`              |
| Union / Literal | `type`      | `type ViewMode = 'mobile' \| 'web'`      |
| 함수 시그니처   | `type`      | `type Handler = (e: MouseEvent) => void` |

### 타입 import — `import type` 명시

```tsx
// Good
import type { CmsPage, ViewMode } from "@/db/types";

// Bad
import { CmsPage } from "@/db/types";
```

### 타입 정의 위치

| 범위                      | 위치                    |
| ------------------------- | ----------------------- |
| 여러 파일에서 공유        | `src/db/types.ts`       |
| 단일 파일 내부            | 해당 파일 상단          |
| Props 타입                | 컴포넌트 파일 내부      |
| 외부 라이브러리 타입 확장 | `src/types/*.d.ts`      |
| window 전역 타입          | `src/types/global.d.ts` |

### null 안전 — 선택적 체이닝 + nullish coalescing 적극 사용

```tsx
const value = result.rows?.[0] ?? null;
const name = item?.name ?? "기본값";
```

---

## 8. API 라우트 작성 규칙

### 기본 구조

```tsx
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  getErrorMessage,
} from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. 입력 검증
    if (!body.requiredField) {
      return errorResponse("필수 필드 누락", 400);
    }

    // 2. 비즈니스 로직
    const result = await someService(body);

    // 3. 성공 응답
    return successResponse(result);
  } catch (err: unknown) {
    console.error("작업 설명:", err);
    return errorResponse(getErrorMessage(err));
  }
}
```

### 응답 형식

**`lib/api-response.ts`의 헬퍼 함수를 사용.** `NextResponse.json()`을 직접 호출하지 않음.

| 상황                | 사용 함수                          | HTTP | 응답 body                     |
| ------------------- | ---------------------------------- | ---- | ----------------------------- |
| 성공                | `successResponse(data)`            | 200  | `{ ok: true, data: ... }`     |
| 성공 (데이터 없음)  | `successResponse()`                | 200  | `{ ok: true }`                |
| 클라이언트 에러     | `errorResponse(msg, 400)`          | 400  | `{ ok: false, error: '...' }` |
| 서버 에러           | `errorResponse(msg)`               | 500  | `{ ok: false, error: '...' }` |
| ContentBuilder 규약 | `contentBuilderErrorResponse(msg)` | 200  | `{ ok: false, error: '...' }` |

> **ContentBuilder 예외**: AI 관련 API (`/api/openrouter`, `/api/openai`)는 라이브러리 규약상
> 에러도 HTTP 200으로 반환해야 합니다. 이 경우에만 `contentBuilderErrorResponse()`를 사용합니다.

### 에러 처리 통일

```tsx
// catch 파라미터: 항상 err: unknown
// 에러 메시지 추출: 항상 getErrorMessage(err)
// 로그 메시지: 항상 한국어
} catch (err: unknown) {
  console.error('페이지 저장 실패:', err);
  return errorResponse(getErrorMessage(err));
}
```

### 입력 검증 패턴

```tsx
// 필수 필드
if (html === undefined || html === null) {
  return errorResponse("html 필드 누락", 400);
}

// 배열 검증
if (!files || !Array.isArray(files) || files.length === 0) {
  return errorResponse("파일 목록이 비어있습니다", 400);
}

// 보안: 디렉토리 트래버설 방지
if (relativePath.includes("..")) {
  return errorResponse("잘못된 경로", 400);
}
```

---

## 9. 공유 유틸리티 (lib/)

코드 중복을 방지하기 위해 공통 로직은 `lib/`에 모아서 관리합니다.

### `lib/api-response.ts` — API 응답 헬퍼

```tsx
import {
  successResponse,
  errorResponse,
  contentBuilderErrorResponse,
  getErrorMessage,
} from "@/lib/api-response";
```

### `lib/env.ts` — 환경변수 중앙 관리

```tsx
import { OPENROUTER_API_KEY, ORACLE_CONFIG } from "@/lib/env";

// 직접 process.env 접근 금지 (lib/env.ts 외부에서)
// Bad: const key = process.env.OPENROUTER_API_KEY;
// Good: import { OPENROUTER_API_KEY } from '@/lib/env';
```

### `lib/upload.ts` — 업로드 유틸

```tsx
import { UPLOAD_PATH, UPLOAD_URL, normalizeUploadUrl } from "@/lib/upload";
```

### `lib/constants.ts` — 비즈니스 상수

```tsx
import {
  DEFAULT_BANK_ID,
  DEFAULT_VIEW_MODE,
  MAX_FILE_SIZE,
} from "@/lib/constants";

// 매직 넘버 직접 사용 금지
// Bad: const bank = body.bank || 'ibk';
// Good: const bank = body.bank || DEFAULT_BANK_ID;
```

### 원칙

- **API 라우트 내부에 유틸 함수를 정의하지 않는다** → `lib/`에 분리
- **`process.env`는 `lib/env.ts`에서만 직접 접근**
- **하드코딩 상수는 `lib/constants.ts`에 정의**

---

## 10. Import 정렬 규칙

**4단계 그룹**, 그룹 간 빈 줄로 구분

```tsx
// 1단계: React / Next.js
import React, { useEffect, useRef, useState } from "react";
import { NextRequest } from "next/server";
import Image from "next/image";

// 2단계: 외부 라이브러리
import ContentBuilder from "@innovastudio/contentbuilder";
import { Upload, Trash2 } from "lucide-react";

// 3단계: 내부 모듈 (@/ alias)
import { successResponse, errorResponse } from "@/lib/api-response";
import { getPageById } from "@/db/repository/page.repository";
import type { CmsPage } from "@/db/types";

// 4단계: 상대 경로 + CSS
import type { FinanceComponent } from "./finance-component-data";
import "@innovastudio/contentbuilder/public/contentbuilder/contentbuilder.css";
```

### 규칙

- **`@/*` 절대 경로** 를 항상 사용 (상대 경로는 같은 디렉토리 내에서만)
- **`import type`** 은 같은 그룹 내에서 일반 import 뒤에 배치
- **CSS import**는 최하단

---

## 11. 상태 관리 패턴

### useState — 복잡한 타입은 제네릭 명시

```tsx
const [loading, setLoading] = useState(false); // 추론 가능
const [files, setFiles] = useState<FileItem[]>([]); // 제네릭 명시
const [error, setError] = useState<string | null>(null);
```

### useRef — 용도별 초기값

```tsx
const containerRef = useRef<HTMLDivElement>(null); // DOM 참조
const builderRef = useRef<ContentBuilder | null>(null); // 라이브러리 인스턴스
const isFetchingRef = useRef(false); // 렌더링 무관 플래그
```

### useCallback / useMemo — 의존성 배열 필수

```tsx
const handleClick = useCallback(async () => { ... }, [dependency]);
const componentMap = useMemo(() => Object.fromEntries(...), [items]);
```

### useEffect — cleanup 패턴

```tsx
useEffect(() => {
  const runtime = new ContentBuilderRuntime({ ... });
  runtime.init();
  return () => runtime.destroy();  // cleanup 필수
}, []);
```

---

## 12. 스타일링 규칙

### Tailwind CSS 우선

```tsx
// Good — Tailwind
<div className="flex items-center gap-2 px-3 py-1.5 rounded-md">

// 조건부 클래스
<div className={`rounded-md ${isActive ? 'bg-[#EBF4FF] text-[#0046A4]' : 'text-gray-700'}`}>
```

### 인라인 스타일 — 동적 값에만 허용

```tsx
// 허용 — 런타임 동적 값
<div style={{ maxWidth: `${width}px` }}>

// 지양 — Tailwind로 대체 가능한 정적 스타일
<div style={{ padding: '6px 14px' }}>   // Bad
<div className="px-3.5 py-1.5">          // Good
```

### 프로젝트 색상

```
기업 브랜드: #004B9C, #0064C8, #0046A4
배경 강조:   #EBF4FF
텍스트:      gray-600, gray-700, gray-900
```

---

## 13. 에러 처리 규칙

### DB 단건 조회 — try-finally

```tsx
export async function getPageById(pageId: string): Promise<CmsPage | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<CmsPage>(SQL, { pageId }, OBJ);
    return result.rows?.[0] ?? null;
  } finally {
    await conn.close(); // 반드시 커넥션 반환
  }
}
```

### 트랜잭션 — `withTransaction` 유틸

```tsx
await withTransaction(async (conn) => {
  await conn.execute(UPDATE_SQL, params);
  await conn.execute(INSERT_HISTORY_SQL, historyParams);
  // 자동 commit / 에러 시 자동 rollback
});
```

### API 라우트 — `try-catch` + 한국어 로깅

```tsx
} catch (err: unknown) {
  console.error('페이지 저장 실패:', err);
  return errorResponse(getErrorMessage(err));
}
```

---

## 14. 주석 규칙

### 언어: 한국어 기반 (기술 용어는 영문 유지)

```tsx
// 커넥션 풀 설정 (최초 호출 시 Oracle Client 초기화)
// Promise 캐싱 패턴: 레이스 컨디션 방지
```

### 주석 형식

```tsx
// 파일 섹션 구분
// ============================================================================
// SPW_CMS_PAGE — Repository
// ============================================================================

// 함수 설명 (간략 JSDoc)
/** 페이지 단건 조회 */
export async function getPageById(pageId: string): Promise<CmsPage | null> { ... }

// TODO
// TODO: 로그인 기능 구현 시 세션/토큰 기반으로 교체
```

### 금지 사항

```tsx
// Bad — 코드 내용 반복
const count = items.length; // 아이템 개수를 구함

// Bad — 주석 처리된 코드 방치 (Git 히스토리에서 복원 가능)
// const oldMethod = () => { ... };

// Good — "왜"를 설명하는 주석
// ContentBuilder 규약: AI 에러도 HTTP 200으로 반환해야 함
return contentBuilderErrorResponse(msg);
```

---

# Part 4: GitHub 컨벤션

## 15. 브랜치 전략

```
main                      # 프로덕션 (직접 push 금지)
feat/#[이슈번호]           # 기능 개발       예: feat/#32
fix/#[이슈번호]            # 버그 수정       예: fix/#60
refactor/#[이슈번호]       # 리팩토링        예: refactor/#67
chore/#[이슈번호]          # 설정/유지보수    예: chore/#64
docs/#[이슈번호]           # 문서            예: docs/#64
```

### 워크플로우

```
1. main에서 브랜치 생성:  git checkout -b feat/#99
2. 작업 + 커밋
3. push:                 git push -u origin feat/#99
4. GitHub에서 PR 생성
5. 코드 리뷰 + 승인
6. main에 merge (Squash or Merge commit)
7. 브랜치 삭제
```

---

## 16. 커밋 메시지

### 형식

```
type #이슈번호: 한글 설명
```

### 예시

```
feat #32: data/index.json 제거 및 파일 폴백 코드 정리
fix #60: 탭 목록을 local storage가 아닌 DB에서 불러오도록 수정
fix #50: PAGE_UPDATE 시 pageName null로 인한 ORA-01407 오류 수정
refactor #67: API 응답 헬퍼 함수 생성 및 적용
chore: package-lock.json 업데이트
docs #64: 개발 컨벤션 문서 작성
```

### 타입

| 타입       | 용도                         | 예시                           |
| ---------- | ---------------------------- | ------------------------------ |
| `feat`     | 새 기능 추가                 | 새 API, 새 페이지, 새 컴포넌트 |
| `fix`      | 버그 수정                    | 오류 수정, 예외 처리           |
| `refactor` | 리팩토링 (기능 변경 없음)    | 코드 구조 개선, 중복 제거      |
| `chore`    | 설정, 의존성, 유지보수       | 패키지 업데이트, CI 설정       |
| `docs`     | 문서 수정                    | README, 컨벤션 문서            |
| `test`     | 테스트 추가/수정             | 단위 테스트, E2E 테스트        |
| `style`    | 코드 포매팅 (동작 변경 없음) | Prettier 적용, 들여쓰기 통일   |

### 규칙

- **이슈 번호 필수** (이슈 없는 작업: `chore:`, `style:` 등 예외)
- **한글로 작성** (영문 기술 용어는 그대로)
- **현재형** 사용 (`수정했다` X → `수정` O)

---

## 17. 이슈 작성

### 제목 형식

```
[TYPE]: 한글 설명
```

| TYPE         | 용도           |
| ------------ | -------------- |
| `[Feature]`  | 새 기능        |
| `[Bug]`      | 버그 리포트    |
| `[Refactor]` | 리팩토링       |
| `[UI]`       | UI/디자인 관련 |
| `[DOCS]`     | 문서           |
| `[Chore]`    | 설정/유지보수  |

### 라벨

| 라벨             | 용도       |
| ---------------- | ---------- |
| `Feature ✨`     | 새 기능    |
| `Bug 🐞`         | 버그       |
| `Refactor ⚒️`    | 리팩토링   |
| `UI 💄`          | UI/디자인  |
| `Docs 📚`        | 문서       |
| `Chore 🧹`       | 유지보수   |
| `DevOps 🐳`      | 배포/CI/CD |
| `Security 🛡️`    | 보안       |
| `Performance 🚀` | 성능       |

### 이슈 본문 템플릿

```markdown
## 📌 개요 (Overview)

> 핵심 내용 요약

## 🎯 목표 (Objective)

> 완료 후 모습

## 🛠 상세 구현 내용 (Description)

- [ ] 작업 1
- [ ] 작업 2

## ✅ 인수 기준 (Acceptance Criteria)

- [ ] 조건 1

## 💡 고려 사항 및 대안 (선택)

## 🔗 참고 사항 (선택)
```

---

## 18. Pull Request

### PR 제목

```
type #이슈번호: 한글 설명
```

70자 이내. 커밋 메시지와 동일한 형식.

### PR 본문 템플릿

프로젝트에 `.github/pull_request_template.md`가 설정되어 있어 PR 생성 시 자동으로 채워집니다.

```markdown
## 🔗 관련 이슈 (Related Issues)

- #이슈번호

## ✨ 변경 사항 (Changes)

- 변경 내용 1
- 변경 내용 2

## 📸 변경 사항 확인 (선택)

| 변경 전 (Before) | 변경 후 (After) |
| :--------------- | :-------------- |
| (이미지/GIF)     | (이미지/GIF)    |

## ⚠️ 고려 및 주의 사항 (선택)

## 💬 리뷰 포인트 (선택)
```

### PR 규칙

- 관련 이슈를 반드시 연결 (`Closes #이슈번호` 또는 `Fixes #이슈번호`)
- UI 변경이 있으면 스크린샷 첨부
- Draft PR은 아직 리뷰 준비가 안 된 상태를 의미

---

## 19. 코드 리뷰

### 기본 규칙

| 규칙          | 설명                      |
| ------------- | ------------------------- |
| **리뷰어**    | PR 생성 시 최소 1명 지정  |
| **승인**      | 1명 이상 Approve 필요     |
| **응답 시간** | 리뷰 요청 후 1영업일 이내 |

### 리뷰 시 확인 포인트

- [ ] 이슈에 명시된 요구사항이 충족되었는가
- [ ] 컨벤션(이 문서)을 따르고 있는가
- [ ] 새 유틸 함수가 `lib/`에 있는가 (API 라우트 내부 정의 X)
- [ ] `as any`를 사용하지 않았는가
- [ ] 주석 처리된 코드가 남아있지 않은가
- [ ] `process.env`를 직접 접근하지 않는가 (`lib/env.ts` 사용)
- [ ] 에러 처리가 통일된 패턴을 따르는가 (`err: unknown` + `getErrorMessage`)
- [ ] 빌드가 통과하는가

---

# Part 5: 개발 도구

## 20. 코드 포매팅 (Prettier + ESLint)

### Prettier 설정

**`prettier.config.mjs`**

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  trailingComma: "es5",
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "auto",
};
```

### ESLint 설정

**`eslint.config.mjs`**

```js
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  { ignores: ["node_modules/**", ".next/**", "build/**"] },
];
```

### 포매팅 명령어

```bash
npm run format        # 전체 코드 자동 포매팅
npm run format:check  # 포매팅 위반 확인 (CI용)
npm run lint          # ESLint 검사
```

---

## 21. VSCode 설정

프로젝트에 `.vscode/settings.json`이 포함되어 있어 팀 전체에 동일한 설정이 적용됩니다.

### 필수 확장 프로그램

| 확장                      | ID                          | 용도              |
| ------------------------- | --------------------------- | ----------------- |
| ESLint                    | `dbaeumer.vscode-eslint`    | 코드 품질 검사    |
| Prettier                  | `esbenp.prettier-vscode`    | 코드 포매팅       |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind 자동완성 |

### 공유 설정 (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

> 저장 시 자동 포매팅 + ESLint 자동 수정이 적용됩니다.

---

## 22. Git Hooks (husky + lint-staged)

커밋 시 자동으로 포매팅 검사와 린트가 실행됩니다.

### 동작 방식

```
git commit 실행
  → husky가 pre-commit 훅 실행
    → lint-staged가 스테이징된 파일에 대해:
      1. prettier --write (자동 포매팅)
      2. eslint --fix (자동 수정)
    → 통과하면 커밋 완료
    → 실패하면 커밋 중단 (수정 필요)
```

### 설정

**`package.json`**

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["prettier --write", "eslint --fix"]
  }
}
```

> 포매팅이나 린트 에러가 있으면 커밋이 거부됩니다.
> `eslint --fix`로 자동 수정 가능한 것은 자동 수정 후 커밋됩니다.

---

## 부록: 빠른 참조 카드

### 파일 위치

| 만들 것   | 위치                                 |
| --------- | ------------------------------------ |
| 페이지    | `app/[path]/page.tsx`                |
| API       | `app/api/[path]/route.ts`            |
| 컴포넌트  | `components/[domain]/Name.tsx`       |
| 유틸 함수 | `lib/name.ts`                        |
| 커스텀 훅 | `hooks/useName.ts`                   |
| DB 쿼리   | `db/queries/name.sql.ts`             |
| DB 함수   | `db/repository/name.repository.ts`   |
| 타입      | `db/types.ts` 또는 `types/name.d.ts` |

### 네이밍

| 대상          | 규칙                        |
| ------------- | --------------------------- |
| 컴포넌트 파일 | `PascalCase.tsx`            |
| 그 외 파일    | `kebab-case.ts`             |
| 폴더          | `kebab-case`                |
| 브랜치        | `type/#이슈번호`            |
| 커밋          | `type #이슈번호: 한글 설명` |

### 금지 사항

| 금지                        | 대안                                    |
| --------------------------- | --------------------------------------- |
| `Response.json()`           | `successResponse()` / `errorResponse()` |
| `process.env.XXX` 직접 접근 | `import from '@/lib/env'`               |
| 매직 넘버 하드코딩          | `import from '@/lib/constants'`         |
| `as any`                    | `types/global.d.ts`에서 타입 확장       |
| 주석 처리된 코드 방치       | 삭제 (Git에서 복원)                     |
| `app/` 안에 컴포넌트        | `components/`에 작성                    |
