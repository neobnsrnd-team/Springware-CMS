// src/app/files/page.tsx
import FileBrowser from '@/components/files/FileBrowser';

export default function FilesPage() {
    return (
        <FileBrowser
            apiEndpoints={{
                folders: '/api/manage/folders',
                files: '/api/manage/files',
                upload: '/api/manage/upload',
                delete: '/api/manage/delete',
                addFolder: '/api/manage/addfolder',
            }}
        />
    );
}
