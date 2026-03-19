// src/components/files/FileBrowser.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Trash2, Check, FolderPlus, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/files/Sidebar';
import FileCard from '@/components/files/FileCard';
import CreateFolderModal from '@/components/files/CreateFolderModal';
import DeleteConfirmModal from '@/components/files/DeleteConfirmModal';
import UploadProgressList from '@/components/files/UploadProgressList';
import Breadcrumbs from '@/components/files/Breadcrumbs';

interface FileItem {
    name: string;
    url: string;
    isDirectory: boolean;
    size: number;
}

interface FolderNode {
    name: string;
    path: string;
    children?: FolderNode[];
    isExpanded?: boolean;
}

interface UploadProgress {
    name: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

export interface ApiEndpoints {
    folders: string;
    files: string;
    upload: string;
    delete: string;
    addFolder: string;
}

export interface FileBrowserProps {
    apiEndpoints?: Partial<ApiEndpoints>;
    className?: string;
}

const DEFAULT_ENDPOINTS: ApiEndpoints = {
    folders: '/api/manage/folders',
    files: '/api/manage/files',
    upload: '/api/manage/upload',
    delete: '/api/manage/delete',
    addFolder: '/api/manage/addfolder',
};

export default function FileBrowser({ 
    apiEndpoints = {}, 
    className = '' 
}: FileBrowserProps) {
    const endpoints = { ...DEFAULT_ENDPOINTS, ...apiEndpoints };

    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [currentPath, setCurrentPath] = useState('');
    const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  
    const loaderRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);

    // Fetch folder structure
    const fetchFolderTree = useCallback(async () => {
        try {
            const res = await fetch(endpoints.folders);
            if (!res.ok) throw new Error('Failed to fetch folders');
            const data = await res.json();
            setFolderTree(data.folders || []);
        } catch (err) {
            console.error('Failed to load folder tree:', err);
        }
    }, [endpoints.folders]);

    // Fetch files function
    const fetchFiles = useCallback(async (pageNum: number, path: string) => {
        if (isFetchingRef.current) return;
        
        try {
            isFetchingRef.current = true;
            const pathParam = path ? `&path=${encodeURIComponent(path)}` : '';
            const res = await fetch(`${endpoints.files}?page=${pageNum}${pathParam}`);
            if (!res.ok) throw new Error('Failed to fetch files');
            const data = await res.json();
            
            setFiles(prev => pageNum === 1 ? data.files : [...prev, ...data.files]);
            setHasMore(data.hasMore);
            setPage(pageNum);
        } catch (err) {
            setError('Failed to load files');
            console.error(err);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, [endpoints.files]);

    // Upload files
    const uploadFiles = async (filesToUpload: File[]) => {
        const newProgress: UploadProgress[] = filesToUpload.map(file => ({
            name: file.name,
            progress: 0,
            status: 'uploading' as const
        }));
        setUploadProgress(prev => [...prev, ...newProgress]);

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', currentPath);

            try {
                const res = await fetch(endpoints.upload, {
                    method: 'POST',
                    body: formData,
                });

                // if (!res.ok) {
                //     const errorData = await res.json();
                //     throw new Error(errorData.error || 'Upload failed');
                // }
                if (!res.ok) {
                    const errorData = await res.json();
                    setUploadProgress(prev =>
                        prev.map(p =>
                            p.name === file.name
                                ? { ...p, status: 'error', error: errorData.error || 'Upload failed' }
                                : p
                        )
                    );
                    continue; // skip to next file in the loop
                }

                setUploadProgress(prev => 
                    prev.map(p => 
                        p.name === file.name 
                        ? { ...p, progress: 100, status: 'success' as const }
                        : p
                    )
                );

                await fetchFiles(1, currentPath);
                await fetchFolderTree();
            } catch (err) {
                console.error('Upload error:', err);
                setUploadProgress(prev => 
                    prev.map(p => 
                        p.name === file.name 
                        ? { ...p, status: 'error' as const, error: err instanceof Error ? err.message : 'Upload failed' }
                        : p
                    )
                );
            }
        }

        setTimeout(() => {
            setUploadProgress(prev => 
                prev.filter(p => p.status === 'uploading')
            );
        }, 3000);
    };

    // Delete selected files
    const deleteSelectedFiles = async () => {
        setIsDeleting(true);
        try {
            const filesToDelete = Array.from(selectedFiles).map(url => {
                const relativePath = url.replace('/uploads/', '');
                return relativePath;
            });

            const res = await fetch(endpoints.delete, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    files: filesToDelete,
                    path: currentPath
                }),
            });

            // if (!res.ok) {
            //     const errorData = await res.json();
            //     throw new Error(errorData.error || 'Delete failed');
            // }
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Delete error:', errorData);
                setUploadProgress(prev => [...prev, {
                    name: 'Failed to delete files',
                    progress: 0,
                    status: 'error',
                    error: errorData.error || 'Delete failed'
                }]);
                return; // exit early, don’t continue
            }

            // const result = await res.json();
            
            // Show success message
            /*
            if (result.deleted > 0) {
                setUploadProgress(prev => [...prev, {
                    name: `${result.deleted} item(s) deleted successfully`,
                    progress: 100,
                    status: 'success'
                }]);
            }
            */

            // Refresh file list and folder tree
            await fetchFiles(1, currentPath);
            await fetchFolderTree();

            // Clear selection and exit selection mode
            setSelectedFiles(new Set());
            setSelectionMode(false);
            setShowDeleteConfirm(false);

            // Clear success message after 3 seconds
            /*
            setTimeout(() => {
                setUploadProgress(prev => 
                    prev.filter(p => !p.name.includes('deleted successfully'))
                );
            }, 3000);
            */
        } catch (err) {
            console.error('Delete error:', err);
            setUploadProgress(prev => [...prev, {
                name: 'Failed to delete files',
                progress: 0,
                status: 'error',
                error: err instanceof Error ? err.message : 'Delete failed'
            }]);
        } finally {
            setIsDeleting(false);
        }
    };

    /*
    const handleFolderCreated = (folderName: string) => {
        // Show success message
        setUploadProgress(prev => [...prev, {
            name: `Folder "${folderName}" created`,
            progress: 100,
            status: 'success'
        }]);

        // Refresh data
        fetchFiles(1, currentPath);
        fetchFolderTree();

        // Clear success message after 3s
        setTimeout(() => {
            setUploadProgress(prev => 
                prev.filter(p => p.name !== `Folder "${folderName}" created`)
            );
        }, 3000);
    };
    */

    const handleFolderCreated = () => {

        // Refresh data
        fetchFiles(1, currentPath);
        fetchFolderTree();
    };

    // Toggle selection mode
    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedFiles(new Set());
    };

    // Toggle file selection
    const toggleFileSelection = (fileUrl: string) => {
        setSelectedFiles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(fileUrl)) {
            newSet.delete(fileUrl);
        } else {
            newSet.add(fileUrl);
        }
        return newSet;
        });
    };

    // Select all files
    const selectAllFiles = () => {
        const allFileUrls = new Set(files.map(f => f.url));
        setSelectedFiles(allFileUrls);
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounterRef.current = 0;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            uploadFiles(droppedFiles);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            uploadFiles(selectedFiles);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeUploadProgress = (name: string) => {
        setUploadProgress(prev => prev.filter(p => p.name !== name));
    };

    // Initial load
    useEffect(() => {
        fetchFolderTree();
    }, [fetchFolderTree]);

    // Reload files when path changes
    useEffect(() => {
        setLoading(true);
        setFiles([]);
        setPage(1);
        setHasMore(true);
        isFetchingRef.current = false;
        setSelectedFiles(new Set());
        setSelectionMode(false);
        fetchFiles(1, currentPath);
    }, [currentPath, fetchFiles]);

    // Intersection observer setup
    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current) {
                fetchFiles(page + 1, currentPath);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(currentLoader);

        return () => {
        if (currentLoader) {
            observer.unobserve(currentLoader);
        }
        };
    }, [page, hasMore, loading, currentPath, fetchFiles]);

    const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
        if (selectionMode) {
            e.preventDefault();
            toggleFileSelection(file.url);
            return;
        }

        if (file.isDirectory) {
            const urlPath = file.url.replace('/uploads/', '');
            setCurrentPath(urlPath);
        } else {
            // console.log('Selected file URL:', file.url);
            // window.open(file.url, '_blank');
            if(window.parent) window.parent.postMessage({ type: "ASSET_SELECTED", url: file.url }, "*");
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index === 0) {
            setCurrentPath('');
        } else {
            const pathParts = currentPath.split('/');
            setCurrentPath(pathParts.slice(0, index).join('/'));
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        setFiles([]);
        setPage(1);
        setHasMore(true);
        isFetchingRef.current = false;
        await fetchFiles(1, currentPath);
        await fetchFolderTree();
    };

    if (loading && page === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading files...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className={`h-screen bg-gray-50 flex ${className}`}>
        {/* Sidebar */}
        <div
            className={`h-full w-64 bg-white shadow transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <Sidebar
                folderTree={folderTree}
                currentPath={currentPath}
                onFolderClick={setCurrentPath}
                expandedFolders={expandedFolders}
                onToggleFolder={(path) => {
                setExpandedFolders(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(path)) {
                    newSet.delete(path);
                    } else {
                    newSet.add(path);
                    }
                    return newSet;
                });
                }}
            />
       </div>

        {/* Main content */} 
        <div
            className={`flex flex-col flex-1 transition-all duration-300`}
            style={{ marginLeft: sidebarOpen ? 0 : -256 }} // -256px moves main left when sidebar hidden
        >
            {/* Fixed header (non-scrolling) */}
            <div className="shrink-0 pt-4 pb-2 px-4 md:pt-8 md:pb-4 md:px-8">
                {/* Header with breadcrumbs and actions */}
                <div className="flex items-center justify-between mb-6">
                    <Breadcrumbs currentPath={currentPath} navigateToBreadcrumb={navigateToBreadcrumb} />

                    <div className="flex items-center gap-2">
                        {!selectionMode ? (
                        <>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-lg hover:bg-[#EBF4FF] hover:border-[#0046A4] transition-colors cursor-pointer"
                                title="Refresh files"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="text-sm">Refresh</span>
                            </button>
                            <button
                                onClick={toggleSelectionMode}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-lg hover:bg-[#EBF4FF] hover:border-[#0046A4] transition-colors cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Select</span>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0046A4] text-white rounded-lg hover:bg-[#003399] transition-colors cursor-pointer"
                            >
                                <Upload className="w-4 h-4" />
                                <span className="text-sm">Upload</span>
                            </button>
                            <button
                                onClick={() => setShowCreateFolderModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-lg hover:bg-[#EBF4FF] hover:border-[#0046A4] transition-colors cursor-pointer"
                            >
                                <FolderPlus className="w-4 h-4" />
                                <span className="text-sm">New Folder</span>
                            </button>
                        </>
                        ) : (
                        <button
                            onClick={toggleSelectionMode}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-lg hover:bg-[#EBF4FF] hover:border-[#0046A4] transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            <span className="text-sm">Cancel</span>
                        </button>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 hover:text-gray-900 p-2 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Scrollable files area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div> {/* className="max-w-6xl mx-auto" */}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInputChange}
                    />

                    {/* Upload progress notifications */}
                    {uploadProgress.length > 0 && (
                    <UploadProgressList progressList={uploadProgress} onRemove={removeUploadProgress} />
                    )}
                    
                    {/* Drop zone overlay */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="relative"
                    >
                    {isDragging && (
                        <div className="absolute inset-0 z-10 bg-[#EBF4FF] border-4 border-dashed border-[#0046A4] rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <Upload className="w-16 h-16 text-[#0046A4] mx-auto mb-4" />
                            <p className="text-lg font-medium text-[#0046A4]">파일을 여기에 드롭하여 업로드</p>
                            <p className="text-sm text-[#2563EB] mt-1">
                                Files will be uploaded to: {currentPath || 'Home'}
                            </p>
                        </div>
                        </div>
                    )}

                    {files.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-medium">No files found in this directory</p>
                        <p className="text-sm mt-1">Drag & drop files here or click Upload button</p>
                        </div>
                    ) : (
                        <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                            {files.map((file, index) => {
                            // const isSelected = selectedFiles.has(file.url);
                            return (
                                <FileCard
                                    key={`${file.url}-${index}`}
                                    file={file}
                                    isSelected={selectedFiles.has(file.url)}
                                    selectionMode={selectionMode}
                                    onClick={handleFileClick}
                                    priority={index < 5}
                                />
                            );
                            })
                            }
                        </div>
                        
                        {/* Loading trigger element */}
                        {hasMore && (
                            <div ref={loaderRef} className="flex justify-center py-8">
                            <div className="text-gray-500 text-sm">Loading more...</div>
                            </div>
                        )}
                        
                        {/* End of results */}
                        {!hasMore && files.length > 0 && (
                            <div className="flex justify-center py-8 text-gray-400 text-sm">
                            All files loaded
                            </div>
                        )}
                        </>
                    )}
                    </div>
                </div>
            </div>
        </div>

        {/* Selection action bar */}
        {selectionMode && selectedFiles.size > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">
                            {selectedFiles.size} item{selectedFiles.size !== 1 ? 's' : ''} selected
                        </span>
                        {selectedFiles.size < files.length && (
                            <button
                            onClick={selectAllFiles}
                            className="text-sm text-[#0046A4] hover:text-[#003399] cursor-pointer"
                            >
                            Select all
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">Delete</span>
                        </button>
                        <button
                            onClick={toggleSelectionMode}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F0F4FF] text-[#0046A4] border border-[#C7D8F4] rounded-lg hover:bg-[#EBF4FF] hover:border-[#0046A4] transition-colors cursor-pointer"
                        >
                            <span className="text-sm">Cancel</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <CreateFolderModal
            isOpen={showCreateFolderModal}
            onClose={() => setShowCreateFolderModal(false)}
            currentPath={currentPath}
            onFolderCreated={handleFolderCreated}
            apiEndpoint={endpoints.addFolder}
        />
        
        <DeleteConfirmModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={deleteSelectedFiles}
            itemCount={selectedFiles.size}
            isDeleting={isDeleting}
        />
        </div>
    );
}