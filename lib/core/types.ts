/**
 * Núcleo astronômico — resultado de um provider de efemérides.
 * Usado por todos os engines (Jyotish, Human Design, etc.) sem depender de IA.
 */

export type AstronomicalCore = {
  /** Provider que gerou os dados (ex.: "mhah-panchang", "swiss-ephemeris") */
  providerUsed: string;
  /** Dia juliano (opcional; Swiss Ephemeris) */
  julianDay?: number;
  /** Longitudes planetárias em graus (0–360) — chave = planeta (sun, moon, ...) */
  planets?: Record<string, number>;
  /** Signo lunar sidereal (Rashi) — chave do dicionário (ex.: "karka", "revati") */
  moonRashi?: string;
  /** Nakshatra lunar — chave (ex.: "ashwini", "rohini") */
  nakshatra?: string;
  /** Ascendente em graus (opcional) */
  ascendant?: number;
  /** Casas em graus (1–12) — chave = número da casa */
  houses?: Record<string, number>;
};

/** Perfil mínimo para cálculo (data e opcionalmente hora/local) */
export type CoreProfile = {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  fullName?: string;
};
