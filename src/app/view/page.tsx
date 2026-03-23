// src/app/view/page.tsx

import { Metadata } from 'next';
import { getPageById, getLatestHistory } from '@/db/repository/page.repository';
import ViewClient from './ViewClient';

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

// DB에서 페이지 로드
async function loadPage(bank: string): Promise<string> {
    const page = await getPageById(bank);
    if (!page) return '';

    const history = await getLatestHistory(bank);
    return history?.RENDERED_HTML ?? page.PAGE_DESC ?? '';
}

export default async function View({
    searchParams,
}: {
    searchParams: Promise<{ bank?: string }>;
}) {
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

    return (
        <ViewClient html={html} />
    );
}
