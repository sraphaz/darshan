/**
 * SymbolicMap universal — núcleo do Darshan offline.
 * Core → Jyotish + Numerologia + Human Design (só símbolos).
 * Inicializa Swiss Ephemeris (se instalado) antes de calcular, para priorizar alta precisão.
 */

import type { CoreProfile } from "@/lib/core/types";
import type { AstronomicalCore } from "@/lib/core/types";
import { computeAstronomicalCore } from "@/lib/core/ephemerisResolver";
import { initSwissEphemeris } from "@/lib/core/providers/swissProvider";
import { jyotishEngine } from "./jyotishEngine";
import { numerologyEngine } from "./numerologyEngine";
import { humanDesignEngine } from "./humanDesignEngine";
import type { JyotishEngineResult } from "./jyotishEngine";
import type { NumerologyEngineResult } from "./numerologyEngine";
import type { HumanDesignEngineResult } from "./humanDesignEngine";

export type SymbolicMap = {
  core: AstronomicalCore;
  jyotish: JyotishEngineResult;
  numerology: NumerologyEngineResult;
  humanDesign: HumanDesignEngineResult;
};

export async function buildSymbolicMap(profile: CoreProfile): Promise<SymbolicMap> {
  await initSwissEphemeris();
  const core = computeAstronomicalCore(profile);
  return {
    core,
    jyotish: jyotishEngine(core),
    numerology: numerologyEngine(profile),
    humanDesign: humanDesignEngine(core),
  };
}
