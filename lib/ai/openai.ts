import OpenAI from "openai";
import type { AIConnector } from "./types";

function createClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export function createOpenAIConnector(): AIConnector | null {
  const client = createClient();
  if (!client) return null;

  return {
    id: "openai",
    name: "OpenAI (GPT)",
    async complete(systemPrompt: string, userContent: string) {
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.85,
      });
      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      const usage = completion.usage
        ? {
            input_tokens: completion.usage.prompt_tokens ?? 0,
            output_tokens: completion.usage.completion_tokens ?? 0,
          }
        : undefined;
      return { text: raw, usage };
    },
  };
}
