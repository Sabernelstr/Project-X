import { GoogleGenAI } from "@google/genai";
import { ScanResult, ToolType } from "../types";
import { SYSTEM_INSTRUCTION, getPromptForTool } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const runOsintScan = async (
  tool: ToolType, 
  target: string
): Promise<ScanResult> => {
  
  const modelId = 'gemini-2.5-flash'; 
  const prompt = getPromptForTool(tool, target);

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], 
        temperature: 0.3, // Lower temperature for more factual/analytical output
      }
    });

    const textOutput = response.text || "No intelligence gathered. Target may be elusive.";
    
    // Extract grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
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