/**
 * Estimativa de custo por provedor e tokens.
 * Valores por 1M tokens (USD). USD→BRL configurável ou via API (com cache).
 */

export type CostProvider = "openai" | "anthropic" | "gemini";

export interface CostRates {
  inputPer1M: number;
  outputPer1M: number;
}

const DEFAULT_RATES: Record<CostProvider, CostRates> = {
  openai: { inputPer1M: 0.15, outputPer1M: 0.6 },
  anthropic: { inputPer1M: 3, outputPer1M: 15 },
  gemini: { inputPer1M: 0.35, outputPer1M: 0.53 },
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DOLAR_API_URL = "https://br.dolarapi.com/v1/cotacoes/usd";

let usdToBrl = 5.0;
let cacheExpiresAt = 0;

export function setUsdToBrl(rate: number): void {
  usdToBrl = Math.max(0.01, rate);
}

export function getUsdToBrl(): number {
  return usdToBrl;
}

/**
 * Atualiza a cotação USD→BRL via API (DolarAPI) só se o cache expirou.
 * Chame antes de estimateCost quando quiser cotação atualizada.
 * Em erro ou API indisponível, mantém o valor atual (ou 5.0).
 */
export async function refreshUsdToBrlCache(): Promise<number> {
  if (Date.now() < cacheExpiresAt) return usdToBrl;
  try {
    const res = await fetch(DOLAR_API_URL, { cache: "no-store" });
    if (!res.ok) return usdToBrl;
    const data = (await res.json()) as { compra?: number; venda?: number };
    const compra = Number(data.compra);
    const venda = Number(data.venda);
    if (Number.isFinite(compra) && Number.isFinite(venda)) {
      usdToBrl = (compra + venda) / 2;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }
  } catch {
    // mantém usdToBrl atual
  }
  return usdToBrl;
}

/**
 * Estima custo em USD e BRL para uma chamada.
 */
export function estimateCost(
  provider: CostProvider,
  inputTokens: number,
  outputTokens: number
): { costUsd: number; costBrl: number } {
  const rates = DEFAULT_RATES[provider] ?? DEFAULT_RATES.openai;
  const inputUsd = (inputTokens / 1_000_000) * rates.inputPer1M;
  const outputUsd = (outputTokens / 1_000_000) * rates.outputPer1M;
  const costUsd = inputUsd + outputUsd;
  const costBrl = costUsd * usdToBrl;
  return {
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
    costBrl: Math.round(costBrl * 1_000_000) / 1_000_000,
  };
}

export function getRates(): Record<CostProvider, CostRates> {
  return { ...DEFAULT_RATES };
}
