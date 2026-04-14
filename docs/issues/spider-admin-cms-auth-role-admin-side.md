# [FEATURE]: CMS 확장 모듈 로그인 세션 및 역할 권한 연동 지원

## 개요

`spider-admin`은 메인 관리자 시스템이고, `cms-1-innova-next`는 `/cms/**` 아래에 붙는 CMS 기능 확장 모듈이다. CMS가 자체 사용자/역할을 관리하지 않고 `spider-admin`의 로그인 세션과 역할별 메뉴 권한을 사용하도록, `spider-admin` 쪽에 CMS 메뉴/권한/API/라우팅 지원을 추가한다.

이 이슈는 `spider-admin` 저장소에서 수행할 작업을 대상으로 한다. 연동 대상 CMS 저장소는 `cms-1-innova-next`다.

## 목표

- `spider-admin` 로그인 후 `/cms/**` CMS 화면으로 이동해도 동일 사용자가 유지된다.
- `spider-admin` 메뉴 또는 버튼에서 CMS 화면(`/cms/**`)으로 진입할 수 있다.
- CMS 권한은 `FWK_ROLE_MENU`의 역할별 메뉴 권한을 기준으로 판단한다.
- 1차 CMS 권한은 단순하게 `CMS:R`, `CMS:W`만 사용한다.
- CMS는 사용자/역할 테이블을 별도로 만들지 않고, `spider-admin`의 `FWK_USER`, `FWK_ROLE`, `FWK_ROLE_MENU`를 권한 원장으로 사용한다.
- `spider-admin`은 CMS가 현재 사용자와 권한을 조회할 수 있는 API를 제공한다.

## 결정된 방향

| 항목 | 결정 |
| --- | --- |
| 메인 시스템 | `spider-admin` |
| CMS 시스템 | `cms-1-innova-next` |
| CMS 라우팅 | `/cms/**` |
| Java API 라우팅 | `/api/**`는 `spider-admin` 소유 |
| CMS Next API 라우팅 | `/cms/api/**` |
| 권한 원장 | `FWK_ROLE_MENU` |
| 1차 CMS 권한 단위 | `CMS:R`, `CMS:W` |
| CMS 사용자 관리 | 별도 사용자/역할 테이블 생성하지 않음 |

## 구현 내용

### 1. CMS 메뉴 등록

`FWK_MENU`에 CMS 진입 메뉴를 추가한다. URL은 `/cms/...` prefix를 사용한다. 기존 사이드바/메뉴 렌더링 로직이 `FWK_MENU.MENU_URL`을 사용하므로, 메뉴 권한이 있는 사용자에게 CMS 진입 메뉴가 노출되어야 한다.

예시:

| 메뉴 | MENU_ID 예시 | MENU_URL 예시 |
| --- | --- | --- |
| CMS 작업자 대시보드 | `cms_system` | `/cms/system` |
| CMS 관리자 승인 관리 | `cms_approve` | `/cms/approve` |
| CMS 편집 | `cms_edit` | `/cms/edit` |
| CMS 파일 관리 | `cms_files` | `/cms/files` |

1차 구현에서 메뉴를 세분화하지 않을 경우 `cms_manage` 하나로 시작해도 된다. 다만 작업자 기본 진입은 `/cms/system`, 관리자 기본 진입은 `/cms/approve`로 둔다. 이슈 기준 권한은 `CMS:R`, `CMS:W`로 통일한다.

### 1-1. CMS 진입 버튼 추가

메뉴 외에 기존 관리자 화면의 버튼에서 CMS로 이동해야 하는 진입점이 있다면 버튼을 추가한다.

예시 위치:

| 화면 | 버튼 예시 | 이동 URL |
| --- | --- | --- |
| 홈/대시보드 | CMS 작업 화면 바로가기 | `/cms/system` |
| 홈/대시보드 | CMS 승인 관리 바로가기 | `/cms/approve` |
| 메뉴/권한 관리 화면 | CMS 관리 열기 | `/cms/approve` |
| 콘텐츠/컴포넌트 관련 화면이 있는 경우 | CMS 편집 열기 | `/cms/edit` |

버튼 이동은 새 인증을 만들지 않고 `window.location.href = '/cms/...'` 또는 일반 링크(`<a href="/cms/...">`)로 처리한다. 같은 도메인 구조에서는 브라우저가 기존 `JSESSIONID`를 함께 전달한다.

버튼 노출 기준은 다음처럼 잡는다.

- 작업자 역할은 `/cms/system` 진입 버튼 노출
- 관리자 역할은 `/cms/approve` 진입 버튼 노출
- `CMS:R` 또는 `CMS:W` 권한이 있으면 CMS 조회/진입 버튼 노출
- `CMS:W` 권한이 있으면 CMS 편집/관리 버튼 노출
- 권한이 없으면 버튼 미노출 또는 disabled 처리

### 2. `menu-resource-permissions.yml`에 CMS 권한 추가

수정 파일:

- `src/main/resources/menu-resource-permissions.yml`

예시:

```yaml
menu-resource:
  permissions:
    cms_manage:
      R: CMS:R
      W: CMS:W
```

메뉴를 세분화한다면 여러 `MENU_ID`가 같은 `CMS:R`, `CMS:W` 권한으로 매핑되어도 된다.

```yaml
menu-resource:
  permissions:
    cms_edit:
      R: CMS:R
      W: CMS:W
    cms_system:
      R: CMS:R
      W: CMS:W
    cms_approve:
      R: CMS:R
      W: CMS:W
    cms_files:
      R: CMS:R
      W: CMS:W
```

### 3. `FWK_ROLE_MENU`에 CMS 권한 부여

작업자/관리자 역할에 CMS 메뉴 권한을 부여한다.

예시 정책:

| 역할 | 권한 |
| --- | --- |
| 작업자 | `CMS:R`, 기본 진입 URL `/cms/system` |
| 관리자 | `CMS:W`, 기본 진입 URL `/cms/approve` |

실제 DB에는 `FWK_ROLE_MENU.AUTH_CODE`가 `R`/`W`로 저장되고, `menu-resource-permissions.yml`을 통해 `CMS:R`/`CMS:W` authority로 변환된다.

### 4. 현재 사용자 조회 API 추가

CMS가 `spider-admin` 세션 기준으로 현재 사용자와 권한을 확인할 수 있도록 API를 추가한다.

권장 URL:

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

구현 방향:

- `@AuthenticationPrincipal CustomUserDetails userDetails` 또는 `SecurityUtil.getCurrentUser()`를 사용한다.
- `userId`, `displayName`, `roleId`, `authorities`를 내려준다.
- 인증되지 않은 요청은 기존 `CustomAuthenticationEntryPoint` 흐름대로 401을 반환한다.

### 5. `/cms/**` 접근 및 프록시 정책 확인

`spider-admin`이 실제 운영에서 `/cms/**` 요청을 Next 서버로 전달할지, 별도 reverse proxy가 담당할지 정책을 확정한다.

같은 도메인 구조 예시:

```txt
/login       -> spider-admin
/api/**      -> spider-admin
/cms/**    -> cms-1-innova-next
/cms/api/** -> cms-1-innova-next
```

확인해야 할 점:

- `/api/**`는 계속 `spider-admin`이 소유한다.
- `/cms/**`는 인증된 사용자만 접근하도록 한다.
- `/cms/**`를 Spring Security에서 막지 않도록 정책을 확인한다.
- 실제 프록시는 Spring에서 처리할지, Nginx/Apache/Ingress 같은 앞단에서 처리할지 결정한다.

## 수정 예정 파일

| 파일/대상 | 수정 내용 |
| --- | --- |
| `src/main/resources/menu-resource-permissions.yml` | CMS 메뉴 권한 `CMS:R`, `CMS:W` 매핑 추가 |
| `src/main/java/com/example/admin_demo/global/auth/controller/AuthController.java` | `GET /api/auth/me` 추가 |
| `src/main/java/com/example/admin_demo/global/security/SecurityConfig.java` | `/cms/**` 인증/접근 정책 확인 및 필요 시 추가 |
| `src/main/java/com/example/admin_demo/global/security/CustomUserDetails.java` | 필요 시 CMS 응답에 필요한 사용자 정보 접근자 확인 |
| `src/main/java/com/example/admin_demo/global/security/converter/AuthorityConverter.java` | 기존 변환 흐름으로 `CMS:R/W`가 내려오는지 확인 |
| `src/main/resources/templates/home.html` | 필요 시 CMS 바로가기 버튼 또는 링크 추가 |
| `src/main/resources/templates/fragments/sidebar.html` | CMS 메뉴 노출/이동이 기존 메뉴 렌더링으로 처리되는지 확인, 필요 시 보정 |
| 관련 Thymeleaf 페이지 템플릿 | CMS 진입 버튼이 필요한 화면에 `/cms/...` 링크 추가 |
| `FWK_MENU` 데이터 | CMS 메뉴 URL `/cms/...` 등록 |
| `FWK_ROLE_MENU` 데이터 | 작업자/관리자 역할에 CMS 메뉴 권한 부여 |

## 구현 예시

### `GET /api/auth/me`

```java
@GetMapping("/me")
public ResponseEntity<ApiResponse<CurrentUserResponse>> me(
        @AuthenticationPrincipal CustomUserDetails userDetails) {
    Set<String> authorities = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toCollection(TreeSet::new));

    CurrentUserResponse response = CurrentUserResponse.builder()
            .userId(userDetails.getUserId())
            .userName(userDetails.getDisplayName())
            .roleId(userDetails.getRoleId())
            .authorities(authorities)
            .build();

    return ResponseEntity.ok(ApiResponse.success(response));
}
```

DTO 예시:

```java
@Getter
@Builder
public class CurrentUserResponse {
    private String userId;
    private String userName;
    private String roleId;
    private Set<String> authorities;
}
```

## 수용 기준

- [ ] `FWK_MENU`에 CMS 진입 메뉴가 등록되어 있다.
- [ ] `spider-admin` 사이드바 또는 메뉴에서 CMS 화면(`/cms/**`)으로 이동할 수 있다.
- [ ] 필요한 기존 관리자 화면에 CMS 진입 버튼이 추가되어 있다.
- [ ] 작업자 역할은 `/cms/system`으로 진입할 수 있다.
- [ ] 관리자 역할은 `/cms/approve`로 진입할 수 있다.
- [ ] CMS 진입 메뉴/버튼은 `CMS:R` 또는 `CMS:W` 권한이 있는 사용자에게만 노출된다.
- [ ] `menu-resource-permissions.yml`에 `CMS:R`, `CMS:W` 매핑이 추가되어 있다.
- [ ] `FWK_ROLE_MENU`에서 작업자/관리자 역할에 CMS 메뉴 권한을 부여할 수 있다.
- [ ] `GET /api/auth/me`가 로그인 사용자 기준 `userId`, `userName`, `roleId`, `authorities`를 반환한다.
- [ ] `GET /api/auth/me` 응답에 `CMS:R` 또는 `CMS:W`가 포함된다.
- [ ] 인증되지 않은 사용자가 `GET /api/auth/me`를 호출하면 401이 반환된다.
- [ ] `/api/**`는 `spider-admin`이 계속 처리한다.
- [ ] `/cms/**`는 CMS로 라우팅되며, `spider-admin` 로그인 세션을 유지한다.
- [ ] CMS가 별도 사용자/역할 DB 없이 `FWK_USER`, `FWK_ROLE`, `FWK_ROLE_MENU`를 기준으로 동작할 수 있다.

## 참고

- `cms-1-innova-next` 쪽 대응 이슈: `spider-admin 로그인 및 역할/권한 연동`
- CMS는 현재 `DEMO_USERS`, `cms-token`, `cms-user` 기반 임시 인증을 사용 중이며, 연동 후 운영 권한 판단에서 제거할 예정이다.
- CMS DB에는 사용자/역할 테이블이 없고, `SPW_CMS_PAGE`와 `SPW_CMS_COMPONENT`에 작성자/수정자/승인자 ID와 이름만 저장한다.

