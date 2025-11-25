import { GoogleGenAI } from "@google/genai";

export default async function handler(request, response) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).send('OK');
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction } = request.body;
    
    // Use the environment variable name you specified
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Server Error: GEMINI_API_KEY is missing in environment variables.");
      return response.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        // The 'tools' line is omitted to resolve the Vercel 10s timeout.
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
  }
}
  }
}
