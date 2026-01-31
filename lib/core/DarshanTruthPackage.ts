/**
 * Truth Package canônico — payload único que alimenta offline e IA.
 * Todo endpoint Darshan retorna este formato. Não inventar remédios; IA só expande a partir disso.
 */

import type { Theme, Mode } from "./UserRequestContext";

export type SacredCorpusKey =
  | "yoga_sutras"
  | "puranas"
  | "upanishads"
  | "legacy";

export type DarshanTruthPackage = {
  mode: Mode;
  theme: Theme;
  /** Estado RemedyMatrix escolhido */
  stateKey: string;
  diagnosis: {
    klesha: string;
    samkhyaGuna: string;
    qualities: string[];
    confidence?: number;
  };
  sacred: {
    id: string;
    corpus: SacredCorpusKey;
    text: string;
    translation?: string;
    tags?: string[];
    /** Versos de contexto (ex.: anterior ao sutra medicinal) para exibir em bloco completo */
    supporting?: { id: string; text: string }[];
  };
  practice: {
    title: string;
    steps: string[];
    duration?: string;
  };
  food?: {
    do: string[];
    avoid: string[];
  };
  /** Pergunta contemplativa final (canônico) */
  contemplativeQuestion: {
    text: string;
  };
  /** @deprecated Use contemplativeQuestion */
  question?: {
    text: string;
  };
  /** Opcional para modo personal */
  symbolicMap?: unknown;
  meta?: {
    generatedAt: string;
    usedSacredIds?: string[];
    usedStateKeys?: string[];
  };
  /** Insight do mapa (personal) */
  insight?: string;
  /** Campos flat para compatibilidade com cliente atual */
  sacredText?: string;
  sacredId?: string;
  sleep?: string;
  routine?: string;
};
