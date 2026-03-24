// src/components/files/CreateFolderModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

import { useDraggable } from '@/lib/useDraggable';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onFolderCreated: (folderName: string) => void;
    apiEndpoint?: string;
}

export default function CreateFolderModal({
    isOpen,
    onClose,
    currentPath,
    onFolderCreated,
    apiEndpoint = '/api/manage/addfolder',
}: CreateFolderModalProps) {
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 드래그 훅
    const { modalRef, handleRef, isDragging } = useDraggable(isOpen);

    // 모달 열고 닫을 때 상태 초기화
    useEffect(() => {
        if (isOpen) {
            setFolderName('');
            setError(null);
        }
    }, [isOpen]);

    // 모달 열릴 때 입력창 포커스
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Escape 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!folderName.trim()) {
            setError('폴더 이름을 입력해주세요.');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: folderName.trim(),
                    path: currentPath,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || '폴더 생성에 실패했습니다.');
            }

            const result = await res.json();
            onFolderCreated(result.folder.name);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : '폴더 생성에 실패했습니다.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isCreating) {
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-folder-title"
            onClick={(e) => {
                if (isDragging) return;
                e.target === e.currentTarget && onClose();
            }}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative"
                style={{ boxShadow: '0 24px 64px rgba(0,70,164,0.15)' }}
            >
                {/* 드래그 핸들 영역 */}
                <div
                    ref={handleRef}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    <h3 id="create-folder-title" className="text-lg font-semibold text-gray-900">
                        새 폴더 만들기
                    </h3>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#0046A4] focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 rounded p-1 cursor-pointer"
                    aria-label="닫기"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                            폴더 이름
                        </label>
                        <input
                            ref={inputRef}
                            id="folder-name"
                            type="text"
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                                if (error) setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 focus:border-[#0046A4] ${
                                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="폴더 이름 입력"
                            aria-invalid={!!error}
                            aria-describedby={error ? 'folder-error' : undefined}
                        />
                        {error && (
                            <p id="folder-error" className="mt-1 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-xl hover:bg-[#EBF4FF] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 cursor-pointer"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isCreating || !folderName.trim()}
                            className="px-4 py-2 bg-[#0046A4] text-white rounded-xl hover:bg-[#003399] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 flex items-center gap-2 cursor-pointer"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    생성 중...
                                </>
                            ) : (
                                '만들기'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
