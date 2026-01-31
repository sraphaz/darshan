/**
 * Sacred Remedy Engine — tipos canônicos.
 * Diagnóstico consciente (klesha, samkhya, qualidades) + corpus sagrado taggeado + matriz de remédios.
 */

/** Guṇas Sāṃkhya — estado global da consciência */
export type SamkhyaGuna = "sattva" | "rajas" | "tamas";

/** Kleśas — obstáculos da mente (Yoga Sutras) */
export type KleshaKey = "avidya" | "asmita" | "raga" | "dvesha" | "abhinivesha" | null;

/** As 20 qualidades ayurvédicas (10 pares) — mente, corpo, alimento, clima, emoções */
export type AyurvedicQuality =
  | "guru"   | "laghu"   // pesado | leve
  | "snigdha"| "ruksha"  // oleoso | seco
  | "sita"   | "ushna"   // frio | quente (usna)
  | "manda"  | "tikshna" // lento/obtuso | agudo
  | "sthira" | "chala"   // estável | móvel
  | "mridu"  | "kathina" // suave | duro
  | "vishada"| "picchila"// claro/limpo | pegajoso
  | "shlakshna"| "khara" // liso | áspero
  | "sukshma"| "sthula"  // sutil | grosso
  | "sandra" | "drava"   // denso | fluido
  | "sara";              // fluido/móvel (complementar)

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
  /** Qualidades em excesso e em deficiência (20 gunas ayurvédicas) */
  ayurvedicQualities: { excess: AyurvedicQuality[]; deficient: AyurvedicQuality[] };
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

/** Entrada da matriz de remédios (50 estados) */
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
  /** Recomendação alimentar simples (Ayurveda) */
  food?: string;
  question: string;
  sacredId?: string;
  stateKey?: string;
};
