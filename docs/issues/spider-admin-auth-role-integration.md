# [FEATURE]: spider-admin 로그인 및 역할/권한 연동

## 개요

`spider-admin`이 메인 관리자 시스템이고, `cms-1-innova-next`는 기능 확장 CMS 모듈이다. 현재 CMS는 자체 데모 사용자(`DEMO_USERS`)와 `cms-token` JWT 쿠키 기반으로 `admin`/`user` 역할을 임시 처리하고 있다.

앞으로는 `spider-admin` 로그인 세션과 역할/권한을 CMS에서도 동일하게 사용하도록 통합한다. 사용자/역할/권한의 원장은 `spider-admin`의 `FWK_USER`, `FWK_ROLE`, `FWK_ROLE_MENU`로 두고, CMS는 별도 사용자/역할 테이블을 만들지 않는다.

## 목표

- `spider-admin` 로그인 후 CMS(`/cms/**`)로 이동해도 동일 사용자로 인식된다.
- `spider-admin`의 메뉴 또는 버튼에서 `/cms/**` CMS 화면으로 진입했을 때 정상적으로 라우팅된다.
- CMS 권한은 `spider-admin`의 역할별 메뉴 권한(`FWK_ROLE_MENU`)을 기준으로 판단한다.
- CMS 권한 단위는 1차 구현에서 단순하게 `CMS:R`, `CMS:W`로 시작한다.
- CMS 내부의 데모 인증 흐름(`DEMO_USERS`, `cms-token`, `cms-user`)은 운영 권한 판단에서 제거한다.
- `spider-admin`의 `/api/**`와 CMS의 Next API가 충돌하지 않도록 CMS를 `/cms/**` 아래에 배치한다.

## 결정된 방향

| 항목 | 결정 |
| --- | --- |
| 이슈/작업 기준 저장소 | `cms-1-innova-next` |
| 메인 시스템 | `spider-admin` |
| CMS 라우팅 | `/cms/**` |
| Java API 라우팅 | `/api/**`는 `spider-admin` 소유 |
| CMS Next API 라우팅 | `/cms/api/**` |
| 권한 원장 | `FWK_ROLE_MENU` |
| 1차 CMS 권한 단위 | `CMS:R`, `CMS:W` |
| CMS 사용자 관리 | 별도 사용자/역할 테이블 생성하지 않음 |

## 구현 내용

### 1. spider-admin 연동 전제

- `spider-admin`에서 `FWK_MENU`에 CMS 메뉴를 추가한다.
- CMS 메뉴 URL은 `/cms/...` prefix를 사용한다.
- `menu-resource-permissions.yml`에 CMS 메뉴 권한을 추가한다.

예시:

```yaml
menu-resource:
  permissions:
    cms_manage:
      R: CMS:R
      W: CMS:W
```

- `FWK_ROLE_MENU`에서 작업자/관리자 역할에 CMS 메뉴 권한을 부여한다.
- `spider-admin`에서 현재 로그인 사용자 정보를 내려주는 API가 필요하다.

권장 API:

```txt
GET /api/auth/me
```

응답 예시:

```json
{
  "success": true,
  "message": "성공",
  "data": {
    "userId": "admin",
    "userName": "관리자",
    "roleId": "ADMIN",
    "authorities": ["CMS:R", "CMS:W"]
  },
  "code": 200
}
```

### 2. CMS 라우팅 분리

- Next 앱을 `/cms` basePath로 동작하도록 구성한다.
- CMS 내부 Next API 호출과 `spider-admin` API 호출을 명확히 분리한다.
- `spider-admin`의 메뉴/버튼이 `/cms`, `/cms/system`, `/cms/approve`, `/cms/edit`, `/cms/files`로 이동할 수 있으므로 각 진입 URL이 정상 렌더링되도록 한다.
- `/cms` 루트는 로그인 사용자의 역할/권한에 따라 기본 CMS 화면으로 redirect한다.
  - 작업자: `/cms/system`
  - 관리자: `/cms/approve`

예시:

```ts
fetch(nextApi('/api/builder/save'));
fetch(javaApi('/api/auth/me'), { credentials: 'include' });
```

`spider-admin`에서 들어올 수 있는 진입 URL:

| 진입 URL | CMS 처리 |
| --- | --- |
| `/cms` | 현재 사용자 역할/권한에 따라 `/cms/system` 또는 `/cms/approve`로 redirect |
| `/cms/system` | 작업자용 CMS 대시보드. 현재 `src/app/[userId]/page.tsx` 동적 라우트에서 `system` 파라미터로 처리되는 구조를 유지하거나 명시 라우트로 분리 |
| `/cms/approve` | 관리자용 승인 관리 화면 |
| `/cms/edit` | CMS 편집 화면 |
| `/cms/files` | 파일 관리 화면 |

권한이 없는 사용자가 직접 URL로 접근한 경우에는 빈 화면으로 두지 않고 권한 없음 안내 또는 `spider-admin` 홈으로 이동 처리한다.

### 3. CMS 현재 사용자 조회 교체

- 현재 `src/lib/current-user.ts`는 `cms-token` JWT를 검증하고, 없으면 `system/user`로 fallback한다.
- 통합 후에는 `spider-admin`의 `/api/auth/me`를 기준으로 현재 사용자를 조회한다.
- fallback으로 `system`을 반환하지 않는다. 인증이 없으면 401로 처리한다.

### 4. CMS 데모 인증 제거 또는 개발 전용화

- `DEMO_USERS` 기반 사용자 선택 UI는 운영에서 사용하지 않는다.
- `cms-user`, `cms-token` 쿠키는 운영 권한 판단에 사용하지 않는다.
- `src/app/api/auth/login/route.ts`는 제거하거나 개발 전용 경로로 격리한다.

### 5. CMS API 권한 체크 교체

- 현재 일부 Next API route는 `role !== 'admin'` 방식으로 관리자 여부를 판단한다.
- 통합 후에는 `CMS:W` 권한 보유 여부로 쓰기 작업을 판단한다.
- 조회 작업은 `CMS:R` 또는 `CMS:W` 권한을 허용한다.

예시:

```ts
if (!hasAuthority(user, 'CMS:W')) {
  return errorResponse('권한이 없습니다.', 403);
}
```

### 6. CMS UI 권한 제어

- 버튼/메뉴 표시는 `authorities` 기준으로 보조 제어한다.
- 최종 권한 차단은 반드시 Next API route 또는 `spider-admin` API에서 수행한다.
- `CMS:R`만 있는 사용자는 조회만 가능하게 하고, 생성/수정/삭제/승인/배포 버튼은 숨김 또는 disabled 처리한다.
- `CMS:W` 사용자는 CMS 쓰기 기능을 사용할 수 있다.

## 수정 예정 파일

### cms-1-innova-next

| 파일 | 수정 내용 |
| --- | --- |
| `next.config.ts` | `/cms` basePath 및 assetPrefix 적용 여부 반영 |
| `src/lib/api-url.ts` | `nextApi()`, `javaApi()` 헬퍼 신규 추가 |
| `src/lib/java-admin-api.ts` | `spider-admin` API 응답 처리 및 세션 쿠키 전달 헬퍼 신규 추가 |
| `src/lib/current-user.ts` | `cms-token` JWT 기반 조회를 `/api/auth/me` 기반 조회로 교체 |
| `src/data/demo-users.ts` | 운영 코드 의존 제거 또는 개발 전용 fixture로 이동 |
| `src/app/api/auth/login/route.ts` | 데모 로그인 API 제거 또는 개발 전용 경로로 이동 |
| `src/components/home/HomeClient.tsx` | 사용자 선택/`cms-user` 쿠키 저장 흐름 제거, 기본 CMS 화면으로 이동 처리 |
| `src/app/page.tsx` | `/cms` 루트 접근 시 사용자 역할/권한에 따라 `/cms/system` 또는 `/cms/approve`로 redirect |
| `src/app/[userId]/page.tsx` | `/cms/system` 작업자 대시보드 접근이 현재 동적 라우트 구조와 충돌 없이 동작하는지 확인 |
| `src/components/dashboard/ApprovalRequestModal.tsx` | 승인자 목록을 `DEMO_USERS`가 아닌 `spider-admin` API 기반으로 교체 |
| `src/components/dashboard/DashboardClient.tsx` | Next 내부 API URL을 `nextApi()`로 교체, `CMS:R/W`에 따른 버튼 제어 |
| `src/components/approve/ApproveClient.tsx` | Next 내부 API URL을 `nextApi()`로 교체, 승인/반려/배포 버튼 권한 제어 |
| `src/components/edit/EditClient.tsx` | Next 내부 API URL을 `nextApi()`로 교체, 편집/삭제 기능 권한 제어 |
| `src/components/files/FileBrowser.tsx` | Next 내부 API URL을 `nextApi()`로 교체, 파일 업로드/삭제 권한 제어 |
| `src/components/admin/AdminNavTabs.tsx` | `/cms` basePath 적용 후 내부 탭 링크가 올바르게 동작하는지 확인 |
| `src/app/api/builder/save/route.ts` | 현재 사용자 정보를 `spider-admin` 세션 기준으로 기록 |
| `src/app/api/builder/pages/route.ts` | 삭제 등 쓰기 작업을 `CMS:W` 기준으로 체크 |
| `src/app/api/builder/pages/[pageId]/approve/route.ts` | `role !== 'admin'` 체크를 `CMS:W` 체크로 교체 |
| `src/app/api/builder/pages/[pageId]/reject/route.ts` | `role !== 'admin'` 체크를 `CMS:W` 체크로 교체 |
| `src/app/api/builder/pages/[pageId]/rollback/route.ts` | `role !== 'admin'` 체크를 `CMS:W` 체크로 교체 |
| `src/app/api/builder/pages/[pageId]/set-public/route.ts` | `role !== 'admin'` 체크를 `CMS:W` 체크로 교체 |
| `src/app/api/builder/pages/[pageId]/update-dates/route.ts` | `role !== 'admin'` 체크를 `CMS:W` 체크로 교체 |
| `src/app/api/deploy/push/route.ts` | 배포 권한을 `CMS:W` 기준으로 체크 |
| `src/app/api/builder/ab/route.ts` | A/B 설정 변경을 `CMS:W` 기준으로 체크 |
| `src/app/api/builder/ab/promote/route.ts` | A/B winner 반영을 `CMS:W` 기준으로 체크 |
| `src/app/layout.tsx` | 필요 시 `spider-admin` 공통 CSS/폰트 로딩 추가 |
| `src/app/globals.css` | CMS shell과 Java 관리자 UI 통일을 위한 전역 스타일 정리 |
| `docs/cms-java-ui-integration-implementation.md` | 구현 결과에 맞게 가이드 업데이트 |

### spider-admin

> 이 이슈는 `cms-1-innova-next` 저장소 기준으로 관리하되, 아래 변경은 메인 시스템인 `spider-admin`에 필요하다.

| 파일 | 수정 내용 |
| --- | --- |
| `src/main/resources/menu-resource-permissions.yml` | CMS 메뉴 권한 `CMS:R`, `CMS:W` 매핑 추가 |
| `src/main/java/.../global/auth/controller/AuthController.java` | `GET /api/auth/me` 추가 |
| `src/main/java/.../global/security/SecurityConfig.java` | `/cms/**` 접근 및 프록시 정책 확인 |
| `FWK_MENU` 데이터 | CMS 메뉴 URL `/cms/...` 등록 |
| `FWK_ROLE_MENU` 데이터 | 작업자/관리자 역할에 CMS 권한 부여 |
| `spider-admin` 메뉴/버튼 UI | 작업자는 `/cms/system`, 관리자는 `/cms/approve` 등 CMS 진입 링크 추가 |

## 수용 기준

- [ ] `spider-admin` 로그인 후 `/cms/**` CMS 화면에 접근하면 별도 로그인 없이 현재 사용자가 인식된다.
- [ ] `spider-admin`의 메뉴 또는 버튼에서 `/cms/**` CMS 화면으로 이동할 수 있다.
- [ ] `/cms` 루트 접근 시 작업자는 `/cms/system`, 관리자는 `/cms/approve`로 정상 redirect된다.
- [ ] 작업자는 `/cms/system` 화면에 접근할 수 있다.
- [ ] 관리자는 `/cms/approve` 화면에 접근할 수 있다.
- [ ] CMS에서 `GET /api/auth/me` 호출 시 `JSESSIONID` 기반 사용자 정보와 `CMS:R`/`CMS:W` 권한이 내려온다.
- [ ] `FWK_ROLE_MENU`에서 CMS 권한을 제거하면 CMS 쓰기 버튼이 숨김 또는 disabled 처리된다.
- [ ] `CMS:R`만 있는 사용자는 조회 가능하지만 생성/수정/삭제/승인/반려/배포가 불가능하다.
- [ ] `CMS:W`가 있는 사용자는 CMS 쓰기 기능을 사용할 수 있다.
- [ ] `role !== 'admin'` 기반 권한 체크가 운영 코드에서 제거된다.
- [ ] `DEMO_USERS`, `cms-token`, `cms-user`가 운영 권한 판단에 사용되지 않는다.
- [ ] `/api/**`는 `spider-admin`, `/cms/api/**`는 Next API로 라우팅되어 충돌하지 않는다.
- [ ] CMS 페이지/컴포넌트의 `CREATE_USER_ID`, `APPROVER_ID`, `LAST_MODIFIER_ID`에는 `FWK_USER.USER_ID`가 기록된다.

## 참고

- 현재 CMS는 별도 역할 DB를 가지고 있지 않다.
- 현재 CMS DB는 `SPW_CMS_PAGE`, `SPW_CMS_COMPONENT` 등에 작성자/수정자/승인자 ID와 이름만 저장한다.
- 사용자/역할/권한의 최종 원장은 `spider-admin`의 `FWK_USER`, `FWK_ROLE`, `FWK_ROLE_MENU`로 둔다.

