/**
 * Regras determinísticas de insights Jyotish — só símbolos → keys; nada aleatório.
 */

import type { Insight } from "./types";
import type { JyotishEngineResult } from "@/lib/engines/jyotishEngine";

export function jyotishInsights(jyotish: JyotishEngineResult): Insight[] {
  const out: Insight[] = [];
  if (!jyotish) return out;

  if (jyotish.nakshatra) {
    out.push({
      key: `jyotish.nakshatra.${jyotish.nakshatra}.general`,
      weight: 0.9,
      system: "jyotish",
      topic: "general",
      evidence: { nakshatra: jyotish.nakshatra },
    });
    out.push({
      key: `jyotish.nakshatra.${jyotish.nakshatra}.spiritualTheme`,
      weight: 0.85,
      system: "jyotish",
      topic: "general",
      evidence: { nakshatra: jyotish.nakshatra },
    });
  }

  if (jyotish.moonRashi) {
    out.push({
      key: `jyotish.rashi.${jyotish.moonRashi}.general`,
      weight: 0.8,
      system: "jyotish",
      topic: "general",
      evidence: { moonRashi: jyotish.moonRashi },
    });
    out.push({
      key: `jyotish.rashi.${jyotish.moonRashi}.love`,
      weight: 0.7,
      system: "jyotish",
      topic: "love",
      evidence: { moonRashi: jyotish.moonRashi },
    });
    out.push({
      key: `jyotish.rashi.${jyotish.moonRashi}.career`,
      weight: 0.7,
      system: "jyotish",
      topic: "career",
      evidence: { moonRashi: jyotish.moonRashi },
    });
    out.push({
      key: `jyotish.rashi.${jyotish.moonRashi}.year`,
      weight: 0.7,
      system: "jyotish",
      topic: "year",
      evidence: { moonRashi: jyotish.moonRashi },
    });
  }

  if (jyotish.nakshatra) {
    out.push({
      key: `jyotish.nakshatra.${jyotish.nakshatra}.year`,
      weight: 0.75,
      system: "jyotish",
      topic: "year",
      evidence: { nakshatra: jyotish.nakshatra },
    });
  }

  return out;
}
