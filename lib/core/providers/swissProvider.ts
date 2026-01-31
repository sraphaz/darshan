/**
 * Provider Swiss Ephemeris (premium) — @fusionstrings/swiss-eph (WASM).
 * Retorna planetas completos, casas e ascendente; moonRashi/nakshatra derivados da longitude lunar (Lahiri).
 * Se falhar ou não estiver instalado, o resolver usa mhah-panchang como fallback.
 */

import type { EphemerisProvider } from "../ephemerisProvider";
import type { AstronomicalCore, CoreProfile } from "../types";

/** Chaves Rashi (signo) por índice 0–11 — mesma ordem que mhahProvider */
const INO_TO_RASHI: string[] = [
  "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
  "tula", "vrischika", "dhanu", "makara", "kumbha", "mina",
];

/** Chaves Nakshatra por índice 0–26 — mesma ordem que mhahProvider */
const INO_TO_NAKSHATRA: string[] = [
  "ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu",
  "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta",
  "chitra", "swati", "vishakha", "anuradha", "jyestha", "mula", "purva-ashadha",
  "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadra",
  "uttara-bhadra", "revati",
];

/** Longitude (0–360) → Rashi key (sidereal; longitude já em Lahiri se usar SEFLG_SIDEREAL) */
function longitudeToRashi(longitudeDeg: number): string {
  const L = longitudeDeg % 360;
  const index = Math.floor(L / 30) % 12;
  return INO_TO_RASHI[index] ?? "mesha";
}

/** Longitude (0–360) → Nakshatra key */
function longitudeToNakshatra(longitudeDeg: number): string {
  const L = longitudeDeg % 360;
  const index = Math.floor(L / (360 / 27)) % 27;
  return INO_TO_NAKSHATRA[index] ?? "ashwini";
}

/** Mapa planeta SE_* → chave para AstronomicalCore.planets */
const PLANET_KEYS: Record<number, string> = {
  0: "sun",    // SE_SUN
  1: "moon",   // SE_MOON
  2: "mercury",// SE_MERCURY
  3: "venus",  // SE_VENUS
  4: "mars",   // SE_MARS
  5: "jupiter",// SE_JUPITER
  6: "saturn", // SE_SATURN
};

/** Lat/lon padrão quando birthPlace não fornece (ex.: 0,0 ou São Paulo) */
const DEFAULT_LAT = 0;
const DEFAULT_LON = 0;

/** Cache do módulo WASM carregado (lazy). Preencher com initSwissEphemeris() para usar Swiss. */
let ephCache: { eph: { swe_julday: (y: number, m: number, d: number, h: number, g: number) => number;
  swe_calc_ut: (jd: number, ipl: number, iflag: number) => { returnCode: number; xx: Float64Array; error: string };
  swe_houses: (jd: number, lat: number, lon: number, hsys: number) => { cusps: Float64Array; ascmc: Float64Array; returnCode: number };
  swe_set_sid_mode: (mode: number, t0: number, ayan_t0: number) => void };
  Constants: { SE_GREG_CAL: number; SE_SUN: number; SE_MOON: number; SE_MERCURY: number; SE_VENUS: number; SE_MARS: number; SE_JUPITER: number; SE_SATURN: number; SEFLG_SPEED: number; SEFLG_SIDEREAL?: number; SE_SIDM_LAHIRI: number };
} | null = null;

async function loadSwissEph(): Promise<NonNullable<typeof ephCache>> {
  const mod = await import("@fusionstrings/swiss-eph");
  const eph = await mod.load();
  const Constants = mod.Constants;
  if (typeof eph.swe_set_sid_mode === "function" && Constants.SE_SIDM_LAHIRI != null) {
    eph.swe_set_sid_mode(Constants.SE_SIDM_LAHIRI, 0, 0);
  }
  return { eph, Constants };
}

function parseProfileDateTime(profile: CoreProfile): { year: number; month: number; day: number; hourDecimal: number } | null {
  const birthDate = profile.birthDate?.trim();
  if (!birthDate) return null;
  const birthTime = (profile.birthTime?.trim() ?? "12:00").slice(0, 8);
  const [h, m, s] = birthTime.split(":").map((x) => (x ? parseFloat(x) : 0));
  const dateStr = birthTime ? `${birthDate}T${birthTime}` : `${birthDate}T12:00`;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const hourDecimal = (d.getUTCHours() ?? 0) + ((d.getUTCMinutes() ?? 0) / 60) + ((d.getUTCSeconds() ?? 0) / 3600);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hourDecimal,
  };
}

/** Obtém lat/lon do perfil; por enquanto usa valor padrão (geocoding futuro). */
function getLatLon(_profile: CoreProfile): { lat: number; lon: number } {
  return { lat: DEFAULT_LAT, lon: DEFAULT_LON };
}

/**
 * Calcula o núcleo astronômico com Swiss Ephemeris (async).
 * Retorna null se o pacote não estiver disponível, dados inválidos ou erro.
 */
export async function trySwissCompute(profile: CoreProfile): Promise<AstronomicalCore | null> {
  try {
    const dt = parseProfileDateTime(profile);
    if (!dt) return null;

    if (!ephCache) {
      ephCache = await loadSwissEph();
    }
    const { eph, Constants } = ephCache;

    const jd = eph.swe_julday(dt.year, dt.month, dt.day, dt.hourDecimal, Constants.SE_GREG_CAL);
    const flag = (Constants.SEFLG_SPEED ?? 256) | (Constants.SEFLG_SIDEREAL ?? 0);

    const planets: Record<string, number> = {};
    for (const [seId, key] of Object.entries(PLANET_KEYS)) {
      const res = eph.swe_calc_ut(jd, Number(seId), flag);
      if (res.returnCode >= 0 && res.xx && res.xx[0] != null) {
        planets[key] = res.xx[0] % 360;
      }
    }

    const moonLong = planets.moon != null ? planets.moon : undefined;
    const moonRashi = moonLong != null ? longitudeToRashi(moonLong) : undefined;
    const nakshatra = moonLong != null ? longitudeToNakshatra(moonLong) : undefined;

    const { lat, lon } = getLatLon(profile);
    const hsys = "P".charCodeAt(0);
    const housesRes = eph.swe_houses(jd, lat, lon, hsys);
    const houses: Record<string, number> = {};
    if (housesRes.cusps && housesRes.returnCode >= 0) {
      for (let i = 1; i <= 12; i++) {
        const c = housesRes.cusps[i];
        if (typeof c === "number" && !Number.isNaN(c)) {
          houses[String(i)] = c % 360;
        }
      }
    }
    const ascendant = housesRes.ascmc && housesRes.ascmc[0] != null
      ? (housesRes.ascmc[0] % 360)
      : (houses["1"]);

    return {
      providerUsed: "swiss-ephemeris",
      julianDay: jd,
      planets: Object.keys(planets).length ? planets : undefined,
      moonRashi,
      nakshatra,
      ascendant,
      houses: Object.keys(houses).length ? houses : undefined,
    };
  } catch {
    return null;
  }
}

export const SwissProvider: EphemerisProvider = {
  name: "swiss-ephemeris",

  compute(profile: CoreProfile): AstronomicalCore {
    const result = trySwissComputeSync(profile);
    if (result) return result;
    throw new Error("Swiss Ephemeris not available");
  },
};

/**
 * Versão síncrona: só retorna resultado se o WASM já estiver em cache.
 * Caso contrário retorna null para o resolver cair no mhah-panchang.
 */
function trySwissComputeSync(profile: CoreProfile): AstronomicalCore | null {
  if (ephCache === null) return null;
  try {
    const dt = parseProfileDateTime(profile);
    if (!dt) return null;
    const { eph, Constants } = ephCache;
    const jd = eph.swe_julday(dt.year, dt.month, dt.day, dt.hourDecimal, Constants.SE_GREG_CAL);
    const flag = (Constants.SEFLG_SPEED ?? 256) | (Constants.SEFLG_SIDEREAL ?? 0);

    const planets: Record<string, number> = {};
    for (const [seId, key] of Object.entries(PLANET_KEYS)) {
      const res = eph.swe_calc_ut(jd, Number(seId), flag);
      if (res.returnCode >= 0 && res.xx && res.xx[0] != null) {
        planets[key] = res.xx[0] % 360;
      }
    }
    const moonLong = planets.moon;
    const moonRashi = moonLong != null ? longitudeToRashi(moonLong) : undefined;
    const nakshatra = moonLong != null ? longitudeToNakshatra(moonLong) : undefined;

    const { lat, lon } = getLatLon(profile);
    const hsys = "P".charCodeAt(0);
    const housesRes = eph.swe_houses(jd, lat, lon, hsys);
    const houses: Record<string, number> = {};
    if (housesRes.cusps && housesRes.returnCode >= 0) {
      for (let i = 1; i <= 12; i++) {
        const c = housesRes.cusps[i];
        if (typeof c === "number" && !Number.isNaN(c)) {
          houses[String(i)] = c % 360;
        }
      }
    }
    const ascendant = housesRes.ascmc && housesRes.ascmc[0] != null
      ? (housesRes.ascmc[0] % 360)
      : (houses["1"]);

    return {
      providerUsed: "swiss-ephemeris",
      julianDay: jd,
      planets: Object.keys(planets).length ? planets : undefined,
      moonRashi,
      nakshatra,
      ascendant,
      houses: Object.keys(houses).length ? houses : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Inicializa o Swiss Ephemeris (carrega WASM). Chamar uma vez no startup ou antes do primeiro uso
 * para que o resolver use Swiss em vez de mhah-panchang nas próximas chamadas síncronas.
 */
export async function initSwissEphemeris(): Promise<void> {
  if (ephCache) return;
  ephCache = await loadSwissEph();
}
