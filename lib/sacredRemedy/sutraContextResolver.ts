/**
 * Sutra Context Resolver — entrega bloco completo quando o sutra referencia o verso anterior.
 * Evita fragmentos sem contexto ("Por isso...") e permite exibir: verso contexto + sutra medicinal.
 */

import yogaSutrasFullJson from "@/lib/dictionaries/sacred/yoga_sutras_full.json";

type SutraEntry = { id: string; text: string; kleshaTargets?: string[]; qualities?: string[] };
const YOGA_SUTRAS = yogaSutrasFullJson as SutraEntry[];

export type SutraContextResult = {
  /** Verso anterior (contexto), quando existe e o sutra se beneficia de contexto */
  prev?: { id: string; text: string };
  /** Sutra principal selecionado */
  primary: { id: string; text: string };
  /** Verso seguinte (para thread mode futuro) */
  next?: { id: string; text: string };
};

/**
 * Resolve contexto sequencial para um sutra por id.
 * Deriva prev/next pela ordem no corpus (YS.1.1, YS.1.2, ...).
 * Inclui prev quando o sutra não é o primeiro do capítulo (verso > 1), para evitar "Por isso..." sem referência.
 */
export function resolveSutraContext(sutraId: string): SutraContextResult | null {
  const idx = YOGA_SUTRAS.findIndex((e) => e.id === sutraId);
  if (idx < 0) return null;
  const primary = YOGA_SUTRAS[idx];
  const prevEntry = idx > 0 ? YOGA_SUTRAS[idx - 1] : undefined;
  const nextEntry = idx < YOGA_SUTRAS.length - 1 ? YOGA_SUTRAS[idx + 1] : undefined;
  return {
    prev: prevEntry ? { id: prevEntry.id, text: (prevEntry.text ?? "").trim() } : undefined,
    primary: { id: primary.id, text: (primary.text ?? "").trim() },
    next: nextEntry ? { id: nextEntry.id, text: (nextEntry.text ?? "").trim() } : undefined,
  };
}

/**
 * Indica se o sutra deve ser exibido com verso anterior (contexto).
 * Por padrão: todo sutra que não é o primeiro (índice > 0) pode ter contexto.
 * Entradas com context.requiresPrev no corpus podem ser usadas no futuro.
 */
export function shouldIncludePrevContext(sutraId: string): boolean {
  const idx = YOGA_SUTRAS.findIndex((e) => e.id === sutraId);
  return idx > 0;
}
