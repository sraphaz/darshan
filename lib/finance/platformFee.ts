/**
 * Taxa da plataforma (margem) — configurável por ambiente.
 * Usada em descrições, relatórios e meta de custo IA vs faturamento.
 * Ver docs/PRECIFICACAO_CREDITOS.md.
 */

const ENV_KEY = "PLATFORM_FEE_PERCENT";
const DEFAULT_PERCENT = 30;
const MIN = 0;
const MAX = 100;

/**
 * Retorna a taxa da plataforma em percentual (0–100).
 * Lê PLATFORM_FEE_PERCENT; se inválido ou ausente, usa 30.
 */
export function getPlatformFeePercent(): number {
  const raw = process.env[ENV_KEY];
  if (raw === undefined || raw === "") return DEFAULT_PERCENT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_PERCENT;
  return Math.max(MIN, Math.min(MAX, Math.round(n)));
}

/**
 * Taxa como decimal (ex.: 0.30 para 30%). Útil para cálculos.
 */
export function getPlatformFeeDecimal(): number {
  return getPlatformFeePercent() / 100;
}
