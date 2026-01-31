/**
 * Diagnosis Engine — diagnóstico consciente e matriz de remédios (Sacred Remedy Matrix).
 * Camada 1: Prakṛti (Jyotish). Camada 2: Sāṃkhya Guṇas. Camada 3: Ayurvedic Qualities.
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
