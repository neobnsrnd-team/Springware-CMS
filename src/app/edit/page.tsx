// src/app/edit/page.tsx

import { Suspense } from 'react';

import EditClientLoader from '@/components/edit/EditClientLoader';
import { getCurrentUser } from '@/lib/current-user';

export default async function Edit({ searchParams }: { searchParams: Promise<{ bank?: string }> }) {
    const params = await searchParams;
    const bank = params.bank || 'ibk';
    const { userId } = await getCurrentUser();

    return (
        <Suspense>
            <EditClientLoader key={bank} bank={bank} userId={userId} />
        </Suspense>
    );
}
