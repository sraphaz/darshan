/**
 * Sacred Library Engine — rotação determinística, evitar repetição (cooldown), tags temáticas.
 * Textos sagrados (Upanishads, Yoga Sutras, Bhagavad Gita) sempre em primeiro lugar no Instant Light.
 */

import {
  ALL_CLASSIC_TEXTS,
  type ClassicTextEntry,
} from "@/lib/knowledge/classicTexts";
import type { SacredTextEntry, PickSacredOptions } from "./types";

/** Converte ClassicTextEntry → SacredTextEntry com tags (source, guna, archetype). */
function toSacredEntry(e: ClassicTextEntry): SacredTextEntry {
  const tags: string[] = [
    e.source,
    e.guna ?? "sattva",
    ...(e.archetypeHints ?? []),
  ];
  return {
    id: e.id,
    source: e.source,
    work: e.work,
    verse: e.text,
    tags,
  };
}

let cachedSacredList: SacredTextEntry[] | null = null;

function getSacredList(): SacredTextEntry[] {
  if (cachedSacredList) return cachedSacredList;
  cachedSacredList = ALL_CLASSIC_TEXTS.map(toSacredEntry);
  return cachedSacredList;
}

/**
 * Escolhe um texto sagrado com rotação determinística e cooldown.
 * - themeTags: filtra por pelo menos uma tag (ex.: ["yoga-sutras", "mind"]).
 * - avoidLastIds: IDs a não repetir (cooldown).
 * - seed: escolha determinística (ex.: dailySeed).
 */
export function pickSacredText(options: PickSacredOptions = {}): SacredTextEntry {
  const {
    themeTags,
    avoidLastIds = [],
    avoidLastN = 0,
    seed,
  } = options;

  const list = getSacredList();
  let pool = list;

  if (themeTags?.length) {
    pool = pool.filter((e) =>
      themeTags.some((t) => e.tags.includes(t.toLowerCase()))
    );
    if (pool.length === 0) pool = list;
  }

  const avoidSet = new Set(avoidLastIds);
  if (avoidLastN > 0 && avoidLastIds.length >= avoidLastN) {
    const recent = avoidLastIds.slice(0, avoidLastN);
    recent.forEach((id) => avoidSet.add(id));
  }
  let candidates = pool.filter((e) => !avoidSet.has(e.id));
  if (candidates.length === 0) candidates = pool;

  const idx =
    seed !== undefined
      ? Math.abs(Math.floor(seed)) % candidates.length
      : Math.floor(Math.random() * candidates.length);
  return candidates[idx] ?? candidates[0];
}

/** Retorna seed diário (YYYYMMDD) para rotação por dia. */
export function getDailySeed(): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return y * 10000 + m * 100 + d;
}

export type { SacredTextEntry, PickSacredOptions } from "./types";
