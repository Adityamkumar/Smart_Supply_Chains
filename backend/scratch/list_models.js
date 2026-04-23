import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function listModels() {
  try {
    const listResponse = await ai.models.list();
    // In @google/genai, the response is an array-like object but might need to be converted
    console.log("Names:");
    for (let i = 0; i < listResponse.length; i++) {
        const m = listResponse[i];
        if (m.name.includes("gemini")) {
            console.log(m.name);
        }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
