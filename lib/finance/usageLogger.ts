/**
 * Registro de uso de IA em ai_usage_log (Supabase).
 * Se Supabase não estiver configurado, não grava (silencioso).
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AiUsageEntry } from "./types";

export interface LogUsageOptions {
  /** user_id na tabela users (UUID). Se não tiver, insere por email e usa o id retornado. */
  userTableId?: string;
  /** Email do usuário; usado para obter/criar user_id se userTableId não for passado. */
  userEmail: string;
}

/**
 * Grava um registro em ai_usage_log.
 * user_id: se userTableId for passado, usa; senão busca/cria por userEmail e usa o id.
 */
export async function logAiUsage(
  entry: Omit<AiUsageEntry, "userId">,
  options: LogUsageOptions
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return null;

  let userId = options.userTableId;
  if (!userId && options.userEmail) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", options.userEmail)
      .single();
    if (user) userId = user.id;
    else {
      const { data: inserted } = await supabase
        .from("users")
        .insert({
          email: options.userEmail,
          credits_balance: 0,
          plan: "free",
        })
        .select("id")
        .single();
      userId = inserted?.id ?? undefined;
    }
  }
  if (!userId) return null;

  const row = {
    user_id: userId,
    provider: entry.provider,
    model: entry.model,
    input_tokens: entry.inputTokens,
    output_tokens: entry.outputTokens,
    total_tokens: entry.totalTokens,
    cost_usd: entry.costUsd,
    cost_brl: entry.costBrl,
    credits_spent: entry.creditsSpent,
    mode: entry.mode,
    question_length: entry.questionLength,
    response_length: entry.responseLength,
    success: entry.success,
    safety_flags: entry.safetyFlags ?? null,
  };

  const { data, error } = await supabase
    .from("ai_usage_log")
    .insert(row)
    .select("id")
    .single();

  if (error) return null;
  return data?.id ?? null;
}

/**
 * Conta quantas requisições de IA o usuário fez hoje (UTC).
 * Usado para limite diário. Sem Supabase retorna 0.
 */
export async function getTodayAiRequestCount(userEmail: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return 0;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .single();
  if (!user?.id) return 0;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const iso = todayStart.toISOString();

  const { count, error } = await supabase
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", iso);

  if (error) return 0;
  return typeof count === "number" ? count : 0;
}
