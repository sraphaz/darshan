/**
 * Tipos do módulo financeiro.
 */

export type AiUsageProvider = "openai" | "anthropic" | "gemini";
export type UsageMode = "now" | "question" | "personal_map";

export interface AiUsageEntry {
  userId: string;
  provider: AiUsageProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  costBrl: number;
  creditsSpent: number;
  mode: UsageMode;
  questionLength: number;
  responseLength: number;
  success: boolean;
  safetyFlags?: string | null;
}
