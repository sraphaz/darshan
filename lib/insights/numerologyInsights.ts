/**
 * Regras determinísticas de insights Numerologia — número regente → keys.
 */

import type { Insight } from "./types";
import type { NumerologyEngineResult } from "@/lib/engines/numerologyEngine";

export function numerologyInsights(numerology: NumerologyEngineResult): Insight[] {
  const out: Insight[] = [];
  if (!numerology) return out;

  out.push({
    key: `numerology.ruling.${numerology.rulingNumber}.general`,
    weight: 0.85,
    system: "numerology",
    topic: "general",
    evidence: { rulingNumber: numerology.rulingNumber },
  });
  out.push({
    key: `numerology.ruling.${numerology.rulingNumber}.career`,
    weight: 0.75,
    system: "numerology",
    topic: "career",
    evidence: { rulingNumber: numerology.rulingNumber },
  });
  out.push({
    key: `numerology.ruling.${numerology.rulingNumber}.love`,
    weight: 0.75,
    system: "numerology",
    topic: "love",
    evidence: { rulingNumber: numerology.rulingNumber },
  });
  out.push({
    key: `numerology.ruling.${numerology.rulingNumber}.year`,
    weight: 0.75,
    system: "numerology",
    topic: "year",
    evidence: { rulingNumber: numerology.rulingNumber },
  });

  return out;
}
