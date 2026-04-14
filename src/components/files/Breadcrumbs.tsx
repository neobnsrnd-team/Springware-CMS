// src/components/files/Breadcrumbs.tsx
'use client';

import { ChevronRight } from 'lucide-react';

export interface BreadcrumbsProps {
    currentPath: string;
    navigateToBreadcrumb: (index: number) => void;
}

export default function Breadcrumbs({ currentPath, navigateToBreadcrumb }: BreadcrumbsProps) {
    const getBreadcrumbs = () => (currentPath ? ['Home', ...currentPath.split('/')] : ['Home']);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
            {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    <button
                        onClick={() => navigateToBreadcrumb(index)}
                        className={`hover:text-[#0046A4] transition-colors ${
                            index === getBreadcrumbs().length - 1 ? 'text-[#0046A4] font-medium' : 'cursor-pointer'
                        }`}
                    >
                        {crumb}
                    </button>
                </div>
            ))}
        </div>
    );
}
