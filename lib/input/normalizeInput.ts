/**
 * Normalização do input do usuário para matching offline.
 * Lower-case, remove acentos, aplica inputNormalization.json, remove ruído.
 */

import inputNormalizationJson from "@/lib/dictionaries/inputNormalization.json";

type NormalizationMap = Record<string, string>;

const NORMALIZATION_MAP = inputNormalizationJson as NormalizationMap;

/** Palavras de ruído a remover (não afetam intent) */
const NOISE_WORDS = new Set([
  "tipo", "mano", "cara", "então", "entao", "assim", "tipo assim",
  "aí", "ai", "daí", "dai", "né", "ne", "entendeu", "sabe",
]);

/**
 * Remove acentos (NFD + remove combining marks).
 */
function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

/**
 * Aplica substituições do dicionário (abreviações → forma expandida).
 * Ordena por tamanho decrescente para aplicar "tô" antes de "t" se existir.
 */
function applyNormalizationMap(text: string): string {
  let out = text;
  const entries = Object.entries(NORMALIZATION_MAP)
    .filter(([, v]) => v != null && String(v).length > 0)
    .sort(([a], [b]) => b.length - a.length);
  for (const [key, value] of entries) {
    const k = key.toLowerCase();
    const v = String(value).toLowerCase();
    const re = new RegExp(`\\b${escapeRe(k)}\\b`, "gi");
    out = out.replace(re, v);
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remove palavras de ruído.
 */
function removeNoiseWords(text: string): string {
  const words = text.split(/\s+/).filter((w) => {
    const lower = w.toLowerCase();
    return lower.length > 0 && !NOISE_WORDS.has(removeAccents(lower));
  });
  return words.join(" ").trim();
}

/**
 * Normaliza o texto do usuário para matching:
 * 1. Trim
 * 2. Lower-case
 * 3. Aplica inputNormalization (abreviações)
 * 4. Remove acentos
 * 5. Remove palavras de ruído
 * 6. Colapsa espaços múltiplos
 */
export function normalizeInput(userText: string | null | undefined): string {
  if (userText == null || typeof userText !== "string") return "";
  let s = userText.trim().toLowerCase();
  if (s.length === 0) return "";
  s = applyNormalizationMap(s);
  s = removeAccents(s);
  s = removeNoiseWords(s);
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
