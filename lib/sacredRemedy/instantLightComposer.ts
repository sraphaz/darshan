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
import {
  getFullActionsForQualitiesWithDosha,
  getActionsForQualities,
  getSeasonFromDate,
  getHourPeriodFromDate,
} from "./ayurvedaActionSelector";
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

  const dosha = diagnosis.prakritiFromJyotish?.dosha;
  const hasQualities = diagnosis.ayurvedicQualities.excess.length > 0;
  const now = new Date();
  const ayurvedaOptions = {
    maxSuggestions: 3,
    season: getSeasonFromDate(now),
    hour: getHourPeriodFromDate(now),
  };
  const ayurvedaFull = dosha && hasQualities
    ? getFullActionsForQualitiesWithDosha(diagnosis.ayurvedicQualities.excess, dosha, ayurvedaOptions)
    : null;
  const ayurvedaFallback = hasQualities ? getActionsForQualities(diagnosis.ayurvedicQualities.excess) : { practice: "", food: "" };
  const practice = (ayurvedaFull?.practice ?? ayurvedaFallback.practice ?? remedy.practice ?? "").trim();
  const food = (ayurvedaFull?.food ?? ayurvedaFallback.food ?? remedy.food ?? "").trim();
  const sleep = ayurvedaFull?.sleep?.trim();
  const routine = ayurvedaFull?.routine?.trim();
  const question = (remedy.question || "O que em você já sabe?").trim();

  const result: InstantLightResponse = {
    sacredText,
    practice,
    question,
    sacredId,
    stateKey: diagnosis.stateKey ?? remedy.state,
  };
  if (food) result.food = food;
  if (sleep) result.sleep = sleep;
  if (routine) result.routine = routine;

  if (hasProfile && profile) {
    const map = buildSymbolicMap(profile);
    const insight = getGeneral(map);
    if (insight?.trim()) result.insight = insight.trim();
  }

  return result;
}
