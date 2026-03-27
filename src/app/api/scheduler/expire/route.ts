// src/app/api/scheduler/expire/route.ts
// 만료 페이지 일괄 처리 API — 스케줄러(cron)에서 호출
// EXPIRED_DATE 경과 페이지를 감지하여 백업·치환·상태 업데이트

import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { getExpiredPages, expirePage, getLatestHistory } from '@/db/repository/page.repository';
import { getServerList, upsertFileSend } from '@/db/repository/file-send.repository';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { sendToServer } from '@/lib/deploy-utils';

const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET ?? '';
const EXPIRED_HTML_PATH = path.join(process.cwd(), 'public', 'system', 'page-expired.html');
const BACKUP_DIR = path.join(process.cwd(), 'public', 'uploads', 'pages', 'backup');

/** 만료 안내 페이지를 활성 운영 서버 전체에 배포 */
async function deployExpiredPage(pageId: string): Promise<{ serverDeployed: number; serverFailed: number }> {
    const servers = await getServerList('Y');
    if (servers.length === 0) {
        return { serverDeployed: 0, serverFailed: 0 };
    }

    const expiredHtml = await fs.readFile(EXPIRED_HTML_PATH, 'utf8');
    const latestHistory = await getLatestHistory(pageId);
    const version = latestHistory?.VERSION ?? 1;
    const fileId = `${pageId}_v${version}.html`;

    let serverDeployed = 0;
    let serverFailed = 0;

    for (const server of servers) {
        const serverUrl = `http://${server.INSTANCE_IP}:${server.INSTANCE_PORT}/api/deploy/receive`;
        try {
            await sendToServer(serverUrl, pageId, expiredHtml);
            await upsertFileSend({
                instanceId: server.INSTANCE_ID,
                fileId,
                fileSize: Buffer.byteLength(expiredHtml, 'utf8'),
                lastModifierId: 'scheduler',
            });
            serverDeployed++;
        } catch (err: unknown) {
            console.warn(`[만료 스케줄러] 운영 서버 전송 실패 [${server.INSTANCE_ID}]:`, err);
            serverFailed++;
        }
    }

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

        // 백업 디렉토리 자동 생성
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        const failed: Array<{ pageId: string; error: string }> = [];
        let processed = 0;

        for (const page of pages) {
            try {
                const filePath = page.FILE_PATH;
                if (!filePath) {
                    // FILE_PATH 없는 페이지는 DB 상태 업데이트 + 운영 서버 배포
                    await expirePage(page.PAGE_ID, '', 'scheduler');
                    await deployExpiredPage(page.PAGE_ID);
                    processed++;
                    continue;
                }

                const originalPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
                const backupFileName = path.basename(filePath);
                const backupPath = path.join(BACKUP_DIR, backupFileName);
                const filePathBack = `/uploads/pages/backup/${backupFileName}`;

                // a. 원본 파일 → 백업 경로로 이동
                try {
                    await fs.rename(originalPath, backupPath);
                } catch (err: unknown) {
                    console.warn(`[만료 스케줄러] 원본 파일 이동 실패 (${originalPath}):`, err);
                }

                // b. 만료 안내 HTML → 원본 경로에 복사
                try {
                    await fs.copyFile(EXPIRED_HTML_PATH, originalPath);
                } catch (err: unknown) {
                    console.warn(`[만료 스케줄러] 만료 안내 파일 복사 실패 (${originalPath}):`, err);
                }

                // c. DB 업데이트
                await expirePage(page.PAGE_ID, filePathBack, 'scheduler');

                // d. 운영 서버에 만료 안내 페이지 배포
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
