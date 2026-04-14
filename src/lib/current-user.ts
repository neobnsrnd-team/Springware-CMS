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
    } catch (error) {
        throw new UnauthorizedError(error instanceof Error ? error.message : undefined);
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

export function getDefaultCmsPath(user: Pick<CurrentUser, 'authorities'>): '/approve' | '/system' {
    return canWriteCms(user) ? '/approve' : '/system';
}

export async function requireCmsWrite(): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!canWriteCms(user)) {
        throw new UnauthorizedError('Permission denied.');
    }
    return user;
}
