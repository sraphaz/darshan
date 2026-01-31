/**
 * Diagnosis Engine — detecta estado dominante via SymbolicMap + heurísticas e seleciona
 * entrada da matriz de remédios (Sacred Remedy Matrix). Nunca aleatório puro; usa cooldown/histórico.
 */

import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { ARCHETYPE_TO_GUNA } from "@/lib/knowledge/classicTexts";
import type { UserProfileForOracle } from "@/lib/knowledge/types";
import type { SymbolicMap } from "@/lib/symbolic/types";
import type { RemedyMatrixEntry, SamkhyaGuna, ConsciousDiagnosis, PrakritiFromJyotish } from "./types";

import remedyMatrixJson from "@/lib/dictionaries/remedyMatrix.json";

const REMEDY_MATRIX: RemedyMatrixEntry[] = remedyMatrixJson as RemedyMatrixEntry[];

/** Rashi → tendência dosha (simplificado para prakriti simbólica) */
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

/** Deriva prakriti simbólica (dosha/elemento) do mapa Jyotish */
export function getPrakritiFromMap(map: SymbolicMap): PrakritiFromJyotish {
  const rashi = map.jyotish?.moonRashi ?? "mesha";
  return {
    dosha: RASHI_TO_DOSHA[rashi] ?? "vata",
    element: RASHI_TO_ELEMENT[rashi] ?? "air",
  };
}

/** Dominante Sāṃkhya do mapa (arquétipo → guna) */
export function getDominantSamkhyaGuna(map: SymbolicMap): SamkhyaGuna {
  const primary = map.archetypes?.primary ?? map.jyotish?.archetypeKey ?? "dissolvente";
  const guna = ARCHETYPE_TO_GUNA[primary];
  return (guna ?? "tamas") as SamkhyaGuna;
}

/**
 * Monta diagnóstico consciente a partir do mapa e da entrada de remédio selecionada.
 */
export function buildDiagnosisFromMapAndRemedy(
  map: SymbolicMap,
  remedy: RemedyMatrixEntry
): ConsciousDiagnosis {
  const prakriti = getPrakritiFromMap(map);
  const dominant = getDominantSamkhyaGuna(map);
  const sattva = dominant === "sattva" ? 0.6 : 0.2;
  const rajas = dominant === "rajas" ? 0.6 : 0.2;
  const tamas = dominant === "tamas" ? 0.6 : 0.2;
  return {
    klesha: remedy.klesha,
    samkhyaGunas: { sattva, rajas, tamas },
    ayurvedicQualities: {
      excess: remedy.qualities ?? [],
      deficient: [],
    },
    prakritiFromJyotish: prakriti,
  };
}

export type SelectRemedyOptions = {
  /** Seed para escolha determinística */
  seed?: number;
  /** IDs de textos sagrados recentes (evitar repetição) */
  recentSacredIds?: string[];
};

/**
 * Seleciona uma entrada da matriz de remédios.
 * Com perfil: filtra por guna dominante do mapa e evita recentSacredIds; escolha por seed.
 * Sem perfil: escolhe entre todas por seed, evitando recentSacredIds.
 */
export function selectRemedy(
  profile: UserProfileForOracle | undefined,
  options: SelectRemedyOptions = {}
): RemedyMatrixEntry {
  const { seed = 0, recentSacredIds = [] } = options;
  const avoidSet = new Set(recentSacredIds);

  let pool = REMEDY_MATRIX;
  if (profile?.birthDate || profile?.fullName) {
    const map = buildSymbolicMap(profile as UserProfileForOracle);
    const dominantGuna = getDominantSamkhyaGuna(map);
    const byGuna = REMEDY_MATRIX.filter((e) => e.samkhyaGuna === dominantGuna);
    if (byGuna.length > 0) pool = byGuna;
  }

  const preferred = pool.filter((e) => {
    const sacredId = e.sacred?.id ?? e.state;
    return !avoidSet.has(sacredId);
  });
  const candidates = preferred.length > 0 ? preferred : pool;
  const idx = Math.abs(Math.floor(seed)) % candidates.length;
  return candidates[idx] ?? candidates[0];
}
