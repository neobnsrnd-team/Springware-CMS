// src/components/files/CreateFolderModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onFolderCreated: (folderName: string) => void;
    apiEndpoint?: string; // New prop for API endpoint
}

export default function CreateFolderModal({
    isOpen,
    onClose,
    currentPath,
    onFolderCreated,
    apiEndpoint = '/api/manage/addfolder' // Default endpoint
}: CreateFolderModalProps) {
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
        setFolderName('');
        setError(null);
        }
    }, [isOpen]);

    // Auto-focus input
    useEffect(() => {
        if (isOpen && inputRef.current) {
        inputRef.current.focus();
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

    const handleSubmit = async () => {
        if (!folderName.trim()) {
            setError('Folder name is required');
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
                    path: currentPath
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create folder');
            }

            const result = await res.json();
            onFolderCreated(result.folder.name);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create folder');
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
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative" style={{ boxShadow: '0 24px 64px rgba(0,70,164,0.15)' }}>

                <h3 id="create-folder-title" className="text-lg font-semibold text-gray-900">Create New Folder</h3>
                            
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#0046A4] focus:outline-none focus:ring-2 focus:ring-[#0046A4]/30 rounded p-1 cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Folder name
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
                            placeholder="Enter folder name"
                            aria-invalid={!!error}
                            aria-describedby={error ? "folder-error" : undefined}
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
                            Cancel
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
                            Creating...
                            </>
                        ) : (
                            'Create'
                        )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}