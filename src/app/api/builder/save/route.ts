// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { isDbEnabled } from '@/db/connection';
import { updatePage, createPage, getPageById } from '@/db/repository/page.repository';

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

// DB 기반 저장
async function saveToDb(bank: string, html: string): Promise<void> {
    const existing = await getPageById(bank);

    if (existing) {
        await updatePage({
            pageId: bank,
            pageDesc: html,
            renderedHtml: html,
            lastModifierId: 'system',
            lastModifierName: '시스템',
        });
    } else {
        await createPage({
            pageId: bank,
            pageName: bank,
            createUserId: 'system',
            createUserName: '시스템',
            pageDesc: html,
            renderedHtml: html,
        });
    }
}

// 파일 기반 저장 (폴백)
async function saveToFile(bank: string, html: string): Promise<void> {
    await writeFile(
        `data/${bank}.json`,
        JSON.stringify({
            content: html,
            updated: new Date().toISOString(),
        }),
        'utf-8',
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html } = body;
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        if (html === undefined || html === null) {
            return NextResponse.json({ error: 'Missing html content' }, { status: 400 });
        }

        if (isDbEnabled()) {
            await saveToDb(bank, html);
        } else {
            await saveToFile(bank, html);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Failed to save page:', error);
        return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
    }
}
