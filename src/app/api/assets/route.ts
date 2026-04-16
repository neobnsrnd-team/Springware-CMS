// src/app/api/assets/route.ts
// 에셋 목록 조회 · 등록 API

import crypto from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { NextRequest } from 'next/server';

import { getAssetList, createAsset } from '@/db/repository/asset.repository';
import type { AssetState } from '@/db/types';
import { canWriteCms, getCurrentUser } from '@/lib/current-user';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/api-response';
import { ASSET_UPLOAD_DIR, ASSET_BASE_URL } from '@/lib/env';

const ASSET_STATES: AssetState[] = ['WORK', 'PENDING', 'APPROVED', 'REJECTED'];

function parseAssetState(value: string | null): AssetState | undefined {
    if (!value) {
        return undefined;
    }

    if (!ASSET_STATES.includes(value as AssetState)) {
        throw new Error('지원하지 않는 에셋 상태입니다.');
    }

    return value as AssetState;
}

/**
 * GET /api/assets — 에셋 목록 조회 (페이지네이션 + 카테고리 필터)
 *
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본: 1)
 * - pageSize: 페이지당 항목 수 (기본: 10, 최대: 100)
 * - category: BUSINESS_CATEGORY 필터 (선택)
 * - assetState: ASSET_STATE 필터 (WORK / PENDING / APPROVED / REJECTED, 선택)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10) || 10));
        const category = searchParams.get('category') || undefined;
        const assetState = parseAssetState(searchParams.get('assetState'));

        const { list, totalCount } = await getAssetList({
            businessCategory: category,
            assetState,
            page,
            pageSize,
        });

        const assets = list.map((a) => ({
            assetId: a.ASSET_ID,
            assetName: a.ASSET_NAME,
            businessCategory: a.BUSINESS_CATEGORY,
            mimeType: a.MIME_TYPE,
            fileSize: a.FILE_SIZE,
            assetDesc: a.ASSET_DESC,
            assetState: a.ASSET_STATE,
            createUserId: a.CREATE_USER_ID,
            createUserName: a.CREATE_USER_NAME,
            createDate: a.CREATE_DATE ? new Date(a.CREATE_DATE).toISOString() : null,
            url: a.ASSET_URL,
        }));

        return successResponse({ assets, totalCount });
    } catch (err) {
        if (err instanceof Error && err.message === '지원하지 않는 에셋 상태입니다.') {
            return errorResponse(err.message, 400);
        }

        console.error('에셋 목록 조회 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}

/**
 * POST /api/assets — 에셋 신규 등록 (FormData)
 *
 * FormData 필드:
 * - file: 이미지 파일 (필수)
 * - assetName: 에셋 이름 (선택, 기본: 파일명)
 * - businessCategory: 카테고리 (선택)
 * - assetDesc: 설명 (선택)
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return errorResponse('파일이 없습니다.', 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const currentUser = await getCurrentUser();
        if (!canWriteCms(currentUser)) {
            return errorResponse('Permission denied.', 403);
        }
        const { userId, userName } = currentUser;

        const assetId = crypto.randomUUID();
        const assetName = ((formData.get('assetName') as string) || file.name).replace(/[^a-zA-Z0-9._-]/g, '_');
        const businessCategory = (formData.get('businessCategory') as string) || undefined;
        const assetDesc = (formData.get('assetDesc') as string) || undefined;

        // 파일 시스템에 저장
        const filename = `${assetId}_${assetName}`;
        const filepath = join(ASSET_UPLOAD_DIR, filename);
        await mkdir(dirname(filepath), { recursive: true });
        await writeFile(filepath, buffer);
        const assetUrl = `${ASSET_BASE_URL}/${filename}`;

        try {
            await createAsset({
                assetId,
                assetName,
                businessCategory,
                mimeType: file.type || 'application/octet-stream',
                fileSize: buffer.length,
                assetPath: filepath,
                assetUrl,
                assetDesc,
                createUserId: userId,
                createUserName: userName,
            });
        } catch (dbErr: unknown) {
            // DB 실패 시 고아 파일 정리
            await unlink(filepath).catch(() => {});
            throw dbErr;
        }

        return successResponse({ assetId, url: assetUrl });
    } catch (err: unknown) {
        console.error('에셋 등록 실패:', err);
        return errorResponse(getErrorMessage(err));
    }
}
