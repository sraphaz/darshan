/**
 * Oráculo offline — interpreta perfil e pergunta usando apenas o dicionário local.
 * Integra: arquétipo (Jyotish), número regente (numerologia), traits, textos clássicos e formulações.
 * Usa seed derivado do perfil para variedade e menor replicação.
 */

import type { UserProfileForOracle } from "./knowledge/types";
import { buildSymbolicMap } from "./engines/buildSymbolicMap";
import { collectAllInsights } from "./insights/collectInsights";
import { phraseFor } from "./dictionaries";

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

/** Gera uma mensagem de revelação a partir do SymbolicMap e insights (coerente com o mapa). */
export async function getOfflineRevelation(
  profile: UserProfileForOracle,
  _userMessage?: string,
  recentlyUsedPhrases?: string[]
): Promise<string> {
  const salt = getRequestSalt();
  const seed4 = (getSeedFromProfile(profile, 4) + salt * 43) >>> 0;

  const recentSet = new Set(
    (recentlyUsedPhrases ?? [])
      .map((p) => normalizeForCompare(p))
      .filter((n) => n.length > 0)
  );

  const coreProfile = {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    fullName: profile.fullName,
  };
  const map = await buildSymbolicMap(coreProfile);
  const insights = collectAllInsights(map).filter((i) => i.topic === "general");
  const sorted = [...insights].sort((a, b) => b.weight - a.weight);

  const candidates: string[] = [];
  const seenNormalized = new Set<string>();
  for (const i of sorted) {
    const phrase = phraseFor(i.key);
    if (!phrase) continue;
    const n = normalizeForCompare(phrase);
    if (!n || seenNormalized.has(n) || recentSet.has(n)) continue;
    seenNormalized.add(n);
    candidates.push(phrase);
  }

  const firstName = profile.fullName?.trim().split(/\s+/)[0];
  const closing = firstName && seed4 % 3 === 0
    ? `${firstName}, o que em você já sabe?`
    : "O que em você já sabe?";
  if (closing && !recentSet.has(normalizeForCompare(closing))) candidates.push(closing);

  const shuffled = shuffleBySeed(candidates.map((phrase) => ({ phrase })), seed4);
  const targetTotal = getTargetBlockCount(seed4);
  const blocks: string[] = [];

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
