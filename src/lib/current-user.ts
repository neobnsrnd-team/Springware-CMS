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

export async function getCurrentUser(): Promise<CurrentUser> {
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
