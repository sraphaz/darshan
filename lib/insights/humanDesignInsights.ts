/**
 * Regras determinísticas de insights Human Design — stub; só quando HD estiver disponível.
 */

import type { Insight } from "./types";
import type { HumanDesignEngineResult } from "@/lib/engines/humanDesignEngine";

export function humanDesignInsights(humanDesign: HumanDesignEngineResult): Insight[] {
  const out: Insight[] = [];
  if (!humanDesign) return out;

  out.push({
    key: `hd.type.${humanDesign.type.toLowerCase()}`,
    weight: 0.85,
    system: "humanDesign",
    topic: "general",
    evidence: humanDesign,
  });
  out.push({
    key: `hd.authority.${humanDesign.authority.toLowerCase()}`,
    weight: 0.8,
    system: "humanDesign",
    topic: "action",
    evidence: humanDesign,
  });

  return out;
}
