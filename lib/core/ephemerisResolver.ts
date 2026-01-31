/**
 * Resolver multi-provider: Swiss Ephemeris (prioridade) → mhah-panchang (fallback).
 * Nada quebra: se Swiss falhar ou não estiver disponível, usa mhah.
 */

import type { AstronomicalCore, CoreProfile } from "./types";
import type { EphemerisProvider } from "./ephemerisProvider";
import { SwissProvider } from "./providers/swissProvider";
import { MhahProvider } from "./providers/mhahProvider";

const PROVIDERS: EphemerisProvider[] = [SwissProvider, MhahProvider];

/**
 * Calcula o núcleo astronômico com o primeiro provider que conseguir.
 * Ordem: Swiss Ephemeris → mhah-panchang.
 */
export function computeAstronomicalCore(profile: CoreProfile): AstronomicalCore {
  for (const provider of PROVIDERS) {
    try {
      return provider.compute(profile);
    } catch {
      continue;
    }
  }
  throw new Error("No ephemeris provider available");
}
