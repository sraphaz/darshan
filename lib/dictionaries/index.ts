/**
 * Resolve frase por chave de insight — consulta Jyotish, HD, Action e mapa simbólico.
 * Retorna a primeira frase do array (determinístico).
 */

import { JYOTISH_PHRASES } from "./jyotish";
import { HD_PHRASES } from "./humanDesign";
import { ACTION_PHRASES } from "./action";
import { NUMEROLOGY_PHRASES } from "./numerology";
import { PHRASES_FOR_SYMBOLIC } from "./phrasesForSymbolic";

const ALL: Record<string, string[]> = {
  ...JYOTISH_PHRASES,
  ...HD_PHRASES,
  ...ACTION_PHRASES,
  ...NUMEROLOGY_PHRASES,
  ...PHRASES_FOR_SYMBOLIC,
};

export function phraseFor(key: string): string {
  let lookupKey = key;
  if (key.startsWith("action.n.")) {
    const num = key.slice("action.n.".length);
    lookupKey = `action.${num}`;
  }
  // action.archetype.X: fallback para action.general se arquétipo sem frase
  if (key.startsWith("action.archetype.")) {
    const phrases = ALL[key];
    if (phrases && phrases.length > 0) return phrases[0];
    return (ALL["action.general"] as string[])?.[0] ?? "";
  }
  const phrases = ALL[lookupKey] ?? ALL[key];
  if (phrases && phrases.length > 0) return phrases[0];
  return "";
}

export { JYOTISH_PHRASES, HD_PHRASES, ACTION_PHRASES, NUMEROLOGY_PHRASES };
