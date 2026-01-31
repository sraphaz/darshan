/**
 * Sacred Remedy — Instant Light Composer.
 * Texto sagrado dirigido (sutra/purana) + insight (se personal) + prática ayurvédica + pergunta final.
 * Retorna DarshanTruthPackage para alimentar offline e IA. Motor medicinal offline; não quebra /api/darshan.
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
import type { DarshanTruthPackage } from "@/lib/core/DarshanTruthPackage";
import type { Theme } from "@/lib/core/UserRequestContext";
import type { SacredCorpusKey } from "@/lib/core/DarshanTruthPackage";

/** Seed diário para rotação */
function getDailySeed(): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return y * 10000 + m * 100 + d;
}

/** Normaliza corpus da matriz (purana → puranas) para SacredCorpusKey */
function toSacredCorpusKey(corpus: string): SacredCorpusKey {
  const c = (corpus ?? "").toLowerCase();
  if (c === "purana" || c === "puranas") return "puranas";
  if (c === "upanishad" || c === "upanishads") return "upanishads";
  if (c === "yoga_sutras") return "yoga_sutras";
  return "legacy";
}

export type ComposeInstantLightOptions = {
  seed?: number;
  recentSacredIds?: string[];
  recentStateKeys?: string[];
  /** StateKey preferido (ex.: do Intent Parser a partir de userText) */
  preferredStateKey?: string;
  /** Tema da consulta (love, career, health, etc.) */
  theme?: Theme;
  /** Tipo de pergunta (what/how/why/when) — influencia ênfase na resposta */
  questionType?: string;
  /** Confiança do parser (0–1) quando estado veio do input */
  inputConfidence?: number;
  /** Texto da pergunta do usuário (para question.text no package) */
  questionText?: string;
};

/** Converte string de prática em { title, steps } */
function toPracticeStruct(practiceStr: string): { title: string; steps: string[]; duration?: string } {
  const s = (practiceStr ?? "").trim();
  if (!s) return { title: "Prática", steps: [] };
  const steps = s.split(/[;.]\s*/).map((x) => x.trim()).filter(Boolean);
  if (steps.length === 0) steps.push(s);
  return { title: "Prática", steps };
}

/** Converte string de alimento em food.do (evitar vazio) */
function toFoodStruct(foodStr: string): { do: string[]; avoid?: string[] } {
  const s = (foodStr ?? "").trim();
  if (!s) return { do: [] };
  const items = s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
  return { do: items.length > 0 ? items : [s] };
}

/**
 * Compõe a resposta Instant Light (Sacred Remedy Engine) como DarshanTruthPackage.
 * - Com perfil: diagnosisPersonal → sacredSelector(klesha, qualities) → insight do mapa + prática + pergunta.
 * - Sem perfil: diagnosisUniversal → sacredSelector → prática + pergunta.
 * - questionType: how → prática em destaque; why → sutra primeiro; when → framing temporal (meta).
 */
export function composeInstantLight(
  profile?: UserProfileForOracle | null,
  options: ComposeInstantLightOptions = {}
): DarshanTruthPackage {
  const {
    seed,
    recentSacredIds = [],
    recentStateKeys = [],
    preferredStateKey,
    theme = "general",
    questionType,
    inputConfidence,
    questionText,
  } = options;
  const dailySeed = getDailySeed();
  const effectiveSeed = seed ?? dailySeed * 1000 + (Date.now() % 1000);
  const mode = profile && ((profile.fullName ?? "").trim() || (profile.birthDate ?? "").trim()) ? "personal" : "universal";

  const hasProfile = Boolean(
    profile && ((profile.fullName ?? "").trim() || (profile.birthDate ?? "").trim())
  );

  const diagnosis = hasProfile && profile
    ? diagnosisPersonal(profile, { seed: effectiveSeed, recentStateKeys, preferredStateKey })
    : diagnosisUniversal({ seed: effectiveSeed, recentStateKeys, preferredStateKey });

  const remedy = getRemedyForDiagnosis(diagnosis, { seed: effectiveSeed });

  const sacredEntry = selectSacredText({
    kleshaTargets: diagnosis.klesha ? [diagnosis.klesha] : [],
    qualities: diagnosis.ayurvedicQualities.excess,
    avoidIds: recentSacredIds,
    seed: effectiveSeed,
  });

  const sacredText = sacredEntry?.text?.trim() || remedy.sacred?.verse?.trim() || remedy.sacred?.id || "";
  const sacredCorpus = sacredEntry ? (sacredEntry.corpus as SacredCorpusKey) : toSacredCorpusKey(remedy.sacred?.corpus ?? "legacy");
  const sacredId = sacredEntry ? sacredEntry.id : (remedy.sacred?.id ?? remedy.state);

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
  const practiceStr = (ayurvedaFull?.practice ?? ayurvedaFallback.practice ?? remedy.practice ?? "").trim();
  const foodStr = (ayurvedaFull?.food ?? ayurvedaFallback.food ?? remedy.food ?? "").trim();
  const questionFinal = (questionText ?? remedy.question ?? "O que em você já sabe?").trim();

  const stateKey = diagnosis.stateKey ?? remedy.state;
  const confidence = preferredStateKey ? (inputConfidence ?? 0.7) : undefined;

  const packageResult: DarshanTruthPackage = {
    mode,
    theme,
    stateKey,
    diagnosis: {
      klesha: (diagnosis.klesha ?? "avidya") as string,
      samkhyaGuna: diagnosis.samkhyaGunas?.rajas > 0.5 ? "rajas" : diagnosis.samkhyaGunas?.tamas > 0.5 ? "tamas" : "sattva",
      qualities: [...(diagnosis.ayurvedicQualities?.excess ?? [])],
      confidence,
    },
    sacred: {
      id: sacredId,
      corpus: sacredCorpus === "purana" ? "puranas" : sacredCorpus,
      text: sacredText,
    },
    practice: toPracticeStruct(practiceStr),
    food: toFoodStruct(foodStr).do.length > 0 ? toFoodStruct(foodStr) : undefined,
    question: { text: questionFinal },
    meta: {
      usedSacredIds: recentSacredIds.length > 0 ? recentSacredIds : undefined,
      usedStateKeys: recentStateKeys.length > 0 ? recentStateKeys : undefined,
    },
  };

  if (hasProfile && profile) {
    const map = buildSymbolicMap(profile);
    packageResult.symbolicMap = map;
    const insight = getGeneral(map);
    if (insight?.trim()) {
      packageResult.insight = insight.trim();
    }
  }

  if (questionType === "when") {
    packageResult.meta = { ...packageResult.meta, usedSacredIds: packageResult.meta?.usedSacredIds, usedStateKeys: packageResult.meta?.usedStateKeys };
  }

  packageResult.sacredText = sacredText;
  packageResult.sacredId = `${packageResult.sacred.corpus}.${packageResult.sacred.id}`;
  if (ayurvedaFull?.sleep?.trim()) packageResult.sleep = ayurvedaFull.sleep.trim();
  if (ayurvedaFull?.routine?.trim()) packageResult.routine = ayurvedaFull.routine.trim();

  return packageResult;
}
