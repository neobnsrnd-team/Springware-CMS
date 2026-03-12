// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from "fs/promises";

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html } = body;
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        if (html === undefined || html === null) {
            return NextResponse.json({ error: 'Missing html content' }, { status: 400 });
        }

        await writeFile(
            `data/${bank}.json`,
            JSON.stringify({
                content: html,
                updated: new Date().toISOString()
            }),
            'utf-8'
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Failed to save page:', error);
        return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
    }
}
