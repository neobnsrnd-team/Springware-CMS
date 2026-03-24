// src/app/page.tsx
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/current-user';

export default function Home() {
    const { userId } = getCurrentUser();
    redirect(`/${userId}`);
}
