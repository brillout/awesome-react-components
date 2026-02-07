"use client";

import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FileNode {
  path: string;
  content: string;
}

interface FileTreeProps {
  files: FileNode[];
  activeFile: string;
  onFileSelect: (path: string) => void;
}

export default function FileTree({ files, activeFile, onFileSelect }: FileTreeProps) {
  // Simple flat tree for now, or group by folders
  const folders: Record<string, string[]> = {};
  const rootFiles: string[] = [];

  files.forEach(file => {
    const parts = file.path.split("/");
    if (parts.length > 1) {
      const folderName = parts[0];
      if (!folders[folderName]) folders[folderName] = [];
      folders[folderName].push(file.path);
    } else {
      rootFiles.push(file.path);
    }
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4 font-bold text-xs uppercase text-gray-500 tracking-wider">
        Project Files
      </div>
      <div className="flex-1 px-2">
        {Object.entries(folders).map(([folderName, folderFiles]) => (
          <FolderNode
            key={folderName}
            name={folderName}
            files={folderFiles}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
          />
        ))}
        {rootFiles.map(path => (
          <button
            key={path}
            onClick={() => onFileSelect(path)}
            className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
              activeFile === path ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <File className="w-4 h-4 mr-2 text-gray-400" />
            {path}
          </button>
        ))}
      </div>
    </div>
  );
}

function FolderNode({ name, files, activeFile, onFileSelect }: {
  name: string;
  files: string[];
  activeFile: string;
  onFileSelect: (path: string) => void
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-md"
      >
        {isOpen ? <ChevronDown className="w-4 h-4 mr-1 text-gray-400" /> : <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />}
        <Folder className="w-4 h-4 mr-2 text-blue-400 fill-blue-400" />
        {name}
      </button>
      {isOpen && (
        <div className="ml-4 pl-2 border-l border-gray-200">
          {files.map(path => (
            <button
              key={path}
              onClick={() => onFileSelect(path)}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
                activeFile === path ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <File className="w-4 h-4 mr-2 text-gray-400" />
              {path.split("/").pop()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
