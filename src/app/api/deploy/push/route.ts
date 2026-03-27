// src/app/api/deploy/push/route.ts
import { createHash } from 'crypto';
import { readFile, access } from 'fs/promises';
import path from 'path';

import { NextRequest } from 'next/server';

import { getConnection } from '@/db/connection';
import { PAGE_SELECT_BY_ID } from '@/db/queries/page.sql';
import { upsertFileSend, getServerList } from '@/db/repository/file-send.repository';
import { updatePageDeploy } from '@/db/repository/page.repository';
import type { CmsPage } from '@/db/types';
import { getCurrentUser } from '@/lib/current-user';
import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';
import oracledb from 'oracledb';

const OBJ = { outFormat: oracledb.OUT_FORMAT_OBJECT };

/** CRC32 대신 SHA-256 앞 16자리로 무결성 값 생성 */
function calcCrc(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 16);
}

/** 배포 대상 서버로 HTML + 트래커 JS 전송 */
async function sendToServer(serverUrl: string, pageId: string, html: string, trackerJs?: string | null): Promise<void> {
    const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, html, trackerJs }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '응답 없음');
        throw new Error(`서버 전송 실패 (${res.status}): ${text}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { pageId } = (await req.json()) as { pageId?: string };
        const { userId } = await getCurrentUser();

        if (!pageId || typeof pageId !== 'string') {
            return errorResponse('pageId가 필요합니다.', 400);
        }

        // 1. 페이지 조회 — APPROVED 상태 확인
        const conn = await getConnection();
        let page: CmsPage | null = null;
        try {
            const result = await conn.execute<CmsPage>(PAGE_SELECT_BY_ID, { pageId }, OBJ);
            page = result.rows?.[0] ?? null;
        } finally {
            await conn.close();
        }

        if (!page) {
            return errorResponse('페이지를 찾을 수 없습니다.', 404);
        }
        if (page.APPROVE_STATE !== 'APPROVED') {
            return errorResponse('승인된 페이지만 배포할 수 있습니다.', 400);
        }

        // 2. HTML 파일 읽기 — 경로 조작 방지 및 파일 존재 여부 선행 확인
        if (!page.FILE_PATH) {
            return errorResponse('배포할 HTML 파일 경로가 없습니다.', 400);
        }
        // FILE_PATH는 /uploads/pages/xxx.html 형태로 저장 — 앞 슬래시 제거 후 검증
        const normalizedFilePath = page.FILE_PATH.replace(/^\//, '');
        if (normalizedFilePath.includes('..') || path.isAbsolute(normalizedFilePath)) {
            return errorResponse('유효하지 않은 파일 경로입니다.', 400);
        }
        const absolutePath = path.join(process.cwd(), 'public', normalizedFilePath);
        try {
            await access(absolutePath);
        } catch {
            return errorResponse(
                '페이지 HTML 파일이 서버에 존재하지 않습니다. 에디터에서 저장 후 다시 시도해 주세요.',
                400,
            );
        }
        const rawHtml = await readFile(absolutePath, 'utf8');

        // 트래킹 스크립트 태그 주입 — 배포 HTML에 조회/클릭 추적 삽입
        const trackerTag = `<script src="/cms-tracker.js" data-page-id="${pageId}"></script>`;
        const html = rawHtml.includes('</body>')
            ? rawHtml.replace('</body>', `${trackerTag}\n</body>`)
            : `${rawHtml}\n${trackerTag}`;

        const crcValue = calcCrc(html);

        // 트래커 JS 파일 읽기 (운영 서버로 함께 Push)
        const trackerJsPath = path.join(process.cwd(), 'public', 'cms-tracker.js');
        let trackerJs: string | null = null;
        try {
            trackerJs = await readFile(trackerJsPath, 'utf8');
        } catch {
            console.warn('cms-tracker.js 파일을 찾을 수 없습니다. 트래커 없이 배포합니다.');
        }

        // 3. ALIVE_YN='Y' 서버 목록 조회
        const servers = await getServerList('Y');
        if (servers.length === 0) {
            return errorResponse('활성화된 배포 서버가 없습니다.', 400);
        }

        // 4. 최신 승인 버전 조회 (FILE_ID 생성용)
        const { getLatestHistory } = await import('@/db/repository/page.repository');
        const latestHistory = await getLatestHistory(pageId);
        const version = latestHistory?.VERSION ?? 1;
        const fileId = `${pageId}_v${version}.html`;

        // 5. 각 서버에 전송 + 이력 기록
        const results: { instanceId: string; success: boolean; error?: string }[] = [];

        for (const server of servers) {
            const serverUrl = `http://${server.INSTANCE_IP}:${server.INSTANCE_PORT}/api/deploy/receive`;
            try {
                await sendToServer(serverUrl, pageId, html, trackerJs);
                await upsertFileSend({
                    instanceId: server.INSTANCE_ID,
                    fileId,
                    fileSize: Buffer.byteLength(html, 'utf8'),
                    fileCrcValue: crcValue,
                    lastModifierId: userId,
                });
                results.push({ instanceId: server.INSTANCE_ID, success: true });
            } catch (err: unknown) {
                console.error(`서버 전송 실패 [${server.INSTANCE_ID}]:`, err);
                results.push({ instanceId: server.INSTANCE_ID, success: false, error: getErrorMessage(err) });
            }
        }

        // 6. 하나 이상 성공 시 페이지 노출 기간 갱신
        const successCount = results.filter((r) => r.success).length;
        if (successCount > 0) {
            await updatePageDeploy(pageId, crcValue, userId);
        }

        return successResponse({
            fileId,
            crcValue,
            successCount,
            failCount: results.length - successCount,
            results,
        });
    } catch (err: unknown) {
        console.error('배포 요청 처리 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
