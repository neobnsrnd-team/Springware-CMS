import { ChevronRight } from 'lucide-react';

interface Props {
    currentPath: string;
    navigateToBreadcrumb: (index: number) => void;
}

export default function Breadcrumbs({ currentPath, navigateToBreadcrumb }: Props) {
    const getBreadcrumbs = () => (currentPath ? ['Home', ...currentPath.split('/')] : ['Home']);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                    <button
                        onClick={() => navigateToBreadcrumb(index)}
                        className={`hover:text-gray-900 transition-colors ${
                        index === getBreadcrumbs().length - 1
                            ? 'text-gray-900 font-medium'
                            : 'cursor-pointer'
                        }`}
                    >
                        {crumb}
                    </button>
                </div>
            ))}
        </div>
    );
}
