// src/components/files/DeleteConfirmModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

import { useDraggable } from '@/lib/useDraggable';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
    isDeleting: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    itemCount,
    isDeleting,
}: DeleteConfirmModalProps) {
    // 1. state
    const [isConfirming, setIsConfirming] = useState(false);

    // 드래그 훅
    const { modalRef, handleRef, isDragging } = useDraggable(isOpen);

    // Reset confirming state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsConfirming(false);
        }
    }, [isOpen]);

    // Handle Escape key
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

    const handleConfirm = () => {
        setIsConfirming(true);
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            onClick={(e) => {
                if (isDragging) return;
                e.target === e.currentTarget && onClose();
            }}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl w-full max-w-md p-6 relative"
                style={{ boxShadow: '0 24px 64px rgba(0,70,164,0.15)' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#0046A4] focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 rounded p-1 cursor-pointer"
                    aria-label="닫기"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* 드래그 핸들 영역 */}
                <div
                    ref={handleRef}
                    className="flex items-center gap-3 mb-4"
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 id="delete-confirm-title" className="text-lg font-semibold text-gray-900">
                            파일 삭제
                        </h3>
                        <p className="text-sm text-gray-600">{itemCount}개 항목이 영구 삭제됩니다</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?</p>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting || isConfirming}
                        className="px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-xl hover:bg-[#EBF4FF] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 cursor-pointer"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isDeleting || isConfirming}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2 cursor-pointer"
                    >
                        {isDeleting || isConfirming ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>삭제 중...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>삭제</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
