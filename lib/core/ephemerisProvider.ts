/**
 * Interface de um provider de efemérides (mhah-panchang, Swiss Ephemeris, etc.).
 * Cada provider expõe name e compute(profile) → AstronomicalCore.
 */

import type { AstronomicalCore, CoreProfile } from "./types";

export interface EphemerisProvider {
  name: string;
  compute(profile: CoreProfile): AstronomicalCore;
}
