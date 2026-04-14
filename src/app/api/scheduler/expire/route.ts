// src/app/api/scheduler/expire/route.ts
// 만료 페이지 일괄 처리 API — 스케줄러(cron)에서 호출
// EXPIRED_DATE 경과 페이지를 감지하여 운영 서버에 만료 안내 페이지 배포 + DB IS_PUBLIC 업데이트

import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { getExpiredPages, expirePage, getLatestHistory } from '@/db/repository/page.repository';
import { getServerList, upsertFileSend } from '@/db/repository/file-send.repository';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { sendToServer } from '@/lib/deploy-utils';

const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET ?? '';
const EXPIRED_HTML_PATH = path.join(process.cwd(), 'public', 'system', 'page-expired.html');

/** 만료 안내 페이지를 활성 운영 서버 전체에 배포 */
async function deployExpiredPage(pageId: string): Promise<{ serverDeployed: number; serverFailed: number }> {
    const servers = await getServerList('Y');
    if (servers.length === 0) {
        return { serverDeployed: 0, serverFailed: 0 };
    }

    const expiredHtml = await fs.readFile(EXPIRED_HTML_PATH, 'utf8');
    const latestHistory = await getLatestHistory(pageId);
    const version = latestHistory?.VERSION ?? 1;
    // 만료 전용 fileId — 정상 배포 이력 덮어쓰기 방지
    const fileId = `${pageId}_v${version}_expired.html`;
    const fileSize = Buffer.byteLength(expiredHtml, 'utf8');

    // 전체 서버 병렬 전송
    const results = await Promise.all(
        servers.map(async (server) => {
            const serverUrl = `http://${server.INSTANCE_IP}:${server.INSTANCE_PORT}/api/deploy/receive`;
            try {
                await sendToServer(serverUrl, pageId, expiredHtml);
                await upsertFileSend({
                    instanceId: server.INSTANCE_ID,
                    fileId,
                    fileSize,
                    lastModifierId: 'scheduler',
                });
                return true;
            } catch (err: unknown) {
                console.warn(`[만료 스케줄러] 운영 서버 전송 실패 [${server.INSTANCE_ID}]:`, err);
                return false;
            }
        }),
    );

    const serverDeployed = results.filter(Boolean).length;
    const serverFailed = results.length - serverDeployed;

    return { serverDeployed, serverFailed };
}

export async function POST(req: NextRequest) {
    try {
        // 토큰 인증
        const token = req.headers.get('x-scheduler-token');
        if (!SCHEDULER_SECRET || token !== SCHEDULER_SECRET) {
            return errorResponse('인증 토큰이 유효하지 않습니다.', 401);
        }

        const pages = await getExpiredPages();
        if (pages.length === 0) {
            return successResponse({ processed: 0, failed: [] });
        }

        const failed: Array<{ pageId: string; error: string }> = [];
        let processed = 0;

        for (const page of pages) {
            try {
                // a. DB IS_PUBLIC = 'N' 업데이트 (원본 FILE_PATH 유지)
                await expirePage(page.PAGE_ID, page.FILE_PATH ?? '', 'scheduler');

                // b. 운영 서버에 만료 안내 페이지 배포
                await deployExpiredPage(page.PAGE_ID);

                processed++;
            } catch (err: unknown) {
                failed.push({ pageId: page.PAGE_ID, error: getErrorMessage(err) });
            }
        }

        return successResponse({ processed, failed });
    } catch (err: unknown) {
        console.error('만료 일괄 처리 오류:', err);
        return errorResponse(getErrorMessage(err));
    }
}
