import { Upload, X } from 'lucide-react';
import React from 'react';

export interface UploadProgress {
    name: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

interface Props {
    progressList: UploadProgress[];
    onRemove: (name: string) => void;
}

export default function UploadProgressList({ progressList, onRemove }: Props) {
    return (
        <div className="mb-4 space-y-2">
        {progressList.map((progress, index) => (
            <div
                key={`${progress.name}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg ${
                    progress.status === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : progress.status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-[#EBF4FF] border border-[#C7D8F4]'
                }`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Upload
                        className={`w-4 h-4 flex-shrink-0 ${
                            progress.status === 'success'
                            ? 'text-green-600'
                            : progress.status === 'error'
                            ? 'text-red-600'
                            : 'text-[#0046A4]'
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{progress.name}</p>
                        {progress.status === 'error' && progress.error && (
                            <p className="text-xs text-red-600">{progress.error}</p>
                        )}
                        {progress.status === 'success' && !progress.name.includes('deleted') && (
                            <p className="text-xs text-green-600">Upload complete</p>
                        )}
                        {progress.status === 'uploading' && <p className="text-xs text-[#0046A4]">업로드 중...</p>}
                    </div>
                </div>
                <button onClick={() => onRemove(progress.name)} className="p-1 hover:bg-gray-200 rounded cursor-pointer">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        ))}
        </div>
    );
}
