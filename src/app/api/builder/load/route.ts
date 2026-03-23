// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPageById, getLatestHistory } from '@/db/repository/page.repository';

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

// DB에서 페이지 로드
async function loadPage(bank: string): Promise<{ html: string; updated: string | null }> {
    const page = await getPageById(bank);
    if (!page) {
        return { html: '', updated: null };
    }

    // 최신 이력에서 RENDERED_HTML 조회, 없으면 PAGE_DESC 폴백
    const history = await getLatestHistory(bank);
    const html = history?.RENDERED_HTML ?? page.PAGE_DESC ?? '';
    const updated = page.LAST_MODIFIED_DTIME
        ? new Date(page.LAST_MODIFIED_DTIME).toISOString()
        : null;

    return { html, updated };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        const { html, updated } = await loadPage(bank);

        return NextResponse.json({ ok: true, html, updated });
    } catch (error) {
        console.error('페이지 로드 실패:', error);
        return NextResponse.json({ error: 'Failed to load page.' }, { status: 500 });
    }
}
