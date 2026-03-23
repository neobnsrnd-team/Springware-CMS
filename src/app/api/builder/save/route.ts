// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updatePage, createPage, getPageById } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';

// DB에 페이지 저장 (W-7: renderedHtml 제거 — HISTORY는 승인 시에만 INSERT)
async function savePage(bank: string, html: string, pageName?: string, viewMode?: string): Promise<void> {
    const { userId, userName } = getCurrentUser();
    const existing = await getPageById(bank);

    if (existing) {
        await updatePage({
            pageId: bank,
            pageName: pageName,
            viewMode: viewMode as 'mobile' | 'web' | 'responsive' | undefined,
            pageDesc: html,
            lastModifierId: userId,
            lastModifierName: userName,
        });
    } else {
        await createPage({
            pageId: bank,
            pageName: pageName ?? bank,
            viewMode: (viewMode as 'mobile' | 'web' | 'responsive') ?? 'mobile',
            createUserId: userId,
            createUserName: userName,
            pageDesc: html,
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
