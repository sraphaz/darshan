/**
 * Arquétipos e fórmulas para derivar arquétipo a partir do mapa (astrologia védica).
 * O dicionário associa signos lunares (Rashi) e nakshatras a arquétipos interpretativos.
 */

import type { ArchetypeEntry, RashiKey, NakshatraKey } from "./types";

/** Nomes em português dos 12 Rashis (signos sidereais) */
export const RASHI_NAMES: Record<RashiKey, string> = {
  mesha: "Áries (Mesha)",
  vrishabha: "Touro (Vrishabha)",
  mithuna: "Gêmeos (Mithuna)",
  karka: "Câncer (Karka)",
  simha: "Leão (Simha)",
  kanya: "Virgem (Kanya)",
  tula: "Libra (Tula)",
  vrischika: "Escorpião (Vrischika)",
  dhanu: "Sagitário (Dhanu)",
  makara: "Capricórnio (Makara)",
  kumbha: "Aquário (Kumbha)",
  mina: "Peixes (Mina)",
};

/** Os 27 Nakshatras (estações lunares) — lista de chaves para fórmulas */
export const NAKSHATRA_KEYS: NakshatraKey[] = [
  "ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu",
  "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta",
  "chitra", "swati", "vishakha", "anuradha", "jyestha", "mula", "purva-ashadha",
  "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadra",
  "uttara-bhadra", "revati",
];

export const ARCHETYPES: ArchetypeEntry[] = [
  {
    key: "pioneiro",
    name: "Pioneiro",
    shortDescription: "Iniciativa, coragem, novo começo.",
    moonRashi: ["mesha"],
    nakshatraHints: ["ashwini", "krittika"],
    formulationIds: ["f1", "f4", "f8"],
  },
  {
    key: "raiz",
    name: "Raiz",
    shortDescription: "Estabilidade, sensorial, Terra.",
    moonRashi: ["vrishabha"],
    nakshatraHints: ["rohini", "bharani"],
    formulationIds: ["f2", "f9", "f11"],
  },
  {
    key: "mensageiro",
    name: "Mensageiro",
    shortDescription: "Comunicação, curiosidade, dualidade.",
    moonRashi: ["mithuna"],
    nakshatraHints: ["ardra", "punarvasu"],
    formulationIds: ["f5", "f10", "f14"],
  },
  {
    key: "cuidador",
    name: "Cuidador",
    shortDescription: "Emoção, memória, nutrição.",
    moonRashi: ["karka"],
    nakshatraHints: ["pushya", "ashlesha"],
    formulationIds: ["f2", "f7", "f11"],
  },
  {
    key: "soberano",
    name: "Soberano",
    shortDescription: "Centro, coração, reconhecimento.",
    moonRashi: ["simha"],
    nakshatraHints: ["magha", "purva-phalguni"],
    formulationIds: ["f3", "f8", "f18"],
  },
  {
    key: "servidor",
    name: "Servidor",
    shortDescription: "Precisão, discernimento, serviço.",
    moonRashi: ["kanya"],
    nakshatraHints: ["hasta", "chitra"],
    formulationIds: ["f6", "f14", "f16"],
  },
  {
    key: "harmonizador",
    name: "Harmonizador",
    shortDescription: "Equilíbrio, relação, justiça.",
    moonRashi: ["tula"],
    nakshatraHints: ["swati", "vishakha"],
    formulationIds: ["f4", "f12", "f17"],
  },
  {
    key: "transformador",
    name: "Transformador",
    shortDescription: "Profundidade, morte-renascimento, poder.",
    moonRashi: ["vrischika"],
    nakshatraHints: ["anuradha", "jyestha"],
    formulationIds: ["f4", "f15", "f18"],
  },
  {
    key: "sabedor",
    name: "Sabedor",
    shortDescription: "Sentido, filosofia, expansão.",
    moonRashi: ["dhanu"],
    nakshatraHints: ["mula", "purva-ashadha"],
    formulationIds: ["f8", "f12", "f14"],
  },
  {
    key: "estruturador",
    name: "Estruturador",
    shortDescription: "Tempo, dever, realização.",
    moonRashi: ["makara"],
    nakshatraHints: ["uttara-ashadha", "shravana"],
    formulationIds: ["f1", "f9", "f13"],
  },
  {
    key: "visionario",
    name: "Visionário",
    shortDescription: "Liberdade, humanidade, futuro.",
    moonRashi: ["kumbha"],
    nakshatraHints: ["dhanishta", "shatabhisha"],
    formulationIds: ["f3", "f11", "f17"],
  },
  {
    key: "dissolvente",
    name: "Dissolvente",
    shortDescription: "Dissolução, devoção, entrega.",
    moonRashi: ["mina"],
    nakshatraHints: ["uttara-bhadra", "revati"],
    formulationIds: ["f6", "f12", "f15"],
  },
];

/** Mapeia Rashi (signo lunar) → arquétipo(s) principal(is) */
export function getArchetypeKeysByMoonRashi(moonRashi: RashiKey): string[] {
  const entry = ARCHETYPES.find((a) => a.moonRashi?.includes(moonRashi));
  return entry ? [entry.key] : [];
}

/** Mapeia Nakshatra → arquétipo(s) sugerido(s) */
export function getArchetypeKeysByNakshatra(nakshatra: NakshatraKey): string[] {
  return ARCHETYPES.filter((a) =>
    a.nakshatraHints?.some((n) => n === nakshatra)
  ).map((a) => a.key);
}

/** Dado um chart simplificado, retorna lista de arquétipos sugeridos */
export function getArchetypeKeysFromChart(chart: {
  moonRashi?: RashiKey;
  moonNakshatra?: NakshatraKey;
}): string[] {
  const keys = new Set<string>();
  if (chart.moonRashi) {
    getArchetypeKeysByMoonRashi(chart.moonRashi).forEach((k) => keys.add(k));
  }
  if (chart.moonNakshatra) {
    getArchetypeKeysByNakshatra(chart.moonNakshatra).forEach((k) => keys.add(k));
  }
  return Array.from(keys);
}
