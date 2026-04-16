// GET /dev/admin — AUTH_BYPASS 관리자 우회 진입
// 쿠키에 관리자 역할 설정 후 /approve로 리다이렉트

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (process.env.AUTH_BYPASS !== 'true') {
        redirect('/not-authorized');
    }

    const cookieStore = await cookies();
    cookieStore.set('cms_bypass_role', 'cms_admin', { path: '/' });
    redirect('/approve');
}
