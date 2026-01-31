/**
 * Leitura de relacionamento (amor) — mapa + narrativa love + action.
 */

import type { CoreProfile } from "@/lib/core/types";
import type { SymbolicMap } from "@/lib/engines/buildSymbolicMap";
import { buildSymbolicMap } from "@/lib/engines/buildSymbolicMap";
import { collectAllInsights } from "@/lib/insights/collectInsights";
import { composeReadingFromInsights } from "@/lib/narrative/composer";

export async function getLoveReading(profile: CoreProfile): Promise<{ map: SymbolicMap; reading: string; action: string }> {
  const map = await buildSymbolicMap(profile);
  const insights = collectAllInsights(map);
  return {
    map,
    reading: composeReadingFromInsights(insights, "love"),
    action: composeReadingFromInsights(insights, "action"),
  };
}
