"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  filename: string;
}

export default function CodeViewer({ code, filename }: CodeViewerProps) {
  const language = filename.split(".").pop() || "javascript";

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="px-4 py-2 bg-[#252526] text-gray-400 text-sm border-b border-[#3e3e3e]">
        {filename}
      </div>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "14px",
            height: "100%",
            backgroundColor: "transparent",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
