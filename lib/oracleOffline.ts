/**
 * Oráculo offline — interpreta perfil e pergunta usando apenas o dicionário local.
 * Integra: arquétipo (Jyotish), número regente (numerologia), traits, textos clássicos e formulações.
 * Usa seed derivado do perfil para variedade e menor replicação.
 */

import type { UserProfileForOracle } from "./knowledge/types";
import { computeVedicChartSimplified } from "./knowledge/vedic";
import { extractKeywords } from "./knowledge/keywordMatch";
import { getRandomFormulation } from "./knowledge/formulations";
import { getRandomClassicTextForArchetype } from "./knowledge/classicTexts";
import { getRandomArchetypePhrase } from "./knowledge/archetypeTraits";
import { getJyotishPhraseForChart } from "./knowledge/jyotishMeanings";
import { getRulingNumberFromName, getRandomPhraseForNumber } from "./knowledge/numerology";

const MAX_SEED_TRIES = 30;
/** Número de blocos: na maioria 1, às vezes 2, raramente 3. */
function getTargetBlockCount(seed4: number): number {
  const r = seed4 % 10;
  if (r <= 6) return 1;   // ~70% — mais 1
  if (r <= 8) return 2;   // ~20% — poucas vezes 2
  return 3;               // ~10% — raramente 3
}

/** Normaliza texto para comparação (trim + lowercase). */
function normalizeForCompare(text: string): string {
  return text.trim().toLowerCase();
}

/** Verifica se o texto já existe nos blocos (normalizado) para evitar repetição. */
function isDuplicate(text: string, blocks: string[]): boolean {
  const n = normalizeForCompare(text);
  if (!n) return true;
  return blocks.some((b) => normalizeForCompare(b) === n);
}

/** Verifica se o texto está no conjunto de frases usadas nas últimas rodadas. */
function isRecentlyUsed(text: string, recentSet: Set<string>): boolean {
  const n = normalizeForCompare(text);
  return n.length > 0 && recentSet.has(n);
}

/** Retorna true se o texto pode ser usado (não está em blocks nem em recentSet). */
function canUsePhrase(text: string, blocks: string[], recentSet: Set<string>): boolean {
  return !isDuplicate(text, blocks) && !isRecentlyUsed(text, recentSet);
}

/** Gera um seed numérico a partir do perfil para variedade com menor replicação */
function getSeedFromProfile(profile: UserProfileForOracle, offset: number = 0): number {
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

/** Embaralha um array de forma determinística (seed) para ordem fluida, não fixa por tema. */
function shuffleBySeed<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sal de aleatoriedade por requisição (tempo + aleatório) para variar as frases a cada chamada. */
function getRequestSalt(): number {
  return (Date.now() * 1000 + Math.floor(Math.random() * 1000)) >>> 0;
}

/** Gera uma mensagem de revelação a partir do perfil e do dicionário offline. */
export function getOfflineRevelation(
  profile: UserProfileForOracle,
  userMessage?: string,
  recentlyUsedPhrases?: string[]
): string {
  const salt = getRequestSalt();
  const seedBase = (getSeedFromProfile(profile) + salt) >>> 0;
  const seed1 = (getSeedFromProfile(profile, 1) + salt * 31) >>> 0;
  const seed2 = (getSeedFromProfile(profile, 2) + salt * 37) >>> 0;
  const seed3 = (getSeedFromProfile(profile, 3) + salt * 41) >>> 0;
  const seed4 = (getSeedFromProfile(profile, 4) + salt * 43) >>> 0;

  const recentSet = new Set(
    (recentlyUsedPhrases ?? [])
      .map((p) => normalizeForCompare(p))
      .filter((n) => n.length > 0)
  );

  const keywords = extractKeywords(userMessage);
  const blocks: string[] = [];

  const chart = computeVedicChartSimplified({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
  });
  const archetypeKey = chart.archetypeKeys[0];
  const rulingNumber = getRulingNumberFromName(profile.fullName ?? "");
  const firstName = profile.fullName?.trim().split(/\s+/)[0];
  const closing = firstName && (seed4 % 3 === 0)
    ? `${firstName}, o que em você já sabe?`
    : "O que em você já sabe?";

  function pickPhrase(
    getPhrase: (seed: number) => string | null,
    baseSeed: number
  ): string | null {
    let phrase = getPhrase(baseSeed);
    for (let k = 0; k < MAX_SEED_TRIES && phrase && !canUsePhrase(phrase, blocks, recentSet); k++) {
      phrase = getPhrase(baseSeed + k + 1);
    }
    return phrase && !isDuplicate(phrase, blocks) ? phrase : null;
  }

  const formulationText = pickPhrase(
    (s) => getRandomFormulation(archetypeKey, s, keywords)?.text ?? null,
    seedBase
  );

  const archetypePhrase = pickPhrase(
    (s) => getRandomArchetypePhrase(archetypeKey, s, keywords),
    seed1
  );
  const classicText = pickPhrase(
    (s) => getRandomClassicTextForArchetype(archetypeKey, s, keywords)?.text ?? null,
    seed2
  );
  const jyotishPhrase = pickPhrase(
    (s) => getJyotishPhraseForChart(chart, s, keywords),
    seed2 + 1
  );
  const numberPhrase = pickPhrase(
    (s) => getRandomPhraseForNumber(rulingNumber, s, keywords),
    seed3
  );

  const typedPhrases: { phrase: string }[] = [];
  const seenNormalized = new Set<string>();

  function addIfNew(phrase: string | null): void {
    if (!phrase) return;
    const n = normalizeForCompare(phrase);
    if (!n || seenNormalized.has(n)) return;
    seenNormalized.add(n);
    typedPhrases.push({ phrase });
  }

  addIfNew(formulationText);
  addIfNew(archetypePhrase);
  addIfNew(classicText);
  addIfNew(jyotishPhrase);
  addIfNew(numberPhrase);
  if (closing && !isRecentlyUsed(closing, recentSet)) addIfNew(closing);

  const shuffled = shuffleBySeed(typedPhrases, seed4);
  const targetTotal = getTargetBlockCount(seed4);

  for (const { phrase } of shuffled) {
    if (phrase && !isDuplicate(phrase, blocks) && !isRecentlyUsed(phrase, recentSet)) {
      blocks.push(phrase);
    }
    if (blocks.length >= targetTotal) break;
  }

  if (blocks.length === 0 && shuffled.length > 0) {
    const fallback = shuffled.find(({ phrase }) => phrase && !isDuplicate(phrase, blocks));
    if (fallback?.phrase) blocks.push(fallback.phrase);
  }

  return blocks.join("\n\n");
}
