/**
 * GET /api/instant-light — Sacred Remedy Engine (motor medicinal offline).
 * Não consome créditos; não depende de IA. Motor paralelo ao /api/darshan.
 *
 * Query: fullName?, birthDate?, birthTime?, birthPlace?, recentSacredIds?, recentStateKeys?
 * - Se userProfile existe (nome ou data) → diagnosisPersonal(SymbolicMap) + insight.
 * - Se não existe → diagnosisUniversal().
 * - Cooldown server-side: quando há sessão, recentSacredIds/recentStateKeys vêm do servidor e o uso é registrado.
 *
 * Resposta: sacredText, insight? (se personal), practice, question, sacredId?, stateKey?
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { composeInstantLight } from "@/lib/sacredRemedy";
import { getSessionFromCookie } from "@/lib/auth";
import { getRecentInstantLightIds, recordInstantLightUse } from "@/lib/historyStorage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fullName = searchParams.get("fullName") ?? undefined;
  const birthDate = searchParams.get("birthDate") ?? undefined;
  const birthTime = searchParams.get("birthTime") ?? undefined;
  const birthPlace = searchParams.get("birthPlace") ?? undefined;
  const recentSacredIdsParam = searchParams.get("recentSacredIds");
  const recentStateKeysParam = searchParams.get("recentStateKeys");

  let recentSacredIds = recentSacredIdsParam
    ? recentSacredIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  let recentStateKeys = recentStateKeysParam
    ? recentStateKeysParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const cookieStore = await cookies();
  const session = getSessionFromCookie(cookieStore.toString());
  if (session?.email) {
    const recent = await getRecentInstantLightIds(session.email, 50, 7);
    if (recent.sacredIds.length > 0 || recent.stateKeys.length > 0) {
      recentSacredIds = recent.sacredIds.length > 0 ? recent.sacredIds : recentSacredIds;
      recentStateKeys = recent.stateKeys.length > 0 ? recent.stateKeys : recentStateKeys;
    }
  }

  const userProfile =
    (fullName?.trim() || birthDate?.trim())
      ? {
          fullName: fullName?.trim() || undefined,
          birthDate: birthDate?.trim() || undefined,
          birthTime: birthTime?.trim() || undefined,
          birthPlace: birthPlace?.trim() || undefined,
        }
      : null;

  const result = composeInstantLight(userProfile, {
    recentSacredIds,
    recentStateKeys,
  });

  if (session?.email && result.sacredId) {
    recordInstantLightUse(session.email, {
      sacredId: result.sacredId,
      stateKey: result.stateKey ?? undefined,
    }).catch(() => {});
  }

  return NextResponse.json(result);
}
