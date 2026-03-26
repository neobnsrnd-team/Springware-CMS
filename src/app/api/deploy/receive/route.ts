// src/app/api/deploy/receive/route.ts
// 데모 전용 수신 엔드포인트 — 실제 운영 환경에서는 별도 서버로 교체
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest } from 'next/server';

import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    try {
        const { pageId, html } = (await req.json()) as { pageId?: string; html?: string };

        if (!pageId || typeof pageId !== 'string') {
            return errorResponse('pageId가 필요합니다.', 400);
        }
        if (!html || typeof html !== 'string') {
            return errorResponse('html이 필요합니다.', 400);
        }

        // 경로 트래버설 방지
        if (pageId.includes('..') || pageId.includes('/') || pageId.includes('\\')) {
            return errorResponse('유효하지 않은 pageId입니다.', 400);
        }

        // public/deployed/ 폴더에 HTML 저장
        const deployDir = path.join(process.cwd(), 'public', 'deployed');
        await mkdir(deployDir, { recursive: true });

        const filePath = path.join(deployDir, `${pageId}.html`);
        await writeFile(filePath, html, 'utf8');

        return successResponse({ path: `/deployed/${pageId}.html` });
    } catch (err: unknown) {
        console.error('배포 수신 처리 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
