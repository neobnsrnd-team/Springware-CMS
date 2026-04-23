// GET /api/cms-admin/asset-categories — spider-admin `/api/cms-admin/asset-categories` 프록시
// 승인 관리 화면(/cms-admin/asset-approvals)과 동일한 카테고리 목록을 반환합니다.

import { errorResponse, getErrorMessage, successResponse } from '@/lib/api-response';
import { fetchJavaAdminApi } from '@/lib/java-admin-api';

interface AssetCategoryCode {
    code: string;
    codeName: string;
    useYn?: string;
    sortOrder?: number;
}

const ASSET_CATEGORIES_API_PATH = process.env.JAVA_ADMIN_CMS_ASSET_CATEGORIES_PATH ?? '/api/cms-admin/asset-categories';

export async function GET() {
    try {
        const categories = await fetchJavaAdminApi<AssetCategoryCode[]>(ASSET_CATEGORIES_API_PATH);
        return successResponse({ categories });
    } catch (err) {
        return errorResponse(getErrorMessage(err), 502);
    }
}
