/**
 * POST /api/reading?theme= — retorna leitura temática offline (sem IA, sem créditos).
 * theme: general | love | relationship | career | work | year | yearly | action
 */

import { NextResponse } from "next/server";
import { buildSymbolicMap } from "@/lib/symbolic/builder";
import { getReadingByTheme } from "@/lib/readings/symbolicReadings";

export const dynamic = "force-dynamic";

type ProfileInput = {
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
};

const VALID_THEMES = [
  "general",
  "love",
  "relationship",
  "career",
  "work",
  "year",
  "yearly",
  "action",
];

export async function POST(req: Request) {
  let body: { profile?: ProfileInput } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const profile = body.profile ?? {};
  const { searchParams } = new URL(req.url);
  const themeParam = searchParams.get("theme") ?? "general";
  const theme = VALID_THEMES.includes(themeParam.toLowerCase())
    ? themeParam.toLowerCase()
    : "general";

  const map = buildSymbolicMap({
    fullName: profile.fullName,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthPlace: profile.birthPlace,
  });
  const reading = getReadingByTheme(map, theme);

  return NextResponse.json({
    map: {
      jyotish: map.jyotish,
      numerology: map.numerology,
      archetypes: map.archetypes,
    },
    reading,
    theme,
  });
}
