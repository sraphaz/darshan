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
