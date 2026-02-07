"use client";

import { useState, useEffect } from "react";
import { RotateCcw, ExternalLink } from "lucide-react";

interface PreviewPaneProps {
  projectId: string;
}

export default function PreviewPane({ projectId }: PreviewPaneProps) {
  const [key, setKey] = useState(0);
  const previewUrl = `/api/preview/${projectId}/index.html`;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">Live Preview</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setKey(k => k + 1)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="flex-1 bg-white relative">
        {!projectId ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Generate a project to see the preview
          </div>
        ) : (
          <iframe
            key={`${projectId}-${key}`}
            src={previewUrl}
            className="w-full h-full border-none bg-white"
            title="Project Preview"
          />
        )}
      </div>
    </div>
  );
}
