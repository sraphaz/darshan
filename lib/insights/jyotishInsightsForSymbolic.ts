/**
 * Regras determinísticas de insights Jyotish para o mapa simbólico canônico (lib/symbolic).
 * 20 general, 10 love, 10 career, 10 year. Tudo ancorado no mapa; nada aleatório.
 */

import type { SymbolicMap } from "@/lib/symbolic/types";
import type { Insight } from "./types";

export function jyotishInsightsForSymbolic(map: SymbolicMap): Insight[] {
  const out: Insight[] = [];
  const { nakshatra, moonRashi } = map.jyotish;

  // ——— GENERAL (20+ regras: soulPath, spiritualPath, rashi/nakshatra) ———
  if (nakshatra === "revati") {
    out.push({
      key: "jyotish.revati.spiritualPath",
      topic: "general",
      weight: 0.95,
      system: "jyotish",
      evidence: { nakshatra: "revati" },
    });
    out.push({
      key: "jyotish.revati.soulPath",
      topic: "general",
      weight: 0.9,
      system: "jyotish",
      evidence: { nakshatra: "revati" },
    });
  }
  if (nakshatra === "rohini") {
    out.push({
      key: "jyotish.rohini.soulPath",
      topic: "general",
      weight: 0.9,
      system: "jyotish",
      evidence: { nakshatra: "rohini" },
    });
  }
  if (nakshatra === "ashwini") {
    out.push({
      key: "jyotish.ashwini.soulPath",
      topic: "general",
      weight: 0.9,
      system: "jyotish",
      evidence: { nakshatra: "ashwini" },
    });
  }
  if (moonRashi === "karka") {
    out.push({
      key: "jyotish.karka.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "karka" },
    });
  }
  if (moonRashi === "mesha") {
    out.push({
      key: "jyotish.mesha.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "mesha" },
    });
  }
  if (moonRashi === "mina") {
    out.push({
      key: "jyotish.mina.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "mina" },
    });
  }
  if (nakshatra === "pushya") {
    out.push({
      key: "jyotish.pushya.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "pushya" },
    });
  }
  if (nakshatra === "magha") {
    out.push({
      key: "jyotish.magha.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "magha" },
    });
  }
  if (nakshatra === "hasta") {
    out.push({
      key: "jyotish.hasta.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "hasta" },
    });
  }
  if (nakshatra === "chitra") {
    out.push({
      key: "jyotish.chitra.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "chitra" },
    });
  }
  if (moonRashi === "vrishabha") {
    out.push({
      key: "jyotish.vrishabha.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "vrishabha" },
    });
  }
  if (moonRashi === "mithuna") {
    out.push({
      key: "jyotish.mithuna.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "mithuna" },
    });
  }
  if (moonRashi === "simha") {
    out.push({
      key: "jyotish.simha.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "simha" },
    });
  }
  if (moonRashi === "kanya") {
    out.push({
      key: "jyotish.kanya.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "kanya" },
    });
  }
  if (moonRashi === "tula") {
    out.push({
      key: "jyotish.tula.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "tula" },
    });
  }
  if (moonRashi === "vrischika") {
    out.push({
      key: "jyotish.vrischika.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "vrischika" },
    });
  }
  if (moonRashi === "dhanu") {
    out.push({
      key: "jyotish.dhanu.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "dhanu" },
    });
  }
  if (moonRashi === "makara") {
    out.push({
      key: "jyotish.makara.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "makara" },
    });
  }
  if (moonRashi === "kumbha") {
    out.push({
      key: "jyotish.kumbha.general",
      topic: "general",
      weight: 0.85,
      system: "jyotish",
      evidence: { moonRashi: "kumbha" },
    });
  }

  // ——— LOVE (10 regras) ———
  if (nakshatra === "revati") {
    out.push({
      key: "jyotish.revati.love",
      topic: "love",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "revati" },
    });
  }
  if (nakshatra === "rohini") {
    out.push({
      key: "jyotish.rohini.love",
      topic: "love",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "rohini" },
    });
  }
  if (moonRashi === "karka") {
    out.push({
      key: "jyotish.karka.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "karka" },
    });
  }
  if (moonRashi === "mesha") {
    out.push({
      key: "jyotish.mesha.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mesha" },
    });
  }
  if (moonRashi === "mina") {
    out.push({
      key: "jyotish.mina.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mina" },
    });
  }
  if (moonRashi === "vrishabha") {
    out.push({
      key: "jyotish.vrishabha.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "vrishabha" },
    });
  }
  if (moonRashi === "mithuna") {
    out.push({
      key: "jyotish.mithuna.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mithuna" },
    });
  }
  if (moonRashi === "tula") {
    out.push({
      key: "jyotish.tula.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "tula" },
    });
  }
  if (moonRashi === "simha") {
    out.push({
      key: "jyotish.simha.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "simha" },
    });
  }
  if (moonRashi === "kanya") {
    out.push({
      key: "jyotish.kanya.love",
      topic: "love",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "kanya" },
    });
  }

  // ——— CAREER (10 regras) ———
  if (nakshatra === "revati") {
    out.push({
      key: "jyotish.revati.career",
      topic: "career",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "revati" },
    });
  }
  if (moonRashi === "karka") {
    out.push({
      key: "jyotish.karka.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "karka" },
    });
  }
  if (moonRashi === "mesha") {
    out.push({
      key: "jyotish.mesha.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mesha" },
    });
  }
  if (nakshatra === "rohini") {
    out.push({
      key: "jyotish.rohini.career",
      topic: "career",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "rohini" },
    });
  }
  if (nakshatra === "ashwini") {
    out.push({
      key: "jyotish.ashwini.career",
      topic: "career",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "ashwini" },
    });
  }
  if (moonRashi === "mina") {
    out.push({
      key: "jyotish.mina.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mina" },
    });
  }
  if (moonRashi === "vrishabha") {
    out.push({
      key: "jyotish.vrishabha.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "vrishabha" },
    });
  }
  if (moonRashi === "mithuna") {
    out.push({
      key: "jyotish.mithuna.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mithuna" },
    });
  }
  if (moonRashi === "tula") {
    out.push({
      key: "jyotish.tula.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "tula" },
    });
  }
  if (moonRashi === "dhanu") {
    out.push({
      key: "jyotish.dhanu.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "dhanu" },
    });
  }
  if (moonRashi === "kanya") {
    out.push({
      key: "jyotish.kanya.career",
      topic: "career",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "kanya" },
    });
  }

  // ——— YEAR (10 regras) ———
  if (nakshatra === "revati") {
    out.push({
      key: "jyotish.revati.year",
      topic: "year",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "revati" },
    });
  }
  if (moonRashi === "karka") {
    out.push({
      key: "jyotish.karka.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "karka" },
    });
  }
  if (moonRashi === "mesha") {
    out.push({
      key: "jyotish.mesha.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mesha" },
    });
  }
  if (nakshatra === "rohini") {
    out.push({
      key: "jyotish.rohini.year",
      topic: "year",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "rohini" },
    });
  }
  if (nakshatra === "ashwini") {
    out.push({
      key: "jyotish.ashwini.year",
      topic: "year",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "ashwini" },
    });
  }
  if (moonRashi === "mina") {
    out.push({
      key: "jyotish.mina.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mina" },
    });
  }
  if (moonRashi === "vrishabha") {
    out.push({
      key: "jyotish.vrishabha.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "vrishabha" },
    });
  }
  if (moonRashi === "mithuna") {
    out.push({
      key: "jyotish.mithuna.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "mithuna" },
    });
  }
  if (moonRashi === "tula") {
    out.push({
      key: "jyotish.tula.year",
      topic: "year",
      weight: 0.8,
      system: "jyotish",
      evidence: { moonRashi: "tula" },
    });
  }
  if (nakshatra === "pushya") {
    out.push({
      key: "jyotish.pushya.year",
      topic: "year",
      weight: 0.85,
      system: "jyotish",
      evidence: { nakshatra: "pushya" },
    });
  }

  return out;
}
