/**
 * Provider mhah-panchang — NÃO remover; fallback oficial do Darshan.
 * Retorna Lua (Rashi + Nakshatra); planetas/casas ficam para Swiss Ephemeris.
 */

import type { EphemerisProvider } from "../ephemerisProvider";
import type { AstronomicalCore, CoreProfile } from "../types";

const INO_TO_RASHI: string[] = [
  "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
  "tula", "vrischika", "dhanu", "makara", "kumbha", "mina",
];

const INO_TO_NAKSHATRA: string[] = [
  "ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu",
  "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta",
  "chitra", "swati", "vishakha", "anuradha", "jyestha", "mula", "purva-ashadha",
  "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadra",
  "uttara-bhadra", "revati",
];

export const MhahProvider: EphemerisProvider = {
  name: "mhah-panchang",

  compute(profile: CoreProfile): AstronomicalCore {
    const birthDate = profile.birthDate?.trim() ?? "";
    if (!birthDate) {
      return { providerUsed: "mhah-panchang" };
    }
    const birthTime = profile.birthTime?.trim() ?? "12:00";
    const dateStr = birthTime ? `${birthDate}T${birthTime}:00` : `${birthDate}T12:00:00`;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return { providerUsed: "mhah-panchang" };
    }

    const { MhahPanchang } = require("mhah-panchang");
    const obj = new MhahPanchang();
    const result = obj.calculate(d);

    const raasi = result?.Raasi;
    const nakshatra = result?.Nakshatra;

    const moonRashi =
      raasi?.ino != null
        ? INO_TO_RASHI[(raasi.ino - 1) % 12]
        : undefined;
    const nakshatraKey =
      nakshatra?.ino != null
        ? INO_TO_NAKSHATRA[(nakshatra.ino - 1) % 27]
        : undefined;

    return {
      providerUsed: "mhah-panchang",
      moonRashi,
      nakshatra: nakshatraKey,
    };
  },
};
