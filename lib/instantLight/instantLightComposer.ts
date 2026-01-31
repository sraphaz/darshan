/**
 * Instant Light Engine — Sacred Remedy Matrix + diagnóstico (Darshan high-end).
 * Retorna: verso sagrado + insight (se mapa) + prática + pergunta. Nunca aleatório puro; usa cooldown.
 * Sutra/Purana selector usa klesha + samkhyaGunas; Action selector usa ayurvedicQualities.
 */

import { getDailySeed } from "@/lib/sacred/sacredPicker";
import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { getGeneral } from "@/lib/readings/symbolicReadings";
import { selectRemedy } from "@/lib/diagnosis/diagnosisEngine";
import type { UserProfileForOracle } from "@/lib/knowledge/types";

export type InstantLightProfile = {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
};

export type ComposeInstantLightOptions = {
  /** IDs de textos sagrados recentes (evitar repetição) */
  recentSacredIds?: string[];
  /** Seed para escolha (default: dailySeed + salt) */
  seed?: number;
};

function hasProfile(profile: InstantLightProfile | undefined): boolean {
  if (!profile) return false;
  const name = (profile.fullName ?? "").trim();
  const date = (profile.birthDate ?? "").trim();
  return name.length > 0 || date.length > 0;
}

/**
 * Compõe a mensagem Instant Light a partir da matriz de remédios (30 estados).
 * - Sacred verse (da entrada selecionada) + insight do mapa (se perfil) + prática + pergunta.
 * - sacredId para cooldown = corpus.id (ex.: yoga_sutras.YS.1.33).
 */
export function composeInstantLight(
  profile?: InstantLightProfile,
  options: ComposeInstantLightOptions = {}
): { message: string; sacredId: string } {
  const { recentSacredIds = [], seed } = options;
  const dailySeed = getDailySeed();
  const effectiveSeed = seed ?? dailySeed * 1000 + (Date.now() % 1000);

  const remedy = selectRemedy(profile as UserProfileForOracle | undefined, {
    seed: effectiveSeed,
    recentSacredIds,
  });

  const verse = remedy.sacred?.verse ?? remedy.sacred?.id ?? "";
  const sacredId = remedy.sacred?.id
    ? `${remedy.sacred.corpus ?? "remedy"}.${remedy.sacred.id}`
    : remedy.state;

  const parts: string[] = [];
  if (verse.trim()) parts.push(verse.trim());

  if (hasProfile(profile)) {
    const map = buildSymbolicMap({
      fullName: profile!.fullName,
      birthDate: profile!.birthDate,
      birthTime: profile!.birthTime,
      birthPlace: profile!.birthPlace,
    });
    const insight = getGeneral(map);
    if (insight.trim()) parts.push(insight.trim());
  }

  if (remedy.practice?.trim()) parts.push(remedy.practice.trim());
  if (remedy.question?.trim()) parts.push(remedy.question.trim());

  const message = parts.join("\n\n").trim();
  return { message, sacredId };
}
