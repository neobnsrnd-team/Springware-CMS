// src/app/view/page.tsx

import { Metadata } from 'next';
import { getPageById } from '@/db/repository/page.repository';
import { readPageHtml } from '@/lib/page-file';
import ViewClient from '@/components/view/ViewClient';

// Override default metadata from layout.tsx for this page
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'View',
        description: '',
        icons: {
            icon: '/favicon.ico',
        },
    };
}

// FILE_PATH 기반 파일 로드. 마이그레이션 이전 데이터는 PAGE_DESC 폴백.
async function loadPage(bank: string): Promise<string> {
    const page = await getPageById(bank);
    if (!page) return '';

    if (page.FILE_PATH) {
        const content = await readPageHtml(page.FILE_PATH);
        if (content !== null) return content;
        // 파일 경로는 있는데 로컬에 파일 없음 → 안내 메시지
        return (
            '<div style="padding:40px;text-align:center;color:#6b7280;">' +
            '<p style="font-size:18px;font-weight:600;">페이지 파일이 로컬에 존재하지 않습니다.</p>' +
            '<p style="margin-top:8px;">git pull 후 다시 시도하거나, 에디터에서 저장해 주세요.</p>' +
            '</div>'
        );
    }
    // 마이그레이션 이전 데이터: PAGE_DESC 폴백
    return page.PAGE_DESC ?? '';
}

export default async function View({ searchParams }: { searchParams: Promise<{ bank?: string }> }) {
    const params = await searchParams;
    // 경로 순회 방지: 영문·숫자·하이픈만 허용 (커스텀 탭 ID 포함)
    const rawBank = params.bank ?? '';
    const bank = /^[a-z0-9-]+$/i.test(rawBank) ? rawBank : 'ibk';

    let html = '';
    try {
        html = await loadPage(bank);
    } catch (error) {
        console.error('페이지 콘텐츠 로드 실패:', error);
        html = '<p style="color:red;">저장된 콘텐츠가 없습니다. 에디터에서 저장 후 다시 시도하세요.</p>';
    }

    return <ViewClient html={html} />;
}
