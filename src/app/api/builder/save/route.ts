// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updatePage, createPage, getPageById } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';
import { writePageHtml } from '@/lib/page-file';

// 페이지 저장: 파일 먼저 쓰기 → 성공 시 DB에 FILE_PATH 기록
// PAGE_DESC에 HTML 저장하지 않음 (파일만 저장 정책)
async function savePage(bank: string, html: string, pageName?: string, viewMode?: string): Promise<void> {
    const { userId, userName } = getCurrentUser();

    // 1. 파일 먼저 저장 (실패 시 예외 → DB 호출 안 함)
    const filePath = await writePageHtml(bank, html);

    // 2. DB 업데이트 (FILE_PATH만 기록)
    const existing = await getPageById(bank);

    if (existing) {
        await updatePage({
            pageId: bank,
            pageName: pageName,
            viewMode: viewMode as 'mobile' | 'web' | 'responsive' | undefined,
            filePath,
            lastModifierId: userId,
            lastModifierName: userName,
        });
    } else {
        await createPage({
            pageId: bank,
            pageName: pageName ?? bank,
            viewMode: (viewMode as 'mobile' | 'web' | 'responsive') ?? 'mobile',
            filePath,
            createUserId: userId,
            createUserName: userName,
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html, pageName, viewMode } = body;
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        if (html === undefined || html === null) {
            return NextResponse.json({ error: 'HTML 콘텐츠가 없습니다.' }, { status: 400 });
        }

        await savePage(
            bank,
            html,
            typeof pageName === 'string' ? pageName : undefined,
            typeof viewMode === 'string' ? viewMode : undefined,
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('페이지 저장 실패:', error);
        return NextResponse.json({ error: '페이지 저장에 실패했습니다.' }, { status: 500 });
    }
}
