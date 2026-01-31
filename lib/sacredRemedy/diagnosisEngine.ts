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

function remedyToDiagnosis(remedy: RemedyMatrixEntry, prakriti?: PrakritiFromJyotish): ConsciousDiagnosis {
  const g = remedy.samkhyaGuna;
  const sattva = g === "sattva" ? 0.6 : 0.2;
  const rajas = g === "rajas" ? 0.6 : 0.2;
  const tamas = g === "tamas" ? 0.6 : 0.2;
  return {
    klesha: remedy.klesha,
    samkhyaGunas: { sattva, rajas, tamas },
    ayurvedicQualities: { excess: remedy.qualities ?? [], deficient: [] },
    prakritiFromJyotish: prakriti,
    stateKey: remedy.state,
  };
}

/**
 * Diagnóstico universal (sem perfil). Escolhe um estado da matriz por seed; evita recentIds.
 */
export function diagnosisUniversal(options: { seed?: number; recentStateKeys?: string[] } = {}): ConsciousDiagnosis {
  const { seed = 0, recentStateKeys = [] } = options;
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
 * Diagnóstico personalizado (com mapa). Filtra por guna dominante do mapa; escolhe por seed; evita recentIds.
 */
export function diagnosisPersonal(
  profile: UserProfileForOracle,
  options: { seed?: number; recentStateKeys?: string[] } = {}
): ConsciousDiagnosis {
  const { seed = 0, recentStateKeys = [] } = options;
  const map = buildSymbolicMap(profile);
  const dominantGuna = getDominantSamkhyaGuna(map);
  const prakriti = getPrakritiFromMap(map);
  const avoid = new Set(recentStateKeys);
  const byGuna = REMEDY_MATRIX.filter((e) => e.samkhyaGuna === dominantGuna);
  const pool = byGuna.length > 0 ? byGuna : REMEDY_MATRIX;
  const preferred = pool.filter((e) => !avoid.has(e.state));
  const candidates = preferred.length > 0 ? preferred : pool;
  const idx = Math.abs(Math.floor(seed)) % candidates.length;
  const remedy = candidates[idx] ?? candidates[0];
  return remedyToDiagnosis(remedy, prakriti);
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
