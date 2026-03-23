// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPageById } from '@/db/repository/page.repository';

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

// DB에서 페이지 로드 — PAGE.PAGE_DESC에서 직접 읽기
// HISTORY는 승인 이력 조회/롤백 전용이므로 에디터 로드에 사용하지 않음
async function loadPage(bank: string): Promise<{ html: string; updated: string | null }> {
    const page = await getPageById(bank);
    if (!page) {
        return { html: '', updated: null };
    }

    const html = page.PAGE_DESC ?? '';
    const updated = page.LAST_MODIFIED_DTIME ? new Date(page.LAST_MODIFIED_DTIME).toISOString() : null;

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
        return NextResponse.json({ error: '페이지 로드에 실패했습니다.' }, { status: 500 });
    }
}
