/**
 * Sacred Remedy Engine — núcleo offline medicinal.
 * Diagnóstico (universal/personal) + seleção dirigida de texto sagrado + prática + pergunta.
 */

export {
  getRemedyMatrix,
  diagnosisUniversal,
  diagnosisPersonal,
  getRemedyForDiagnosis,
} from "./diagnosisEngine";
export { selectSacredText, getAllSacredEntries } from "./sacredSelector";
export type { SelectSacredOptions } from "./sacredSelector";
export { composeInstantLight } from "./instantLightComposer";
export type { ComposeInstantLightOptions } from "./instantLightComposer";
export type {
  SamkhyaGuna,
  KleshaKey,
  AyurvedicQuality,
  PrakritiFromJyotish,
  SamkhyaGunas,
  ConsciousDiagnosis,
  SacredCorpusEntry,
  RemedyMatrixEntry,
  InstantLightResponse,
} from "./types";
