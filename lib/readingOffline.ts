/**
 * Leitura (mapa pessoal) offline — monta um texto a partir do conhecimento local
 * (Jyotish, numerologia, arquétipos), sem chamar a IA.
 * Usa interpretação Jyotish para leitura (temas e efeitos narrativos), não as frases do oráculo.
 */

import { computeVedicChartSimplified } from "@/lib/knowledge/vedic";
import { getRulingNumberFromName, getNumberTraits } from "@/lib/knowledge/numerology";
import { getArchetypeTraits } from "@/lib/knowledge/archetypeTraits";
import { getRandomClassicTextForArchetype } from "@/lib/knowledge/classicTexts";
import {
  getJyotishReadingInterpretation,
  RASHI_MEANINGS,
  NAKSHATRA_MEANINGS,
} from "@/lib/knowledge/jyotishMeanings";
import type { RashiKey, NakshatraKey } from "@/lib/knowledge/types";

function getSeedFromProfile(profile: { fullName?: string; birthDate?: string; birthTime?: string }, offset: number): number {
  const str = [
    profile.fullName ?? "",
    profile.birthDate ?? "",
    profile.birthTime ?? "",
    String(offset),
  ].join("|");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function rashiName(key: RashiKey): string {
  const e = RASHI_MEANINGS.find((x) => x.key === key);
  return e?.namePt ?? key;
}

function nakshatraName(key: NakshatraKey): string {
  const e = NAKSHATRA_MEANINGS.find((x) => x.key === key);
  return e?.namePt ?? key;
}

/**
 * Gera uma leitura pessoal (mapa) totalmente offline, sem IA.
 * Usa interpretação Jyotish (temas + efeitos), descrição de arquétipo e numerologia,
 * e um texto clássico; evita as frases prontas do oráculo Darshan.
 */
export function getOfflineReading(profile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): string {
  const seed3 = (getSeedFromProfile(profile, 3) + Date.now()) >>> 0;

  const chart = computeVedicChartSimplified({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
  });
  const rulingNumber = getRulingNumberFromName(profile.fullName ?? "");
  const numberTraits = getNumberTraits(rulingNumber);
  const archetypeKey = chart.archetypeKeys?.[0];
  const archetypeEntry = archetypeKey ? getArchetypeTraits(archetypeKey) : undefined;

  const sections: string[] = [];

  // Introdução
  sections.push(
    "Esta leitura integra o mapa védico (Lua, signo e estação lunar), numerologia e arquétipos em uma síntese interpretativa."
  );

  // Lua e Jyotish (interpretação narrativa, não frases do oráculo)
  if (chart.moonRashi || chart.moonNakshatra) {
    const rashi = chart.moonRashi ? rashiName(chart.moonRashi as RashiKey) : "";
    const naks = chart.moonNakshatra ? nakshatraName(chart.moonNakshatra as NakshatraKey) : "";
    const line: string[] = [];
    if (rashi) line.push(`Sua Lua está no signo de ${rashi}`);
    if (naks) line.push(`na estação lunar ${naks}`);
    if (line.length) {
      sections.push(line.join(" e ") + ".");
      const interpretation = getJyotishReadingInterpretation(chart);
      if (interpretation) sections.push(interpretation);
    }
  }

  // Arquétipo (descrição a partir de traits, sem frase pronta)
  if (archetypeKey && archetypeEntry) {
    sections.push("");
    sections.push(`Arquétipo: ${archetypeEntry.name} — ${archetypeEntry.shortTrait}`);
    const personality = archetypeEntry.personality?.slice(0, 3).join(", ") ?? "";
    const tendencies = archetypeEntry.tendencies?.slice(0, 3).join("; ") ?? "";
    const challenges = archetypeEntry.challenges?.slice(0, 2).join("; ") ?? "";
    if (personality) sections.push(`Traços: ${personality}.`);
    if (tendencies) sections.push(`Tendências: ${tendencies}.`);
    if (challenges) sections.push(`Desafios possíveis: ${challenges}.`);
  }

  // Numerologia (descrição a partir de traits, sem frase pronta)
  sections.push("");
  sections.push(`Numerologia (Pitágoras) — Número regente ${rulingNumber}: ${numberTraits.name}.`);
  sections.push(numberTraits.shortTrait + ".");
  sections.push(`Tendências: ${numberTraits.tendencies.join("; ")}.`);
  sections.push(`Desafios: ${numberTraits.challenges.join("; ")}.`);

  // Um texto clássico (reflexão, não oráculo)
  const classic = getRandomClassicTextForArchetype(archetypeKey ?? "sábio", seed3);
  if (classic?.text) {
    sections.push("");
    sections.push(classic.text);
  }

  return sections.join("\n\n").trim();
}
