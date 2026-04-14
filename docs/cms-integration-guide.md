# CMS Integration Guide

## Goal

`spider-admin` remains the main admin, login, and permission system. `cms-1-innova-next` runs as the CMS extension under `/cms/**`.

```text
/login        -> spider-admin
/api/**       -> spider-admin
/cms        -> spider-admin redirects to the default CMS page
/cms/**     -> cms-1-innova-next
/cms/api/** -> cms-1-innova-next
```

CMS must not create separate user, role, or permission tables. It should read the current user and permissions from `GET /api/auth/me`.

## Implementation Plan Checklist

Use this section as the working checklist. Complete the items in order.

### 1. Prepare spider-admin

- [ ] Confirm `AUTHORITY_SOURCE` remains `user-menu` for the existing admin permission model.
- [ ] Add CMS menu rows to `FWK_MENU`.
- [ ] Add CMS role defaults to `FWK_ROLE_MENU`.
- [ ] Apply CMS role defaults to actual users so `FWK_USER_MENU` contains login-time CMS permissions.
- [ ] Confirm `menu-resource-permissions.yml` maps CMS menu IDs to `CMS:R` and `CMS:W`.
- [ ] Confirm `GET /api/auth/me` returns the logged-in user and authorities.
- [ ] Confirm `/cms` and `/cms/` redirect by current role/authority.

Expected CMS menu IDs:

```text
v3_cms_manage
v3_cms_system
v3_cms_approve
v3_cms_edit
v3_cms_files
```

Expected default permissions:

```text
Admin role:
v3_cms_manage   W
v3_cms_system   W
v3_cms_approve  W
v3_cms_edit     W
v3_cms_files    W

Writer/operator role:
v3_cms_manage   R
v3_cms_system   R
```

Expected runtime authorities:

```text
Writer/operator user -> CMS:R
Admin user -> CMS:R, CMS:W
```

### 2. Prepare cms-1-innova-next

- [ ] Configure the Next app to run under `/cms`.
- [ ] Ensure direct routes render: `/cms/system`, `/cms/approve`, `/cms/edit`, `/cms/files`.
- [ ] Keep CMS Next APIs under `/cms/api/**`.
- [ ] Add API URL helpers so Java API calls and Next API calls do not collide.
- [ ] Replace current-user lookup with `GET /api/auth/me`.
- [ ] Remove `DEMO_USERS`, `cms-token`, and `cms-user` from production permission checks.
- [ ] Replace `role !== 'admin'` checks with `CMS:W` authority checks.
- [ ] Allow read pages and read APIs for `CMS:R` or `CMS:W`.
- [ ] Require `CMS:W` for create, update, delete, approve, reject, and deploy.
- [ ] Show an access-denied page or redirect when a user without CMS authority opens a CMS URL directly.

### 3. Run local integration

- [ ] Start `spider-admin` on `http://localhost:8080`.
- [ ] Start `cms-1-innova-next` on `http://localhost:3000`.
- [ ] Start the local Nginx proxy:

```bash
docker compose --profile admin-proxy up -d admin-proxy
```

- [ ] Open `http://localhost:9000/login`.
- [ ] Log in with a user that has CMS permissions in `FWK_USER_MENU`.
- [ ] Click the CMS menu in `spider-admin`.
- [ ] Confirm the URL moves to `/cms/system` for a writer/operator user.
- [ ] Confirm the URL moves to `/cms/approve` for an admin or `CMS:W` user.
- [ ] Confirm CMS calls `/api/auth/me` and receives `CMS:R` or `CMS:W`.

### 4. Do not do these

- [ ] Do not add CMS user, role, or permission tables.
- [ ] Do not use `DEMO_USERS`, `cms-token`, or `cms-user` for production authorization.
- [ ] Do not hard-code `http://localhost:8080/api/auth/me` in browser code. Use `/api/auth/me` through the proxy.
- [ ] Do not use `http://localhost:8080/login` for local CMS integration testing. Use `http://localhost:9000/login`.

## Permission Model

Keep the existing `spider-admin` permission model.

```text
FWK_ROLE_MENU = default permissions by role
FWK_USER_MENU = actual permissions used at login time
menu-resource-permissions.yml = maps menu R/W permissions to Spring Security authorities
```

The current default is:

```yaml
app:
  security:
    authority-source: ${AUTHORITY_SOURCE:user-menu}
```

This means login-time authorities are loaded from `FWK_USER_MENU` unless `AUTHORITY_SOURCE` is changed.

Use `FWK_ROLE_MENU` to manage CMS defaults by role, then apply those defaults to users through the existing admin permission flow so `FWK_USER_MENU` contains the actual CMS permissions.

CMS uses only these first-step authorities:

```text
CMS:R = CMS read/access
CMS:W = CMS write/approve/edit/manage
```

The existing converter adds the `R` mapping first and then adds the `W` mapping for write permissions. Therefore a user with `W` on a CMS menu receives both `CMS:R` and `CMS:W`.

## spider-admin Setup

Register CMS menus in `FWK_MENU`.

```text
v3_cms_manage   -> CMS parent menu
v3_cms_system   -> /cms/system
v3_cms_approve  -> /cms/approve
v3_cms_edit     -> /cms/edit
v3_cms_files    -> /cms/files
```

Register CMS mappings in `menu-resource-permissions.yml`.

```yaml
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

Manage role defaults in `FWK_ROLE_MENU`.

```text
Admin role:
v3_cms_manage   W
v3_cms_system   W
v3_cms_approve  W
v3_cms_edit     W
v3_cms_files    W

Writer/operator role:
v3_cms_manage   R
v3_cms_system   R
```

Make sure the actual login user also has CMS menu permissions in `FWK_USER_MENU`. Use the existing admin permission management flow to apply role defaults to users.

## CMS Setup

### 1. Run under `/cms`

Configure the Next app to run under `/cms`.

```ts
// next.config.ts
const nextConfig = {
  basePath: '/cms',
};

export default nextConfig;
```

If the CMS already serves `/cms/system` and `/cms/approve`, keep the existing setting.

### 2. Keep API paths separate

Use `/cms/api/**` for CMS Next APIs and `/api/**` for `spider-admin` APIs.

```text
Next API: /cms/api/builder/save
Java API: /api/auth/me
```

Recommended helpers:

```ts
export function nextApi(path: string) {
  return `/cms${path}`;
}

export function javaApi(path: string) {
  return path;
}
```

Example:

```ts
fetch(nextApi('/api/builder/save'));
fetch(javaApi('/api/auth/me'), { credentials: 'include' });
```

### 3. Replace current-user lookup

Do not use `DEMO_USERS`, `cms-token`, or `cms-user` for production permission checks.

Use `spider-admin`:

```ts
const response = await fetch('/api/auth/me', {
  credentials: 'include',
});

if (response.status === 401) {
  throw new Error('UNAUTHENTICATED');
}

const body = await response.json();
const currentUser = body.data;
```

If a Next API route or server component calls `spider-admin`, forward the incoming `Cookie` header.

```ts
const cookie = request.headers.get('cookie') ?? '';

const response = await fetch(`${process.env.SPIDER_ADMIN_BASE_URL}/api/auth/me`, {
  headers: { cookie },
});
```

For local proxy testing, `SPIDER_ADMIN_BASE_URL` can be `http://localhost:9000`.

### 4. Replace role checks with authority checks

Remove production checks such as `role !== 'admin'`.

```ts
function hasAuthority(user: CurrentUser, authority: string) {
  return user.authorities.includes(authority);
}

function canReadCms(user: CurrentUser) {
  return hasAuthority(user, 'CMS:R') || hasAuthority(user, 'CMS:W');
}

function canWriteCms(user: CurrentUser) {
  return hasAuthority(user, 'CMS:W');
}
```

Read routes and pages require `CMS:R` or `CMS:W`.

```ts
if (!canReadCms(user)) {
  return errorResponse('권한이 없습니다.', 403);
}
```

Create, update, delete, approve, reject, and deploy actions require `CMS:W`.

```ts
if (!canWriteCms(user)) {
  return errorResponse('권한이 없습니다.', 403);
}
```

UI buttons can be hidden or disabled with the same authority checks. Final enforcement must still happen in the Next API route or Java API.

### 5. Route handling

`spider-admin` handles `/cms` and `/cms/` redirect:

```text
Admin or CMS:W -> /cms/approve
Others -> /cms/system
```

CMS must render these direct entry routes:

```text
/cms/system
/cms/approve
/cms/edit
/cms/files
```

If a user without CMS permission opens a CMS URL directly, show an access-denied page or redirect to the admin home. Do not render a blank page.

## Local Integration Test

Run these three processes:

```text
spider-admin: http://localhost:8080
cms-1-innova-next: http://localhost:3000
admin-proxy: http://localhost:9000
```

Start the proxy from this repository:

```bash
docker compose --profile admin-proxy up -d admin-proxy
```

Use this URL in the browser:

```text
http://localhost:9000/login
```

Do not use `http://localhost:8080/login` for this integration check because `/cms/**` would bypass the proxy.

## Acceptance Checks

- `GET /api/auth/me` returns the logged-in user and `CMS:R` or `CMS:W`.
- Admin users go from `/cms` to `/cms/approve`.
- Writer/operator users go from `/cms` to `/cms/system`.
- CMS menu clicks navigate to `/cms/**`, not to an admin internal tab fragment.
- `CMS:R` users can read but cannot create, update, delete, approve, reject, or deploy.
- `CMS:W` users can use write, approve, edit, manage, and deploy actions.
- Production permission checks do not use `DEMO_USERS`, `cms-token`, or `cms-user`.

