import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  // We'll allow it to be missing during build if necessary, but it's required for runtime
  console.warn('DATABASE_URL is not set. Database features will not work.');
}

export const sql = neon(process.env.DATABASE_URL || "");

export interface Project {
  id: string;
  name: string;
  created_at?: Date;
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface DBMessage {
  role: string;
  content: string;
}

export async function saveProject(projectId: string, name: string, files: ProjectFile[], messages: DBMessage[]) {
  // Insert or update project
  await sql`
    INSERT INTO projects (id, name)
    VALUES (${projectId}, ${name})
    ON CONFLICT (id) DO UPDATE SET name = ${name}
  `;

  // Upsert files
  for (const file of files) {
    await sql`
      INSERT INTO files (project_id, path, content)
      VALUES (${projectId}, ${file.path}, ${file.content})
      ON CONFLICT (project_id, path) DO UPDATE SET content = ${file.content}
    `;
  }

  // Save latest messages (we just insert new ones for simplicity in this MVP)
  // Clear old messages and re-insert or just append. Let's re-insert for state sync.
  await sql`DELETE FROM messages WHERE project_id = ${projectId}`;
  for (const msg of messages) {
      await sql`
        INSERT INTO messages (project_id, role, content)
        VALUES (${projectId}, ${msg.role}, ${msg.content})
      `;
  }
}

export async function getProjectMessages(projectId: string): Promise<DBMessage[]> {
    const result = await sql`
      SELECT role, content FROM messages WHERE project_id = ${projectId} ORDER BY id ASC
    `;
    return result as DBMessage[];
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const result = await sql`
    SELECT path, content FROM files WHERE project_id = ${projectId}
  `;
  return result as ProjectFile[];
}

export async function getFileContent(projectId: string, filePath: string): Promise<string | null> {
  const result = await sql`
    SELECT content FROM files WHERE project_id = ${projectId} AND path = ${filePath}
    LIMIT 1
  `;
  return result.length > 0 ? result[0].content : null;
}
