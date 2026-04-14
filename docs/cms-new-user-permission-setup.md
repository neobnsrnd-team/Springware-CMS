# CMS 신규 사용자 권한 설정 가이드

## 개요

`cms-1-innova-next`는 별도 사용자/역할 테이블을 만들지 않고 `spider-admin`의 로그인 세션과 권한을 사용한다.

신규 사용자가 CMS에 접근하려면 `spider-admin` DB에 사용자, 역할, 메뉴 권한이 맞게 설정되어 있어야 한다.

현재 기본 권장 흐름은 다음과 같다.

```txt
FWK_USER
  -> 사용자 계정과 ROLE_ID 확인

FWK_USER_MENU
  -> 실제 로그인 시점에 부여되는 메뉴 권한
  -> 현재 기본 AUTHORITY_SOURCE=user-menu 기준

menu-resource-permissions.yml
  -> MENU_ID + R/W를 CMS:R / CMS:W로 변환

CMS
  -> /api/auth/me 응답의 authorities 기준으로 기능 권한 판단
```

## 공통 설정

### 1. 사용자 생성

신규 사용자는 `FWK_USER`에 있어야 한다. 운영에서는 가능하면 `spider-admin` 사용자 관리 화면에서 생성한다.

필수 확인값:

| 컬럼 | 설명 |
| --- | --- |
| `USER_ID` | 로그인 ID. 대소문자를 정확히 맞춘다. 예: `cmsUser01`, `cmsAdmin01` |
| `PASSWD` | BCrypt 해시 비밀번호 |
| `PASSWORD` | 평문 표시용 컬럼이 있다면 운영 정책에 맞게 관리 |
| `ROLE_ID` | `cms_user` 또는 `cms_admin` |
| `USER_STATE_CODE` | 로그인 가능한 정상 상태 코드 |

주의:

- `USER_ID`는 대소문자를 구분해서 권한 테이블에도 동일하게 넣는다.
- `cmsUser01`과 `cmsuser01`은 다른 값으로 취급될 수 있다.
- `PASSWD`는 Spring Security `BCryptPasswordEncoder`가 검증하는 값이다.

### 2. CMS 메뉴 확인

`FWK_MENU`에 아래 메뉴가 있어야 한다.

| MENU_ID | MENU_URL | 용도 |
| --- | --- | --- |
| `v3_cms_manage` | `NULL` | CMS 상위 메뉴 |
| `v3_cms_system` | `/cms/system` | 작업자 대시보드 |
| `v3_cms_approve` | `/cms/approve` | 관리자 승인 관리 |
| `v3_cms_edit` | `/cms/edit` | CMS 편집 |
| `v3_cms_files` | `/cms/files` | CMS 파일 관리 |

확인 SQL:

```sql
SELECT MENU_ID, PRIOR_MENU_ID, SORT_ORDER, MENU_NAME, MENU_URL, DISPLAY_YN, USE_YN
FROM FWK_MENU
WHERE MENU_ID LIKE 'v3_cms_%'
ORDER BY PRIOR_MENU_ID NULLS FIRST, SORT_ORDER;
```

### 3. yml 권한 매핑 확인

`spider-admin`의 `menu-resource-permissions.yml`에 아래 매핑이 있어야 한다.

```yaml
menu-resource:
  permissions:
    v3_cms_manage:
      R: CMS:R
      W: CMS:W
    v3_cms_system:
      R: CMS:R
      W: CMS:W
    v3_cms_approve:
      R: CMS:R
      W: CMS:W
    v3_cms_edit:
      R: CMS:R
      W: CMS:W
    v3_cms_files:
      R: CMS:R
      W: CMS:W
```

`W` 권한은 코드상 `R` 권한도 함께 포함된다. 즉 `v3_cms_approve + W`는 최종적으로 `CMS:R`, `CMS:W`를 만들 수 있다.

### 4. 권한 소스 확인

현재 `spider-admin` 기본값은 다음과 같다.

```yaml
app:
  security:
    authority-source: ${AUTHORITY_SOURCE:user-menu}
```

따라서 기본 설정에서는 실제 로그인 권한이 `FWK_USER_MENU`에서 나온다.

| 설정 | 실제 로그인 권한 기준 |
| --- | --- |
| `AUTHORITY_SOURCE=user-menu` | `FWK_USER_MENU` |
| `AUTHORITY_SOURCE=role-menu` | `FWK_ROLE_MENU` |

이 문서는 기본값인 `user-menu` 기준으로 신규 사용자에게 `FWK_USER_MENU` 권한을 부여하는 방법을 우선 설명한다.

## 상세: cms_user

`cms_user`는 CMS 작업자/일반 사용자 권한이다.

기대 동작:

| 항목 | 결과 |
| --- | --- |
| 기본 진입 | `/cms/system` |
| 조회 | 가능 |
| 생성/수정/삭제 | 불가 |
| 승인/반려/배포 | 불가 |
| 최종 authority | `CMS:R` |

### 사용자 역할

`FWK_USER.ROLE_ID`는 `cms_user`로 설정한다.

확인 SQL:

```sql
SELECT USER_ID, USER_NAME, ROLE_ID, USER_STATE_CODE
FROM FWK_USER
WHERE USER_ID = 'cmsUser01';
```

### 실제 사용자 메뉴 권한

`AUTHORITY_SOURCE=user-menu` 기준에서는 `FWK_USER_MENU`에 아래 권한이 필요하다.

```sql
MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsUser01' USER_ID, 'v3_cms_manage' MENU_ID, 'R' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsUser01' USER_ID, 'v3_cms_system' MENU_ID, 'R' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

COMMIT;
```

### 확인

```sql
SELECT USER_ID, MENU_ID, AUTH_CODE
FROM FWK_USER_MENU
WHERE USER_ID = 'cmsUser01'
  AND MENU_ID LIKE 'v3_cms_%'
ORDER BY MENU_ID;
```

로그인 후 기대값:

```txt
GET /api/auth/me
-> authorities에 CMS:R 포함
-> CMS:W 미포함

/cms
-> /cms/system

/cms/approve
-> 권한 없음
```

## 상세: cms_admin

`cms_admin`은 CMS 관리자 권한이다.

기대 동작:

| 항목 | 결과 |
| --- | --- |
| 기본 진입 | `/cms/approve` |
| 조회 | 가능 |
| 생성/수정/삭제 | 가능 |
| 승인/반려/배포 | 가능 |
| 최종 authority | `CMS:R`, `CMS:W` |

### 사용자 역할

`FWK_USER.ROLE_ID`는 `cms_admin`으로 설정한다.

확인 SQL:

```sql
SELECT USER_ID, USER_NAME, ROLE_ID, USER_STATE_CODE
FROM FWK_USER
WHERE USER_ID = 'cmsAdmin01';
```

### 실제 사용자 메뉴 권한

`AUTHORITY_SOURCE=user-menu` 기준에서는 `FWK_USER_MENU`에 아래 권한이 필요하다.

```sql
MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsAdmin01' USER_ID, 'v3_cms_manage' MENU_ID, 'W' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsAdmin01' USER_ID, 'v3_cms_system' MENU_ID, 'W' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsAdmin01' USER_ID, 'v3_cms_approve' MENU_ID, 'W' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsAdmin01' USER_ID, 'v3_cms_edit' MENU_ID, 'W' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

MERGE INTO FWK_USER_MENU t
USING (SELECT 'cmsAdmin01' USER_ID, 'v3_cms_files' MENU_ID, 'W' AUTH_CODE FROM DUAL) s
ON (t.USER_ID = s.USER_ID AND t.MENU_ID = s.MENU_ID)
WHEN MATCHED THEN UPDATE SET
    t.AUTH_CODE = s.AUTH_CODE,
    t.LAST_UPDATE_DTIME = TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'),
    t.LAST_UPDATE_USER_ID = 'system'
WHEN NOT MATCHED THEN INSERT
    (USER_ID, MENU_ID, AUTH_CODE, LAST_UPDATE_DTIME, LAST_UPDATE_USER_ID)
VALUES
    (s.USER_ID, s.MENU_ID, s.AUTH_CODE, TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'), 'system');

COMMIT;
```

### 확인

```sql
SELECT USER_ID, MENU_ID, AUTH_CODE
FROM FWK_USER_MENU
WHERE USER_ID = 'cmsAdmin01'
  AND MENU_ID LIKE 'v3_cms_%'
ORDER BY MENU_ID;
```

로그인 후 기대값:

```txt
GET /api/auth/me
-> authorities에 CMS:R, CMS:W 포함

/cms
-> /cms/approve

/cms/system
-> 접근 가능

/cms/approve
-> 접근 가능

생성/수정/삭제/승인/반려/배포
-> 가능
```

## role-menu 모드로 운영하는 경우

`AUTHORITY_SOURCE=role-menu`로 운영한다면 신규 사용자마다 `FWK_USER_MENU`를 넣지 않아도 된다.

이 경우 필요한 것은:

```txt
FWK_USER.ROLE_ID = cms_user 또는 cms_admin
FWK_ROLE_MENU에 cms_user / cms_admin 권한 등록
```

권한 예시:

```sql
SELECT ROLE_ID, MENU_ID, AUTH_CODE
FROM FWK_ROLE_MENU
WHERE ROLE_ID IN ('cms_user', 'cms_admin')
  AND MENU_ID LIKE 'v3_cms_%'
ORDER BY ROLE_ID, MENU_ID;
```

기대값:

```txt
cms_user
  v3_cms_manage  R
  v3_cms_system  R

cms_admin
  v3_cms_manage  W
  v3_cms_system  W
  v3_cms_approve W
  v3_cms_edit    W
  v3_cms_files   W
```

## 최종 테스트

반드시 같은 origin 프록시에서 테스트한다.

```txt
http://localhost:9000/login
```

`cmsUser01 / test1234!`:

```txt
/api/auth/me -> CMS:R
/cms -> /cms/system
/cms/approve -> 권한 없음
쓰기 API -> 403
```

`cmsAdmin01 / test1234!`:

```txt
/api/auth/me -> CMS:R, CMS:W
/cms -> /cms/approve
/cms/system -> 접근 가능
/cms/approve -> 접근 가능
쓰기 API -> 성공
```

