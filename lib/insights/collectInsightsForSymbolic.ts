/**
 * Coleta insights do mapa simbólico canônico (lib/symbolic).
 * Usado pelo Narrative Composer para leituras determinísticas.
 */

import type { SymbolicMap } from "@/lib/symbolic/types";
import type { Insight } from "./types";
import { jyotishInsightsForSymbolic } from "./jyotishInsightsForSymbolic";

export function collectInsightsForSymbolicMap(map: SymbolicMap): Insight[] {
  const list: Insight[] = [];
  list.push(...jyotishInsightsForSymbolic(map));
  // Action: sempre pelo menos um insight por número regente + geral
  const n = map.numerology.rulingNumber;
  list.push({
    key: `action.n.${n}`,
    topic: "action",
    weight: 1,
    system: "numerology",
    evidence: { rulingNumber: n },
  });
  list.push({
    key: "action.general",
    topic: "action",
    weight: 0.9,
    system: "jyotish",
    evidence: {},
  });
  list.push({
    key: `action.archetype.${map.jyotish.archetypeKey}`,
    topic: "action",
    weight: 0.85,
    system: "jyotish",
    evidence: { archetypeKey: map.jyotish.archetypeKey },
  });
  return list;
}
