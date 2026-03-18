// src/app/edit/page.tsx

import { Suspense } from 'react';
import EditClientLoader from './EditClientLoader';

export default async function Edit({
    searchParams,
}: {
    searchParams: Promise<{ bank?: string }>;
}) {
    const params = await searchParams;
    const bank = params.bank || 'ibk';

    return (
        <Suspense>
            <EditClientLoader key={bank} bank={bank} />
        </Suspense>
    );
}