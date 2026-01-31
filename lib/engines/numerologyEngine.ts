/**
 * Numerologia Engine — refator do conhecimento atual; só símbolos/dados.
 */

import { getRulingNumberFromName, getNumberTraits } from "@/lib/knowledge/numerology";
import type { CoreProfile } from "@/lib/core/types";

export type NumerologyEngineResult = {
  rulingNumber: number;
  name: string;
  shortTrait: string;
  tendencies: string[];
  challenges: string[];
};

export function numerologyEngine(profile: CoreProfile): NumerologyEngineResult {
  const fullName = profile.fullName ?? "";
  const rulingNumber = getRulingNumberFromName(fullName);
  const traits = getNumberTraits(rulingNumber);
  return {
    rulingNumber,
    name: traits.name,
    shortTrait: traits.shortTrait,
    tendencies: traits.tendencies,
    challenges: traits.challenges,
  };
}
