# 코드 컨벤션 리뷰: 현재 문제점과 개선 방안

> **작성일**: 2026-03-20
> **범위**: 폴더 구조를 제외한 코드 수준의 컨벤션 점검
> **분석 대상**: `src/` 하위 전체 TypeScript/TSX 파일

---

## 목차

1. [API 응답 형식 불일치](#1-api-응답-형식-불일치)
2. [에러 처리 패턴 불일치](#2-에러-처리-패턴-불일치)
3. [코드 중복](#3-코드-중복)
4. [환경 변수 관리 분산](#4-환경-변수-관리-분산)
5. [타입 안전성 (as any 남용)](#5-타입-안전성-as-any-남용)
6. [매직 넘버/문자열](#6-매직-넘버문자열)
7. [Dead Code (주석 처리된 코드) 방치](#7-dead-code-주석-처리된-코드-방치)
8. [console.error 메시지 한영 혼재](#8-consoleerror-메시지-한영-혼재)
9. [개선 우선순위 요약](#9-개선-우선순위-요약)

---

## 1. API 응답 형식 불일치

### 문제 A: `Response` vs `NextResponse` 혼용

두 가지 응답 객체가 파일마다 다르게 사용되고 있습니다.

**NextResponse 사용** (builder, openrouter, openai, assets, components)
```typescript
// src/app/api/builder/save/route.ts
return NextResponse.json({ ok: true });
```

**Response 사용** (manage 전체)
```typescript
// src/app/api/manage/upload/route.ts
return Response.json({ success: true, file: { name, url, size } });
```

둘 다 동작은 하지만, `NextResponse`는 Next.js가 제공하는 확장 객체로 쿠키/헤더 조작 등 추가 기능이 있습니다. **하나로 통일해야** 팀원이 헷갈리지 않습니다.

### 문제 B: 성공 응답 구조가 파일마다 다름

```typescript
// 패턴 1: { ok: true }
return NextResponse.json({ ok: true });                    // builder/save

// 패턴 2: { ok: true, 데이터필드 }
return NextResponse.json({ ok: true, html, updated });     // builder/load

// 패턴 3: { success: true, 데이터필드 }
return Response.json({ success: true, file: { ... } });    // manage/upload

// 패턴 4: { success: true, deleted, message }
return Response.json({ success: true, deleted: 3, message: '...' }); // manage/delete

// 패턴 5: 데이터 직접 반환
return NextResponse.json({ answer, usage });               // openrouter
```

`ok`인지 `success`인지, 데이터를 어떤 필드에 담는지 기준이 없습니다.

### 문제 C: 에러 응답에서 HTTP 200 반환

```typescript
// src/app/api/openrouter/route.ts
return NextResponse.json(
  { ok: false, status: 404, error: data.error.message },
  { status: 200 }  // ← HTTP 200인데 body에 status: 404
);
```

ContentBuilder 라이브러리 규약 때문이지만, 이런 예외가 어디에도 문서화되어 있지 않으면 팀원이 혼란스럽습니다.

### 개선 방안: API 응답 표준 정의

```typescript
// src/lib/api-response.ts (신규)
import { NextResponse } from 'next/server';

/** 표준 성공 응답 */
export function successResponse<T>(data?: T, status = 200) {
  return NextResponse.json({ ok: true, ...(data && { data }) }, { status });
}

/** 표준 에러 응답 */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * ContentBuilder 전용 에러 응답
 * 라이브러리 규약상 HTTP 200 + body에 에러를 담아야 함
 */
export function contentBuilderErrorResponse(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 200 });
}
```

**적용 후:**

```typescript
// Before
return NextResponse.json({ error: '페이지 저장 실패' }, { status: 500 });

// After
return errorResponse('페이지 저장 실패');
```

---

## 2. 에러 처리 패턴 불일치

### 문제 A: catch 파라미터명 `error` vs `err`

```typescript
// 파일마다 다른 이름 사용
} catch (error) {                    // builder/save, builder/load, builder/pages
} catch (err: unknown) {             // openai, health, cleanup, result-fal
```

### 문제 B: 에러 타입 처리 방식이 3가지

```typescript
// 방식 1: 타입 처리 없이 그대로 전달
} catch (error) {
  console.error('Failed to save page:', error);
  return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
}

// 방식 2: instanceof Error 체크
} catch (err: unknown) {
  return NextResponse.json({
    ok: false,
    error: err instanceof Error ? err.message : '알 수 없는 오류'
  }, { status: 500 });
}

// 방식 3: 복잡한 body 파싱
} catch (err: unknown) {
  let message = "Unknown error";
  if (err instanceof Error) message = err.message;
  if (typeof err === "object" && err !== null && "body" in err) {
    const body = (err as { body?: { detail?: string } }).body;
    if (body?.detail) message = body.detail;
  }
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
```

### 개선 방안: 에러 처리 헬퍼 함수

```typescript
// src/lib/api-response.ts 에 추가
/** catch 블록에서 에러 메시지 추출 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return '알 수 없는 오류';
}
```

**적용 후 — 모든 API 라우트에서 동일한 패턴:**

```typescript
import { errorResponse, getErrorMessage } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    // 비즈니스 로직
  } catch (err: unknown) {
    console.error('페이지 저장 실패:', err);
    return errorResponse(getErrorMessage(err));
  }
}
```

**통일 규칙:**
- catch 파라미터: **`err: unknown`** 으로 통일
- 에러 메시지 추출: **`getErrorMessage(err)`** 사용
- 에러 로깅: **`console.error('한글 설명:', err)`**

---

## 3. 코드 중복

### 문제: `normalizeUploadUrl()` 함수가 4개 파일에 복붙

완전히 동일한 함수가 아래 4개 파일에 각각 정의되어 있습니다:

- `src/app/api/manage/upload/route.ts`
- `src/app/api/manage/files/route.ts`
- `src/app/api/manage/folders/route.ts`
- `src/app/api/manage/addfolder/route.ts`

```typescript
// 4개 파일 모두 동일한 코드
function normalizeUploadUrl(url: string): string {
  let safe = url.trim();
  if (/^https?:\/\//i.test(safe)) {
    return safe.endsWith("/") ? safe : safe + "/";
  }
  if (!safe.startsWith("/")) safe = "/" + safe;
  if (!safe.endsWith("/")) safe += "/";
  safe = safe.replace(/([^:]\/)\/+/g, "$1");
  return safe;
}
```

또한 `UPLOAD_PATH`, `UPLOAD_URL` 환경변수 로딩 코드도 동일하게 4번 반복됩니다:

```typescript
// 4개 파일 모두 동일
const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || "uploads/");
```

### 개선 방안: 공통 유틸로 추출

```typescript
// src/lib/upload.ts (신규)
export function normalizeUploadUrl(url: string): string {
  let safe = url.trim();
  if (/^https?:\/\//i.test(safe)) {
    return safe.endsWith('/') ? safe : safe + '/';
  }
  if (!safe.startsWith('/')) safe = '/' + safe;
  if (!safe.endsWith('/')) safe += '/';
  safe = safe.replace(/([^:]\/)\/+/g, '$1');
  return safe;
}

export const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';
export const UPLOAD_URL = normalizeUploadUrl(process.env.UPLOAD_URL || 'uploads/');
```

**적용 후:**

```typescript
// src/app/api/manage/files/route.ts
import { UPLOAD_PATH, UPLOAD_URL } from '@/lib/upload';
// normalizeUploadUrl, UPLOAD_PATH, UPLOAD_URL 선언 제거
```

---

## 4. 환경 변수 관리 분산

### 문제: 각 파일에서 `process.env`를 직접 접근

```typescript
// src/app/api/openrouter/route.ts
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// src/app/api/openai/route.ts
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// src/app/api/assets/request-fal/route.ts
const FAL_API_KEY = process.env.FAL_API_KEY;

// src/app/api/manage/files/route.ts (4개 파일 동일)
const UPLOAD_PATH = process.env.UPLOAD_PATH || 'public/uploads/';

// src/db/connection.ts
connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
```

**왜 문제인가:**
- 환경변수명 오타를 컴파일 시점에 잡을 수 없음
- 기본값 설정이 파일마다 다를 수 있음
- 필수 환경변수 누락 시 런타임에서야 에러 발생
- 어떤 환경변수가 필요한지 파악하려면 모든 파일을 뒤져야 함

### 개선 방안: 환경 변수 중앙 관리

```typescript
// src/lib/env.ts (신규)

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`환경변수 ${key}가 설정되지 않았습니다`);
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// --- API 키 ---
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
export const FAL_API_KEY = process.env.FAL_API_KEY ?? '';

// --- 업로드 ---
export const UPLOAD_PATH = optionalEnv('UPLOAD_PATH', 'public/uploads/');
export const UPLOAD_URL = optionalEnv('UPLOAD_URL', 'uploads/');

// --- Oracle DB ---
export const ORACLE_CONFIG = {
  user: requireEnv('ORACLE_USER'),
  password: requireEnv('ORACLE_PASSWORD'),
  connectString: `${requireEnv('ORACLE_HOST')}:${requireEnv('ORACLE_PORT')}/${requireEnv('ORACLE_SERVICE')}`,
  schema: requireEnv('ORACLE_SCHEMA'),
};
```

**적용 후:**

```typescript
// Before (각 파일에서 직접)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// After (중앙에서 import)
import { OPENROUTER_API_KEY } from '@/lib/env';
```

---

## 5. 타입 안전성 (as any 남용)

### 문제: `EditClient.tsx`에 `as any`가 집중

```typescript
// src/app/edit/EditClient.tsx

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).builderReinit = debouncedReinit;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
onAdd: ((html: string) => html.trim()) as any,

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).builderRuntime = runtimeRef.current;

const w = window as any;
```

`eslint-disable` 주석으로 경고를 억제하고 있어서, ESLint가 있어도 보호 효과가 없습니다.

### 개선 방안: window 전역 타입 확장

```typescript
// src/types/global.d.ts (신규)
import type ContentBuilder from '@innovastudio/contentbuilder';
import type ContentBuilderRuntime from '@innovastudio/contentbuilder';

declare global {
  interface Window {
    builderReinit?: () => void;
    builderRuntime?: ContentBuilderRuntime;
    __cmsColors?: string[];
  }
}

export {};
```

**적용 후:**

```typescript
// Before
(window as any).builderRuntime = runtimeRef.current;

// After — 타입 안전
window.builderRuntime = runtimeRef.current;
```

> **참고**: ContentBuilder 라이브러리의 옵션 타입이 불완전한 경우(`onAdd` 등)는 `as any` 대신
> 해당 타입만 확장하는 `.d.ts`를 작성하는 것이 좋습니다.

---

## 6. 매직 넘버/문자열

### 문제: 의미가 불분명한 숫자/문자열이 코드에 직접 작성

```typescript
// src/app/api/builder/pages/route.ts
const { list } = await getPageList({ pageSize: 9999 });  // 9999 = 전체 조회?

// src/app/api/manage/upload/route.ts
const MAX_FILE_SIZE = 100 * 1024 * 1024;  // 이건 상수로 잘 되어 있음

// src/app/api/manage/files/route.ts
const PAGE_SIZE = 10;  // 이것도 괜찮음

// src/app/api/builder/save/route.ts
const bank = isValidBankId(body.bank) ? body.bank : 'ibk';  // 'ibk' 기본값 하드코딩

// src/app/api/builder/pages/route.ts
viewMode: p.VIEW_MODE ?? 'mobile',  // 'mobile' 기본값 하드코딩

// src/app/api/openrouter/route.ts
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const DEFAULT_TEMPERATURE = 0.6;
const DEFAULT_TOP_P = 0.9;
const DEFAULT_NUM = 1;

// src/app/edit/EditClient.tsx
const PANEL_WIDTH_OPEN = 264;  // 264px 패널 너비
```

일부는 상수로 잘 정의되어 있지만, 일부(`'ibk'`, `'mobile'`, `9999`)는 의미 파악이 어렵습니다.

### 개선 방안: 비즈니스 상수 중앙화

```typescript
// src/lib/constants.ts (신규)

// --- 페이지 기본값 ---
export const DEFAULT_BANK_ID = 'ibk';
export const DEFAULT_VIEW_MODE = 'mobile';
export const PAGE_SIZE_UNLIMITED = 9999;

// --- 업로드 ---
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const FILE_LIST_PAGE_SIZE = 10;

// --- AI 모델 ---
export const AI_DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const AI_DEFAULT_TEMPERATURE = 0.6;

// --- UI ---
export const PANEL_WIDTH_OPEN = 264;
```

---

## 7. Dead Code (주석 처리된 코드) 방치

### 문제: 여러 파일에 주석 처리된 코드 블록이 남아 있음

**`src/components/files/FileBrowser.tsx`** — 가장 심각

```typescript
// 예시 1: 주석 처리된 에러 핸들링 (~라인 139-142)
// if (!res.ok) {
//     const errorData = await res.json();
//     throw new Error(errorData.error || 'Upload failed');
// }

// 예시 2: 주석 처리된 삭제 성공 메시지 (~라인 220-231)
/*
if (result.deleted > 0) {
    setUploadProgress(prev => [...prev, {
        name: `${result.deleted} item(s) deleted successfully`,
        progress: 100,
        status: 'success'
    }]);
}
*/

// 예시 3: 주석 처리된 폴더 생성 핸들러 (~라인 263-283)
/*
const handleFolderCreated = (folderName: string) => { ... };
*/
```

**`src/app/edit/EditClient.tsx`** — OpenAI 설정 블록

```typescript
// ~라인 279-303
/*
// OpenAI:
sendCommandUrl: '/api/openai',
sendCommandStreamUrl: '/api/openai/stream',
systemModel: 'gpt-4o-mini',
codeModels: [...],
chatModels: [...],
*/
```

**`src/app/api/assets/result-fal/route.ts`** — S3 함수

```typescript
// async function saveFileToS3(folderPath, filename, base64Image) {
//     return '';
// }
```

### 왜 문제인가

- 코드 리뷰 시 "이건 왜 남겨뒀지?" 매번 확인해야 함
- 코드를 읽는 사람이 활성 코드와 비활성 코드를 구분해야 하는 인지 부하
- Git 히스토리에 이미 보존되므로 주석으로 남길 필요 없음

### 개선 방안

**원칙: 주석 처리된 코드는 삭제한다. 필요하면 git에서 복원한다.**

삭제 전 판단 기준:
- **향후 사용 예정**: 주석 대신 TODO와 함께 이슈로 등록
- **대안 구현 참고용**: 주석 대신 문서(`docs/`)에 기록
- **단순 백업**: 삭제 (git 히스토리에서 복원 가능)

---

## 8. console.error 메시지 한영 혼재

### 문제: CLAUDE.md에서 한국어 기반을 규정했으나 영문 메시지 다수

```typescript
// 한글 (규정 준수)
console.error('페이지 목록 조회 실패:', error);     // builder/pages
console.error('컴포넌트 목록 조회 오류:', error);    // components

// 영문 (규정 미준수)
console.error('Load error:', error);               // builder/load
console.error('Upload error:', error);             // builder/upload
console.error('Stream error:', error);             // openai/stream, openrouter/stream
console.error('Failed to save page:', error);      // builder/save
console.error('File listing error:', error);       // manage/files
console.error('Folder tree error:', error);        // manage/folders
```

### 개선 방안

모든 `console.error` 메시지를 한국어로 통일합니다:

```typescript
// Before
console.error('Load error:', error);
console.error('Upload error:', error);
console.error('Stream error:', error);
console.error('Failed to save page:', error);
console.error('File listing error:', error);

// After
console.error('페이지 로드 실패:', err);
console.error('파일 업로드 실패:', err);
console.error('스트리밍 응답 실패:', err);
console.error('페이지 저장 실패:', err);
console.error('파일 목록 조회 실패:', err);
```

---

## 9. 개선 우선순위 요약

### 즉시 적용 (코드 품질에 직접 영향)

| # | 항목 | 영향도 | 작업량 |
|---|------|--------|--------|
| 1 | **API 응답 헬퍼 함수** 생성 (`lib/api-response.ts`) | 높음 | 소 |
| 2 | **코드 중복 제거** — `normalizeUploadUrl` 등 공유 유틸 추출 (`lib/upload.ts`) | 높음 | 소 |
| 3 | **Dead Code 제거** — 주석 처리된 코드 블록 삭제 | 중간 | 소 |
| 4 | **`Response` → `NextResponse` 통일** (manage/ 하위 5개 파일) | 높음 | 소 |

### 단기 개선 (1~2주)

| # | 항목 | 영향도 | 작업량 |
|---|------|--------|--------|
| 5 | **환경 변수 중앙화** (`lib/env.ts`) | 높음 | 중 |
| 6 | **에러 처리 패턴 통일** — `err: unknown` + `getErrorMessage()` | 중간 | 중 |
| 7 | **console.error 한국어 통일** | 낮음 | 소 |
| 8 | **매직 넘버/문자열 상수화** (`lib/constants.ts`) | 중간 | 중 |

### 중기 개선 (여유 있을 때)

| # | 항목 | 영향도 | 작업량 |
|---|------|--------|--------|
| 9 | **window 전역 타입 확장** — `as any` 제거 (`types/global.d.ts`) | 중간 | 중 |
| 10 | **API 응답 타입 표준화** — 제네릭 `ApiResponse<T>` 정의 | 중간 | 대 |

### 개선 후 새로 생기는 파일

```
src/lib/
├── api-response.ts    # API 응답 헬퍼 (successResponse, errorResponse, getErrorMessage)
├── upload.ts          # 업로드 관련 공유 유틸 (normalizeUploadUrl, UPLOAD_PATH 등)
├── env.ts             # 환경 변수 중앙 관리
└── constants.ts       # 비즈니스 상수 (DEFAULT_BANK_ID, DEFAULT_VIEW_MODE 등)

src/types/
└── global.d.ts        # window 전역 타입 확장
```
