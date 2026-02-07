import { NextRequest, NextResponse } from "next/server";
import { getProjectFiles, getProjectMessages } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const files = await getProjectFiles(id);
    const messages = await getProjectMessages(id);

    if (files.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Format messages back to frontend format
    const formattedMessages = messages.map(m => ({
        role: m.role === "user" ? "user" : "ai",
        content: m.content
    }));

    return NextResponse.json({ files, messages: formattedMessages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
