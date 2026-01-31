/**
 * Leitura (mapa pessoal) offline — SymbolicMap → Insights → Composer → Readings modulares.
 * getOfflineReading é apenas um wrapper: monta o mapa e devolve general + love + career + year + action.
 * Sem IA; motor determinístico e extensível (pronto para Swiss Ephemeris e Human Design).
 */

import { buildSymbolicMap } from "@/lib/symbolic/builder";
import {
  getGeneral,
  getLove,
  getCareer,
  getYear,
  getAction,
  type StructuredOfflineReading,
} from "@/lib/readings/symbolicReadings";

export type { StructuredOfflineReading };

/**
 * Wrapper: map = buildSymbolicMap(profile) → return { general, love, career, year, action }.
 */
export function getOfflineReading(profile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): StructuredOfflineReading {
  const map = buildSymbolicMap({
    fullName: profile.fullName,
    birthDate: profile.birthDate,
    birthPlace: profile.birthPlace,
    birthTime: profile.birthTime,
  });
  return {
    general: getGeneral(map),
    love: getLove(map),
    career: getCareer(map),
    year: getYear(map),
    action: getAction(map),
  };
}

/**
 * Retorna o texto completo da leitura (todas as seções unidas).
 * Útil para compatibilidade com APIs que esperam uma única string (message).
 */
export function getOfflineReadingFullText(profile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): string {
  const s = getOfflineReading(profile);
  const parts: string[] = [];
  const intro = "Esta leitura integra o mapa védico (Lua, signo e estação lunar), numerologia e arquétipos.";
  parts.push(intro);
  if (s.general.trim()) parts.push(s.general.trim());
  if (s.love.trim()) parts.push(s.love.trim());
  if (s.career.trim()) parts.push(s.career.trim());
  if (s.year.trim()) parts.push(s.year.trim());
  if (s.action.trim()) parts.push(s.action.trim());
  return parts.join("\n\n").trim();
}
