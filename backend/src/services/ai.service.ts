import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const getAIScore = async (
  task: any,
  volunteer: any,
  distance: number,
) => {
  try {
    const prompt = `
You are an AI system assigning volunteers.

Task:
- Title: ${task.title}
- Skills Required: ${task.requiredSkills.join(", ")}

Volunteer:
- Skills: ${volunteer.skills.join(", ")}
- Available: ${volunteer.availability}
- Distance: ${distance.toFixed(2)} km

IMPORTANT:
Closer volunteers should be preferred.

Return JSON:
{
  "score": number (0.0 to 1.0),
  "reason": "short explanation within one or two lines, including distance"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;

    const cleaned = text?.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned!);
  } catch (error: any) {
    console.warn(`[AI Service Warning]: Failed to fetch AI score (${error.status || 'API Error'}). Using fallback matching.`);

    return {
      score: 1,
      reason: "Fallback: basic matching",
    };
  }
};

export const extractTaskFromText = async (text: string) => {
  try {
    const prompt = `
You are an Emergency Dispatch AI capable of understanding all languages (English, Hindi, etc.). 
Extract operational task details from the following raw report. 
If the report is in a language other than English, TRANSLATE it and provide the results in English.

Report: "${text}"

Required JSON Schema:
{
  "title": "Short, clear mission title (max 5-7 words)",
  "description": "Professional summary of the emergency mission",
  "priority": "low" | "medium" | "high",
  "volunteersNeeded": number (integer),
  "requiredSkills": string[] (Choose from: Medical, Rescue, Logistics, Food, Shelter, Translation, Driving),
  "address": "Extracted location address if found, otherwise empty string"
}

If details are missing, use best judgment based on the situation. Return ONLY the JSON block. Do not include any other text or markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const resultText = response?.text || "";
    
    if (!resultText) {
      const safetyBlock = response?.candidates?.[0]?.finishReason;
      console.error("[AI Service Error]: Incomplete response from Gemini API", response);
      throw new Error(safetyBlock === "SAFETY" ? "Report contains sensitive content that AI cannot process." : "AI could not process this report. Please fill manually.");
    }

    const cleaned = resultText.replace(/```json|```/g, "").trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.error("[AI Service Error]: Failed to parse JSON from AI", cleaned);
      throw new Error("AI returned an invalid format. Please try again or fill manually.");
    }
  } catch (error: any) {
    console.error(`[AI Triage Error]:`, error.message || error);
    throw new Error(error.message || "Failed to analyze emergency report with AI");
  }
};
