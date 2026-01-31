/**
 * Narrative Composer universal — map → insights → composer → módulos.
 * Monta leitura a partir de insights filtrados por tópico; key → PHRASES[i.key][0].
 * Nada aleatório; tudo ancorado no mapa.
 */

import type { Insight, InsightTopic } from "@/lib/insights/types";
import type { SymbolicMap } from "@/lib/symbolic/types";
import { phraseFor } from "@/lib/dictionaries";
import { collectInsightsForSymbolicMap } from "@/lib/insights/collectInsightsForSymbolic";

/**
 * Composer para o mapa simbólico: collectInsights(map) → filter(topic) → sort(weight) → top 3 → phraseFor(key) → join.
 */
export function composeReading(map: SymbolicMap, topic: InsightTopic): string {
  const insights = collectInsightsForSymbolicMap(map)
    .filter((i) => i.topic === topic)
    .sort((a, b) => b.weight - a.weight);
  return insights
    .slice(0, 3)
    .map((i) => phraseFor(i.key))
    .filter(Boolean)
    .join("\n\n");
}

/** Composer a partir de array de insights (engines flow). */
export function composeReadingFromInsights(insights: Insight[], topic: InsightTopic): string {
  const filtered = insights.filter((i) => i.topic === topic);
  const sorted = filtered.sort((a, b) => b.weight - a.weight);
  const chosen = sorted.slice(0, 5);
  const parts: string[] = [];
  for (const i of chosen) {
    const phrase = phraseFor(i.key);
    if (phrase && !parts.includes(phrase)) parts.push(phrase);
  }
  return parts.join("\n\n");
}

/**
 * Alias para compatibilidade: composer por mapa simbólico.
 */
export function composeReadingFromSymbolicMap(map: SymbolicMap, topic: InsightTopic): string {
  return composeReading(map, topic);
}
