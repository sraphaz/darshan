/**
 * GET /api/instant-light — Sacred Remedy Engine (motor medicinal offline).
 * Não consome créditos; não depende de IA. Motor paralelo ao /api/darshan.
 *
 * Query: fullName?, birthDate?, birthTime?, birthPlace?, recentSacredIds?, recentStateKeys?
 * - Se userProfile existe (nome ou data) → diagnosisPersonal(SymbolicMap) + insight.
 * - Se não existe → diagnosisUniversal().
 *
 * Resposta: sacredText, insight? (se personal), practice, question, sacredId?, stateKey?
 */

import { NextResponse } from "next/server";
import { composeInstantLight } from "@/lib/sacredRemedy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fullName = searchParams.get("fullName") ?? undefined;
  const birthDate = searchParams.get("birthDate") ?? undefined;
  const birthTime = searchParams.get("birthTime") ?? undefined;
  const birthPlace = searchParams.get("birthPlace") ?? undefined;
  const recentSacredIdsParam = searchParams.get("recentSacredIds");
  const recentStateKeysParam = searchParams.get("recentStateKeys");

  const recentSacredIds = recentSacredIdsParam
    ? recentSacredIdsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const recentStateKeys = recentStateKeysParam
    ? recentStateKeysParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

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

  return NextResponse.json(result);
}
