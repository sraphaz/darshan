/**
 * Jyotish Engine — só símbolos a partir do AstronomicalCore; nunca texto.
 * calculate() → resultado bruto; getNakshatraProfile() → perfil interpretativo; detectYogas() → combinações.
 */

import type { AstronomicalCore } from "@/lib/core/types";
import type { RashiKey } from "@/lib/knowledge/types";
import { NAKSHATRA_MEANINGS } from "@/lib/knowledge/jyotishMeanings";
import { getArchetypeKeysFromChart } from "@/lib/knowledge/archetypes";

export type JyotishEngineResult = {
  moonRashi: string | null;
  nakshatra: string | null;
  planets: Record<string, number> | null;
  houses: Record<string, number> | null;
  precisionLevel: string;
};

/** Cálculo Jyotish a partir do core (alias: calculate). */
export function jyotishEngine(core: AstronomicalCore): JyotishEngineResult {
  return {
    moonRashi: core.moonRashi ?? null,
    nakshatra: core.nakshatra ?? null,
    planets: core.planets ?? null,
    houses: core.houses ?? null,
    precisionLevel: core.providerUsed,
  };
}

/** Alias para API externa: JyotishEngine.calculate(core). */
export const calculate = jyotishEngine;

/** Perfil da nakshatra lunar: significados e arquétipos (para Composer/Readings). */
export type NakshatraProfile = {
  nakshatra: string;
  moonRashi: string | null;
  namePt?: string;
  consciousnessThemes?: string[];
  psychologicalEffects?: string[];
  archetypeHints: string[];
};

export function getNakshatraProfile(core: AstronomicalCore): NakshatraProfile | null {
  const nakshatra = core.nakshatra ?? null;
  const moonRashi = core.moonRashi ?? null;
  if (!nakshatra) return null;
  const entry = NAKSHATRA_MEANINGS.find((e) => e.key === nakshatra);
  const archetypeHints = getArchetypeKeysFromChart({
    moonRashi: (moonRashi ?? undefined) as RashiKey | undefined,
    moonNakshatra: nakshatra,
  });
  return {
    nakshatra,
    moonRashi,
    namePt: entry?.namePt,
    consciousnessThemes: entry?.consciousnessThemes,
    psychologicalEffects: entry?.psychologicalEffects,
    archetypeHints,
  };
}

/** Yogas detectados a partir do core (combinações planetárias/signos). Expandir depois com Neecha Bhanga, etc. */
export function detectYogas(core: AstronomicalCore): string[] {
  const yogas: string[] = [];
  if (core.nakshatra) yogas.push(`nakshatra-${core.nakshatra}`);
  if (core.moonRashi) yogas.push(`moon-in-${core.moonRashi}`);
  if (core.planets?.moon != null && core.planets?.sun != null) {
    const moonSign = Math.floor((core.planets.moon % 360) / 30);
    const sunSign = Math.floor((core.planets.sun % 360) / 30);
    if (moonSign === sunSign) yogas.push("chandra-surya-same-sign");
  }
  return yogas;
}
