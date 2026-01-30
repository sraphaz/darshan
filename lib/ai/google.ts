import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIConnector } from "./types";

function createClient(): GoogleGenerativeAI | null {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export function createGoogleConnector(): AIConnector | null {
  const client = createClient();
  if (!client) return null;

  return {
    id: "google",
    name: "Google (Gemini)",
    async complete(systemPrompt: string, userContent: string) {
      const model = client.getGenerativeModel({
        model: process.env.GOOGLE_MODEL ?? "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.85,
        },
      });
      const fullPrompt = `${systemPrompt}\n\n---\n\n${userContent}`;
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const raw = typeof response.text === "function" ? response.text() : response.text;
      const text = (raw && typeof raw === "string" ? raw : "").trim();
      const meta = (response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }).usageMetadata;
      const usage = meta
        ? {
            input_tokens: meta.promptTokenCount ?? 0,
            output_tokens: meta.candidatesTokenCount ?? (meta.totalTokenCount ?? 0) - (meta.promptTokenCount ?? 0),
          }
        : undefined;
      return { text, usage };
    },
  };
}
