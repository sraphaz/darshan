/**
 * Sacred Selector — seleção dirigida de texto sagrado por klesha e qualidades.
 * Carrega yoga_sutras_full (196 sutras), puranas, upanishads (dictionaries/sacred/) com kleshaTargets, qualities e themes.
 */

import type { SacredCorpusEntry } from "./types";

import yogaSutrasFullJson from "@/lib/dictionaries/sacred/yoga_sutras_full.json";
import puranasJson from "@/lib/dictionaries/sacred/puranas.json";
import upanishadsJson from "@/lib/dictionaries/sacred/upanishads.json";

const YOGA_SUTRAS = yogaSutrasFullJson as SacredCorpusEntry[];
const PURANAS = puranasJson as SacredCorpusEntry[];
const UPANISHADS = upanishadsJson as SacredCorpusEntry[];

/** Todas as entradas com corpus para id único */
type TaggedEntry = SacredCorpusEntry & { corpus: string };

function tagCorpus(entries: SacredCorpusEntry[], corpus: string): TaggedEntry[] {
  return entries.map((e) => ({ ...e, corpus }));
}

const ALL_SACRED: TaggedEntry[] = [
  ...tagCorpus(YOGA_SUTRAS, "yoga_sutras"),
  ...tagCorpus(PURANAS, "puranas"),
  ...tagCorpus(UPANISHADS, "upanishads"),
];

export type SelectSacredOptions = {
  /** Kleśas que o texto deve endereçar (pelo menos um match em kleshaTargets) */
  kleshaTargets?: string[];
  /** Qualidades em excesso (match em qualities do texto) */
  qualities?: string[];
  /** IDs a evitar (anti-repetição) — formato "corpus.id" ou só "id" */
  avoidIds?: string[];
  /** Seed para escolha determinística */
  seed?: number;
};

/**
 * Seleciona um texto sagrado dirigido por klesha e qualidades.
 * Prioriza entradas que batem em kleshaTargets; depois em qualities; evita avoidIds.
 */
export function selectSacredText(options: SelectSacredOptions = {}): SacredCorpusEntry & { corpus: string } {
  const { kleshaTargets = [], qualities = [], avoidIds = [], seed = 0 } = options;
  const avoidSet = new Set(avoidIds);
  const kleshaSet = new Set(kleshaTargets.filter(Boolean));
  const qualitySet = new Set(qualities.filter(Boolean));

  const score = (e: TaggedEntry): number => {
    let s = 0;
    const targets = e.kleshaTargets ?? [];
    const quals = e.qualities ?? [];
    if (kleshaSet.size && targets.some((t) => kleshaSet.has(t))) s += 2;
    if (qualitySet.size && quals.some((q) => qualitySet.has(q))) s += 1;
    return s;
  };

  const byAvoid = ALL_SACRED.filter((e) => {
    const fullId = `${e.corpus}.${e.id}`;
    return !avoidSet.has(fullId) && !avoidSet.has(e.id);
  });
  const pool = byAvoid.length > 0 ? byAvoid : ALL_SACRED;

  const scored = pool.map((e) => ({ e, s: score(e) }));
  scored.sort((a, b) => b.s - a.s);
  const bestScore = scored[0]?.s ?? 0;
  const candidates = bestScore > 0 ? scored.filter((x) => x.s === bestScore).map((x) => x.e) : pool;

  const idx = Math.abs(Math.floor(seed)) % candidates.length;
  return candidates[idx] ?? candidates[0];
}

/** Retorna lista completa para fallback ou inspeção */
export function getAllSacredEntries(): TaggedEntry[] {
  return ALL_SACRED;
}
