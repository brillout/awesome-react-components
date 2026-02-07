import { NextRequest, NextResponse } from "next/server";
import { generateProject } from "@/lib/gemini";
import { saveProject } from "@/lib/db";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-gemini-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 401 });
    }

    const { prompt, history, currentFiles, projectId } = await req.json();

    const result = await generateProject(apiKey, prompt, history, currentFiles);

    // Save to Neon Database for persistence
    try {
        const fullHistory = [...history, { role: "user", parts: [{ text: prompt }] }, { role: "model", parts: [{ text: `Built project: ${result.projectName}` }] }];
        const dbMessages = fullHistory.map(h => ({
            role: h.role,
            content: h.parts[0].text
        }));
        await saveProject(projectId, result.projectName, result.files, dbMessages);
    } catch (dbError) {
        console.error("Failed to save to database:", dbError);
        // We continue anyway as we have the result and local storage fallback
    }

    // Save to temp workspace
    const tempDir = path.join(os.tmpdir(), "ai-builder", projectId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write files to disk for preview
    result.files.forEach((file: { path: string; content: string }) => {
      // Security check: prevent path traversal
      const resolvedPath = path.resolve(tempDir, file.path);
      if (!resolvedPath.startsWith(tempDir)) {
          console.warn(`Prevented path traversal attempt: ${file.path}`);
          return;
      }

      const dirPath = path.dirname(resolvedPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, file.content);
    });

    return NextResponse.json({ result, projectId });
  } catch (error: any) {
    console.error("API Generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
