// GET /dev/user — AUTH_BYPASS 일반유저 복귀
// 쿠키에 일반유저 역할 설정 후 /dashboard로 리다이렉트

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (process.env.AUTH_BYPASS !== 'true') {
        redirect('/not-authorized');
    }

    const cookieStore = await cookies();
    cookieStore.set('cms_bypass_role', 'cms_user', { path: '/' });
    redirect('/dashboard');
}
