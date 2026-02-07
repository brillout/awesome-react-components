import { NextRequest, NextResponse } from "next/server";
import { getProjectFiles } from "@/lib/db";
import fs from "fs";
import path from "path";
import os from "os";
import JSZip from "jszip";

export async function GET(
  req: NextRequest,
) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const tempBase = path.join(os.tmpdir(), "ai-builder");
  const projectDir = path.resolve(tempBase, projectId);

  // Security check
  if (!projectDir.startsWith(tempBase)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const zip = new JSZip();

  if (!fs.existsSync(projectDir)) {
    // Try Neon Database
    try {
        const files = await getProjectFiles(projectId);
        if (files.length === 0) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        files.forEach(file => {
            zip.file(file.path, file.content);
        });
    } catch (dbError) {
        console.error("DB Fetch Error:", dbError);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
  } else {
    function addFilesToZip(dir: string, zipFolder: JSZip) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            addFilesToZip(filePath, zipFolder.folder(file)!);
          } else {
            const content = fs.readFileSync(filePath);
            zipFolder.file(file, content);
          }
        });
      }

      addFilesToZip(projectDir, zip);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectId}.zip"`,
    },
  });
}
