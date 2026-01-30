/**
 * Store de configuração editável — sementes da IA e textos do oráculo.
 * Persistência em arquivo (data/config.json); em produção pode usar KV (variável de ambiente).
 */

import fs from "fs";
import path from "path";

export type ConfigFieldMode = "replace" | "complement";

export type AppConfig = {
  masterPromptOverride?: string | null;
  masterPromptMode?: ConfigFieldMode | null;
  revelationInstructionOverride?: string | null;
  revelationInstructionMode?: ConfigFieldMode | null;
  mockMessagesOverride?: string[] | null;
  mockMessagesMode?: ConfigFieldMode | null;
  /** Instrução/prompt da Leitura (resumo completo Sol, Lua, planetas, Nakshatras, numerologia). */
  readingInstructionOverride?: string | null;
  readingInstructionMode?: ConfigFieldMode | null;
  /** Créditos por revelação (IA). Padrão 1. */
  creditsPerRevelation?: number | null;
  /** Créditos por leitura (resumo completo). Padrão 9. */
  creditsPerReading?: number | null;
  /** Valor por crédito em centavos (BRL). Ex.: 69 = R$ 0,69. Usado para exibição e pacotes. */
  pricePerCreditCents?: number | null;
  updatedAt?: string | null;
};

const DEFAULT_CONFIG: AppConfig = {};

function getConfigPath(): string {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dir, "config.json");
}

function ensureDataDir(): void {
  const dir = path.dirname(getConfigPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Lê a configuração atual. Se o arquivo não existir ou KV não estiver configurado, retorna objeto vazio.
 */
export function getConfig(): AppConfig {
  if (process.env.DARSHAN_CONFIG_KV === "1" && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return getConfigFromKV();
  }
  const filePath = getConfigPath();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    const mode = (v: unknown): ConfigFieldMode =>
      v === "replace" || v === "complement" ? v : "complement";
    return {
      masterPromptOverride: typeof data.masterPromptOverride === "string" ? data.masterPromptOverride : null,
      masterPromptMode: mode(data.masterPromptMode),
      revelationInstructionOverride:
        typeof data.revelationInstructionOverride === "string" ? data.revelationInstructionOverride : null,
      revelationInstructionMode: mode(data.revelationInstructionMode),
      mockMessagesOverride: Array.isArray(data.mockMessagesOverride)
        ? data.mockMessagesOverride.filter((x): x is string => typeof x === "string")
        : null,
      mockMessagesMode: mode(data.mockMessagesMode),
      readingInstructionOverride:
        typeof data.readingInstructionOverride === "string" ? data.readingInstructionOverride : null,
      readingInstructionMode: mode(data.readingInstructionMode),
      creditsPerRevelation: typeof data.creditsPerRevelation === "number" && data.creditsPerRevelation >= 0 ? data.creditsPerRevelation : null,
      creditsPerReading: typeof data.creditsPerReading === "number" && data.creditsPerReading >= 0 ? data.creditsPerReading : null,
      pricePerCreditCents: typeof data.pricePerCreditCents === "number" && data.pricePerCreditCents >= 0 ? data.pricePerCreditCents : null,
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Grava configuração (merge com o que já existe). Em produção com KV, persiste no KV.
 */
export function setConfig(partial: Partial<AppConfig>): AppConfig {
  const current = getConfig();
  const updated: AppConfig = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  if (process.env.DARSHAN_CONFIG_KV === "1" && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    setConfigToKV(updated);
    return updated;
  }
  ensureDataDir();
  const filePath = getConfigPath();
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        masterPromptOverride: updated.masterPromptOverride ?? null,
        masterPromptMode: updated.masterPromptMode ?? "complement",
        revelationInstructionOverride: updated.revelationInstructionOverride ?? null,
        revelationInstructionMode: updated.revelationInstructionMode ?? "complement",
        mockMessagesOverride: updated.mockMessagesOverride ?? null,
        mockMessagesMode: updated.mockMessagesMode ?? "complement",
        readingInstructionOverride: updated.readingInstructionOverride ?? null,
        readingInstructionMode: updated.readingInstructionMode ?? "complement",
        creditsPerRevelation: updated.creditsPerRevelation ?? null,
        creditsPerReading: updated.creditsPerReading ?? null,
        pricePerCreditCents: updated.pricePerCreditCents ?? null,
        updatedAt: updated.updatedAt ?? null,
      },
      null,
      2
    ),
    "utf8"
  );
  return updated;
}

/** Placeholder: leitura de KV (Vercel KV / Upstash). Implementar quando DARSHAN_CONFIG_KV=1. */
function getConfigFromKV(): AppConfig {
  // TODO: fetch from KV_REST_API_URL with KV_REST_API_TOKEN, key "darshan:config"
  return { ...DEFAULT_CONFIG };
}

/** Placeholder: escrita em KV. Implementar quando DARSHAN_CONFIG_KV=1. */
function setConfigToKV(_config: AppConfig): void {
  // TODO: PUT to KV_REST_API_URL with KV_REST_API_TOKEN, key "darshan:config"
}
