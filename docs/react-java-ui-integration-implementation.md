# java-admin 중심 React CMS 통합 구현 가이드

## 목표

메인 프로젝트는 `java-admin`이고, 현재 저장소는 React/Next 기반 `react-cms`다. 목표는 `java-admin`의 버튼 또는 메뉴에서 `react-cms` 화면으로 이동했을 때 단순 링크 이동으로 끝나지 않고, 로그인 세션, 역할/권한, 메뉴, UI 톤, API 호출 규칙이 하나의 관리자 서비스처럼 이어지게 만드는 것이다.

정리하면 `java-admin`이 아래 항목의 최종 기준이 된다.

| 통합 항목 | 기준 시스템 | React CMS에서 해야 할 일 |
| --- | --- | --- |
| 로그인/세션 | `java-admin` Spring Security, `JSESSIONID` | `cms-token`, `cms-user`, 데모 사용자 선택 제거 또는 개발 전용화 |
| 역할/권한 | `java-admin` 역할 관리, `@PreAuthorize`, `menu-resource-permissions.yml` | Java 현재 사용자/권한 API를 조회하고 버튼 표시만 보조 제어 |
| 메뉴 | `java-admin` 메뉴 DB, `/api/menus/my` | React 메뉴 URL은 `/cms/...` prefix로 받고, 기존 URL은 Java 화면으로 이동 |
| UI | `java-admin` Thymeleaf 관리자 CSS | React shell에 동일 CSS, 폰트, 테마 키 적용 |
| React 기능 | `react-cms` Next API, DB, ContentBuilder | Next 내부 API는 Java `/api/**`와 경로 충돌이 나지 않게 분리 |

## 권장 아키텍처

가장 권장하는 방식은 같은 도메인에서 `java-admin`이 메인 라우터 역할을 하고, React CMS를 `/cms/**` 아래에 붙이는 것이다.

| URL | 담당 |
| --- | --- |
| `/login`, `/logout` | `java-admin` |
| `/users`, `/menus`, `/roles`, `/wallets` 등 기존 관리자 화면 | `java-admin` Thymeleaf |
| `/api/**` | `java-admin` API |
| `/cms/**` | `react-cms` Next 화면 |
| `/cms/api/**` | `react-cms` Next 내부 API |

이 구조가 필요한 이유는 현재 `react-cms`가 이미 `/api/builder/**`, `/api/manage/**`, `/api/components` 같은 Next API route를 사용하고 있기 때문이다. React를 루트에 올리면 Java의 `/api/**`와 충돌한다.

흐름은 다음처럼 잡는다.

1. 사용자가 `java-admin`에서 로그인한다.
2. 브라우저에 `JSESSIONID`가 생긴다.
3. `java-admin` 메뉴나 버튼에서 `/cms/approve`, `/cms/edit`, `/cms/files`로 이동한다.
4. 같은 도메인이므로 React 화면에서도 `JSESSIONID`가 유지된다.
5. React가 Java API를 부를 때는 `/api/...`를 `credentials: 'include'`로 호출한다.
6. React 자체 저장/편집/배포 API는 `/cms/api/...`로 호출한다.
7. Java의 역할/권한이 최종 기준이고, React는 `readOnly`, `authorities`로 버튼 표시를 보조한다.

## java-admin에서 필요한 구현

### 1. React 메뉴 URL 등록

Java 메뉴 DB에는 React 화면을 `/cms/...` prefix로 등록한다.

| React 화면 | 메뉴 URL 예시 |
| --- | --- |
| 승인 관리 | `/cms/approve` |
| 콘텐츠 최적화 | `/cms/ab` |
| 콘텐츠 편집 | `/cms/edit` |
| 파일 관리 | `/cms/files` |

기존 Thymeleaf 화면은 `/users`, `/menus`, `/roles`, `/wallets` 같은 URL을 그대로 둔다.

### 2. 현재 사용자/권한 API 추가

React에서 데모 사용자와 자체 JWT를 제거하려면 Java 세션 기준의 현재 사용자 API가 필요하다.

권장 URL:

```txt
GET /api/auth/me
```

응답 예시:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "userId": "admin",
    "userName": "관리자",
    "role": "ADMIN",
    "authorities": ["ROLE_ADMIN", "CMS_APPROVE", "CMS_DEPLOY"],
    "menuPermissions": {
      "/cms/approve": { "readOnly": false },
      "/cms/edit": { "readOnly": false },
      "/cms/files": { "readOnly": true }
    }
  },
  "code": 200
}
```

역할 관리가 이미 `java-admin`에 있다면 React 전용 role을 새로 만들기보다 Java의 역할/권한 문자열을 그대로 내려주는 것이 좋다. React 내부에서는 `ROLE_ADMIN`, `CMS_APPROVE`, `CMS_DEPLOY` 같은 권한 문자열을 해석해서 버튼 표시만 제어한다.

### 3. 결재자/승인자 목록 API 추가

현재 `react-cms`의 `src/components/dashboard/ApprovalRequestModal.tsx`는 `DEMO_USERS`에서 admin 사용자를 고른다. 통합 후에는 Java 역할 관리 기준으로 승인자 목록을 받아야 한다.

권장 URL:

```txt
GET /api/users/approvers?permission=CMS_APPROVE
```

응답 예시:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "userId": "admin", "userName": "관리자" },
    { "userId": "approver01", "userName": "승인자01" }
  ],
  "code": 200
}
```

### 4. SecurityConfig와 프록시 정책

같은 도메인에서 운영하려면 reverse proxy 또는 gateway에서 `/cms/**`를 Next 서버로 넘긴다. Spring Security는 `/cms/**`, Next asset 경로가 인증 사용자에게 접근 가능하도록 허용한다.

중요한 점은 `/api/**`는 계속 Java가 소유해야 한다는 것이다. React 내부 API까지 Java의 `/api/**`와 섞이면 메뉴/권한 API와 Next 저장 API가 충돌한다.

## react-cms에서 수정할 항목

### 1. Next 앱을 `/cms` 아래로 배치

수정 파일:

- `next.config.ts`

예시:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/cms',
  assetPrefix: '/cms',
  serverExternalPackages: ['oracledb'],
};

export default nextConfig;
```

개발 환경에서 루트 경로도 유지하고 싶다면 `NEXT_PUBLIC_NEXT_BASE_PATH` 같은 환경변수로 basePath 적용 여부를 분리한다.

### 2. API URL을 Java API와 Next API로 분리

추가 권장 파일:

- `src/lib/api-url.ts`

```ts
const NEXT_BASE_PATH = process.env.NEXT_PUBLIC_NEXT_BASE_PATH ?? '/cms';

export function nextApi(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${NEXT_BASE_PATH}${normalized}`;
}

export function javaApi(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}
```

사용 기준:

```ts
// React CMS 내부 API
fetch(nextApi('/api/builder/save'), ...);

// java-admin API
fetch(javaApi('/api/auth/me'), { credentials: 'include' });
fetch(javaApi('/api/menus/my'), { credentials: 'include' });
```

현재 바꿔야 할 대표 위치:

| 파일 | 현재 호출 | 변경 방향 |
| --- | --- | --- |
| `src/components/dashboard/DashboardClient.tsx` | `/api/builder/save`, `/api/builder/pages...` | `nextApi('/api/builder/...')` |
| `src/components/approve/ApproveClient.tsx` | `/api/builder/pages...`, `/api/deploy/push`, `/api/deploy/history` | `nextApi('/api/...')` |
| `src/components/edit/EditClient.tsx` | `/api/builder/load`, `/api/builder/save`, `/api/components` | `nextApi('/api/...')` |
| `src/components/files/FileBrowser.tsx` | `/api/manage/...` | `nextApi('/api/manage/...')` |
| 신규 메뉴/권한 조회 | 없음 | `javaApi('/api/menus/my')`, `javaApi('/api/auth/me')` |

### 3. Java 세션용 클라이언트 헬퍼 추가

추가 권장 파일:

- `src/lib/java-admin-api.ts`

```ts
export type JavaApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: number;
};

export async function javaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    window.location.href = '/login?expired=true';
    throw new Error('인증이 만료되었습니다.');
  }

  if (res.status === 403) {
    throw new Error('권한이 없습니다.');
  }

  const body = (await res.json()) as JavaApiResponse<T>;
  if (!body.success) {
    throw new Error(body.message || '요청 처리에 실패했습니다.');
  }

  return body.data;
}
```

서버 컴포넌트나 Next API route에서 Java 세션을 확인해야 할 때는 브라우저가 쿠키를 자동으로 붙여주지 않는다. `next/headers`의 `cookies()`로 현재 요청 쿠키를 읽고 Java API로 전달하는 서버용 함수가 별도로 필요하다.

예시:

```ts
import { cookies } from 'next/headers';

export async function javaServerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const res = await fetch(`${process.env.JAVA_ADMIN_ORIGIN ?? ''}${path}`, {
    ...init,
    headers: {
      Cookie: cookieHeader,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');

  const body = (await res.json()) as JavaApiResponse<T>;
  if (!body.success) throw new Error(body.message);
  return body.data;
}
```

### 4. `getCurrentUser()`를 Java 세션 기준으로 교체

현재 파일:

- `src/lib/current-user.ts`

현재는 `cms-token` JWT 쿠키를 검증하고, 없으면 `system`으로 fallback 한다. 통합 후에는 이 fallback이 권한 오류를 숨기므로 제거해야 한다.

교체 방향:

```ts
import { javaServerFetch } from '@/lib/java-admin-api';

export interface CurrentUser {
  userId: string;
  userName: string;
  role: 'ADMIN' | 'USER' | string;
  authorities: string[];
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return javaServerFetch<CurrentUser>('/api/auth/me');
}

export function hasAuthority(user: CurrentUser, authority: string): boolean {
  return user.authorities.includes(authority) || user.authorities.includes('ROLE_ADMIN');
}
```

이렇게 바꾸면 현재 Next API route의 관리자 체크도 Java 역할 기준으로 이어갈 수 있다. 예를 들어 현재 `src/app/api/builder/pages/[pageId]/approve/route.ts` 같은 파일은 `role !== 'admin'` 대신 `hasAuthority(user, 'CMS_APPROVE')` 기준으로 바꾸는 것이 좋다.

### 5. 데모 로그인/사용자 선택 제거

현재 관련 파일:

- `src/components/home/HomeClient.tsx`
- `src/data/demo-users.ts`
- `src/app/api/auth/login/route.ts`

운영 통합 후 처리:

- `HomeClient`의 사용자 선택 드롭다운과 `cms-user` 쿠키 저장 제거
- `/cms` 루트 접근 시 Java 메뉴 정책에 맞는 기본 화면으로 redirect
- `DEMO_USERS`는 삭제하거나 `dev` 전용 fixture로 이동
- `src/app/api/auth/login/route.ts`는 운영에서 사용하지 않도록 제거하거나 개발 전용 path로 이동

예시:

```ts
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/approve');
}
```

`basePath: '/cms'`가 적용되면 브라우저 URL은 `/cms/approve`가 된다.

### 6. 승인자 목록을 Java 역할 API로 교체

현재 파일:

- `src/components/dashboard/ApprovalRequestModal.tsx`

현재는 `DEMO_USERS.filter((u) => u.role === 'admin')`로 승인자를 만든다. 통합 후에는 Java API를 호출한다.

```ts
type Approver = {
  userId: string;
  userName: string;
};

const approvers = await javaFetch<Approver[]>('/api/users/approvers?permission=CMS_APPROVE');
```

승인 요청 API는 현재 Next 내부 API인 `/api/builder/pages/{pageId}/approve-request`를 계속 써도 된다. 다만 그 API route 내부에서 `getCurrentUser()`가 Java 세션 기준으로 바뀌어야 작성자 정보와 권한이 통합된다.

### 7. React 관리자 shell 추가

현재 `DashboardClient`, `ApproveClient`가 각각 자체 header를 가지고 있다. Java 관리자와 UI를 통일하려면 페이지별 header를 줄이고 공통 shell을 둔다.

권장 구조:

```tsx
<div className="admin-container">
  <ReactSidebar className="left-sidebar" />
  <div className="main-area">
    <ReactTopBar className="top-bar" />
    <div className="tab-bar-wrapper">
      <div className="tab-bar" />
    </div>
    <main className="content-area">{children}</main>
  </div>
</div>
```

권장 파일:

- `src/components/admin/AdminShell.tsx`
- `src/components/admin/ReactSidebar.tsx`
- `src/components/admin/ReactTopBar.tsx`
- `src/components/admin/useJavaMenus.ts`

`ReactSidebar`는 Java `/api/menus/my` 응답을 사용한다.

```ts
export type MenuNode = {
  menuId: string;
  menuNm: string;
  menuUrl: string;
  readOnly?: boolean;
  children?: MenuNode[];
};
```

메뉴 이동 규칙:

```ts
function openMenu(menuUrl: string, navigate: (url: string) => void) {
  if (menuUrl.startsWith('/cms/')) {
    navigate(menuUrl.replace('/cms', '') || '/');
    return;
  }

  window.location.href = menuUrl;
}
```

### 8. Java 관리자 CSS와 테마 적용

React의 전역 UI는 Java 관리자 기준 CSS를 로딩한다.

수정 파일:

- `src/app/layout.tsx`
- `src/app/globals.css`

`layout.tsx` 예시:

```tsx
<html lang="ko" suppressHydrationWarning>
  <head>
    <link rel="stylesheet" href="/webjars/bootstrap/5.3.3/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/webjars/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" href="/css/design-tokens.css" />
    <link rel="stylesheet" href="/css/app.css" />
  </head>
  <body>{children}</body>
</html>
```

`react-cms`가 별도 도메인에서 개발될 때는 `/css/**`, `/fonts/**`, `/webjars/**`가 Java 서버로 프록시되거나 Next `public`으로 복사되어야 한다.

테마 키는 Java와 동일하게 맞춘다.

```ts
localStorage.setItem('sp-theme', theme);
document.documentElement.setAttribute('data-bs-theme', theme);
```

### 9. 권한 제어 기준

역할 관리는 반드시 Java가 최종 기준이다. React는 사용자 경험을 위해 버튼을 숨기거나 비활성화할 뿐이다.

권장 권한 매핑:

| 기능 | 권한 예시 | React 처리 |
| --- | --- | --- |
| 승인 관리 진입 | `CMS_APPROVE_VIEW` | 메뉴 노출 |
| 승인/반려 | `CMS_APPROVE` | 승인, 반려 버튼 노출 |
| 배포 | `CMS_DEPLOY` | 배포 버튼 노출 |
| 콘텐츠 생성/수정 | `CMS_CONTENT_WRITE` | 생성, 편집, 삭제 버튼 노출 |
| 파일 관리 | `CMS_FILE_MANAGE` | 업로드, 삭제 버튼 노출 |
| 읽기 전용 | `readOnly: true` | 등록/수정/삭제 버튼 disabled |

Next API route에도 같은 권한 체크를 넣어야 한다. 버튼을 숨겨도 직접 API를 호출할 수 있기 때문이다.

```ts
const user = await getCurrentUser();
if (!hasAuthority(user, 'CMS_APPROVE')) {
  return errorResponse('권한이 없습니다.', 403);
}
```

## 우선순위 구현 순서

1. `java-admin`에서 React 메뉴 URL을 `/cms/...`로 등록한다.
2. `react-cms`에 `basePath: '/cms'` 적용 여부를 결정한다.
3. `react-cms`의 API URL을 `nextApi()`와 `javaApi()`로 분리한다.
4. Java에 `/api/auth/me`, `/api/users/approvers`, 기존 `/api/menus/my` 권한 필드를 준비한다.
5. `src/lib/current-user.ts`를 Java 세션 기준으로 교체한다.
6. `HomeClient`, `DEMO_USERS`, `cms-token`, `cms-user` 흐름을 운영에서 제거한다.
7. `ApprovalRequestModal`의 승인자 목록을 Java 역할 API로 교체한다.
8. `AdminShell`, `ReactSidebar`, `ReactTopBar`를 만들고 Java CSS class 기준으로 페이지를 감싼다.
9. `ApproveClient`, `DashboardClient`, `EditClient`, `FileBrowser`의 버튼을 `authorities`와 `readOnly` 기준으로 제어한다.
10. Next API route의 `role !== 'admin'` 체크를 Java 권한 문자열 기준으로 교체한다.

## 최종 확인

- `java-admin` 로그인 후 `/cms/approve`로 이동했을 때 재로그인 없이 열린다.
- React 화면에서 `/api/auth/me`, `/api/menus/my` 호출에 `JSESSIONID`가 포함된다.
- `/api/**`는 Java로, `/cms/api/**`는 Next로 라우팅된다.
- `DEMO_USERS`, `cms-token`, `cms-user`가 운영 권한 판단에 사용되지 않는다.
- Java에서 역할을 바꾸면 React의 메뉴와 버튼 상태가 같이 바뀐다.
- React 버튼에서 `/users`, `/menus`, `/wallets` 같은 기존 Java 화면으로 정상 이동한다.
- React 내부 메뉴는 `/cms/approve`, `/cms/edit`처럼 현재 React 화면 안에서 이동한다.
- 승인, 반려, 배포, 삭제 같은 민감 기능은 UI뿐 아니라 Next API route에서도 Java 권한으로 막힌다.
- Java 관리자 CSS, Hana 폰트, `sp-theme`, `data-bs-theme`가 React 화면에도 동일하게 적용된다.

