// src/app/files/page.tsx
import FileBrowser from '@/components/files/FileBrowser';
import { nextApi } from '@/lib/api-url';
import { canReadCms, canWriteCms, getCurrentUser } from '@/lib/current-user';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FilesPage() {
    const currentUser = await getCurrentUser();
    if (!canReadCms(currentUser)) {
        redirect('/not-authorized');
    }

    return (
        <FileBrowser
            apiEndpoints={{
                folders: nextApi('/api/manage/folders'),
                files: nextApi('/api/manage/files'),
                upload: nextApi('/api/manage/upload'),
                delete: nextApi('/api/manage/delete'),
                addFolder: nextApi('/api/manage/addfolder'),
            }}
            canWrite={canWriteCms(currentUser)}
        />
    );
}
