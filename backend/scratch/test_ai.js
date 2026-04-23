import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

async function test() {
  try {
    const prompt = "Hello, respond with a JSON object saying {'status': 'ok'}";
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    console.log("Response structure:", Object.keys(response));
    console.log("Text property:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
