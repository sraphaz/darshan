/**
 * Readings modulares a partir do mapa simbólico canônico (lib/symbolic).
 * Cada getX(map) chama composeReading(map, topic). Motor modular e extensível.
 */

import type { UserProfileForOracle } from "@/lib/knowledge/types";
import type { SymbolicMap } from "@/lib/symbolic/types";
import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { composeReading } from "@/lib/narrative/composer";
import type { InsightTopic } from "@/lib/insights/types";

function toProfile(p: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): UserProfileForOracle {
  return {
    fullName: p.fullName,
    birthDate: p.birthDate,
    birthPlace: p.birthPlace,
    birthTime: p.birthTime,
  };
}

// ——— Getters por mapa (usados por readingOffline) ———
export function getGeneral(map: SymbolicMap): string {
  return composeReading(map, "general");
}

export function getLove(map: SymbolicMap): string {
  return composeReading(map, "love");
}

export function getCareer(map: SymbolicMap): string {
  return composeReading(map, "career");
}

export function getYear(map: SymbolicMap): string {
  return composeReading(map, "year");
}

export function getAction(map: SymbolicMap): string {
  return composeReading(map, "action");
}

/** Mapa tema externo (API) → tópico interno (composer). */
const THEME_TO_TOPIC: Record<string, InsightTopic> = {
  general: "general",
  love: "love",
  relationship: "love",
  career: "career",
  work: "career",
  year: "year",
  yearly: "year",
  action: "action",
};

/**
 * Leitura temática por nome de tema (usado por POST /api/reading?theme=).
 * Aceita: general | love | relationship | career | work | year | yearly | action.
 */
export function getReadingByTheme(map: SymbolicMap, theme: string): string {
  const topic = THEME_TO_TOPIC[theme?.toLowerCase()] ?? "general";
  return composeReading(map, topic);
}

// ——— Readings por perfil (conveniência) ———
export function getGeneralReadingSymbolic(profile: UserProfileForOracle): string {
  const map = buildSymbolicMap(profile);
  return getGeneral(map);
}

export function getLoveReadingSymbolic(profile: UserProfileForOracle): string {
  const map = buildSymbolicMap(profile);
  return getLove(map);
}

export function getCareerReadingSymbolic(profile: UserProfileForOracle): string {
  const map = buildSymbolicMap(profile);
  return getCareer(map);
}

export function getYearReadingSymbolic(profile: UserProfileForOracle): string {
  const map = buildSymbolicMap(profile);
  return getYear(map);
}

export function getActionReadingSymbolic(profile: UserProfileForOracle): string {
  const map = buildSymbolicMap(profile);
  return getAction(map);
}

export type StructuredOfflineReading = {
  general: string;
  love: string;
  career: string;
  year: string;
  action: string;
};

export function getStructuredOfflineReading(profile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): StructuredOfflineReading {
  const p = toProfile(profile);
  const map = buildSymbolicMap(p);
  return {
    general: getGeneral(map),
    love: getLove(map),
    career: getCareer(map),
    year: getYear(map),
    action: getAction(map),
  };
}
