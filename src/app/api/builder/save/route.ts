// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updatePage, createPage, getPageById } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

// DB에 페이지 저장
async function savePage(bank: string, html: string, pageName?: string, viewMode?: string): Promise<void> {
    const { userId, userName } = getCurrentUser();
    const existing = await getPageById(bank);

    if (existing) {
        await updatePage({
            pageId: bank,
            pageName: pageName,
            pageDesc: html,
            renderedHtml: html,
            lastModifierId: userId,
            lastModifierName: userName,
        });
    } else {
        await createPage({
            pageId: bank,
            pageName: pageName ?? bank,
            createUserId: userId,
            createUserName: userName,
            pageDesc: html,
            renderedHtml: html,
            viewMode: viewMode ?? 'mobile',
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
