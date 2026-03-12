// src/app/api/builder/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from "fs/promises";

const VALID_BANKS = ['ibk', 'hana', 'kb', 'shinhan', 'woori', 'nh'];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html } = body;
        const bank = VALID_BANKS.includes(body.bank) ? body.bank : 'ibk';

        if (!html) {
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
