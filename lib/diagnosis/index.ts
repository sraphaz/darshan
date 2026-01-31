/**
 * Diagnosis Engine — diagnóstico consciente e matriz de remédios (Sacred Remedy Matrix).
 * Camada 1: Prakṛti (Jyotish). Camada 2: Sāṃkhya Guṇas. Camada 3: Ayurvedic Qualities.
 *
 * @deprecated Engine oficial: lib/sacredRemedy (diagnosisEngine.ts). Este módulo é legado;
 * o fluxo Instant Light usa apenas sacredRemedy. Mantido por referência.
 */

export {
  getRemedyMatrix,
  getPrakritiFromMap,
  getDominantSamkhyaGuna,
  buildDiagnosisFromMapAndRemedy,
  selectRemedy,
} from "./diagnosisEngine";
export type { SelectRemedyOptions } from "./diagnosisEngine";
export type {
  SamkhyaGuna,
  AyurvedicQuality,
  KleshaKey,
  PrakritiFromJyotish,
  SamkhyaGunas,
  ConsciousDiagnosis,
  SacredRef,
  RemedyMatrixEntry,
} from "./types";
