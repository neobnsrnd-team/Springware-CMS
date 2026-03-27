// src/components/admin/AdminNavTabs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { label: '승인 관리', href: '/approve' },
    { label: '콘텐츠 최적화', href: '/ab' },
];

export default function AdminNavTabs() {
    const pathname = usePathname();

    return (
        <div className="flex gap-1">
            {TABS.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`px-4 py-1.5 rounded-t-md text-sm font-semibold transition-colors ${
                            isActive ? 'bg-white text-[#1e3a5f]' : 'text-[#c8dff5] hover:text-white hover:bg-[#2a4f7a]'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
