/**
 * Coleta todos os insights do mapa simbólico (Jyotish + Numerologia + Human Design).
 */

import type { SymbolicMap } from "@/lib/engines/buildSymbolicMap";
import type { Insight } from "./types";
import { jyotishInsights } from "./jyotishInsights";
import { numerologyInsights } from "./numerologyInsights";
import { humanDesignInsights } from "./humanDesignInsights";

export function collectAllInsights(map: SymbolicMap): Insight[] {
  const list: Insight[] = [];
  list.push(...jyotishInsights(map.jyotish));
  list.push(...numerologyInsights(map.numerology));
  list.push(...humanDesignInsights(map.humanDesign));
  return list;
}
