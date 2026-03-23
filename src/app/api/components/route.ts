// src/app/api/components/route.ts
// 컴포넌트 목록 조회 / 수정 API — DB 전용

import { NextRequest, NextResponse } from 'next/server';
import type { FinanceComponent } from '@/app/edit/finance-component-data';
import type { ComponentType, ViewMode, CmsComponentParsed } from '@/db/types';
import { getComponentList, getComponentById, updateComponent } from '@/db/repository/component.repository';
import { getErrorMessage } from '@/lib/api-response';

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
        preview: typeof d.preview === 'string' ? d.preview : (row.COMPONENT_THUMBNAIL ?? ''),
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
        const componentType = type && VALID_TYPES.has(type) ? (type as ComponentType) : undefined;
        const viewMode = mode && VALID_VIEW_MODES.has(mode) ? (mode as ViewMode) : undefined;

        const rows = await getComponentList({ componentType, viewMode });
        const components = rows.map(toFinanceComponent).filter((c): c is FinanceComponent => c !== null);

        return NextResponse.json({ ok: true, components });
    } catch (err: unknown) {
        console.error('컴포넌트 목록 조회 오류:', err);
        return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json({ error: '잘못된 요청 본문입니다.' }, { status: 400 });
        }

        const { componentId, viewMode, label, description, html } = body as Record<string, unknown>;

        if (typeof componentId !== 'string' || typeof viewMode !== 'string') {
            return NextResponse.json({ error: 'componentId와 viewMode는 필수 문자열입니다.' }, { status: 400 });
        }

        // DB COMPONENT_ID는 "{id}-{viewMode}" 형식으로 저장됨
        const dbComponentId = `${componentId}-${viewMode}`;

        // 기존 컴포넌트 조회 (COMPONENT_TYPE, VIEW_MODE 보존용)
        const existing = await getComponentById(dbComponentId);
        if (!existing) {
            return NextResponse.json({ error: '컴포넌트를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 기존 DATA에 label / description / html 만 덮어씀
        const currentData = (existing.DATA ?? {}) as Record<string, unknown>;
        const newData: Record<string, unknown> = {
            ...currentData,
            ...(label !== undefined && { label }),
            ...(description !== undefined && { description }),
            ...(html !== undefined && { html }),
        };

        await updateComponent({
            componentId: dbComponentId,
            componentType: existing.COMPONENT_TYPE,
            viewMode: existing.VIEW_MODE,
            componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
            data: newData,
            lastModifierId: 'system',
        });

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error('컴포넌트 수정 오류:', err);
        return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
    }
}
