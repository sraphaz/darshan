/**
 * Action Engine — prática concreta obrigatória ao final de toda leitura.
 */

import type { CoreProfile } from "@/lib/core/types";
import { buildSymbolicMap } from "@/lib/engines/buildSymbolicMap";
import { collectAllInsights } from "@/lib/insights/collectInsights";
import { composeReadingFromInsights } from "@/lib/narrative/composer";

export async function getActionReading(profile: CoreProfile): Promise<string> {
  const map = await buildSymbolicMap(profile);
  const insights = collectAllInsights(map);
  return composeReadingFromInsights(insights, "action");
}
