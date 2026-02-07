# Personal AI Software Builder (MVP)

A web-based application that generates full web projects from natural language prompts using Gemini 1.5 Pro.

## Features
- **Prompt-to-App**: Create landing pages, tools, and websites with simple text.
- **Iterative Updates**: Refine your project with follow-up prompts.
- **File Explorer**: Browse the generated file structure.
- **Code Viewer**: Inspect the code with syntax highlighting.
- **Live Preview**: Real-time iframe preview of the generated project.
- **Download as ZIP**: Export your project for local use.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS 4, Lucide React.
- **Backend**: Next.js API Routes.
- **AI**: Gemini 1.5 Pro.
- **File Handling**: JSZip for project exports.

## How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Enter your API Key**:
   Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/) and enter it when prompted in the UI.

## Project Structure
- `src/app/page.tsx`: Main dashboard UI and state management.
- `src/app/api/generate/route.ts`: API for communicating with Gemini and saving files.
- `src/app/api/preview/[projectId]`: Serves files for the preview iframe.
- `src/app/api/download/route.ts`: Generates and serves project ZIP files.
- `src/lib/gemini.ts`: AI prompt templates and Gemini SDK integration.
- `src/components/`: Reusable UI components (Chat, FileTree, CodeViewer, etc.).

## AI Prompt Templates
The system uses a robust system prompt defined in `src/lib/gemini.ts` that enforces:
- Valid JSON output.
- Modern design principles (Tailwind, responsive design).
- Single source of truth (returning the full updated file list on every step).
- Use of high-quality placeholders (Unsplash).

## How to Extend
- **Next.js App Generation**: Currently, the system generates static HTML/CSS/JS. To support Next.js generation, the backend would need to trigger a build process or use a sandbox like WebContainer.
- **Authentication**: Add NextAuth.js or Clerk to save projects to a user profile.
- **Cloud Deployment**: Integrate with Vercel API or Netlify API to deploy the generated code with one click.
- **Database Persistence**: Already integrated with **Neon**. Every project and file is saved to Neon for long-term storage, enabling previews even after server restarts.
