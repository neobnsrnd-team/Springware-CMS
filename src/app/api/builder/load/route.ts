// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPageById } from '@/db/repository/page.repository';
import { isValidBankId } from '@/lib/validators';
import { readPageHtml } from '@/lib/page-file';

// FILE_PATH 기반 파일 로드. 마이그레이션 이전 데이터는 PAGE_DESC 폴백.
async function loadPage(bank: string): Promise<{ html: string; updated: string | null; fileNotFound?: boolean }> {
    const page = await getPageById(bank);
    if (!page) {
        return { html: '', updated: null };
    }

    let html = '';
    let fileNotFound = false;

    if (page.FILE_PATH) {
        const content = await readPageHtml(page.FILE_PATH);
        if (content !== null) {
            html = content;
        } else {
            fileNotFound = true; // 파일 경로는 있는데 로컬에 파일 없음
        }
    } else {
        // 마이그레이션 이전 데이터: PAGE_DESC 폴백
        html = page.PAGE_DESC ?? '';
    }

    const updated = page.LAST_MODIFIED_DTIME ? new Date(page.LAST_MODIFIED_DTIME).toISOString() : null;

    return { html, updated, fileNotFound };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        const { html, updated, fileNotFound } = await loadPage(bank);

        return NextResponse.json({ ok: true, html, updated, fileNotFound });
    } catch (error) {
        console.error('페이지 로드 실패:', error);
        return NextResponse.json({ error: '페이지 로드에 실패했습니다.' }, { status: 500 });
    }
}
