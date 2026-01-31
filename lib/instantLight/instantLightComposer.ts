/**
 * Instant Light — re-export do Sacred Remedy Engine (único composer).
 *
 * @deprecated Use @/lib/sacredRemedy. Wrapper de compatibilidade; pipeline oficial é sacredRemedy.
 */

import { composeInstantLight as composeSacredRemedy } from "@/lib/sacredRemedy";
import type { UserProfileForOracle } from "@/lib/knowledge/types";

export type InstantLightProfile = {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
};

export type ComposeInstantLightOptions = {
  recentSacredIds?: string[];
  recentStateKeys?: string[];
  seed?: number;
};

/**
 * Compõe a mensagem Instant Light (delega ao Sacred Remedy e monta message única).
 * Retorno legado: { message, sacredId } para compatibilidade com quem ainda importa daqui.
 */
export function composeInstantLight(
  profile?: InstantLightProfile | null,
  options: ComposeInstantLightOptions = {}
): { message: string; sacredId: string } {
  const res = composeSacredRemedy(profile as UserProfileForOracle | null, options);
  const parts: string[] = [];
  if (res.sacredText?.trim()) parts.push(res.sacredText.trim());
  if (res.insight?.trim()) parts.push(res.insight.trim());
  if (res.practice?.trim()) parts.push(res.practice.trim());
  if (res.food?.trim()) parts.push(res.food.trim());
  if (res.question?.trim()) parts.push(res.question.trim());
  const message = parts.join("\n\n").trim();
  return { message, sacredId: res.sacredId ?? "" };
}
