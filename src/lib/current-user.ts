import { fetchJavaAdminApi } from './java-admin-api';

export interface CurrentUser {
    userId: string;
    userName: string;
    roleId: string;
    authorities: string[];
}

interface SpiderAdminCurrentUser {
    userId: string;
    userName: string;
    roleId: string;
    authorities?: string[];
}

const GUEST_USER: CurrentUser = {
    userId: 'guest',
    userName: 'Guest',
    roleId: 'guest',
    authorities: [],
};

export class UnauthorizedError extends Error {
    constructor(message = 'Authentication is required.') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

/** 인증 우회 모드 기본 사용자 (AUTH_BYPASS=true 시 사용) */
const BYPASS_USER: CurrentUser = {
    userId: 'dev',
    userName: '개발자',
    roleId: 'cms_admin',
    authorities: ['CMS:R', 'CMS:W'],
};

export async function getCurrentUser(): Promise<CurrentUser> {
    // 인증 우회 모드 — admin 미배포 환경 테스트용
    if (process.env.AUTH_BYPASS === 'true') {
        return BYPASS_USER;
    }

    try {
        const user = await fetchJavaAdminApi<SpiderAdminCurrentUser>('/api/auth/me');
        return {
            userId: user.userId,
            userName: user.userName,
            roleId: user.roleId,
            authorities: user.authorities ?? [],
        };
    } catch {
        return GUEST_USER;
    }
}

export function hasAuthority(user: Pick<CurrentUser, 'authorities'>, authority: 'CMS:R' | 'CMS:W'): boolean {
    return user.authorities.includes(authority);
}

export function canReadCms(user: Pick<CurrentUser, 'authorities'>): boolean {
    return hasAuthority(user, 'CMS:R') || hasAuthority(user, 'CMS:W');
}

export function canWriteCms(user: Pick<CurrentUser, 'authorities'>): boolean {
    return hasAuthority(user, 'CMS:W');
}

export const CMS_ROLE = {
    ADMIN: 'cms_admin',
    USER: 'cms_user',
} as const;

export function canAdminScreen(user: Pick<CurrentUser, 'roleId'>): boolean {
    return user.roleId === CMS_ROLE.ADMIN;
}

export function getDefaultCmsPath(user: Pick<CurrentUser, 'roleId'>): '/approve' | '/dashboard' {
    return canAdminScreen(user) ? '/approve' : '/dashboard';
}

export async function requireCmsWrite(): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!canWriteCms(user)) {
        throw new UnauthorizedError('Permission denied.');
    }
    return user;
}
