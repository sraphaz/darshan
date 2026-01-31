/**
 * State Scorer — escolhe o bestStateKey a partir do ParsedIntent.
 * Pesos: base (parser score) + verbClass fear +2, tema +1, sujeito other +1.
 * Frase composta (ex.: "medo de perder") já vem com score maior do parser.
 * Só retorna estados que existem na RemedyMatrix.
 */

import type { ParsedIntent, StateCandidate } from "./intentParser";
import remedyMatrixJson from "@/lib/dictionaries/remedyMatrix.json";

type RemedyEntry = { state: string };
const REMEDY_MATRIX = remedyMatrixJson as RemedyEntry[];
const VALID_STATES = new Set(REMEDY_MATRIX.map((e) => e.state));

/** Pesos por eixo */
const WEIGHT_VERB_FEAR = 2;
const WEIGHT_THEME = 1;
const WEIGHT_SUBJECT_OTHER = 1;
/** fear + love → attachment / fear_of_loss (relational_insecurity) em destaque */
const WEIGHT_FEAR_AND_LOVE = 2;

/** verbClass fear → estados que ganham bônus */
const FEAR_STATES = new Set([
  "anxiety",
  "existential_fear",
  "relational_insecurity",
  "avoidance",
]);

/** theme love → estados que ganham bônus */
const LOVE_STATES = new Set([
  "emotional_attachment",
  "relational_insecurity",
  "longing",
  "jealousy",
  "grief",
]);

/** fear + love juntos → apego / medo de perder (resposta prioriza esses estados) */
const FEAR_AND_LOVE_STATES = new Set([
  "emotional_attachment",
  "relational_insecurity",
  "anxiety",
]);

/** theme career → estados que ganham bônus */
const CAREER_STATES = new Set([
  "lack_of_purpose",
  "burnout",
  "stagnation",
  "emotional_exhaustion",
  "perfectionism",
]);

/** theme health → estados que ganham bônus */
const HEALTH_STATES = new Set([
  "burnout",
  "emotional_exhaustion",
  "lethargy",
  "overwhelm",
]);

/** subject other → estados de compaixão/relação */
const OTHER_SUBJECT_STATES = new Set([
  "aversion_to_other",
  "resentment",
  "coldness",
  "emotional_attachment",
  "relational_insecurity",
]);

export type PickBestStateResult = {
  stateKey: string;
  confidence: number;
};

/**
 * Retorna o melhor stateKey e confiança (0–1) para o intent.
 * Usa base score do parser + bônus por eixo (fear+love, conflict→anger, etc.).
 */
export function pickBestState(intent: ParsedIntent | null): PickBestStateResult | undefined {
  if (intent == null || intent.stateCandidates.length === 0) return undefined;
  const validCandidates = intent.stateCandidates.filter((c) =>
    VALID_STATES.has(c.stateKey)
  ) as StateCandidate[];
  if (validCandidates.length === 0) return undefined;
  if (validCandidates.length === 1) {
    return {
      stateKey: validCandidates[0].stateKey,
      confidence: Math.min(1, 0.3 + validCandidates[0].score * 0.1),
    };
  }

  const scores = new Map<string, number>();
  const fearAndLove = intent.verbClass === "fear" && intent.theme === "love";
  for (const c of validCandidates) {
    let score = c.score;
    if (intent.verbClass === "fear" && FEAR_STATES.has(c.stateKey)) score += WEIGHT_VERB_FEAR;
    if (intent.theme === "love" && LOVE_STATES.has(c.stateKey)) score += WEIGHT_THEME;
    if (fearAndLove && FEAR_AND_LOVE_STATES.has(c.stateKey)) score += WEIGHT_FEAR_AND_LOVE;
    if (intent.theme === "career" && CAREER_STATES.has(c.stateKey)) score += WEIGHT_THEME;
    if (intent.theme === "health" && HEALTH_STATES.has(c.stateKey)) score += WEIGHT_THEME;
    if (intent.subject === "other" && OTHER_SUBJECT_STATES.has(c.stateKey)) score += WEIGHT_SUBJECT_OTHER;
    scores.set(c.stateKey, score);
  }

  const sorted = [...validCandidates].sort(
    (a, b) => (scores.get(b.stateKey) ?? 0) - (scores.get(a.stateKey) ?? 0)
  );
  const best = sorted[0];
  const bestScore = scores.get(best.stateKey) ?? 0;
  const maxScore = Math.max(...Array.from(scores.values()));
  const confidence = maxScore > 0 ? Math.min(1, 0.2 + (bestScore / (maxScore + 2)) * 0.8) : 0.5;

  return { stateKey: best.stateKey, confidence };
}

/**
 * Retorna apenas o stateKey (compatibilidade com código que usa scoreState).
 */
export function scoreState(intent: ParsedIntent | null): string | undefined {
  return pickBestState(intent)?.stateKey;
}
