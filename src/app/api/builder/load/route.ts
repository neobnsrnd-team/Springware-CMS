// src/app/api/builder/load/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fsPromises from 'fs/promises';
import { isDbEnabled } from '@/db/connection';
import { getPageById, getLatestHistory } from '@/db/repository/page.repository';

// bank id 검증: 영문 소문자·숫자·하이픈만 허용, 1~64자 (디렉토리 트래버설 방지)
function isValidBankId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
}

// DB 기반 로드
async function loadFromDb(bank: string): Promise<{ html: string; updated: string | null }> {
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

// 파일 기반 로드 (폴백)
async function loadFromFile(bank: string): Promise<{ html: string; updated: string | null }> {
    try {
        const fileContent = await fsPromises.readFile(`data/${bank}.json`, { encoding: 'utf8' });
        const pageData = JSON.parse(fileContent);
        return { html: pageData.content, updated: pageData.updated };
    } catch {
        // 파일 없으면 빈 콘텐츠 반환 (첫 방문)
        return { html: '', updated: null };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        const { html, updated } = isDbEnabled()
            ? await loadFromDb(bank)
            : await loadFromFile(bank);

        return NextResponse.json({ ok: true, html, updated });
    } catch (error) {
        console.error('Load error:', error);
        return NextResponse.json({ error: 'Failed to load page.' }, { status: 500 });
    }
}
