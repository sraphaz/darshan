/**
 * GET /api/instant-light — Sacred Remedy Engine (motor medicinal offline).
 * Não consome créditos; não depende de IA. Retorna DarshanTruthPackage.
 *
 * Pipeline quando há userText:
 *   userText → normalize → parseIntent → pickBestState → preferredStateKey + theme + questionType
 *   → composeInstantLight(symbolicMap?, inputStateKey, theme, questionType)
 *   → sutra medicinal + prática ayurvédica + pergunta contemplativa (tudo offline).
 *
 * Query: fullName?, birthDate?, birthTime?, birthPlace?, userText?, question?, theme?, recentSacredIds?, recentStateKeys?
 * Cooldown server-side: getRecentSacredIds/getRecentStateKeys + recordInstantLight.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { composeInstantLight } from "@/lib/sacredRemedy";
import { parseIntent } from "@/lib/input/intentParser";
import { pickBestState } from "@/lib/input/stateScorer";
import { getSessionFromCookie } from "@/lib/auth";
import { getRecentSacredIds, getRecentStateKeys, recordInstantLight } from "@/lib/history/historyAdapter";
import type { Theme } from "@/lib/core/UserRequestContext";

const THEMES: Theme[] = ["general", "love", "career", "year", "health", "spirituality"];

function parseTheme(s: string | null): Theme {
  if (!s) return "general";
  const t = s.toLowerCase().trim();
  return THEMES.includes(t as Theme) ? (t as Theme) : "general";
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fullName = searchParams.get("fullName") ?? undefined;
  const birthDate = searchParams.get("birthDate") ?? undefined;
  const birthTime = searchParams.get("birthTime") ?? undefined;
  const birthPlace = searchParams.get("birthPlace") ?? undefined;
  const userText = searchParams.get("userText") ?? searchParams.get("question") ?? undefined;
  const questionExplicit = searchParams.get("question") ?? undefined;
  const themeParam = searchParams.get("theme") ?? undefined;
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
  const userKey = session?.email ?? undefined;

  if (userKey) {
    const sacredIds = await getRecentSacredIds(userKey, 7);
    const stateKeys = await getRecentStateKeys(userKey, 7);
    if (sacredIds.length > 0) recentSacredIds = sacredIds;
    if (stateKeys.length > 0) recentStateKeys = stateKeys;
  }

  let preferredStateKey: string | undefined;
  let inputConfidence: number | undefined;
  let questionType: string | undefined;
  let themeFromIntent: Theme | undefined;

  const inputText = (userText ?? questionExplicit)?.trim();
  if (inputText) {
    const intent = parseIntent(inputText);
    const best = pickBestState(intent ?? null);
    if (best) {
      preferredStateKey = best.stateKey;
      inputConfidence = best.confidence;
    }
    if (intent?.questionType) questionType = intent.questionType;
    if (intent?.theme) themeFromIntent = intent.theme as Theme;
  }

  const theme = themeFromIntent ?? parseTheme(themeParam);

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
    preferredStateKey,
    theme,
    questionType,
    inputConfidence,
    questionText: questionExplicit ?? inputText ?? undefined,
  });

  if (userKey && result.sacred?.id) {
    recordInstantLight(userKey, result).catch(() => {});
  }

  return NextResponse.json(result);
}
