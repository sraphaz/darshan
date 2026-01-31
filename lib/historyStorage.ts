/**
 * Armazenamento de histórico: respostas (orb) e leituras.
 * Usa Supabase; se não configurado, as funções não fazem nada (silencioso).
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type RevelationRow = {
  id: string;
  user_id: string;
  question_text: string | null;
  response_text: string;
  created_at: string;
};

export type ReadingRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

/** Obtém user_id pelo email (apenas busca; não cria usuário). */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();
  return data?.id ?? null;
}

/** Salva uma revelação (resposta do orb) para o usuário. */
export async function saveRevelation(
  userEmail: string,
  payload: { questionText?: string | null; responseText: string }
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return null;
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return null;
  const { data, error } = await supabase
    .from("revelations")
    .insert({
      user_id: userId,
      question_text: payload.questionText?.trim() || null,
      response_text: payload.responseText.trim().slice(0, 50000),
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

/** Salva uma leitura (mapa pessoal) para o usuário. */
export async function saveReading(userEmail: string, content: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return null;
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return null;
  const { data, error } = await supabase
    .from("readings")
    .insert({
      user_id: userId,
      content: content.trim().slice(0, 100000),
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

/** Lista revelações do usuário (mais recentes primeiro). */
export async function listRevelations(
  userEmail: string,
  options: { limit?: number; offset?: number } = {}
): Promise<RevelationRow[]> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return [];
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return [];
  const limit = Math.min(Math.max(1, options.limit ?? 50), 100);
  const offset = Math.max(0, options.offset ?? 0);
  const { data } = await supabase
    .from("revelations")
    .select("id, user_id, question_text, response_text, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []) as RevelationRow[];
}

/** Lista leituras do usuário (mais recentes primeiro). */
export async function listReadings(
  userEmail: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ReadingRow[]> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return [];
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return [];
  const limit = Math.min(Math.max(1, options.limit ?? 50), 100);
  const offset = Math.max(0, options.offset ?? 0);
  const { data } = await supabase
    .from("readings")
    .select("id, user_id, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []) as ReadingRow[];
}

/** Conta revelações e leituras do usuário (para exibir ícone quando > 0). */
export async function getHistoryCounts(userEmail: string): Promise<{ revelations: number; readings: number }> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return { revelations: 0, readings: 0 };
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return { revelations: 0, readings: 0 };
  const [rev, read] = await Promise.all([
    supabase.from("revelations").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("readings").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  return {
    revelations: rev.count ?? 0,
    readings: read.count ?? 0,
  };
}

/** Cooldown server-side: retorna sacredIds e stateKeys recentes do usuário (evitar repetição). */
export async function getRecentInstantLightIds(
  userEmail: string,
  limit: number = 20
): Promise<{ sacredIds: string[]; stateKeys: string[] }> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return { sacredIds: [], stateKeys: [] };
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return { sacredIds: [], stateKeys: [] };
  const cap = Math.min(Math.max(1, limit), 50);
  const { data } = await supabase
    .from("instant_light_uses")
    .select("sacred_id, state_key")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(cap);
  const rows = (data ?? []) as { sacred_id: string; state_key: string | null }[];
  return {
    sacredIds: rows.map((r) => r.sacred_id).filter(Boolean),
    stateKeys: rows.map((r) => r.state_key).filter((k): k is string => Boolean(k)),
  };
}

/** Cooldown server-side: registra uso de sacredId/stateKey para o usuário (recordUse automático). */
export async function recordInstantLightUse(
  userEmail: string,
  payload: { sacredId: string; stateKey?: string }
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) return;
  const userId = await getUserIdByEmail(userEmail);
  if (!userId) return;
  await supabase.from("instant_light_uses").insert({
    user_id: userId,
    sacred_id: payload.sacredId?.trim() || "",
    state_key: payload.stateKey?.trim() || null,
  });
}
