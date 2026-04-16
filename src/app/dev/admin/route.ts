// GET /dev/admin — AUTH_BYPASS 관리자 우회 진입
// 쿠키에 관리자 역할 설정 후 /approve로 리다이렉트

import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const basePath = process.env.NEXT_PUBLIC_CMS_BASE_PATH || '/cms';

export async function GET(req: NextRequest) {
    if (process.env.AUTH_BYPASS !== 'true') {
        redirect('/not-authorized');
    }

    const response = NextResponse.redirect(new URL(`${basePath}/approve`, req.url));
    response.cookies.set('cms_bypass_role', 'cms_admin', { path: '/' });
    return response;
}
