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
      model: "gemini-1.5-flash",
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
