# React UI 통일 및 웹서비스 연동 확인 가이드

## 전제

이 저장소는 Spring Boot + Thymeleaf 관리자 화면이다. 실제 React 프로젝트 소스는 이 저장소에서 확인되지 않았다. 따라서 React 프로젝트를 별도로 열었을 때 아래 항목을 먼저 확인하고, 현재 프로젝트 기준과 맞추면 된다.

## React 프로젝트에서 먼저 확인할 코드

| 확인 대상 | React에서 찾을 파일/코드 |
| --- | --- |
| 앱 진입점 | `main.tsx`, `index.tsx`, `App.tsx`, `RootLayout` |
| 라우팅 | `router.tsx`, `routes.tsx`, `createBrowserRouter`, `BrowserRouter`, `Routes`, `Route` |
| 전체 레이아웃 | `Layout`, `AdminLayout`, `Sidebar`, `Header`, `TopBar`, `Tabs`, `Outlet` |
| 공통 CSS 로딩 | `index.css`, `global.css`, `App.css`, `styles/`, `theme/`, `vite.config`, `public/index.html` |
| UI 라이브러리 | `package.json`의 `bootstrap`, `bootstrap-icons`, `antd`, `mui`, `tailwind`, `styled-components` 등 |
| 테마 처리 | `ThemeProvider`, `darkMode`, `localStorage`, `data-bs-theme`, CSS variables |
| API 클라이언트 | `api.ts`, `axios.ts`, `http.ts`, `fetchClient`, `interceptors`, `baseURL` |
| 인증/세션 처리 | `authStore`, `AuthProvider`, `login`, `logout`, `credentials`, `withCredentials`, 401/403 처리 |
| 메뉴 렌더링 | `Menu`, `SidebarMenu`, `Navigation`, `menuUrl`, `menuId`, 메뉴 API 호출부 |
| 버튼 이동 처리 | `navigate(...)`, `window.location.href`, `window.open`, `Link`, `useNavigate` |
| 권한 처리 | `permissions`, `authorities`, `role`, `readOnly`, 버튼 숨김/disabled 조건 |
| 테이블/검색/모달 | `DataTable`, `Grid`, `SearchForm`, `Modal`, `Pagination` 컴포넌트 |

React 코드 확인 시 가장 중요한 순서는 `라우팅 -> 레이아웃 -> CSS/테마 -> API 클라이언트 -> 메뉴/버튼 이동 -> 권한`이다.

## 현재 프로젝트에서 맞춰야 할 기준 파일

| 기준 | 현재 프로젝트 파일 |
| --- | --- |
| 전체 화면 구조 | `src/main/resources/templates/home.html` |
| 사이드바 | `src/main/resources/templates/fragments/sidebar.html` |
| 상단바 | `src/main/resources/templates/fragments/topbar.html` |
| 디자인 토큰 | `src/main/resources/static/css/design-tokens.css` |
| 공통 스타일 | `src/main/resources/static/css/app.css` |
| 페이지 URL | `src/main/java/com/example/admin_demo/global/page/controller/PageController.java` |
| 보안/세션 | `src/main/java/com/example/admin_demo/global/security/SecurityConfig.java` |
| 메뉴 API | `src/main/java/com/example/admin_demo/domain/menu/controller/MenuController.java` |
| 응답 포맷 | `src/main/java/com/example/admin_demo/global/dto/ApiResponse.java`, `src/main/java/com/example/admin_demo/global/dto/PageResponse.java` |
| 메뉴 권한 | `src/main/resources/menu-resource-permissions.yml` |

## UI 통일 기준

React 화면은 현재 관리자 화면의 CSS를 기준으로 맞춘다.

필수 스타일:

```html
<link rel="stylesheet" href="/webjars/bootstrap/5.3.3/css/bootstrap.min.css">
<link rel="stylesheet" href="/webjars/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css">
<link rel="stylesheet" href="/css/design-tokens.css">
<link rel="stylesheet" href="/css/app.css">
```

React가 다른 서버에서 실행되면 `design-tokens.css`, `app.css`, `fonts/Hana2-*.ttf`를 React 프로젝트에 복사하거나, Spring Boot의 `/css/**`, `/fonts/**` 경로를 참조하도록 구성한다.

React 레이아웃은 아래 구조와 class name을 우선 맞춘다.

```tsx
<div className="admin-container">
  <Sidebar className="left-sidebar" />
  <div className="main-area">
    <TopBar className="top-bar" />
    <div className="tab-bar-wrapper">
      <div className="tab-bar" />
    </div>
    <main className="content-area">
      <Outlet />
    </main>
  </div>
</div>
```

검색/목록 화면은 현재 패턴을 따른다.

```html
<div class="page-header">...</div>
<div class="sp-search-container">...</div>
<div class="page-header mt-3">...</div>
<table class="table table-sm table-hover sp-data-grid">...</table>
```

테마는 현재 프로젝트와 같은 저장 키를 쓴다.

```ts
localStorage.setItem('sp-theme', 'dark');
document.documentElement.setAttribute('data-bs-theme', 'dark');
```

## API 연동 기준

현재 서버는 form login + `JSESSIONID` 세션 방식이다.

| 항목 | 기준 |
| --- | --- |
| API prefix | `/api` |
| 인증 | `/api/**`는 로그인 필요 |
| API CSRF | `/api/**`는 CSRF 제외 |
| 로그인 페이지 | `/login` |
| 로그인 처리 | `POST /login`, form parameter: `userId`, `password` |
| 로그아웃 | `POST /logout` |

React API 클라이언트는 쿠키를 포함해야 한다.

```ts
fetch('/api/menus/my', {
  credentials: 'include',
  headers: { Accept: 'application/json' },
});
```

axios를 쓰면 다음 설정을 확인한다.

```ts
axios.create({
  baseURL: '/api',
  withCredentials: true,
});
```

공통 응답 포맷:

```ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: number;
};

type PageResponse<T> = {
  content: T[];
  currentPage: number; // 1-based
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
```

401은 `/login?expired=true` 이동, 403은 권한 없음 안내로 처리한다.

## 메뉴와 버튼 연동 기준

현재 사이드바는 `/api/menus/my`를 호출하고, 응답의 `menuUrl`로 페이지를 연다.

React 메뉴 컴포넌트도 아래 필드를 기준으로 렌더링하면 된다.

```ts
type MenuNode = {
  menuId: string;
  menuNm: string;
  menuUrl: string;
  priorMenuId?: string;
  menuLevel?: number;
  srtSeq?: number;
  readOnly?: boolean;
  children?: MenuNode[];
};
```

기존 Thymeleaf 웹서비스로 진입하는 버튼은 `menuUrl`을 그대로 사용한다.

```ts
function openLegacyPage(menuUrl: string) {
  window.location.href = menuUrl;
}
```

React 화면을 유지하고 새 탭에서 열어야 하면 다음처럼 처리한다.

```ts
function openLegacyPageNewTab(menuUrl: string) {
  window.open(menuUrl, '_blank', 'noopener,noreferrer');
}
```

React 내부 라우팅으로 처리할 메뉴와 기존 Thymeleaf로 이동할 메뉴가 섞여 있다면, React 라우트 prefix를 명확히 나눈다.

```ts
if (menuUrl.startsWith('/cms/')) {
  navigate(menuUrl.replace('/cms', ''));
} else {
  window.location.href = menuUrl;
}
```

## 기존 페이지 URL

React 버튼에서 기존 웹서비스 화면으로 이동할 때 사용할 URL이다.

| 화면 | URL |
| --- | --- |
| 개인정보 | `/users/profile` |
| 사용자 | `/users` |
| 메뉴 | `/menus` |
| 역할 | `/roles` |
| 코드그룹 | `/code-groups` |
| 코드 | `/codes` |
| 프로퍼티 DB | `/properties` |
| WAS 인스턴스 | `/was-instances` |
| 배치 APP | `/batches/apps` |
| 배치 수행내역 | `/batches/history` |
| 실행중 배치 | `/batches/executing` |
| 오류 발생 현황 | `/error-histories` |
| 오류코드 | `/error-codes` |
| Housekeep | `/housekeeps` |
| 월렛 | `/wallets` |
| VC 조회 | `/wallet-vcs` |
| 고객 VC 집계 | `/cust-vc-sumrs` |
| 일별 VC 집계 | `/daily-vc-sumrs` |
| 얼굴 임시 | `/face-tmps` |
| CAS 로그 | `/cas-log-hists` |
| NNCE | `/nnces` |
| 관리자 작업 로그 | `/admin-histories` |

## 권한 확인 기준

서버 권한은 `@PreAuthorize`와 `menu-resource-permissions.yml`이 최종 기준이다. React에서는 버튼 표시만 보조로 처리한다.

React에서 확인할 코드:

- `readOnly`로 등록/수정/삭제 버튼을 숨기거나 disabled 하는지
- 사용자 authorities 또는 role 정보를 별도로 저장하는지
- 403 응답을 받았을 때 공통 안내를 띄우는지

현재 React에서 권한 API가 없다면, 우선 `/api/menus/my`의 `readOnly`를 기준으로 메뉴 단위 쓰기 버튼을 제어한다.

## 최소 구현 순서

1. React 프로젝트의 라우터와 레이아웃 파일을 찾아 현재 `.admin-container`, `.left-sidebar`, `.main-area`, `.top-bar`, `.content-area` 구조와 맞춘다.
2. React 공통 CSS 로딩부를 찾아 Bootstrap, Bootstrap Icons, `design-tokens.css`, `app.css`, Hana 폰트를 적용한다.
3. React 테마 코드를 찾아 `sp-theme`와 `data-bs-theme`를 사용하도록 맞춘다.
4. React API 클라이언트를 찾아 `baseURL: '/api'`, `withCredentials: true` 또는 `credentials: 'include'`를 적용한다.
5. React 메뉴 코드를 찾아 `/api/menus/my` 응답의 `menuUrl`로 이동하도록 맞춘다.
6. 버튼 클릭 코드에서 기존 화면 진입은 `window.location.href = menuUrl`, React 내부 화면은 `navigate(...)`로 분리한다.
7. 권한/401/403 처리 코드를 확인해 서버 응답 기준과 맞춘다.

## 서버 변경이 필요한 경우

| 요구 | 필요한 변경 |
| --- | --- |
| React 빌드를 Spring Boot에 포함 | React build output을 정적 경로에 배치하고 `/cms/**` forward 추가 |
| React 정적 경로 접근 | `SecurityConfig`에 `/cms/**` 또는 asset 경로 정책 추가 |
| React에서 현재 사용자/권한 조회 | `/api/me` 또는 `/api/auth/me` API 추가 |
| React 신규 화면을 메뉴에 등록 | DB `IMIS_MIC_MENU_BASE.MENU_URL`과 `menu-resource-permissions.yml` 추가 |
| React가 다른 도메인에서 API 호출 | CORS, 쿠키 SameSite/Secure, reverse proxy 설정 확인 |

## 최종 확인

- React에서 현재 CSS 토큰과 Hana 폰트가 적용되는가?
- `/api/menus/my` 메뉴 순서와 권한이 사이드바에 그대로 반영되는가?
- 버튼 클릭 시 `/users`, `/wallets`, `/batches/apps` 등 기존 페이지로 정상 이동하는가?
- React 내부 라우트와 기존 Thymeleaf URL 이동 규칙이 충돌하지 않는가?
- API 호출에 세션 쿠키가 포함되는가?
- 401/403 공통 처리가 있는가?
- pagination이 `currentPage` 1-based 응답에 맞는가?

