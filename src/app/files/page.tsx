import { redirect } from 'next/navigation';

import AssetBrowser from '@/components/files/AssetBrowser';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

export const dynamic = 'force-dynamic';

export default async function FilesPage() {
    const currentUser = await getCurrentUser();
    if (!canReadCms(currentUser)) {
        redirect('/not-authorized');
    }

    return <AssetBrowser />;
}
