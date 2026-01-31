/**
 * Numerologia Engine — numerologia completa (ruling, life path, expression, soul urge, personality).
 * Usa lib/knowledge/numerology como fonte única.
 */

import {
  getRulingNumberFromName,
  getNumberTraits,
  getLifePathNumber,
  getExpressionNumber,
  getSoulUrgeNumber,
  getPersonalityNumber,
} from "@/lib/knowledge/numerology";
import type { CoreProfile } from "@/lib/core/types";

export type NumerologyEngineResult = {
  rulingNumber: number;
  name: string;
  shortTrait: string;
  tendencies: string[];
  challenges: string[];
  /** Life Path (data de nascimento) — 1–9, 11, 22 */
  lifePathNumber?: number;
  /** Expression/Destiny (nome completo) */
  expressionNumber?: number;
  /** Soul Urge (vogais do nome) — desejo interior */
  soulUrgeNumber?: number;
  /** Personality (consoantes do nome) — máscara social */
  personalityNumber?: number;
};

export function numerologyEngine(profile: CoreProfile): NumerologyEngineResult {
  const fullName = profile.fullName ?? "";
  const birthDate = profile.birthDate ?? "";
  const rulingNumber = getRulingNumberFromName(fullName);
  const traits = getNumberTraits(rulingNumber);
  const lifePathNumber = getLifePathNumber(birthDate);
  const expressionNumber = getExpressionNumber(fullName);
  const soulUrgeNumber = getSoulUrgeNumber(fullName);
  const personalityNumber = getPersonalityNumber(fullName);
  return {
    rulingNumber,
    name: traits.name,
    shortTrait: traits.shortTrait,
    tendencies: traits.tendencies,
    challenges: traits.challenges,
    lifePathNumber: lifePathNumber as number,
    expressionNumber: expressionNumber as number,
    soulUrgeNumber: soulUrgeNumber as number,
    personalityNumber: personalityNumber as number,
  };
}
