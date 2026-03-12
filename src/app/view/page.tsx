// src/app/view/page.tsx

import { Metadata } from "next";
import fs from 'fs/promises';
import ViewClient from './ViewClient';

// Override default metadata from layout.tsx for this page
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "View",
        description: "",
        icons: {
            icon: "/favicon.ico", 
        },
    };
}

const VALID_BANKS = ['ibk', 'hana', 'kb', 'shinhan', 'woori', 'nh'];

export default async function View({
    searchParams,
}: {
    searchParams: Promise<{ bank?: string }>;
}) {
    const params = await searchParams;
    const bank = VALID_BANKS.includes(params.bank ?? '') ? params.bank! : 'ibk';

    let html = '';
    try {
        const fileContent = await fs.readFile(`data/${bank}.json`, { encoding: 'utf8' });
        const pageData = JSON.parse(fileContent);
        html = pageData.content || '';
    } catch (error) {
        console.error('Failed to load page content:', error);
        html = '<p style="color:red;">저장된 콘텐츠가 없습니다. 에디터에서 저장 후 다시 시도하세요.</p>';
    }

    return (
        <ViewClient html={html} />
    );
}