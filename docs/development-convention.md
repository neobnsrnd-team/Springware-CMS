# Springware CMS 개발 컨벤션 가이드

> **목적**: 팀 개발 환경 전환에 따른 코드 일관성 확보 및 협업 효율화
> **작성일**: 2026-03-20
> **대상**: Springware CMS 프로젝트 전체 개발자

---

## 목차

1. [현재 컨벤션 분석 요약](#1-현재-컨벤션-분석-요약)
2. [파일 및 폴더 네이밍](#2-파일-및-폴더-네이밍)
3. [컴포넌트 작성 규칙](#3-컴포넌트-작성-규칙)
4. [TypeScript 사용 규칙](#4-typescript-사용-규칙)
5. [API 라우트 작성 규칙](#5-api-라우트-작성-규칙)
6. [Import 정렬 규칙](#6-import-정렬-규칙)
7. [상태 관리 패턴](#7-상태-관리-패턴)
8. [스타일링 규칙](#8-스타일링-규칙)
9. [에러 처리 규칙](#9-에러-처리-규칙)
10. [주석 규칙](#10-주석-규칙)
11. [Git 컨벤션](#11-git-컨벤션)
12. [코드 포매팅 및 도구 설정](#12-코드-포매팅-및-도구-설정)
13. [도입 제안 사항](#13-도입-제안-사항)

---

## 1. 현재 컨벤션 분석 요약

현재 프로젝트의 컨벤션 일관성을 분석한 결과입니다.

| 항목 | 일관성 | 비고 |
|------|--------|------|
| 파일/폴더 네이밍 | **높음** | PascalCase/camelCase/kebab-case 구분 명확 |
| 컴포넌트 패턴 | **높음** | function 키워드 + export default 통일 |
| TypeScript | **높음** | interface/type 구분, import type 사용 일관 |
| Import 정렬 | **높음** | React → 외부 → 내부 → CSS 순서 통일 |
| 상태 관리 | **높음** | useState/useRef/useCallback 패턴 명확 |
| 에러 처리 | **높음** | try-catch-finally 패턴 일관 |
| 주석 | **높음** | 한글 기반 통일 |
| Git 커밋 | **높음** | `type #이슈번호: 한글 설명` 형식 |
| 코드 포매팅 | **중간** | 들여쓰기 2칸/4칸 혼용, Prettier 미설정 |
| API 응답 형식 | **중간** | Response/NextResponse 혼용 |
| Props 타입명 | **중간** | `Props` vs `ComponentNameProps` 혼용 |

---

## 2. 파일 및 폴더 네이밍

### 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | **PascalCase** | `EditClient.tsx`, `FileBrowser.tsx` |
| 유틸/라이브러리 파일 | **kebab-case** | `current-user.ts`, `page.repository.ts` |
| API 라우트 폴더 | **kebab-case** | `api/builder/save/` |
| API 라우트 파일 | **route.ts** (Next.js 고정) | `route.ts` |
| DB SQL 파일 | **점(.) 구분 kebab-case** | `page.sql.ts`, `page-history.sql.ts` |
| 타입 정의 파일 | **kebab-case** | `types.ts` |
| 데이터 파일 | **kebab-case** | `finance-component-data.ts` |

### 규칙 요약

```
컴포넌트 → PascalCase.tsx
그 외 모든 .ts 파일 → kebab-case.ts
폴더명 → 항상 kebab-case
```

---

## 3. 컴포넌트 작성 규칙

### 3.1 함수 선언 방식

**`function` 키워드 + `export default` 사용** (화살표 함수 컴포넌트 사용하지 않음)

```tsx
// Good
export default function FileCard({ file, isSelected }: FileCardProps) {
  return <div>...</div>;
}

// Bad - 화살표 함수 컴포넌트
const FileCard = ({ file, isSelected }: FileCardProps) => {
  return <div>...</div>;
};
export default FileCard;
```

### 3.2 'use client' 선언

클라이언트 컴포넌트는 **파일 최상단**에 `'use client'` 선언 (import 이전)

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
```

### 3.3 Props 타입 정의

**`[컴포넌트명]Props` 형식의 interface로 정의** (통일 권장)

```tsx
// Good - 컴포넌트명 + Props
interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onClick: (file: FileItem, e: React.MouseEvent) => void;
}

export default function FileCard({ file, isSelected, onClick }: FileCardProps) { ... }

// Bad - 단순 Props (여러 파일에서 이름 충돌 가능)
interface Props {
  html: string;
}
```

### 3.4 컴포넌트 파일 구조 순서

```tsx
'use client';

// 1. import 구문
import React, { useState } from 'react';

// 2. 타입/인터페이스 정의
interface MyComponentProps { ... }

// 3. 상수 정의
const DEFAULT_VALUE = 10;

// 4. 컴포넌트 함수
export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 4-1. 상태 선언 (useState, useRef)
  const [state, setState] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);

  // 4-2. 파생 상태 (useMemo)
  const derived = useMemo(() => ..., [dep]);

  // 4-3. 콜백 함수 (useCallback)
  const handleClick = useCallback(() => { ... }, [dep]);

  // 4-4. 부수 효과 (useEffect)
  useEffect(() => { ... }, [dep]);

  // 4-5. 헬퍼 함수
  function formatValue(val: string) { ... }

  // 4-6. JSX 반환
  return <div>...</div>;
}
```

---

## 4. TypeScript 사용 규칙

### 4.1 interface vs type

| 용도 | 사용 | 예시 |
|------|------|------|
| 객체 구조 정의 | **interface** | `interface CmsPage { ... }` |
| Union / Literal 타입 | **type** | `type ViewMode = 'mobile' \| 'web'` |
| 함수 시그니처 | **type** | `type Handler = (e: MouseEvent) => void` |

```tsx
// 객체 → interface
interface CmsPage {
  pageId: string;
  pageName: string;
  viewMode: ViewMode;
}

// Union → type
type ViewMode = 'mobile' | 'web' | 'responsive';
type ApproveState = 'WORK' | 'PENDING' | 'APPROVED' | 'REJECTED';
```

### 4.2 타입 import

**`import type` 구문을 명시적으로 사용**

```tsx
// Good
import type { CmsPage, ViewMode } from '@/db/types';
import type { FinanceComponent } from './finance-component-data';

// Bad
import { CmsPage, ViewMode } from '@/db/types';
```

### 4.3 타입 정의 위치

| 범위 | 위치 |
|------|------|
| 여러 파일에서 공유하는 타입 | `src/db/types.ts` (중앙 타입 파일) |
| 단일 파일 내부에서만 사용 | 해당 파일 상단에 정의 |
| Props 타입 | 컴포넌트 파일 내부에 정의 |

### 4.4 제네릭 & 유틸리티 타입

```tsx
// DB 쿼리 결과 타이핑
const result = await conn.execute<CmsPage>(SQL, params, OBJ);

// 트랜잭션 함수
export async function withTransaction<T>(
  task: (conn: oracledb.Connection) => Promise<T>
): Promise<T> { ... }

// 선택적 체이닝 + nullish coalescing
return result.rows?.[0] ?? null;
const label = text.slice(0, 25) || `기본 블록 ${i + 1}`;
```

---

## 5. API 라우트 작성 규칙

### 5.1 기본 구조

```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. 입력 검증
    if (!body.requiredField) {
      return NextResponse.json({ error: '필수 필드 누락' }, { status: 400 });
    }

    // 2. 비즈니스 로직
    const result = await someService(body);

    // 3. 성공 응답
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error('작업 설명:', error);
    return NextResponse.json({ error: '작업 실패 메시지' }, { status: 500 });
  }
}
```

### 5.2 응답 객체 통일

**`NextResponse` 사용으로 통일** (`Response` 대신)

```tsx
// Good
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// Bad - Response 직접 사용
return Response.json({ error: 'Not found' }, { status: 400 });
```

### 5.3 HTTP 상태 코드 규칙

| 상황 | 상태 코드 | 응답 형식 |
|------|-----------|-----------|
| 성공 | 200 | `{ ok: true, data: ... }` |
| 요청 검증 실패 | 400 | `{ error: '설명' }` |
| 인증 실패 | 401 | `{ error: '설명' }` |
| 리소스 없음 | 404 | `{ error: '설명' }` |
| 서버 에러 | 500 | `{ error: '설명' }` |
| ContentBuilder 규약 (AI 등) | 200 | `{ ok: false, error: '설명' }` |

> **참고**: ContentBuilder 라이브러리가 요구하는 AI 관련 API (`/api/openrouter`, `/api/openai`)는
> HTTP 200 + body의 error 필드로 에러를 전달합니다 (라이브러리 규약).

### 5.4 입력 검증 패턴

```tsx
// 필수 필드 검증
if (html === undefined || html === null) {
  return NextResponse.json({ error: 'html 필드 누락' }, { status: 400 });
}

// 배열 검증
if (!files || !Array.isArray(files) || files.length === 0) {
  return NextResponse.json({ error: '파일 목록이 비어있습니다' }, { status: 400 });
}

// 보안: 디렉토리 트래버설 방지
if (relativePath.includes('..')) {
  return NextResponse.json({ error: '잘못된 경로' }, { status: 400 });
}

// 타입 가드
function isValidBankId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}
```

---

## 6. Import 정렬 규칙

**4단계 그룹으로 정렬**, 그룹 간 빈 줄로 구분

```tsx
// 1단계: React / Next.js
import React, { useEffect, useRef, useState } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';

// 2단계: 외부 라이브러리
import ContentBuilder from '@innovastudio/contentbuilder';
import { Upload, X, Trash2 } from 'lucide-react';

// 3단계: 내부 모듈 (@ alias 사용)
import { getConnection } from '@/db/connection';
import { getPageById } from '@/db/repository/page.repository';
import type { CmsPage } from '@/db/types';

// 4단계: 상대 경로 import + CSS
import type { FinanceComponent } from './finance-component-data';
import '@innovastudio/contentbuilder/public/contentbuilder/contentbuilder.css';
```

### 규칙

- **절대 경로 `@/*`** 를 항상 사용 (상대 경로는 같은 디렉토리 내에서만)
- **`import type`** 은 같은 그룹 내에서 일반 import 뒤에 배치
- CSS import는 항상 최하단에 배치

---

## 7. 상태 관리 패턴

### 7.1 useState

```tsx
// 기본 타입은 초기값으로 추론
const [loading, setLoading] = useState(false);

// 복잡한 타입은 명시
const [files, setFiles] = useState<FileItem[]>([]);
const [error, setError] = useState<string | null>(null);
const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
```

### 7.2 useRef

```tsx
// DOM 참조
const containerRef = useRef<HTMLDivElement>(null);

// 외부 라이브러리 인스턴스
const builderRef = useRef<ContentBuilder | null>(null);

// 렌더링과 무관한 상태 추적
const isFetchingRef = useRef(false);
```

### 7.3 useCallback / useMemo

```tsx
// 자식 컴포넌트에 전달하는 콜백
const handleClick = useCallback(async () => {
  // ...
}, [dependency]);

// 비용이 큰 계산
const componentMap = useMemo(
  () => Object.fromEntries(items.map(c => [c.id, c])),
  [items]
);
```

### 7.4 useEffect

```tsx
// cleanup 필수인 경우
useEffect(() => {
  const runtime = new ContentBuilderRuntime({ ... });
  runtime.init();
  return () => runtime.destroy();
}, []);

// ref 동기화
useEffect(() => {
  canvasBlocksRef.current = canvasBlocks;
}, [canvasBlocks]);
```

---

## 8. 스타일링 규칙

### 8.1 Tailwind CSS 우선

```tsx
// Good - Tailwind 클래스
<div className="flex items-center gap-2 px-3 py-1.5 rounded-md">

// 조건부 클래스
<div className={`px-3 py-1.5 rounded-md ${
  isActive
    ? 'bg-[#EBF4FF] text-[#0046A4] font-medium'
    : 'hover:bg-[#EBF4FF] text-gray-700'
}`}>
```

### 8.2 인라인 스타일은 제한적으로

외부 라이브러리 연동이나 동적 값이 필요한 경우에만 인라인 스타일 사용

```tsx
// 허용 - 동적 값
<div style={{ maxWidth: `${width}px`, transform: `translateY(${offset}px)` }}>

// 지양 - 정적 스타일은 Tailwind로
<div style={{ padding: '6px 14px', borderRadius: '6px' }}>  // Bad
<div className="px-3.5 py-1.5 rounded-md">                   // Good
```

### 8.3 색상 사용

프로젝트에서 사용하는 주요 브랜드 색상은 중앙에서 관리

```tsx
// 현재 사용 중인 주요 색상
// 기업 브랜드: #004B9C, #0064C8, #0046A4
// 배경 강조: #EBF4FF
// 텍스트: gray-600, gray-700, gray-900
```

---

## 9. 에러 처리 규칙

### 9.1 DB 작업 — try-finally

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

### 9.2 트랜잭션 — withTransaction 유틸 사용

```tsx
await withTransaction(async (conn) => {
  await conn.execute(UPDATE_SQL, params);
  await conn.execute(INSERT_HISTORY_SQL, historyParams);
});
```

### 9.3 API 라우트 — try-catch + 로깅

```tsx
try {
  // 비즈니스 로직
} catch (error) {
  console.error('페이지 저장 실패:', error);
  return NextResponse.json({ error: '페이지 저장에 실패했습니다' }, { status: 500 });
}
```

### 9.4 null 안전 처리

```tsx
// 선택적 체이닝 + nullish coalescing 적극 사용
const value = result.rows?.[0] ?? null;
const name = item?.name ?? '기본값';
const ext = fileName.split('.').pop()?.toLowerCase() || '';
```

---

## 10. 주석 규칙

### 10.1 언어

- **한국어 기반** 으로 작성
- 기술 용어(Oracle, CLOB, ContentBuilder 등)는 영문 유지

### 10.2 주석 종류별 형식

```tsx
// 1. 파일/섹션 구분 주석
// ============================================================================
// SPW_CMS_PAGE — Repository
// ============================================================================

// 2. 함수 설명 (간략 JSDoc)
/** 페이지 단건 조회 */
export async function getPageById(pageId: string): Promise<CmsPage | null> { ... }

// 3. 인라인 설명
// Promise 캐싱 패턴: 동시 요청이 동일한 Promise를 await하여 레이스 컨디션 방지

// 4. TODO
// TODO: 로그인 기능 구현 시 세션/토큰 기반으로 교체
```

### 10.3 지양할 주석

```tsx
// Bad - 코드와 동일한 내용 반복
const count = items.length; // 아이템 개수를 구함

// Bad - 주석 처리된 코드를 장기간 방치
// const oldMethod = () => { ... };

// Good - 이유를 설명하는 주석
// ContentBuilder 라이브러리 규약: AI 에러도 HTTP 200으로 반환해야 함
return NextResponse.json({ ok: false, error: msg }, { status: 200 });
```

---

## 11. Git 컨벤션

### 11.1 브랜치 네이밍

```
main                    # 프로덕션 브랜치
feat/#[이슈번호]         # 기능 개발 (예: feat/#32)
fix/#[이슈번호]          # 버그 수정 (예: fix/#60)
refactor/#[이슈번호]     # 리팩토링
chore/#[이슈번호]        # 설정/유지보수
```

### 11.2 커밋 메시지

**형식**: `type #이슈번호: 한글 설명`

```
feat #32: data/index.json 제거 및 파일 폴백 코드 정리
fix #60: 탭 목록을 local storage가 아닌 DB에서 불러오도록 수정
fix #50: PAGE_UPDATE 시 pageName null로 인한 ORA-01407 오류 수정
chore: package-lock.json 업데이트
refactor #45: 커넥션 풀 초기화 로직 개선
```

**타입 종류**

| 타입 | 용도 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `chore` | 빌드, 설정, 의존성 등 유지보수 |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `style` | 코드 포매팅 (동작 변경 없음) |

### 11.3 PR 규칙 (제안)

```
제목: type #이슈번호: 한글 설명 (70자 이내)
본문:
  ## 변경 사항
  - 변경 내용 1
  - 변경 내용 2

  ## 테스트
  - [ ] 테스트 항목 1
  - [ ] 테스트 항목 2
```

### 11.4 코드 리뷰 규칙 (제안)

- PR 생성 후 최소 **1명 이상의 리뷰어 승인** 필요
- 자신의 PR은 자신이 머지하지 않음
- 리뷰 요청 후 **1영업일 이내** 리뷰 완료

---

## 12. 코드 포매팅 및 도구 설정

### 12.1 현재 상태

- **ESLint**: `next/core-web-vitals`, `next/typescript` 사용 중
- **Prettier**: **미설정** (들여쓰기 2칸/4칸 혼용 원인)

### 12.2 Prettier 도입 (필수 권장)

```bash
npm install -D prettier eslint-config-prettier
```

**`prettier.config.mjs`** (프로젝트 루트)

```js
/** @type {import("prettier").Config} */
export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
};
```

**`eslint.config.mjs`** 수정

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"), // prettier 추가
  { ignores: ["node_modules/**", ".next/**", "build/**"] },
];
```

**`package.json`** scripts 추가

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\""
  }
}
```

### 12.3 VSCode 설정 (공유용)

**`.vscode/settings.json`** (프로젝트 루트)

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

---

## 13. 도입 제안 사항

현재 프로젝트는 전반적으로 **높은 일관성**을 유지하고 있습니다. 팀 개발 전환 시 아래 항목들을 우선적으로 도입하면 효과적입니다.

### 즉시 도입 (우선순위 높음)

| 항목 | 이유 | 예상 소요 |
|------|------|-----------|
| **Prettier 설정** | 들여쓰기 혼용 해소, 자동 포매팅 | 설정 30분 + 전체 포매팅 적용 |
| **VSCode 공유 설정** | 팀원 간 에디터 설정 통일 | 10분 |
| **PR 리뷰 정책** | GitHub Branch Protection Rule 설정 | 30분 |
| **Props 타입명 통일** | `ComponentNameProps` 형식으로 통일 | 리팩토링 1시간 |
| **NextResponse 통일** | `Response` → `NextResponse`로 교체 | 30분 |

### 단기 도입 (1~2주)

| 항목 | 이유 |
|------|------|
| **husky + lint-staged** | 커밋 전 자동 lint/format 검사 |
| **import 자동 정렬** | `eslint-plugin-import` 또는 `@trivago/prettier-plugin-sort-imports` |
| **커밋 메시지 검증** | `commitlint` + Conventional Commits 형식 강제 |
| **GitHub Actions CI** | PR 생성 시 자동 lint + build 검증 |

### 중기 도입 (1~2개월)

| 항목 | 이유 |
|------|------|
| **Storybook** | 컴포넌트 단위 UI 문서화 및 시각적 테스트 |
| **테스트 프레임워크** | Jest + React Testing Library로 핵심 로직 테스트 |
| **API 응답 타입 표준화** | 공통 응답 wrapper 타입 정의 (`ApiResponse<T>`) |
| **에러 핸들링 미들웨어** | API 라우트 공통 에러 처리 추상화 |

### husky + lint-staged 설정 예시

```bash
npm install -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`**

```bash
npx lint-staged
```

**`package.json`** 추가

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

### commitlint 설정 예시

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

**`commitlint.config.js`**

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'chore', 'docs', 'test', 'style']],
    'subject-empty': [2, 'never'],
  },
};
```

---

## 체크리스트: 새 팀원 온보딩

새로 합류하는 팀원이 확인해야 할 항목입니다.

- [ ] Node.js 20+ 설치
- [ ] Oracle Instant Client 설치 (Thick 모드)
- [ ] `.env` 파일 설정 (환경 변수 목록은 CLAUDE.md 참조)
- [ ] VSCode 확장 설치: ESLint, Prettier, Tailwind CSS IntelliSense
- [ ] `npm install` 실행
- [ ] `npm run dev`로 로컬 개발 서버 확인
- [ ] 이 문서(`development-convention.md`) 숙지
- [ ] Git 브랜치/커밋 규칙 확인
