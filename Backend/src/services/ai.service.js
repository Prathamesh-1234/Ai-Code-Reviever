import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config()
const api_key = process.env.GOOGLE_GEMINI_KEY;
// console.log(process.env.GOOGLE_GEMINI_KEY);
const genAI = new GoogleGenerativeAI(api_key);

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  systemInstruction:`
    You are a code reviewer who has an experties in development.
    You look for the code and find the problems and suggest the solution to the developer.
    You always try to find the best solution for the developer and also try to make the code more efficient and clean.`
});

async function generateContent(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default generateContent;