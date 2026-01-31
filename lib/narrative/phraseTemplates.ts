/**
 * Templates de frase para o Narrative Composer — tudo derivado do mapa.
 * placements, yogas, archetypes, theme → frase determinística (sem IA).
 */

import { phraseFor } from "@/lib/dictionaries";

export type TemplateContext = {
  placements?: { moonRashi?: string; nakshatra?: string };
  yogas?: string[];
  archetypes?: string[];
  theme: "general" | "love" | "career" | "year" | "action";
};

/** Retorna a frase do dicionário para uma chave de insight (usado pelo Composer). */
export function getPhraseForInsight(key: string): string {
  return phraseFor(key);
}

/**
 * Retorna uma frase para o contexto (placements + theme).
 * O Composer principal usa composeReading(map, topic); este helper serve chamadas que já têm só placements/theme.
 */
export function getPhraseForContext(ctx: TemplateContext): string {
  if (ctx.placements?.nakshatra) {
    const key = `jyotish.${ctx.placements.nakshatra}.${ctx.theme === "general" ? "general" : ctx.theme}`;
    const phrase = phraseFor(key);
    if (phrase) return phrase;
  }
  if (ctx.placements?.moonRashi) {
    const key = `jyotish.${ctx.placements.moonRashi}.${ctx.theme === "general" ? "general" : ctx.theme}`;
    const phrase = phraseFor(key);
    if (phrase) return phrase;
  }
  return phraseFor("jyotish.revati.soulPath") || "";
}
