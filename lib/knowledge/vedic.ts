/**
 * Astrologia védica (Jyotish) — cálculos offline.
 * Usa mhah-panchang quando instalado (npm install mhah-panchang); senão, aproximações locais.
 */

import type { RashiKey, NakshatraKey, VedicChartSimplified } from "./types";
import { getArchetypeKeysFromChart } from "./archetypes";

/** Mapeia ino (1–12) do mhah-panchang Raasi para RashiKey */
const INO_TO_RASHI: RashiKey[] = [
  "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
  "tula", "vrischika", "dhanu", "makara", "kumbha", "mina",
];

/** Mapeia ino (1–27) do mhah-panchang Nakshatra para NakshatraKey */
const INO_TO_NAKSHATRA: NakshatraKey[] = [
  "ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu",
  "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta",
  "chitra", "swati", "vishakha", "anuradha", "jyestha", "mula", "purva-ashadha",
  "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadra",
  "uttara-bhadra", "revati",
];

function tryMhahPanchang(birthDate: string, birthTime?: string): VedicChartSimplified | null {
  try {
    const { MhahPanchang } = require("mhah-panchang");
    const obj = new MhahPanchang();
    const dateStr = birthTime ? `${birthDate}T${birthTime}:00` : `${birthDate}T12:00:00`;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    const mhahObj = obj.calculate(d);
    const raasi = mhahObj?.Raasi;
    const nakshatra = mhahObj?.Nakshatra;
    const moonRashi: RashiKey | undefined = raasi?.ino != null
      ? INO_TO_RASHI[(raasi.ino - 1) % 12]
      : undefined;
    const moonNakshatra: NakshatraKey | undefined = nakshatra?.ino != null
      ? INO_TO_NAKSHATRA[(nakshatra.ino - 1) % 27]
      : undefined;
    const archetypeKeys = getArchetypeKeysFromChart({ moonRashi, moonNakshatra });
    return {
      sunRashi: moonRashi,
      moonRashi,
      moonNakshatra,
      archetypeKeys: archetypeKeys.length ? archetypeKeys : ["dissolvente"],
    };
  } catch {
    return null;
  }
}

/** Ayanamsa aproximado (Lahiri) em graus — diferença tropical/sidereal (~24° em 2000) */
const AYANAMSA_DEG = 24;

/** Graus por signo */
const DEG_PER_SIGN = 30;

/** Ordem dos Rashis (signos sidereais) */
const RASHI_ORDER: RashiKey[] = [
  "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
  "tula", "vrischika", "dhanu", "makara", "kumbha", "mina",
];

/**
 * Converte data (YYYY-MM-DD) em dia do ano (0–365).
 */
function dayOfYear(dateStr: string): number | null {
  const d = new Date(dateStr + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Posição tropical aproximada do Sol em graus (0–360) a partir do dia do ano.
 * Fórmula simplificada: Sol avança ~1° por dia.
 */
function tropicalSunLongitude(dayOfYearVal: number): number {
  const deg = (dayOfYearVal * 360) / 365.25;
  return deg % 360;
}

/**
 * Converte longitude em graus (0–360) em signo sidereal (Rashi).
 * Aplica ayanamsa: longitude_sidereal ≈ longitude_tropical - ayanamsa.
 */
function longitudeToRashi(longitudeDeg: number, subtractAyanamsa: boolean): RashiKey {
  let L = longitudeDeg;
  if (subtractAyanamsa) {
    L = (L - AYANAMSA_DEG + 360) % 360;
  }
  const index = Math.floor(L / DEG_PER_SIGN) % 12;
  return RASHI_ORDER[index] ?? "mesha";
}

/**
 * Nakshatra aproximada a partir da longitude lunar (0–360).
 * 27 nakshatras = 360/27 ≈ 13,33° cada.
 */
function longitudeToNakshatra(longitudeDeg: number): NakshatraKey {
  const L = longitudeDeg % 360;
  const index = Math.floor(L / (360 / 27)) % 27;
  return INO_TO_NAKSHATRA[index] ?? "ashwini";
}

/**
 * Longitude lunar aproximada a partir de data e hora.
 * Fórmula muito simplificada: Lua avança ~13° por dia (ciclo ~27,3 dias).
 * Não substitui efeméride real; serve só para fallback/estimação.
 */
function approximateMoonLongitude(dateStr: string, timeStr?: string): number | null {
  const day = dayOfYear(dateStr);
  if (day === null) return null;
  let dayFraction = day;
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    if (!Number.isNaN(h)) dayFraction += (h + (Number.isNaN(m) ? 0 : m / 60)) / 24;
  }
  const lunarCycle = 27.321661;
  const moonDeg = (dayFraction / lunarCycle) * 360;
  return moonDeg % 360;
}

/**
 * Calcula um chart védico simplificado a partir do perfil.
 * - Signo solar sidereal: aproximado por data de nascimento.
 * - Signo lunar e nakshatra: aproximados se houver data e hora (senão indefinidos).
 * - Arquétipos: derivados do signo lunar (prioridade) e do solar.
 */
export function computeVedicChartSimplified(profile: {
  birthDate?: string;
  birthTime?: string;
}): VedicChartSimplified {
  if (profile.birthDate && profile.birthTime) {
    const fromPanchang = tryMhahPanchang(profile.birthDate, profile.birthTime);
    if (fromPanchang) return fromPanchang;
  }
  if (profile.birthDate) {
    const fromPanchang = tryMhahPanchang(profile.birthDate);
    if (fromPanchang) return fromPanchang;
  }

  const archetypeKeys: string[] = [];
  let sunRashi: RashiKey | undefined;
  let moonRashi: RashiKey | undefined;
  let moonNakshatra: NakshatraKey | undefined;

  if (profile.birthDate) {
    const day = dayOfYear(profile.birthDate);
    if (day !== null) {
      const tropSun = tropicalSunLongitude(day);
      sunRashi = longitudeToRashi(tropSun, true);
      archetypeKeys.push(...getArchetypeKeysFromChart({ moonRashi: sunRashi }));
    }
  }

  if (profile.birthDate && profile.birthTime) {
    const moonLong = approximateMoonLongitude(profile.birthDate, profile.birthTime);
    if (moonLong !== null) {
      moonNakshatra = longitudeToNakshatra(moonLong);
      moonRashi = longitudeToRashi(moonLong, true);
      const fromMoon = getArchetypeKeysFromChart({ moonRashi, moonNakshatra });
      fromMoon.forEach((k) => {
        if (!archetypeKeys.includes(k)) archetypeKeys.push(k);
      });
    }
  }

  if (archetypeKeys.length === 0) {
    archetypeKeys.push("dissolvente");
  }

  return {
    sunRashi,
    moonRashi,
    moonNakshatra,
    archetypeKeys,
  };
}
