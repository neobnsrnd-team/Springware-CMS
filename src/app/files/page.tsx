import { redirect } from 'next/navigation';

import { adminPath } from '@/lib/cms-admin-boundary';

export const dynamic = 'force-dynamic';

export default function FilesPage() {
    redirect(adminPath('/cms-admin/approvals'));
}
