// src/components/files/Sidebar.tsx

'use client';

import { Folder } from 'lucide-react';
import FolderTree from './FolderTree';

interface FolderNode {
    name: string;
    path: string;
    children?: FolderNode[];
    isExpanded?: boolean;
}

interface SidebarProps {
  folderTree: FolderNode[];
  currentPath: string;
  onFolderClick: (path: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
}

export default function Sidebar({ 
    folderTree, 
    currentPath, 
    onFolderClick,
    expandedFolders,
    onToggleFolder
}: SidebarProps) {
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">Folders</h2>
            </div>
            <div className="p-2 overflow-y-auto h-[calc(100vh-60px)]">
                <div
                    onClick={() => onFolderClick('')}
                    className={`flex items-center gap-2 px-3 py-1.5 mb-1 rounded-md cursor-pointer transition-colors ${
                        currentPath === ''
                        ? 'bg-gray-100 text-foreground'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                    <Folder className="w-4 h-4" />
                    <span className="text-sm">Home</span>
                </div>
                <FolderTree
                    nodes={folderTree}
                    currentPath={currentPath}
                    onFolderClick={onFolderClick}
                    expandedFolders={expandedFolders}
                    onToggleFolder={onToggleFolder}
                />
            </div>
        </div>
    );
}