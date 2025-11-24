import { ScanResult, ToolType } from "../types";
import { SYSTEM_INSTRUCTION, getPromptForTool } from "../constants";

// We no longer import @google/genai here to avoid browser-side bundle errors.
// The logic has been moved to api/generate.ts

export const runOsintScan = async (
  tool: ToolType, 
  target: string
): Promise<ScanResult> => {
  
  const prompt = getPromptForTool(tool, target);

  try {
    // Call the serverless function instead of the SDK directly
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        toolType: tool
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data.text || "No intelligence gathered. Target may be elusive.";
    
    // Process grounding chunks returned from the server
    const groundingChunks = data.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || "Source",
        uri: chunk.web.uri
      }));

    // Remove duplicates based on URI
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values());

    return {
      id: crypto.randomUUID(),
      tool,
      target,
      timestamp: Date.now(),
      rawOutput: textOutput,
      sources: uniqueSources as { title: string; uri: string }[]
    };

  } catch (error) {
    console.error("OSINT Scan Failed:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error during scan");
  }
};