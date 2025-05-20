import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Load API key from environment variable
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) throw new Error("Missing GOOGLE_API_KEY in environment variables");

export const gemini = new ChatGoogleGenerativeAI({
  apiKey,
  model: "gemini-2.0-flash-exp", // Use "gemini-pro" or other variants like "gemini-pro-vision"
  temperature: 0.7,
});
