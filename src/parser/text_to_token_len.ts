import { GoogleGenerativeAI } from "@google/generative-ai";

async function getTokenCount(text: string): Promise<number> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  // Count tokens in a prompt without calling text generation.
  const tokenCount = await model.countTokens(text);
  return tokenCount.totalTokens;
}

export { getTokenCount };
