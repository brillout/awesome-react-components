"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Layout, Code, Eye, Download, Settings, Github } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import FileTree from "@/components/FileTree";
import CodeViewer from "@/components/CodeViewer";
import PreviewPane from "@/components/PreviewPane";

interface FileNode {
  path: string;
  content: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Initialize Project ID if not exists
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
        setProjectId(hash);
        loadProject(hash);
    } else if (!projectId) {
      const newId = uuidv4();
      setProjectId(newId);
      window.location.hash = newId;
    }
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    } else {
        setShowKeyInput(true);
    }
  }, []);

  const loadProject = async (id: string) => {
    setIsLoading(true);
    try {
        const res = await fetch(`/api/project/${id}`);
        const data = await res.json();
        if (data.files) {
            setFiles(data.files);
            setMessages(data.messages);
            if (data.files.length > 0) {
                setActiveFile(data.files[0].path);
            }
        }
    } catch (e) {
        console.error("Failed to load project", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setShowKeyInput(false);
  };

  const handleSendMessage = async (prompt: string) => {
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setIsLoading(true);
    const newMessage: Message = { role: "user", content: prompt };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({
          prompt,
          history,
          currentFiles: files,
          projectId
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiResponse = data.result;
      setFiles(aiResponse.files);
      if (aiResponse.files.length > 0 && !activeFile) {
        setActiveFile(aiResponse.files[0].path);
      }

      setMessages([...updatedMessages, { role: "ai", content: `Built project: ${aiResponse.projectName}` }]);
      setViewMode("preview");
    } catch (error: any) {
      console.error(error);
      setMessages([...updatedMessages, { role: "ai", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/download?projectId=${projectId}`;
  };

  const selectedFileContent = files.find(f => f.path === activeFile)?.content || "";

  return (
    <main className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* API Key Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Gemini API Key Required
            </h2>
            <p className="text-gray-600 text-sm mb-4">
                Enter your Gemini 1.5 Pro API Key to start building. It will be stored locally in your browser.
            </p>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
                onClick={() => handleSaveApiKey(apiKey)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Start Building
            </button>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Builder</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode("preview")}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === "preview" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                </button>
                <button
                    onClick={() => setViewMode("code")}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === "code" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <Code className="w-4 h-4 mr-2" />
                    Code
                </button>
            </div>
            <button
                onClick={handleDownload}
                disabled={files.length === 0}
                className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP
            </button>
            <button
                onClick={() => setShowKeyInput(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
                <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Tree */}
          <div className="w-64 flex-shrink-0">
            <FileTree
                files={files}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
            />
          </div>

          {/* Editor/Preview Area */}
          <div className="flex-1 min-w-0">
            {viewMode === "code" ? (
              <CodeViewer code={selectedFileContent} filename={activeFile} />
            ) : (
              <PreviewPane projectId={projectId} />
            )}
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 flex-shrink-0">
        <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
        />
      </div>
    </main>
  );
}
