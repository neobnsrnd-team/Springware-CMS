// src/app/api/components/route.ts
// 컴포넌트 목록 조회 API — DB 전용

import { NextRequest, NextResponse } from 'next/server';
import type { FinanceComponent } from '@/app/edit/finance-component-data';
import type { ComponentType, ViewMode, CmsComponentParsed } from '@/db/types';
import { getComponentList } from '@/db/repository/component.repository';

const VALID_TYPES = new Set<string>(['finance', 'basic']);
const VALID_VIEW_MODES = new Set<string>(['mobile', 'web', 'responsive']);

/** DB 컴포넌트 → 프론트엔드 FinanceComponent 변환 */
function toFinanceComponent(row: CmsComponentParsed): FinanceComponent | null {
    const d = row.DATA;
    if (!d) return null;

    const viewMode = d.viewMode;
    const isValidViewMode = typeof viewMode === 'string' && VALID_VIEW_MODES.has(viewMode);

    return {
        id: typeof d.id === 'string' ? d.id : row.COMPONENT_ID,
        label: typeof d.label === 'string' ? d.label : '',
        description: typeof d.description === 'string' ? d.description : '',
        preview: typeof d.preview === 'string' ? d.preview : row.COMPONENT_THUMBNAIL ?? '',
        html: typeof d.html === 'string' ? d.html : '',
        viewMode: isValidViewMode ? (viewMode as FinanceComponent['viewMode']) : row.VIEW_MODE,
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const type = searchParams.get('type') ?? undefined;
        const mode = searchParams.get('viewMode') ?? undefined;

        // 입력 검증
        const componentType = (type && VALID_TYPES.has(type)) ? type as ComponentType : undefined;
        const viewMode = (mode && VALID_VIEW_MODES.has(mode)) ? mode as ViewMode : undefined;

        const rows = await getComponentList({ componentType, viewMode });
        const components = rows.map(toFinanceComponent).filter((c): c is FinanceComponent => c !== null);

        return NextResponse.json({ ok: true, components });
    } catch (error) {
        console.error('컴포넌트 목록 조회 오류:', error);
        return NextResponse.json({ error: '컴포넌트 목록 조회에 실패했습니다.' }, { status: 500 });
    }
}
