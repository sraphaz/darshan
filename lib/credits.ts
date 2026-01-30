/**
 * Créditos de IA — 1 crédito = 1 resposta com IA (modo ritual).
 * Planos Fibonacci: muito acessíveis, primeiro plano < R$10.
 * Ver docs/PRECIFICACAO_CREDITOS.md.
 */

const CREDITS_COOKIE = "darshan_credits";

/** 1 consulta (modo ritual, curto) = 1 crédito. Aprofundar = +1; imagem/sigil = +1. */
export const CREDITS_PER_AI_REQUEST = 1;

/** Mapa pessoal: resumo completo (Jyotish + numerologia + arquétipos) = 9 créditos. */
export const CREDITS_PER_PERSONAL_MAP = 9;

/** Modos de revelação para multiplicador de créditos (doc: ritual=1, longo=2, longo+imagem=3). */
export type RevelationMode = "ritual" | "long" | "long_image";

/** Créditos por modo. ritual=1, longo (aprofundar)=2, longo+imagem/sigil=3. */
export function getCreditsForRevelation(mode: RevelationMode): number {
  return mode === "ritual" ? 1 : mode === "long" ? 2 : 3;
}

/** Pacotes de créditos. Preço em centavos (BRL). */
export const CREDIT_PACKAGES = [
  { id: "13", amount: 13, priceCents: 890, label: "13 créditos" },
  { id: "21", amount: 21, priceCents: 1390, label: "21 créditos" },
  { id: "34", amount: 34, priceCents: 2190, label: "34 créditos" },
  { id: "55", amount: 55, priceCents: 3490, label: "55 créditos" },
  { id: "89", amount: 89, priceCents: 5590, label: "89 créditos" },
] as const;

export function formatPriceBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function getCreditsFromCookie(cookieHeader: string | null): number {
  if (!cookieHeader) return 0;
  const match = cookieHeader.match(new RegExp(`${CREDITS_COOKIE}=([^;]+)`));
  const value = match?.[1];
  if (!value) return 0;
  const n = parseInt(decodeURIComponent(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function creditsCookieHeader(balance: number): string {
  const n = Math.max(0, Math.floor(balance));
  return `${CREDITS_COOKIE}=${n}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
}

export function clearCreditsCookieHeader(): string {
  return `${CREDITS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
