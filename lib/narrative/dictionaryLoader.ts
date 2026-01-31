/**
 * Carregador de dicionários — agrega todas as fontes de frases (Jyotish, HD, Action, Numerologia, Symbolic).
 * Usado pelo Narrative Composer; tudo derivado do mapa, sem aleatoriedade solta.
 */

import { JYOTISH_PHRASES } from "@/lib/dictionaries/jyotish";
import { HD_PHRASES } from "@/lib/dictionaries/humanDesign";
import { ACTION_PHRASES } from "@/lib/dictionaries/action";
import { NUMEROLOGY_PHRASES } from "@/lib/dictionaries/numerology";
import { PHRASES_FOR_SYMBOLIC } from "@/lib/dictionaries/phrasesForSymbolic";

export type PhraseDictionary = Record<string, string[]>;

/** Retorna o dicionário único mergendo todas as fontes (mesma ordem que phraseFor). */
export function getMergedDictionaries(): PhraseDictionary {
  return {
    ...JYOTISH_PHRASES,
    ...HD_PHRASES,
    ...ACTION_PHRASES,
    ...NUMEROLOGY_PHRASES,
    ...PHRASES_FOR_SYMBOLIC,
  };
}

/** Retorna a primeira frase para uma chave, ou string vazia (sem aleatoriedade). */
export function getPhraseFromDict(dict: PhraseDictionary, key: string): string {
  const phrases = dict[key];
  if (phrases && phrases.length > 0) return phrases[0];
  return "";
}
