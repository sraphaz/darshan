/**
 * Sacred Remedy — Instant Light Composer.
 * Texto sagrado dirigido (sutra/purana) + insight (se personal) + prática ayurvédica + pergunta final.
 * Motor medicinal offline; não quebra /api/darshan.
 */

import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { getGeneral } from "@/lib/readings/symbolicReadings";
import {
  diagnosisUniversal,
  diagnosisPersonal,
  getRemedyForDiagnosis,
} from "./diagnosisEngine";
import { selectSacredText } from "./sacredSelector";
import type { UserProfileForOracle } from "@/lib/knowledge/types";
import type { InstantLightResponse } from "./types";

/** Seed diário para rotação */
function getDailySeed(): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return y * 10000 + m * 100 + d;
}

export type ComposeInstantLightOptions = {
  seed?: number;
  recentSacredIds?: string[];
  recentStateKeys?: string[];
};

/**
 * Compõe a resposta Instant Light (Sacred Remedy Engine).
 * - Com perfil: diagnosisPersonal → sacredSelector(klesha, qualities) → insight do mapa + prática + pergunta.
 * - Sem perfil: diagnosisUniversal → sacredSelector → prática + pergunta.
 */
export function composeInstantLight(
  profile?: UserProfileForOracle | null,
  options: ComposeInstantLightOptions = {}
): InstantLightResponse {
  const {
    seed,
    recentSacredIds = [],
    recentStateKeys = [],
  } = options;
  const dailySeed = getDailySeed();
  const effectiveSeed = seed ?? dailySeed * 1000 + (Date.now() % 1000);

  const hasProfile = Boolean(
    profile && ((profile.fullName ?? "").trim() || (profile.birthDate ?? "").trim())
  );

  const diagnosis = hasProfile && profile
    ? diagnosisPersonal(profile, { seed: effectiveSeed, recentStateKeys })
    : diagnosisUniversal({ seed: effectiveSeed, recentStateKeys });

  const remedy = getRemedyForDiagnosis(diagnosis, { seed: effectiveSeed });

  const sacredEntry = selectSacredText({
    kleshaTargets: diagnosis.klesha ? [diagnosis.klesha] : [],
    qualities: diagnosis.ayurvedicQualities.excess,
    avoidIds: recentSacredIds,
    seed: effectiveSeed,
  });

  const sacredText = sacredEntry?.text?.trim() || remedy.sacred?.verse?.trim() || remedy.sacred?.id || "";
  const sacredId = sacredEntry ? `${sacredEntry.corpus}.${sacredEntry.id}` : `${remedy.sacred?.corpus ?? "remedy"}.${remedy.sacred?.id ?? remedy.state}`;

  const result: InstantLightResponse = {
    sacredText,
    practice: remedy.practice?.trim() || "",
    question: remedy.question?.trim() || "O que em você já sabe?",
    sacredId,
    stateKey: diagnosis.stateKey ?? remedy.state,
  };

  if (hasProfile && profile) {
    const map = buildSymbolicMap(profile);
    const insight = getGeneral(map);
    if (insight?.trim()) result.insight = insight.trim();
  }

  return result;
}
