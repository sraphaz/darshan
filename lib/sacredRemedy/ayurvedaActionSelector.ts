/**
 * Ayurveda Action Selector — práticas e alimentos concretos por qualidade ayurvédica.
 * Texto cura mente; prática cura qualidade; alimento ancora no corpo.
 */

import type { AyurvedicQuality } from "./types";

/** Qualidade em excesso → prática mínima recomendada (antídoto) */
export const QUALITY_TO_PRACTICE: Record<string, string> = {
  ruksha: "oleação: óleo na pele ou nas narinas (2 gotas)",
  chala: "grounding: pés no chão 2 min ou caminhada lenta",
  tikshna: "cooling: respiração lunar ou água fria no rosto",
  ushna: "refrescar: bebida à temperatura ambiente, sombra",
  guru: "movimento leve: caminhada curta ou alongamento suave",
  manda: "estimular: pimenta preta, calor, movimento agora",
  sthira: "soltar: alongar, soltar um plano hoje",
  picchila: "limpar: gargarejo, escovar língua, leveza na comida",
  kathina: "suavizar: óleos, calor úmido, compaixão",
  khara: "suavizar: hidratar, palavras gentis",
  sukshma: "ancorar: comida densa e quente, corpo no presente",
  laghu: "grounding: raiz, sopa, ritual fixo 5 min",
  snigdha: "leveza digestiva: chá digestivo, não exceder",
  sita: "aquecer: bebida quente, gesto de bondade",
  mridu: "contenção suave: descanso, não forçar",
  vishada: "nutrir: comida quente e nutritiva",
  sandra: "fluir: especiarias, movimento, fluido",
  drava: "estabilizar: raiz assada, rotina",
  sara: "estabilizar: quente e oleoso, respiração alternada",
  shlakshna: "—",
  sthula: "—",
};

/** Qualidade em excesso → sugestão alimentar simples (antídoto) */
export const QUALITY_TO_FOOD: Record<string, string> = {
  ruksha: "ghee, sopa quente, oleação",
  chala: "raiz, sopa, comida quente",
  tikshna: "coco, hortelã, cooling",
  ushna: "coco, hortelã, doce natural",
  guru: "pimenta preta, gengibre, calor",
  manda: "pimenta preta, calor, leve",
  sthira: "óleos, suavizante",
  picchila: "especiarias leves, digestivo",
  kathina: "óleos, quente",
  khara: "suavizante, hidratante",
  sukshma: "comida densa e quente",
  laghu: "grounding (raiz), quente",
  snigdha: "chá leve digestivo",
  sita: "quente, reconfortante",
  mridu: "nutritivo, descanso",
  vishada: "nutritivo e quente",
  sandra: "especiarias, fluido",
  drava: "raiz assada, estável",
  sara: "quente e oleoso",
  shlakshna: "—",
  sthula: "—",
};

/**
 * Retorna prática sugerida para a qualidade em excesso (primeira da lista ou fallback).
 */
export function getPracticeForQuality(quality: AyurvedicQuality | string): string {
  return QUALITY_TO_PRACTICE[quality] ?? "";
}

/**
 * Retorna sugestão alimentar para a qualidade em excesso.
 */
export function getFoodForQuality(quality: AyurvedicQuality | string): string {
  return QUALITY_TO_FOOD[quality] ?? "";
}

/** Dosha → qualidades tipicamente em excesso (prioridade no antídoto) */
const DOSHA_QUALITIES_PRIORITY: Record<string, string[]> = {
  vata: ["ruksha", "laghu", "chala", "sukshma", "sara"],
  pitta: ["ushna", "tikshna", "drava"],
  kapha: ["guru", "snigdha", "manda", "sthira", "sandra"],
};

function orderByDosha(qualities: string[], dosha?: string): string[] {
  if (!dosha || !DOSHA_QUALITIES_PRIORITY[dosha]) return qualities;
  const priority = DOSHA_QUALITIES_PRIORITY[dosha];
  const set = new Set(qualities);
  const first: string[] = [];
  for (const p of priority) {
    if (set.has(p)) first.push(p);
  }
  const rest = qualities.filter((q) => !priority.includes(q));
  return [...first, ...rest];
}

/**
 * Dado uma lista de qualidades em excesso, retorna práticas e alimentos concretos.
 * Prioriza a primeira qualidade; pode combinar até 2 sugestões.
 */
export function getActionsForQualities(qualities: (AyurvedicQuality | string)[]): {
  practice: string;
  food: string;
} {
  const q = qualities.filter(Boolean);
  const practice = q.map((x) => QUALITY_TO_PRACTICE[x]).filter(Boolean)[0] ?? "";
  const food = q.map((x) => QUALITY_TO_FOOD[x]).filter(Boolean)[0] ?? "";
  return { practice, food };
}

export type GetActionsWithDoshaOptions = { maxSuggestions?: number };

/**
 * High-end: múltiplas qualities, prioridade por dosha. Combina até maxSuggestions antídotos (default 3).
 */
export function getActionsForQualitiesWithDosha(
  qualities: (AyurvedicQuality | string)[],
  dosha?: string,
  options: GetActionsWithDoshaOptions = {}
): { practice: string; food: string } {
  const max = Math.min(5, Math.max(1, options.maxSuggestions ?? 3));
  const ordered = orderByDosha(qualities.filter(Boolean).map(String), dosha);
  const practices: string[] = [];
  const foods: string[] = [];
  for (const q of ordered) {
    const p = QUALITY_TO_PRACTICE[q]?.trim();
    const f = QUALITY_TO_FOOD[q]?.trim();
    if (p && p !== "—" && !practices.includes(p)) practices.push(p);
    if (f && f !== "—" && !foods.includes(f)) foods.push(f);
    if (practices.length >= max && foods.length >= max) break;
  }
  const practice = practices.slice(0, max).join(". ").trim() || "";
  const food = foods.slice(0, max).join("; ").trim() || "";
  return { practice, food };
}
