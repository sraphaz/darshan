/**
 * Sacred Remedy — Diagnosis Engine.
 * diagnosisUniversal() sem perfil; diagnosisPersonal(map) com perfil. Seleção dirigida + anti-repetição.
 */

import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { ARCHETYPE_TO_GUNA } from "@/lib/knowledge/classicTexts";
import type { UserProfileForOracle } from "@/lib/knowledge/types";
import type { SymbolicMap } from "@/lib/symbolic/types";
import type {
  ConsciousDiagnosis,
  RemedyMatrixEntry,
  SamkhyaGuna,
  PrakritiFromJyotish,
  AyurvedicQuality,
  NumerologyFromMap,
  KleshaKey,
} from "./types";

import remedyMatrixJson from "@/lib/dictionaries/remedyMatrix.json";

const REMEDY_MATRIX: RemedyMatrixEntry[] = remedyMatrixJson as RemedyMatrixEntry[];

const RASHI_TO_DOSHA: Record<string, string> = {
  mesha: "pitta", vrishabha: "kapha", mithuna: "vata", karka: "kapha",
  simha: "pitta", kanya: "vata", tula: "vata", vrischika: "pitta",
  dhanu: "pitta", makara: "kapha", kumbha: "vata", mina: "kapha",
};

const RASHI_TO_ELEMENT: Record<string, string> = {
  mesha: "fire", vrishabha: "earth", mithuna: "air", karka: "water",
  simha: "fire", kanya: "earth", tula: "air", vrischika: "water",
  dhanu: "fire", makara: "earth", kumbha: "air", mina: "water",
};

/** Dosha → qualidades tipicamente em excesso (Ayurveda); usadas para enriquecer diagnóstico a partir do mapa */
const DOSHA_TO_QUALITIES_EXCESS: Record<string, AyurvedicQuality[]> = {
  vata: ["ruksha", "laghu", "chala", "sukshma", "sara"],
  pitta: ["ushna", "tikshna", "drava"],
  kapha: ["guru", "snigdha", "manda", "sthira", "sandra"],
};

/** Nakshatra → klesha provável (tendência psicológica) — refina diagnóstico personal */
const NAKSHATRA_KLESHA_TENDENCY: Record<string, KleshaKey> = {
  ashwini: "abhinivesha",
  bharani: "raga",
  krittika: "dvesha",
  rohini: "raga",
  mrigashira: "avidya",
  ardra: "dvesha",
  punarvasu: "raga",
  pushya: "avidya",
  ashlesha: "asmita",
  magha: "asmita",
  "purva-phalguni": "raga",
  "uttara-phalguni": "raga",
  hasta: "avidya",
  chitra: "asmita",
  swati: "raga",
  vishakha: "dvesha",
  anuradha: "raga",
  jyestha: "asmita",
  mula: "abhinivesha",
  "purva-ashadha": "raga",
  "uttara-ashadha": "asmita",
  shravana: "avidya",
  dhanishta: "asmita",
  shatabhisha: "abhinivesha",
  "purva-bhadra": "dvesha",
  "uttara-bhadra": "abhinivesha",
  revati: "avidya",
};

export function getRemedyMatrix(): RemedyMatrixEntry[] {
  return REMEDY_MATRIX;
}

function getPrakritiFromMap(map: SymbolicMap): PrakritiFromJyotish {
  const rashi = map.jyotish?.moonRashi ?? "mesha";
  return {
    dosha: RASHI_TO_DOSHA[rashi] ?? "vata",
    element: RASHI_TO_ELEMENT[rashi] ?? "air",
  };
}

function getDominantSamkhyaGuna(map: SymbolicMap): SamkhyaGuna {
  const primary = map.archetypes?.primary ?? map.jyotish?.archetypeKey ?? "dissolvente";
  const guna = ARCHETYPE_TO_GUNA[primary];
  return (guna ?? "tamas") as SamkhyaGuna;
}

function remedyToDiagnosis(
  remedy: RemedyMatrixEntry,
  prakriti?: PrakritiFromJyotish,
  numerologyFromMap?: NumerologyFromMap
): ConsciousDiagnosis {
  const g = remedy.samkhyaGuna;
  const sattva = g === "sattva" ? 0.6 : 0.2;
  const rajas = g === "rajas" ? 0.6 : 0.2;
  const tamas = g === "tamas" ? 0.6 : 0.2;
  const excessFromRemedy = (remedy.qualities ?? []) as AyurvedicQuality[];
  const excessFromDosha = prakriti?.dosha ? DOSHA_TO_QUALITIES_EXCESS[prakriti.dosha] ?? [] : [];
  const excess = [...new Set([...excessFromRemedy, ...excessFromDosha])];
  const out: ConsciousDiagnosis = {
    klesha: remedy.klesha,
    samkhyaGunas: { sattva, rajas, tamas },
    ayurvedicQualities: { excess, deficient: [] },
    prakritiFromJyotish: prakriti,
    stateKey: remedy.state,
  };
  if (numerologyFromMap && (numerologyFromMap.lifePath != null || numerologyFromMap.soulUrge != null)) {
    out.numerologyFromMap = numerologyFromMap;
  }
  return out;
}

/**
 * Diagnóstico universal (sem perfil). Escolhe um estado da matriz por seed; evita recentIds.
 * Se preferredStateKey for informado e existir na matriz, usa esse estado.
 */
export function diagnosisUniversal(options: {
  seed?: number;
  recentStateKeys?: string[];
  preferredStateKey?: string;
} = {}): ConsciousDiagnosis {
  const { seed = 0, recentStateKeys = [], preferredStateKey } = options;
  if (preferredStateKey) {
    const found = REMEDY_MATRIX.find((e) => e.state === preferredStateKey);
    if (found) return remedyToDiagnosis(found);
  }
  const avoid = new Set(recentStateKeys);
  const pool = avoid.size > 0
    ? REMEDY_MATRIX.filter((e) => !avoid.has(e.state))
    : REMEDY_MATRIX;
  const candidates = pool.length > 0 ? pool : REMEDY_MATRIX;
  const idx = Math.abs(Math.floor(seed)) % candidates.length;
  const remedy = candidates[idx] ?? candidates[0];
  return remedyToDiagnosis(remedy);
}

/**
 * Diagnóstico personalizado (com mapa). Filtra por guna dominante; seed influenciado por numerologia (lifePath, soulUrge).
 * Se preferredStateKey for informado e existir na matriz, usa esse estado (com prakriti/numerologia do mapa).
 */
export function diagnosisPersonal(
  profile: UserProfileForOracle,
  options: { seed?: number; recentStateKeys?: string[]; preferredStateKey?: string } = {}
): ConsciousDiagnosis {
  const { seed = 0, recentStateKeys = [], preferredStateKey } = options;
  const map = buildSymbolicMap(profile);
  const prakriti = getPrakritiFromMap(map);
  const lifePath = map.numerology?.lifePathNumber ?? 0;
  const soulUrge = map.numerology?.soulUrgeNumber ?? 0;
  const numerologyFromMap: NumerologyFromMap = {
    lifePath: lifePath || undefined,
    soulUrge: soulUrge || undefined,
    expression: map.numerology?.expressionNumber ?? undefined,
    personality: map.numerology?.personalityNumber ?? undefined,
  };
  if (preferredStateKey) {
    const found = REMEDY_MATRIX.find((e) => e.state === preferredStateKey);
    if (found) return remedyToDiagnosis(found, prakriti, numerologyFromMap);
  }
  const dominantGuna = getDominantSamkhyaGuna(map);
  const effectiveSeed = seed + (lifePath || 0) * 31 + (soulUrge || 0);
  const avoid = new Set(recentStateKeys);
  const byGuna = REMEDY_MATRIX.filter((e) => e.samkhyaGuna === dominantGuna);
  let pool = byGuna.length > 0 ? byGuna : REMEDY_MATRIX;
  const nakshatra = map.jyotish?.nakshatra ?? "";
  const nakshatraKlesha = nakshatra ? NAKSHATRA_KLESHA_TENDENCY[nakshatra] : null;
  if (nakshatraKlesha) {
    const byNakshatra = pool.filter((e) => e.klesha === nakshatraKlesha);
    if (byNakshatra.length > 0) pool = byNakshatra;
  }
  const preferred = pool.filter((e) => !avoid.has(e.state));
  const candidates = preferred.length > 0 ? preferred : pool;
  const idx = Math.abs(Math.floor(effectiveSeed)) % candidates.length;
  const remedy = candidates[idx] ?? candidates[0];
  return remedyToDiagnosis(remedy, prakriti, numerologyFromMap);
}

/**
 * Retorna a entrada da matriz de remédios correspondente ao diagnóstico (por stateKey ou por klesha+guna).
 */
export function getRemedyForDiagnosis(
  diagnosis: ConsciousDiagnosis,
  options: { seed?: number } = {}
): RemedyMatrixEntry {
  if (diagnosis.stateKey) {
    const found = REMEDY_MATRIX.find((e) => e.state === diagnosis.stateKey);
    if (found) return found;
  }
  const byKlesha = diagnosis.klesha
    ? REMEDY_MATRIX.filter((e) => e.klesha === diagnosis.klesha)
    : REMEDY_MATRIX;
  const pool = byKlesha.length > 0 ? byKlesha : REMEDY_MATRIX;
  const idx = Math.abs(Math.floor(options.seed ?? 0)) % pool.length;
  return pool[idx] ?? pool[0];
}
