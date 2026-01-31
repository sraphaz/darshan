/**
 * Tipos da Sacred Library — textos sagrados (Upanishads, Yoga Sutras, Bhagavad Gita, Puranas).
 * Cada item tem id, verso, source e tags para filtro temático e rotação.
 */

export type SacredSource = "upanishad" | "bhagavad-gita" | "yoga-sutras" | "outro";

export type SacredTextEntry = {
  id: string;
  source: SacredSource;
  work?: string;
  verse: string;
  /** Tags para filtro e rotação (mind, silence, discipline, etc.) */
  tags: string[];
};

export type PickSacredOptions = {
  /** Filtrar por pelo menos uma tag (ex.: ["mind", "silence"]) */
  themeTags?: string[];
  /** IDs a evitar (cooldown / evitar repetição) */
  avoidLastIds?: string[];
  /** Seed determinístico (ex.: dailySeed) */
  seed?: number;
  /** Número de itens recentes a evitar por índice (alternativa a avoidLastIds) */
  avoidLastN?: number;
};
