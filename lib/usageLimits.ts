/**
 * Limites de consumo de IA: rate limit (req/min) e limite diário (respostas/dia).
 * Ver docs/PRECIFICACAO_CREDITOS.md.
 */

import { getTodayAiRequestCount } from "@/lib/finance/usageLogger";
import { isSupabaseConfigured } from "@/lib/supabase";

const ENV_RATE = "RATE_LIMIT_PER_MINUTE";
const ENV_DAILY = "DAILY_AI_LIMIT";
const DEFAULT_RATE = 5;
const DEFAULT_DAILY = 30;
const WINDOW_MS = 60 * 1000; // 1 minuto

/** Timestamps das últimas requisições por chave (email). */
const rateWindow = new Map<string, number[]>();

/** Contagem in-memory por dia (quando Supabase não está configurado). key = email, value = { date: YYYY-MM-DD, count } */
const dailyCountByKey = new Map<string, { date: string; count: number }>();

function getRateLimit(): number {
  const raw = process.env[ENV_RATE];
  if (raw === undefined || raw === "") return DEFAULT_RATE;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_RATE;
}

function getDailyLimit(): number {
  const raw = process.env[ENV_DAILY];
  if (raw === undefined || raw === "") return DEFAULT_DAILY;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DAILY;
}

function todayUtcKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function pruneOldTimestamps(now: number, list: number[]): number[] {
  const cutoff = now - WINDOW_MS;
  return list.filter((t) => t > cutoff);
}

/**
 * Verifica e registra rate limit (requisições por minuto).
 * Retorna true se permitido; false se excedeu. 0 = desativado (sempre true).
 */
export function checkAndRecordRateLimit(key: string): boolean {
  const limit = getRateLimit();
  if (limit === 0) return true;

  const now = Date.now();
  let list = rateWindow.get(key) ?? [];
  list = pruneOldTimestamps(now, list);
  if (list.length >= limit) {
    return false;
  }
  list.push(now);
  rateWindow.set(key, list);
  return true;
}

export function getRateLimitConfig(): { perMinute: number } {
  return { perMinute: getRateLimit() };
}

export function getDailyLimitConfig(): number {
  return getDailyLimit();
}

/**
 * Retorna a contagem in-memory de requisições hoje (usado quando Supabase não está configurado).
 */
function getTodayCountInMemory(key: string): number {
  const today = todayUtcKey();
  const entry = dailyCountByKey.get(key);
  if (!entry || entry.date !== today) return 0;
  return entry.count;
}

/**
 * Incrementa a contagem diária in-memory. Chamar após uma requisição de IA bem-sucedida
 * apenas quando Supabase não está configurado (senão o count vem de ai_usage_log).
 */
export function recordDailyRequest(key: string): void {
  if (isSupabaseConfigured()) return;
  const today = todayUtcKey();
  const entry = dailyCountByKey.get(key);
  if (!entry || entry.date !== today) {
    dailyCountByKey.set(key, { date: today, count: 1 });
    return;
  }
  entry.count += 1;
}

export interface DailyLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

/**
 * Verifica o limite diário (respostas/dia). Com Supabase usa ai_usage_log; sem Supabase usa contagem in-memory.
 * limit 0 = desativado (sempre allowed).
 */
export async function checkDailyLimit(key: string): Promise<DailyLimitResult> {
  const limit = getDailyLimit();
  if (limit === 0) {
    return { allowed: true, count: 0, limit: 0 };
  }

  const count = isSupabaseConfigured()
    ? await getTodayAiRequestCount(key)
    : getTodayCountInMemory(key);

  return {
    allowed: count < limit,
    count,
    limit,
  };
}
