// src/app/api/builder/save/route.ts

import { NextRequest } from 'next/server';

import { updatePage, createPage, getPageById, resetApproveStateToWork } from '@/db/repository/page.repository';
import { getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';
import { writePageHtml, isPageExpired } from '@/lib/page-file';
import { commitAndPushPage } from '@/lib/git-utils';
import { successResponse, contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';

// 페이지 저장: 파일 먼저 쓰기 → 성공 시 DB에 FILE_PATH 기록
// PAGE_DESC에 HTML 저장하지 않음 (파일만 저장 정책)
async function savePage(
    bank: string,
    html: string,
    pageName?: string,
    viewMode?: string,
    thumbnail?: string,
): Promise<void> {
    const { userId, userName } = await getCurrentUser();

    // 1. 기존 페이지 확인 + 만료 체크
    const existing = await getPageById(bank);
    if (existing && isPageExpired(existing.IS_PUBLIC, existing.EXPIRED_DATE)) {
        throw new Error('만료된 페이지는 수정할 수 없습니다.');
    }

    // 2. 파일 먼저 저장 (실패 시 예외 → DB 호출 안 함)
    const filePath = await writePageHtml(bank, html);

    // 3. DB 업데이트 (FILE_PATH만 기록)
    if (existing) {
        await updatePage({
            pageId: bank,
            pageName: pageName,
            viewMode: viewMode as 'mobile' | 'web' | 'responsive' | undefined,
            filePath,
            thumbnail,
            lastModifierId: userId,
            lastModifierName: userName,
        });

        // 4. 승인/반려 상태이면 WORK로 전환 (재승인 플로우)
        await resetApproveStateToWork(bank, userId);
    } else {
        await createPage({
            pageId: bank,
            pageName: pageName ?? bank,
            viewMode: (viewMode as 'mobile' | 'web' | 'responsive') ?? 'mobile',
            filePath,
            thumbnail,
            createUserId: userId,
            createUserName: userName,
        });
    }

    // 5. git 자동 커밋·푸시 (fire-and-forget — 실패해도 저장 응답에 영향 없음)
    const gitFilePaths = [
        `public/uploads/pages/${bank}.html`,
        ...(thumbnail ? [`public/uploads/pages/thumbnails/${bank}_thumb.jpg`] : []),
    ];
    commitAndPushPage({ filePaths: gitFilePaths, pageId: bank, userId }).catch((err: unknown) => {
        console.warn('git 자동 커밋 실패 (저장 결과에는 영향 없음):', getErrorMessage(err));
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { html, pageName, viewMode, thumbnail } = body;
        const bank = isValidBankId(body.bank) ? body.bank : 'ibk';

        if (html === undefined || html === null) {
            return contentBuilderErrorResponse('HTML 콘텐츠가 없습니다.');
        }

        await savePage(
            bank,
            html,
            typeof pageName === 'string' ? pageName : undefined,
            typeof viewMode === 'string' ? viewMode : undefined,
            typeof thumbnail === 'string' ? thumbnail : undefined,
        );

        return successResponse();
    } catch (err: unknown) {
        console.error('페이지 저장 실패:', err);
        return contentBuilderErrorResponse(getErrorMessage(err));
    }
}
