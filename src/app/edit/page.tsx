// src/app/edit/page.tsx

import { Suspense } from 'react';

import EditClientLoader from '@/components/edit/EditClientLoader';
import { getCurrentUser } from '@/lib/current-user';
import { BANK_BRAND } from '@/lib/env';
import { BRAND_THEMES, type BrandTheme } from '@/data/brand-themes';

export default async function Edit({ searchParams }: { searchParams: Promise<{ bank?: string }> }) {
    const params = await searchParams;
    const bank = params.bank || 'ibk';
    const { userId } = await getCurrentUser();

    // BANK_BRAND 미설정 시 null → EditClient에서 색상 치환 건너뜀
    const brandTheme: BrandTheme | null = BRAND_THEMES[BANK_BRAND.toUpperCase()] ?? null;

    return (
        <Suspense>
            <EditClientLoader key={bank} bank={bank} userId={userId} brandTheme={brandTheme} />
        </Suspense>
    );
}
