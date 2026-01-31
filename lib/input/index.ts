/**
 * Input layer — Intent Parser e State Scorer offline.
 * Classificação multi-eixo (verbo, sujeito, tema, emoção) → bestStateKey para RemedyMatrix.
 */

export { parseIntent } from "./intentParser";
export type { ParsedIntent, SubjectKey, VerbClassKey, ThemeKey, StateKey, StateCandidate } from "./intentParser";
export { scoreState, pickBestState } from "./stateScorer";
export type { PickBestStateResult } from "./stateScorer";
export { normalizeInput } from "./normalizeInput";
