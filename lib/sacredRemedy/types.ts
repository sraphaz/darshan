/**
 * Sacred Remedy Engine — tipos canônicos.
 * Diagnóstico consciente (klesha, samkhya, qualidades) + corpus sagrado taggeado + matriz de remédios.
 */

/** Guṇas Sāṃkhya — estado global da consciência */
export type SamkhyaGuna = "sattva" | "rajas" | "tamas";

/** Kleśas — obstáculos da mente (Yoga Sutras) */
export type KleshaKey = "avidya" | "asmita" | "raga" | "dvesha" | "abhinivesha" | null;

/** Qualidades ayurvédicas (20) — fenomenológicas */
export type AyurvedicQuality = string;

/** Prakṛti simbólica (Jyotish) */
export type PrakritiFromJyotish = {
  dosha?: string;
  element?: string;
};

export type SamkhyaGunas = {
  sattva: number;
  rajas: number;
  tamas: number;
};

/** Diagnóstico consciente — entrada do motor de remédio */
export type ConsciousDiagnosis = {
  klesha: KleshaKey;
  samkhyaGunas: SamkhyaGunas;
  ayurvedicQualities: { excess: string[]; deficient: string[] };
  prakritiFromJyotish?: PrakritiFromJyotish;
  /** Estado da matriz usado (ex.: anxiety, lethargy) */
  stateKey?: string;
};

/** Entrada do corpus sagrado (dictionaries/sacred/*.json) — taggeada por klesha e qualidades */
export type SacredCorpusEntry = {
  id: string;
  text: string;
  /** Kleśas que este texto ajuda a equilibrar */
  kleshaTargets?: string[];
  /** Qualidades ayurvédicas associadas */
  qualities?: string[];
};

/** Entrada da matriz de remédios (30 estados) */
export type RemedyMatrixEntry = {
  state: string;
  klesha: KleshaKey;
  samkhyaGuna: SamkhyaGuna;
  qualities: string[];
  sacred: { corpus: string; id: string; verse?: string };
  practice: string;
  food: string;
  question: string;
};

/** Resposta do Instant Light (GET /api/instant-light) */
export type InstantLightResponse = {
  sacredText: string;
  insight?: string;
  practice: string;
  question: string;
  sacredId?: string;
  stateKey?: string;
};
