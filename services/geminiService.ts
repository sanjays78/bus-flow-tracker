
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') return null;

  if (!ai) {
    ai = new GoogleGenAI(apiKey);
  }
  return ai;
};

export const getTravelTip = async (source: string, destination: string) => {
  try {
    const aiInstance = getAI();
    if (!aiInstance) return null;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: `Give a very short (max 2 sentences) travel tip for someone traveling from ${source} to ${destination} by bus. Mention best time to travel or a key landmark.` }] }],
    });

    // Note: The structure of response might vary based on @google/genai version
    // For ^1.38.0 it should be response.response.text()
    return response.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
