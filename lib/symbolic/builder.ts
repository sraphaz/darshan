/**
 * Constrói o mapa simbólico canônico a partir do perfil (Jyotish + Numerologia).
 * Determinístico; sem IA. evidence guarda o chart para auditoria e extensão.
 */

import type { UserProfileForOracle } from "@/lib/knowledge/types";
import type { VedicChartSimplified } from "@/lib/knowledge/types";
import { computeVedicChartSimplified } from "@/lib/knowledge/vedic";
import {
  getRulingNumberFromName,
  getLifePathNumber,
  getExpressionNumber,
} from "@/lib/knowledge/numerology";
import type { SymbolicMap } from "./types";

export function buildSymbolicMap(profile: UserProfileForOracle): SymbolicMap {
  const chart: VedicChartSimplified = computeVedicChartSimplified({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
  });
  const rulingNumber = getRulingNumberFromName(profile.fullName ?? "");
  const lifePathNumber = getLifePathNumber(profile.birthDate ?? "");
  const expressionNumber = getExpressionNumber(profile.fullName ?? "");

  const archetypeKeys = chart.archetypeKeys ?? ["dissolvente"];
  const primary = archetypeKeys[0] ?? "dissolvente";

  return {
    jyotish: {
      moonRashi: chart.moonRashi ?? "mesha",
      nakshatra: chart.moonNakshatra ?? "ashwini",
      archetypeKey: primary,
    },
    numerology: {
      rulingNumber: rulingNumber as number,
      lifePathNumber: lifePathNumber as number,
      expressionNumber: expressionNumber as number,
    },
    archetypes: {
      primary,
      keys: archetypeKeys,
    },
    themes: [],
    evidence: { chart },
  };
}
