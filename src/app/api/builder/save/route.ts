// src/app/api/builder/save/route.ts

import { NextRequest } from 'next/server';

import { updatePage, createPage, getPageById, resetApproveStateToWork } from '@/db/repository/page.repository';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { isValidBankId } from '@/lib/validators';
import { isPageExpired } from '@/lib/page-file';
import { successResponse, contentBuilderErrorResponse, getErrorMessage } from '@/lib/api-response';

// 페이지 저장: DB PAGE_HTML에 HTML 직접 저장
async function savePage(
    bank: string,
    html: string,
    pageName?: string,
    viewMode?: string,
    thumbnail?: string,
): Promise<void> {
    const { userId, userName, authorities } = await getCurrentUser();
    if (!canWriteCms({ authorities })) {
        throw new Error('권한이 없습니다.');
    }

    // 1. 기존 페이지 확인 + 만료 체크
    const existing = await getPageById(bank);
    if (existing && isPageExpired(existing.IS_PUBLIC, existing.EXPIRED_DATE)) {
        throw new Error('만료된 페이지는 수정할 수 없습니다.');
    }

    // 2. DB 저장 (PAGE_HTML CLOB에 직접 기록)
    if (existing) {
        await updatePage({
            pageId: bank,
            pageName: pageName,
            viewMode: viewMode as 'mobile' | 'web' | 'responsive' | undefined,
            pageHtml: html,
            thumbnail,
            lastModifierId: userId,
            lastModifierName: userName,
        });

        // 3. 승인/반려 상태이면 WORK로 전환 (재승인 플로우)
        await resetApproveStateToWork(bank, userId);
    } else {
        await createPage({
            pageId: bank,
            pageName: pageName ?? bank,
            viewMode: (viewMode as 'mobile' | 'web' | 'responsive') ?? 'mobile',
            pageHtml: html,
            thumbnail,
            createUserId: userId,
            createUserName: userName,
        });
    }
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
