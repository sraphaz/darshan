/**
 * Tipos do dicionário offline — base de conhecimento para o oráculo sem IA.
 * Permite interpretar perfil, mapa e pergunta usando apenas dados locais.
 */

export type UserProfileForOracle = {
  fullName?: string;
  birthDate?: string;   // YYYY-MM-DD
  birthPlace?: string;
  birthTime?: string;  // HH:mm
};

/** Chave de arquétipo derivada do mapa (signo lunar, nakshatra, etc.) */
export type ArchetypeKey = string;

/** Gunas — qualidades que afetam a consciência (sattva = clareza/equilíbrio, rajas = ação/movimento, tamas = inércia/repouso) */
export type Guna = "sattva" | "rajas" | "tamas";

/** Signo sidereal (Védico) — 12 Rashis */
export type RashiKey =
  | "mesha" | "vrishabha" | "mithuna" | "karka" | "simha" | "kanya"
  | "tula" | "vrischika" | "dhanu" | "makara" | "kumbha" | "mina";

/** Nakshatra (27 estações lunares) — chave abreviada */
export type NakshatraKey = string;

/** Resultado de cálculo védico simplificado (offline) */
export type VedicChartSimplified = {
  /** Signo solar sidereal aproximado */
  sunRashi?: RashiKey;
  /** Signo lunar sidereal aproximado (prioridade para interpretação) */
  moonRashi?: RashiKey;
  /** Nakshatra lunar aproximada */
  moonNakshatra?: NakshatraKey;
  /** Arquétipo(s) sugerido(s) pelas fórmulas internas */
  archetypeKeys: ArchetypeKey[];
};

/** Uma entrada do dicionário de formulações (frases internas) */
export type FormulationEntry = {
  id: string;
  text: string;
  /** Arquétipos com os quais combina (vazio = neutro) */
  archetypeHints?: ArchetypeKey[];
};

/** Afirmação contínua das Upanishads */
export type UpanishadEntry = {
  id: string;
  text: string;
  source?: string;  // ex: "Isha", "Kena", "Mundaka"
  archetypeHints?: ArchetypeKey[];
};

/** Definição de arquétipo + regras de associação ao mapa */
export type ArchetypeEntry = {
  key: ArchetypeKey;
  name: string;
  shortDescription: string;
  /** Signos lunares associados (Rashi) */
  moonRashi?: RashiKey[];
  /** Nakshatras associadas */
  nakshatraHints?: NakshatraKey[];
  /** Frases típicas deste arquétipo (ids ou texto) */
  formulationIds?: string[];
};
