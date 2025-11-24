import { GoogleGenAI } from "@google/genai";

export default async function handler(request, response) {
  // Handle CORS preflight if necessary (Vercel usually handles this, but good practice)
  if (request.method === 'OPTIONS') {
    return response.status(200).send('OK');
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction } = request.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("Server Error: API_KEY is missing");
      return response.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Execute the scan on the server side
    // We use the same model configuration as previously defined in the client
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      }
    });

    const text = result.text || "No intelligence gathered.";
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return response.status(200).json({
      text,
      groundingChunks
    });

  } catch (error) {
    console.error("API Error:", error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    });
  }
}