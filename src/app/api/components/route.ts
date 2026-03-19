// src/app/api/components/route.ts
// 컴포넌트 목록 조회 API — 듀얼 모드 (DB / 파일 폴백)

import { NextRequest, NextResponse } from 'next/server';
import { isDbEnabled } from '@/db/connection';
import type { FinanceComponent } from '@/app/edit/finance-component-data';
import type { ComponentType, ViewMode, CmsComponentParsed } from '@/db/types';

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

/** DB 모드: repository에서 조회 */
async function loadFromDb(componentType?: ComponentType, viewMode?: ViewMode): Promise<FinanceComponent[]> {
    // 런타임에만 DB 모듈 import (파일 모드에서는 oracledb 의존성 불필요)
    const { getComponentList } = await import('@/db/repository/component.repository');
    const rows = await getComponentList({ componentType, viewMode });
    return rows.map(toFinanceComponent).filter((c): c is FinanceComponent => c !== null);
}

/** 파일 모드: 기존 정적 데이터로 폴백 */
async function loadFromFile(componentType?: string, viewMode?: string): Promise<FinanceComponent[]> {
    if (componentType === 'basic') return []; // 기본 블록은 content-plugins.js에서 로드

    const { FINANCE_COMPONENTS } = await import('@/app/edit/finance-component-data');
    let components = FINANCE_COMPONENTS;
    if (viewMode && VALID_VIEW_MODES.has(viewMode)) {
        components = components.filter(c => c.viewMode === viewMode);
    }
    return components;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const type = searchParams.get('type') ?? undefined;
        const mode = searchParams.get('viewMode') ?? undefined;

        // 입력 검증
        const componentType = (type && VALID_TYPES.has(type)) ? type as ComponentType : undefined;
        const viewMode = (mode && VALID_VIEW_MODES.has(mode)) ? mode as ViewMode : undefined;

        const components = isDbEnabled()
            ? await loadFromDb(componentType, viewMode)
            : await loadFromFile(componentType, viewMode);

        return NextResponse.json({ ok: true, components });
    } catch (error) {
        console.error('컴포넌트 목록 조회 오류:', error);
        return NextResponse.json({ error: '컴포넌트 목록 조회에 실패했습니다.' }, { status: 500 });
    }
}
