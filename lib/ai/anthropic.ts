import Anthropic from "@anthropic-ai/sdk";
import type { AIConnector } from "./types";

function createClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

export function createAnthropicConnector(): AIConnector | null {
  const client = createClient();
  if (!client) return null;

  return {
    id: "anthropic",
    name: "Anthropic (Claude)",
    async complete(systemPrompt: string, userContent: string) {
      const message = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      });
      const block = message.content.find((b) => b.type === "text");
      const raw = block && "text" in block ? block.text.trim() : "";
      const usage = message.usage
        ? {
            input_tokens: message.usage.input_tokens ?? 0,
            output_tokens: message.usage.output_tokens ?? 0,
          }
        : undefined;
      return { text: raw ?? "", usage };
    },
  };
}
