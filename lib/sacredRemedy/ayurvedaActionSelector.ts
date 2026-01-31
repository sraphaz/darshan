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
  shlakshna: "ancorar: textura (caminhar descalço, toque em superfícies), firmeza no corpo",
  sthula: "refinar: respiração sutil, escuta interna, leveza na comida",
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
  shlakshna: "alimento com textura (raiz, fibra), quente e estável",
  sthula: "leve, digestivo, especiarias suaves",
};

/** Qualidade em excesso → sugestão de sono/descanso (antídoto) */
export const QUALITY_TO_SLEEP: Record<string, string> = {
  ruksha: "dormir cedo; quarto aquecido e um pouco úmido",
  chala: "horário fixo; sem telas 1h antes; pés no chão antes de deitar",
  tikshna: "ambiente fresco; jantar leve e cedo",
  ushna: "dormir antes da meia-noite; quarto ventilado",
  guru: "acordar cedo; movimento de manhã",
  manda: "evitar soneca longa; luz de manhã",
  sthira: "alongar antes de dormir; soltar agenda",
  picchila: "jantar leve; escovar língua",
  kathina: "ritual suave; óleo nos pés",
  khara: "hidratar; palavras gentis ao fim do dia",
  sukshma: "comida quente no jantar; corpo na cama",
  laghu: "jantar quente e grounding; rotina fixa",
  snigdha: "jantar leve; não exagerar",
  sita: "agasalho; bebida quente antes de dormir",
  mridu: "descanso sem culpa; não forçar",
  vishada: "jantar nutritivo; quarto aconchegante",
  sandra: "movimento de tarde; jantar com especiarias leves",
  drava: "jantar em horário fixo; rotina de sono",
  sara: "jantar quente e oleoso; respiração antes de dormir",
  shlakshna: "textura no quarto (tecido, peso); rotina",
  sthula: "ambiente leve; não comer pesado à noite",
};

/** Qualidade em excesso → sugestão de rotina diária mínima (antídoto) */
export const QUALITY_TO_ROUTINE: Record<string, string> = {
  ruksha: "oleação ao acordar; refeições em horários fixos",
  chala: "acordar e dormir no mesmo horário; 5 min de pé no chão",
  tikshna: "refrescar ao meio-dia; evitar pico de calor",
  ushna: "atividades pesadas no início da manhã; sombra à tarde",
  guru: "movimento logo cedo; evitar ficar parado",
  manda: "despertar com luz e movimento; pimenta no café da manhã",
  sthira: "alongar pela manhã; um compromisso solto por dia",
  picchila: "escovar língua ao acordar; refeições leves",
  kathina: "oleação; um gesto de compaixão por dia",
  khara: "hidratar; uma frase gentil por dia",
  sukshma: "café da manhã quente e denso; ancorar no corpo",
  laghu: "sopa ou raiz no almoço; ritual fixo 5 min",
  snigdha: "chá digestivo após refeições; não exceder",
  sita: "bebida quente pela manhã; um gesto de bondade",
  mridu: "pausas sem culpa; não encher a agenda",
  vishada: "refeições quentes e nutritivas; ambiente limpo",
  sandra: "especiarias no dia; movimento e fluido",
  drava: "refeições em horário fixo; rotina estável",
  sara: "respiração alternada 2 min; comida quente e oleosa",
  shlakshna: "caminhar descalço 2 min; textura nas refeições",
  sthula: "respiração sutil 2 min; refeições leves",
};

/**
 * Retorna estação do ano (hemisfério norte) para prioridade ayurvédica: winter, spring, summer, autumn.
 */
export function getSeasonFromDate(date: Date = new Date()): string {
  const m = date.getMonth() + 1;
  if (m >= 12 || m <= 2) return "winter";
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  return "autumn";
}

/**
 * Retorna período do dia (dinacharya simplificado) para prioridade ayurvédica.
 */
export function getHourPeriodFromDate(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 6 && h < 10) return "morning";
  if (h >= 10 && h < 14) return "midday";
  if (h >= 14 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  if (h >= 22 || h < 2) return "night";
  return "late_night";
}

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

/** Estação → dosha mais agravado (prioridade no antídoto: outono=vata, verão=pitta, inverno=kapha) */
const SEASON_DOSHA_AGGRAVATION: Record<string, string> = {
  autumn: "vata",
  fall: "vata",
  summer: "pitta",
  winter: "kapha",
  spring: "kapha", // início do ano ainda frio/úmido
};

/** Período do dia (hora) → dosha em destaque (dinacharya simplificado) */
const HOUR_PERIOD_DOSHA: Record<string, string> = {
  morning: "kapha",   // 6–10
  midday: "pitta",    // 10–14
  afternoon: "pitta",  // 14–18
  evening: "vata",    // 18–22
  night: "vata",      // 22–2
  late_night: "kapha", // 2–6
};

function orderByDosha(qualities: string[], dosha?: string, options: { season?: string; hour?: string } = {}): string[] {
  const set = new Set(qualities);
  const ordered: string[] = [];
  const seasonDosha = options.season ? SEASON_DOSHA_AGGRAVATION[options.season] : null;
  const hourDosha = options.hour ? HOUR_PERIOD_DOSHA[options.hour] : null;
  const priorityDoshas = [seasonDosha, hourDosha, dosha].filter(Boolean) as string[];
  const seen = new Set<string>();
  for (const d of priorityDoshas) {
    const priority = DOSHA_QUALITIES_PRIORITY[d];
    if (!priority) continue;
    for (const p of priority) {
      if (set.has(p) && !seen.has(p)) {
        ordered.push(p);
        seen.add(p);
      }
    }
  }
  for (const q of qualities) {
    if (!seen.has(q)) ordered.push(q);
  }
  return ordered;
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

export type GetActionsWithDoshaOptions = {
  maxSuggestions?: number;
  /** Extensão futura: prioridade por estação (vata=outono, pitta=verão, kapha=inverno) */
  season?: string;
  /** Extensão futura: hora do dia para ajuste fino */
  hour?: string;
};

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

export type FullActionsResult = { practice: string; food: string; sleep?: string; routine?: string };

/**
 * Ayurveda high-end completo: practice, food, sleep e routine por qualities + dosha.
 * Útil para UI premium que exibe sono e rotina diária.
 */
export function getFullActionsForQualitiesWithDosha(
  qualities: (AyurvedicQuality | string)[],
  dosha?: string,
  options: GetActionsWithDoshaOptions = {}
): FullActionsResult {
  const base = getActionsForQualitiesWithDosha(qualities, dosha, options);
  const ordered = orderByDosha(qualities.filter(Boolean).map(String), dosha, {
    season: options.season,
    hour: options.hour,
  });
  const sleepParts: string[] = [];
  const routineParts: string[] = [];
  for (const q of ordered) {
    const s = QUALITY_TO_SLEEP[q]?.trim();
    const r = QUALITY_TO_ROUTINE[q]?.trim();
    if (s && !sleepParts.includes(s)) sleepParts.push(s);
    if (r && !routineParts.includes(r)) routineParts.push(r);
    if (sleepParts.length >= 2 && routineParts.length >= 2) break;
  }
  const result: FullActionsResult = { practice: base.practice, food: base.food };
  if (sleepParts.length) result.sleep = sleepParts.slice(0, 2).join(". ");
  if (routineParts.length) result.routine = routineParts.slice(0, 2).join(". ");
  return result;
}
