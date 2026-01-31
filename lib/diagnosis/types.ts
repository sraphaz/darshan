/**
 * Tipos do diagnóstico consciente e da matriz de remédios sagrados (Darshan high-end).
 * Camada 1: Prakṛti (Jyotish). Camada 2: Sāṃkhya Guṇas (3). Camada 3: Ayurvedic Qualities (20).
 */

/** Guṇas Sāṃkhya — estado global da consciência (macro): clareza, movimento, inércia */
export type SamkhyaGuna = "sattva" | "rajas" | "tamas";

/** As 20 qualidades ayurvédicas (fenomenológicas): mente, corpo, alimento, clima, emoções */
export type AyurvedicQuality =
  | "guru" | "laghu"
  | "snigdha" | "ruksha"
  | "sita" | "ushna"
  | "manda" | "tikshna"
  | "sthira" | "chala"
  | "mridu" | "kathina"
  | "vishada" | "picchila"
  | "shlakshna" | "khara"
  | "sukshma" | "sthula"
  | "sandra" | "drava"
  | "sara";

/** Kleśas — obstáculos da mente (Yoga Sutras) */
export type KleshaKey = "avidya" | "asmita" | "raga" | "dvesha" | "abhinivesha" | null;

/** Prakṛti simbólica a partir do Jyotish (Lua + Nakshatra → dosha/elemento) */
export type PrakritiFromJyotish = {
  dosha?: string;   // "vata" | "pitta" | "kapha" | "vata-pitta" etc.
  element?: string; // "earth" | "water" | "fire" | "air" | "ether"
};

/** Estado macro Sāṃkhya (3 guṇas) — valores relativos 0–1 ou proporção */
export type SamkhyaGunas = {
  sattva: number;
  rajas: number;
  tamas: number;
};

/** Diagnóstico consciente completo — entrada do Sacred Remedy Engine */
export type ConsciousDiagnosis = {
  /** Kleśa dominante no momento */
  klesha: KleshaKey;
  /** Estado macro (céu interno) */
  samkhyaGunas: SamkhyaGunas;
  /** Qualidades em desequilíbrio (micro) — chaves das 20 qualidades ayurvédicas */
  ayurvedicQualities: {
    excess: AyurvedicQuality[] | string[];
    deficient: AyurvedicQuality[] | string[];
  };
  /** Constituição simbólica do mapa (base da pessoa) */
  prakritiFromJyotish?: PrakritiFromJyotish;
};

/** Referência a texto sagrado (corpus + id para resolução ou verso embutido) */
export type SacredRef = {
  corpus: string;
  id: string;
  verse?: string;
};

/** Uma entrada da matriz de remédios (30 estados) */
export type RemedyMatrixEntry = {
  state: string;
  klesha: KleshaKey;
  samkhyaGuna: SamkhyaGuna;
  qualities: string[];
  sacred: SacredRef;
  practice: string;
  food: string;
  question: string;
};
