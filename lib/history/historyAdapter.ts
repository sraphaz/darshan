/**
 * Adapter de histórico para Instant Light — cooldown server-side autônomo.
 * getRecentSacredIds / getRecentStateKeys para avoidIds; recordInstantLight grava o Truth Package.
 * Delega para historyStorage (Supabase).
 */

import { getRecentInstantLightIds, recordInstantLightUse } from "@/lib/historyStorage";
import type { DarshanTruthPackage } from "@/lib/core/DarshanTruthPackage";

/**
 * Retorna sacredIds recentes do usuário (últimos N dias) para evitar repetição.
 */
export async function getRecentSacredIds(
  userKey: string,
  sinceDays: number = 7,
  limit: number = 50
): Promise<string[]> {
  const { sacredIds } = await getRecentInstantLightIds(userKey, limit, sinceDays);
  return sacredIds;
}

/**
 * Retorna stateKeys recentes do usuário (últimos N dias) para evitar repetição.
 */
export async function getRecentStateKeys(
  userKey: string,
  sinceDays: number = 7,
  limit: number = 50
): Promise<string[]> {
  const { stateKeys } = await getRecentInstantLightIds(userKey, limit, sinceDays);
  return stateKeys;
}

/**
 * Registra uso do Instant Light (Truth Package) para cooldown.
 * Cliente não controla cooldown; o servidor grava automaticamente.
 */
export async function recordInstantLight(
  userKey: string,
  truthPackage: DarshanTruthPackage
): Promise<void> {
  const sacredId = truthPackage.sacred?.id
    ? `${truthPackage.sacred.corpus ?? "legacy"}.${truthPackage.sacred.id}`
    : "";
  await recordInstantLightUse(userKey, {
    sacredId: sacredId || "unknown",
    stateKey: truthPackage.stateKey,
  });
}
