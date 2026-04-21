// src/app/files/page.tsx
// 승인 이미지 브라우저 페이지 — 에디터에서 팝업으로 오픈되어 이미지 선택에 사용됨
import { redirect } from 'next/navigation';

import FileBrowser from '@/components/files/FileBrowser';
import { nextApi } from '@/lib/api-url';
import { canReadCms, getCurrentUser } from '@/lib/current-user';

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
            }}
        />
    );
}
