// src/app/edit/page.tsx

import { Suspense } from 'react';
import EditClient from './EditClient';

export default async function Edit({
    searchParams,
}: {
    searchParams: Promise<{ bank?: string }>;
}) {
    const params = await searchParams;
    const bank = params.bank || 'ibk';

    return (
        <Suspense>
            <EditClient key={bank} bank={bank} />
        </Suspense>
    );
}