// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { getPageById } from '@/db/repository/page.repository';
import { isValidBankId } from '@/lib/validators';
import { readPageHtml } from '@/lib/page-file';
import { contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';

// DB PAGE_HTML 우선 → FILE_PATH 폴백 → PAGE_DESC 폴백
async function loadPage(bank: string): Promise<{
    html: string;
    updated: string | null;
    fileNotFound?: boolean;
    pageName?: string;
    viewMode?: string;
}> {
    const page = await getPageById(bank);
    if (!page) {
        return { html: '', updated: null };
    }

    let html = '';
    let fileNotFound = false;

    // DB PAGE_HTML 우선 (getPageById의 SELECT *에 이미 포함)
    if (page.PAGE_HTML) {
        html = page.PAGE_HTML;
    } else if (page.FILE_PATH) {
        // FILE_PATH 폴백 (기존 데이터 호환)
        const content = await readPageHtml(page.FILE_PATH);
        if (content !== null) {
            html = content;
        } else {
            fileNotFound = true;
        }
    } else {
        // 마이그레이션 이전 데이터: PAGE_DESC 폴백
        html = page.PAGE_DESC ?? '';
    }

    const updated = page.LAST_MODIFIED_DTIME ? new Date(page.LAST_MODIFIED_DTIME).toISOString() : null;

    return {
        html,
        updated,
        fileNotFound,
        pageName: page.PAGE_NAME,
        viewMode: page.VIEW_MODE ?? 'mobile',
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        const { html, updated, fileNotFound, pageName, viewMode } = await loadPage(bank);

        return NextResponse.json({ ok: true, html, updated, fileNotFound, pageName, viewMode });
    } catch (err: unknown) {
        console.error('페이지 로드 실패:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
