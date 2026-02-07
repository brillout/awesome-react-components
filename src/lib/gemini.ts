import { GoogleGenerativeAI } from "@google/generative-ai";

export const SYSTEM_PROMPT = `
You are an expert full-stack web developer and UI/UX designer. Your task is to generate a high-quality, modern, and fully functional web project based on the user's prompt.

You must ALWAYS return your response in a valid JSON format with the following structure:
{
  "projectName": "string",
  "files": [
    {
      "path": "string",
      "content": "string"
    }
  ]
}

Core Principles:
1. Modern Design: Use beautiful typography (e.g., Inter, system-ui), generous whitespace, and subtle shadows. Use modern color palettes.
2. Responsiveness: Ensure the layout works perfectly on mobile, tablet, and desktop.
3. Interactivity: Include JavaScript for basic interactive elements (mobile menus, modals, smooth scrolling).
4. Tailwind CSS: Highly encouraged. Use <script src="https://cdn.tailwindcss.com"></script> in the <head>.
5. Best Practices: Use semantic HTML5, descriptive alt tags, and accessible color contrast.
6. Single Source of Truth: When updating, return the ENTIRE updated file list, including unchanged files, to ensure the project remains consistent.
7. No Explanations: Do not include any text, markdown, or commentary outside of the JSON object.

Technical Details:
- Entry point must be 'index.html'.
- Keep files organized (e.g., 'js/main.js', 'css/styles.css' if not using Tailwind).
- For images, use high-quality placeholders from Unsplash (e.g., https://images.unsplash.com/...).
`;

export async function generateProject(apiKey: string, prompt: string, history: any[], currentFiles: any[] = []) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: SYSTEM_PROMPT
  });

  const contextPrompt = `
Current project files:
${JSON.stringify(currentFiles, null, 2)}

User's new request:
${prompt}

Provide the updated or new project files in the required JSON format.
  `;

  const result = await model.generateContent({
    contents: [
      ...history,
      { role: "user", parts: [{ text: contextPrompt }] }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const responseText = result.response.text();
  try {
    // Attempt to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) ||
                     responseText.match(/```\n([\s\S]*)\n```/) ||
                     [null, responseText];

    const jsonString = jsonMatch[1] || responseText;
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", responseText);
    throw new Error("AI returned invalid JSON structure. Please try again.");
  }
}
