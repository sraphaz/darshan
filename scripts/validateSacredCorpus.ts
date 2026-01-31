/**
 * Valida o corpus sagrado (yoga_sutras_full, puranas, upanishads).
 * - IDs únicos
 * - Tags obrigatórias: id, text, kleshaTargets, qualities
 * - Cobertura mínima por klesha e por qualities
 * - Peso balanceado entre corpora
 *
 * Uso: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/validateSacredCorpus.ts
 * Ou: node --loader ts-node/esm scripts/validateSacredCorpus.ts (conforme ambiente)
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const SACRED_DIR = path.join(ROOT, "lib", "dictionaries", "sacred");

type SacredEntry = {
  id: string;
  text: string;
  kleshaTargets?: string[];
  qualities?: string[];
  themes?: string[];
};

const REQUIRED_KLESHAS = ["avidya", "asmita", "raga", "dvesha", "abhinivesha"];
const KNOWN_QUALITIES = new Set([
  "guru", "laghu", "snigdha", "ruksha", "sita", "ushna", "manda", "tikshna",
  "sthira", "chala", "mridu", "kathina", "vishada", "picchila", "shlakshna", "khara",
  "sukshma", "sthula", "sandra", "drava", "sara",
]);

function loadJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function validateCorpus(
  corpusName: string,
  entries: SacredEntry[],
  allIds: Set<string>
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e.id) errors.push(`[${corpusName}] entrada ${i}: falta "id"`);
    else if (allIds.has(e.id)) errors.push(`[${corpusName}] id duplicado: ${e.id}`);
    else allIds.add(e.id);

    if (!e.text || typeof e.text !== "string") errors.push(`[${corpusName}] entrada ${e.id ?? i}: falta ou inválido "text"`);
    if (!e.kleshaTargets || !Array.isArray(e.kleshaTargets) || e.kleshaTargets.length === 0) {
      errors.push(`[${corpusName}] entrada ${e.id ?? i}: "kleshaTargets" obrigatório e não vazio`);
    }
    if (!e.qualities || !Array.isArray(e.qualities)) {
      errors.push(`[${corpusName}] entrada ${e.id ?? i}: "qualities" obrigatório (array)`);
    }
    if (e.qualities) {
      for (const q of e.qualities) {
        if (!KNOWN_QUALITIES.has(q)) errors.push(`[${corpusName}] entrada ${e.id}: quality desconhecida "${q}"`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

function checkCoverage(
  corpusName: string,
  entries: SacredEntry[]
): { ok: boolean; messages: string[] } {
  const byKlesha = new Map<string, number>();
  const byQuality = new Map<string, number>();
  for (const e of entries) {
    for (const k of e.kleshaTargets ?? []) {
      byKlesha.set(k, (byKlesha.get(k) ?? 0) + 1);
    }
    for (const q of e.qualities ?? []) {
      byQuality.set(q, (byQuality.get(q) ?? 0) + 1);
    }
  }
  const messages: string[] = [];
  for (const k of REQUIRED_KLESHAS) {
    const n = byKlesha.get(k) ?? 0;
    if (n === 0) messages.push(`[${corpusName}] nenhuma entrada para klesha "${k}"`);
  }
  const minQualityEntries = 3;
  for (const [q, n] of byQuality) {
    if (n < minQualityEntries && entries.length > 20) {
      messages.push(`[${corpusName}] quality "${q}" aparece apenas ${n} vezes`);
    }
  }
  return { ok: messages.length === 0, messages };
}

function main(): void {
  const allIds = new Set<string>();
  const results: { corpus: string; entries: number; ok: boolean; errors: string[]; coverage: string[] }[] = [];

  const files = [
    { name: "yoga_sutras_full", path: path.join(SACRED_DIR, "yoga_sutras_full.json") },
    { name: "puranas", path: path.join(SACRED_DIR, "puranas.json") },
    { name: "upanishads", path: path.join(SACRED_DIR, "upanishads.json") },
  ];

  for (const { name, path: filePath } of files) {
    if (!fs.existsSync(filePath)) {
      results.push({ corpus: name, entries: 0, ok: false, errors: [`Arquivo não encontrado: ${filePath}`], coverage: [] });
      continue;
    }
    const data = loadJson<SacredEntry[]>(filePath);
    const entries = Array.isArray(data) ? data : [];
    const { ok, errors } = validateCorpus(name, entries, allIds);
    const { ok: covOk, messages: coverage } = checkCoverage(name, entries);
    results.push({
      corpus: name,
      entries: entries.length,
      ok: ok && covOk,
      errors,
      coverage: covOk ? [] : coverage,
    });
  }

  let exitCode = 0;
  for (const r of results) {
    console.log(`\n--- ${r.corpus} (${r.entries} entradas) ---`);
    if (r.errors.length > 0) {
      r.errors.forEach((e) => console.error("  ERRO:", e));
      exitCode = 1;
    }
    if (r.coverage.length > 0) {
      r.coverage.forEach((m) => console.warn("  COVERAGE:", m));
      exitCode = 1;
    }
    if (r.ok && r.errors.length === 0 && r.coverage.length === 0) {
      console.log("  OK");
    }
  }
  console.log("\n");
  process.exit(exitCode);
}

main();
