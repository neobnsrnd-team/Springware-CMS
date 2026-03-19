// ============================================================================
// 금융 컴포넌트 시드 — finance-component-data*.ts → SPW_CMS_COMPONENT
// ============================================================================

import { FINANCE_COMPONENTS } from '@/app/edit/finance-component-data';
import { createComponent, getComponentById } from '@/db/repository/component.repository';
import type { ComponentType, ViewMode } from '@/db/types';

/**
 * 금융 컴포넌트 30개(모바일 10 + 웹 10 + 반응형 10)를 DB에 INSERT.
 * 이미 존재하는 컴포넌트는 건너뜀 (중복 안전).
 */
export async function seedFinanceComponents(): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0;
    let skipped = 0;

    for (const comp of FINANCE_COMPONENTS) {
        const componentId = `${comp.id}-${comp.viewMode}`;

        // 중복 체크
        const existing = await getComponentById(componentId);
        if (existing) {
            console.log(`⏭ ${componentId} — 이미 존재, 건너뜀`);
            skipped++;
            continue;
        }

        await createComponent({
            componentId,
            componentType: 'finance' as ComponentType,
            viewMode: comp.viewMode as ViewMode,
            componentThumbnail: comp.preview,
            data: {
                id: comp.id,
                label: comp.label,
                description: comp.description,
                preview: comp.preview,
                html: comp.html,
                viewMode: comp.viewMode,
            },
            createUserId: 'system',
            createUserName: '시스템',
        });

        console.log(`✅ ${componentId} (${comp.label}) — INSERT 완료`);
        inserted++;
    }

    return { inserted, skipped };
}
