# 폴더 구조 리뷰: 현재 문제점과 개선 방안

> **작성일**: 2026-03-20
> **목적**: Next.js App Router 표준 컨벤션 기반으로 현재 프로젝트 구조를 점검하고 개선 방안을 제시

---

## 목차

1. [Next.js 공식 권장 구조](#1-nextjs-공식-권장-구조)
2. [현재 프로젝트 구조](#2-현재-프로젝트-구조)
3. [문제점 분석](#3-문제점-분석)
4. [개선 방안](#4-개선-방안)
5. [Next.js 특수 파일 컨벤션 (미활용)](#5-nextjs-특수-파일-컨벤션-미활용)
6. [마이그레이션 가이드](#6-마이그레이션-가이드)

---

## 1. Next.js 공식 권장 구조

Next.js 공식 문서에서는 3가지 조직 전략을 제시합니다.

### 전략 A: `app/` 외부에 프로젝트 파일 보관 (권장)

`app/`은 **라우팅 전용**으로 사용하고, 나머지 코드는 `src/` 하위 별도 폴더에 보관합니다.

```
src/
├── app/            # 라우팅만 담당 (page.tsx, layout.tsx, route.ts)
├── components/     # UI 컴포넌트
├── lib/            # 유틸리티, 헬퍼 함수, 상수
├── hooks/          # 커스텀 React 훅
├── types/          # TypeScript 타입 정의
└── styles/         # 전역 스타일 (선택)
```

> **팀 프로젝트에 가장 많이 사용되는 전략**입니다. "컴포넌트 어디 있지?" → 항상 `components/`.
> "유틸 함수 어디 있지?" → 항상 `lib/`. 규칙이 단순합니다.

### 전략 B: `app/` 내부에 프로젝트 파일 보관

`app/` 안에 `_components/`, `_lib/` 등 Private Folder(`_` 접두사)로 보관합니다.

```
src/app/
├── _components/    # Private 폴더 (라우팅 제외)
├── _lib/           # Private 폴더
├── edit/
│   └── page.tsx
└── page.tsx
```

### 전략 C: 기능/라우트 단위로 분리

각 라우트 폴더 안에 해당 기능의 컴포넌트와 로직을 함께 두는 방식입니다.

```
src/app/
├── edit/
│   ├── _components/   # edit 전용 컴포넌트
│   ├── _lib/          # edit 전용 유틸
│   └── page.tsx
└── dashboard/
    ├── _components/
    └── page.tsx
```

### 각 전략의 비교

| 전략 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------------|
| **A: app 외부** | 역할 분리 명확, 팀 협업 용이 | 관련 파일이 물리적으로 떨어짐 | **팀 프로젝트, 중대형 규모** |
| **B: app 내부** | 한 곳에서 관리 | app/ 디렉토리가 비대해짐 | 소규모 프로젝트 |
| **C: 기능 단위** | 관련 파일 가까이 위치 | 공유 컴포넌트 위치 애매 | 기능간 독립성이 높은 프로젝트 |

**Springware CMS에는 전략 A**가 가장 적합합니다. 에디터, 파일 관리, 미리보기 등 기능 간 공유 요소가 많고, 팀원이 합류하는 상황이기 때문입니다.

---

## 2. 현재 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── assets/            # FAL AI API (4개 route)
│   │   ├── branches/route.ts
│   │   ├── builder/           # 에디터 API (4개 route)
│   │   ├── components/route.ts
│   │   ├── exchange/route.ts
│   │   ├── health/route.ts
│   │   ├── manage/            # 파일 관리 API (5개 route)
│   │   ├── openai/            # AI 프록시 (2개 route)
│   │   └── openrouter/        # AI 프록시 (2개 route)
│   │
│   ├── edit/                   # ⚠️ 라우트 + 컴포넌트 + 데이터 혼재
│   │   ├── page.tsx
│   │   ├── EditClient.tsx
│   │   ├── EditClientLoader.tsx
│   │   ├── ComponentPanel.tsx
│   │   ├── finance-component-data.ts
│   │   └── ko.ts
│   │
│   ├── view/                   # ⚠️ 라우트 + 컴포넌트 혼재
│   │   ├── page.tsx
│   │   └── ViewClient.tsx
│   │
│   ├── files/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
│
├── components/
│   └── files/                  # ⚠️ 파일 브라우저만 존재
│       ├── FileBrowser.tsx
│       ├── FileCard.tsx
│       ├── FolderTree.tsx
│       ├── Sidebar.tsx
│       ├── Breadcrumbs.tsx
│       ├── CreateFolderModal.tsx
│       ├── DeleteConfirmModal.tsx
│       └── UploadProgressList.tsx
│
├── db/                         # ✅ 잘 구성됨
│   ├── connection.ts
│   ├── types.ts
│   ├── ddl/
│   ├── queries/
│   ├── repository/
│   └── seed/
│
├── lib/                        # ⚠️ 파일 1개뿐
│   └── current-user.ts
│
└── types/                      # ✅ OK
    ├── contentbuilder-runtime.d.ts
    └── oracledb.d.ts
```

---

## 3. 문제점 분석

### 문제 1: `app/edit/`에 라우트와 비즈니스 로직이 혼재

**현재 상태**

```
app/edit/
├── page.tsx                    # 라우트 파일
├── EditClient.tsx              # 에디터 핵심 컴포넌트 (★ 프로젝트 최대 파일)
├── EditClientLoader.tsx        # 로딩 컴포넌트
├── ComponentPanel.tsx          # 금융 컴포넌트 패널
├── finance-component-data.ts   # 데이터 파일
└── ko.ts                       # 언어팩
```

**왜 문제인가**

- Next.js App Router에서 `app/` 안에 컴포넌트를 두는 것(co-location) 자체는 **동작에 문제가 없습니다**. `page.tsx`, `route.ts` 등 특수 파일명만 라우팅에 사용되기 때문입니다.
- 하지만 **팀 개발에서 혼란**을 일으킵니다:
  - "컴포넌트는 `components/`에 있다"와 "컴포넌트는 `app/edit/`에도 있다" → **규칙이 2개**
  - 새 팀원이 `ComponentPanel.tsx`을 찾으려면 `components/`를 먼저 보고, 없으면 `app/edit/`를 뒤져야 합니다
  - 기능이 추가될수록 `app/edit/` 안에 파일이 계속 늘어나 라우트 파일(`page.tsx`)을 찾기 어려워집니다

**Next.js 공식 문서도 이를 인지하고 있습니다:**

> "While you **can** colocate your project files in `app` you don't **have** to. If you prefer, you can keep them outside the `app` directory."

### 문제 2: `components/` 디렉토리에 파일 브라우저만 존재

**현재 상태**

```
components/
└── files/          # 파일 브라우저 컴포넌트 8개
    ├── FileBrowser.tsx
    ├── FileCard.tsx
    └── ...
```

**왜 문제인가**

- 에디터 관련 컴포넌트(`EditClient`, `ComponentPanel`)는 `app/edit/`에 있고, 파일 브라우저 컴포넌트만 `components/`에 있습니다
- **기준이 불분명**: 왜 `FileBrowser`는 `components/`에 있고 `EditClient`는 `app/edit/`에 있는지 규칙을 설명하기 어렵습니다
- 팀원이 합류하면 새 컴포넌트를 어디에 만들어야 하는지 판단하기 어렵습니다

### 문제 3: 데이터/설정 파일이 컴포넌트와 섞여 있음

**현재 상태**

```
app/edit/
├── finance-component-data.ts   # 금융 컴포넌트 데이터 정의
└── ko.ts                       # 에디터 한국어 번역
```

**왜 문제인가**

- `finance-component-data.ts`는 금융 컴포넌트의 **데이터 정의** 파일이지 React 컴포넌트가 아닙니다
- `ko.ts`는 **언어팩(i18n)** 파일입니다
- 이들이 컴포넌트 파일과 같은 위치에 있으면 역할 구분이 모호합니다
- 향후 다국어 지원, 컴포넌트 데이터 확장 시 파일 위치에 대한 규칙이 필요합니다

### 문제 4: `lib/` 디렉토리가 거의 비어 있음

**현재 상태**

```
lib/
└── current-user.ts     # 유일한 파일
```

**왜 문제인가**

- Next.js 표준에서 `lib/`은 유틸리티 함수, API 클라이언트, 헬퍼 함수, 상수 등을 보관하는 핵심 디렉토리입니다
- 현재 유틸리티성 코드가 각 컴포넌트 파일 내부에 흩어져 있을 가능성이 높습니다
- 커스텀 훅(`hooks/`)도 별도 디렉토리 없이 컴포넌트 내부에 인라인 작성 중입니다

### 문제 5: Next.js 특수 파일 미활용

**현재 상태**: `page.tsx`, `layout.tsx`, `route.ts`만 사용

**미활용 특수 파일들**

| 파일 | 역할 | 현재 |
|------|------|------|
| `loading.tsx` | 페이지 로딩 중 스켈레톤 UI 표시 | 미사용 |
| `error.tsx` | 에러 발생 시 에러 바운더리 UI | 미사용 |
| `not-found.tsx` | 404 페이지 | 미사용 |

---

## 4. 개선 방안

### 개선된 폴더 구조

```
src/
├── app/                              # ✅ 라우팅 전용
│   ├── api/                          # API 라우트 (현재 유지)
│   │   ├── builder/
│   │   │   ├── load/route.ts
│   │   │   ├── pages/route.ts
│   │   │   ├── save/route.ts
│   │   │   └── upload/route.ts
│   │   ├── manage/
│   │   │   ├── addfolder/route.ts
│   │   │   ├── delete/route.ts
│   │   │   ├── files/route.ts
│   │   │   ├── folders/route.ts
│   │   │   └── upload/route.ts
│   │   ├── assets/
│   │   ├── openai/
│   │   ├── openrouter/
│   │   ├── branches/route.ts
│   │   ├── components/route.ts
│   │   ├── exchange/route.ts
│   │   └── health/route.ts
│   │
│   ├── edit/
│   │   ├── page.tsx                  # 서버 컴포넌트 래퍼만
│   │   ├── loading.tsx               # [신규] 에디터 로딩 스켈레톤
│   │   └── error.tsx                 # [신규] 에디터 에러 바운더리
│   ├── view/
│   │   └── page.tsx                  # 서버 컴포넌트 래퍼만
│   ├── files/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx                 # [신규] 404 페이지
│   └── page.tsx
│
├── components/                       # ✅ 모든 UI 컴포넌트
│   ├── edit/                         # [이동] 에디터 관련
│   │   ├── EditClient.tsx
│   │   ├── EditClientLoader.tsx
│   │   └── ComponentPanel.tsx
│   ├── view/                         # [이동] 미리보기 관련
│   │   └── ViewClient.tsx
│   ├── files/                        # (현재 유지) 파일 브라우저
│   │   ├── FileBrowser.tsx
│   │   ├── FileCard.tsx
│   │   ├── FolderTree.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── CreateFolderModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── UploadProgressList.tsx
│   └── ui/                           # [신규] 공통 UI (향후 확장)
│
├── data/                             # [신규] 정적 데이터/설정
│   ├── finance-component-data.ts     # [이동] 금융 컴포넌트 데이터
│   └── ko.ts                         # [이동] 에디터 한국어 번역
│
├── hooks/                            # [신규] 커스텀 React 훅 (향후)
│
├── lib/                              # ✅ 유틸리티 (기존 유지 + 확장)
│   └── current-user.ts
│
├── db/                               # ✅ DB 계층 (현재 유지 — 잘 되어 있음)
│   ├── connection.ts
│   ├── types.ts
│   ├── ddl/
│   ├── queries/
│   ├── repository/
│   └── seed/
│
└── types/                            # ✅ 글로벌 타입 선언 (현재 유지)
    ├── contentbuilder-runtime.d.ts
    └── oracledb.d.ts
```

### 변경 요약

| 변경 | Before | After | 이유 |
|------|--------|-------|------|
| 에디터 컴포넌트 | `app/edit/*.tsx` | `components/edit/` | 라우트와 UI 분리 |
| 뷰어 컴포넌트 | `app/view/ViewClient.tsx` | `components/view/` | 라우트와 UI 분리 |
| 데이터 파일 | `app/edit/finance-component-data.ts` | `data/` | 데이터와 UI 분리 |
| 언어팩 | `app/edit/ko.ts` | `data/` | 설정 파일 중앙화 |
| 공통 UI | 없음 | `components/ui/` | 공유 컴포넌트 기반 마련 |
| 커스텀 훅 | 없음 | `hooks/` | 로직 재사용 기반 마련 |
| 에러/로딩 UI | 없음 | `error.tsx`, `loading.tsx` | Next.js 특수 파일 활용 |

### 각 디렉토리의 역할 (Next.js 표준)

| 디렉토리 | 역할 | 넣는 파일 |
|----------|------|----------|
| `app/` | **라우팅만 담당** | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx` |
| `components/` | **모든 React UI 컴포넌트** | `.tsx` 컴포넌트 파일 (도메인별 하위 폴더로 그룹) |
| `components/ui/` | **공통 UI 원자** | 버튼, 모달, 인풋 등 여러 기능에서 재사용하는 기본 UI |
| `lib/` | **유틸리티, 헬퍼** | API 클라이언트, 포맷 함수, 상수, 외부 서비스 래퍼 |
| `hooks/` | **커스텀 React 훅** | `useDebounce.ts`, `useIntersectionObserver.ts` 등 |
| `data/` | **정적 데이터/설정** | 컴포넌트 데이터, 번역 파일, 상수 설정 |
| `db/` | **데이터베이스 계층** | 커넥션, SQL, Repository, 타입, 시드 |
| `types/` | **글로벌 타입 선언** | `.d.ts` 파일, 외부 라이브러리 타입 확장 |

---

## 5. Next.js 특수 파일 컨벤션 (미활용)

Next.js App Router는 `page.tsx` 외에도 여러 특수 파일을 지원합니다. 이를 활용하면 별도 코드 없이 UX를 개선할 수 있습니다.

### loading.tsx — 로딩 스켈레톤

`page.tsx`와 같은 폴더에 `loading.tsx`를 두면, 페이지 로딩 중 자동으로 표시됩니다.

```tsx
// src/app/edit/loading.tsx
export default function EditLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-500">에디터 로딩 중...</p>
      </div>
    </div>
  );
}
```

### error.tsx — 에러 바운더리

런타임 에러 발생 시 앱 전체가 깨지는 대신 해당 라우트만 에러 UI를 보여줍니다.

```tsx
// src/app/edit/error.tsx
'use client';

export default function EditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold mb-4">에디터 로딩 중 오류가 발생했습니다</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  );
}
```

### not-found.tsx — 404 페이지

```tsx
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
      <Link href="/edit" className="text-blue-600 hover:underline">
        에디터로 돌아가기
      </Link>
    </div>
  );
}
```

### Route Groups — URL에 영향 없는 폴더 그룹

현재는 필요하지 않지만, 향후 관리자 페이지 등이 추가되면 활용할 수 있습니다.

```
app/
├── (editor)/           # 에디터 관련 (URL에 포함 안 됨)
│   ├── edit/
│   │   └── page.tsx    # /edit
│   ├── view/
│   │   └── page.tsx    # /view
│   └── layout.tsx      # 에디터 공통 레이아웃
│
├── (admin)/            # 관리자 관련 (향후)
│   ├── dashboard/
│   │   └── page.tsx    # /dashboard
│   └── layout.tsx      # 관리자 공통 레이아웃
│
└── layout.tsx          # 루트 레이아웃
```

### Private Folders — 라우팅 제외 폴더

`_` 접두사를 붙이면 Next.js 라우팅에서 완전히 제외됩니다. 만약 **전략 A 대신 co-location 방식(전략 C)을 선택한다면** 유용합니다.

```
app/edit/
├── _components/        # 라우팅 제외
│   ├── EditClient.tsx
│   └── ComponentPanel.tsx
├── _data/              # 라우팅 제외
│   └── finance-component-data.ts
└── page.tsx
```

---

## 6. 마이그레이션 가이드

### 이동 대상 파일과 import 경로 변경

| 파일 | 현재 경로 | 이동 경로 | import 변경 |
|------|----------|----------|------------|
| `EditClient.tsx` | `app/edit/EditClient.tsx` | `components/edit/EditClient.tsx` | `@/components/edit/EditClient` |
| `EditClientLoader.tsx` | `app/edit/EditClientLoader.tsx` | `components/edit/EditClientLoader.tsx` | `@/components/edit/EditClientLoader` |
| `ComponentPanel.tsx` | `app/edit/ComponentPanel.tsx` | `components/edit/ComponentPanel.tsx` | `@/components/edit/ComponentPanel` |
| `ViewClient.tsx` | `app/view/ViewClient.tsx` | `components/view/ViewClient.tsx` | `@/components/view/ViewClient` |
| `finance-component-data.ts` | `app/edit/finance-component-data.ts` | `data/finance-component-data.ts` | `@/data/finance-component-data` |
| `ko.ts` | `app/edit/ko.ts` | `data/ko.ts` | `@/data/ko` |

### 이동 순서

**영향이 적은 파일부터 이동**하는 것을 권장합니다.

```
1단계: 데이터 파일 이동 (의존하는 곳이 적음)
  - finance-component-data.ts → data/
  - ko.ts → data/

2단계: 뷰어 컴포넌트 이동 (단순)
  - ViewClient.tsx → components/view/

3단계: 에디터 컴포넌트 이동 (핵심 — 의존 관계 확인 필요)
  - ComponentPanel.tsx → components/edit/
  - EditClientLoader.tsx → components/edit/
  - EditClient.tsx → components/edit/

4단계: Next.js 특수 파일 추가
  - app/edit/loading.tsx (신규)
  - app/edit/error.tsx (신규)
  - app/not-found.tsx (신규)
```

### 이동 후 `app/edit/page.tsx` 예시

```tsx
// src/app/edit/page.tsx — 서버 컴포넌트 래퍼
import EditClientLoader from '@/components/edit/EditClientLoader';

export default function EditPage() {
  return <EditClientLoader />;
}
```

이렇게 하면 `app/edit/` 폴더에는 `page.tsx` (+ `loading.tsx`, `error.tsx`)만 남게 되어, **라우트 폴더가 라우팅 역할만 수행**하게 됩니다.

---

## 참고 자료

- [Next.js 공식: Project Structure and Organization](https://nextjs.org/docs/app/getting-started/project-structure)
- [Best Practices for Organizing Your Next.js 15 (2025) - DEV Community](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [Next.js Folder Structure Best Practices for Scalable Applications (2026 Guide)](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
