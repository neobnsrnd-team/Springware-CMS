// src/components/files/DeleteConfirmModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';

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
    const [isConfirming, setIsConfirming] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl w-full max-w-md p-6 relative"
                style={{ boxShadow: '0 24px 64px rgba(0,70,164,0.15)' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#0046A4] focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 rounded p-1 cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 id="delete-confirm-title" className="text-lg font-semibold text-gray-900">
                            Delete files?
                        </h3>
                        <p className="text-sm text-gray-600">
                            {itemCount} item{itemCount !== 1 ? 's' : ''} will be permanently deleted
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                    This action cannot be undone. Are you sure you want to continue?
                </p>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting || isConfirming}
                        className="px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-xl hover:bg-[#EBF4FF] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isDeleting || isConfirming}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 cursor-pointer"
                    >
                        {isDeleting || isConfirming ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
