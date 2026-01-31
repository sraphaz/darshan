/**
 * POST /api/ai/expand — expansão narrativa opcional do Truth Package.
 * Body: { truthPackage: DarshanTruthPackage, question: string, theme?: Theme }
 * Retorna: { narrativeExpansion: string, sections?: { title, content }[] }
 * Guardrails: IA não altera diagnóstico, não inventa remédio, não troca sutra.
 */

import { NextResponse } from "next/server";
import { expandNarrative } from "@/lib/ai/narrativeGateway";
import type { DarshanTruthPackage } from "@/lib/core/DarshanTruthPackage";
import type { Theme } from "@/lib/core/UserRequestContext";

const THEMES: Theme[] = ["general", "love", "career", "year", "health", "spirituality"];

function parseTheme(s: string | null | undefined): Theme {
  if (!s) return "general";
  const t = String(s).toLowerCase().trim();
  return THEMES.includes(t as Theme) ? (t as Theme) : "general";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const truthPackage = body?.truthPackage as DarshanTruthPackage | undefined;
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const theme = parseTheme(body?.theme);

    if (!truthPackage || !truthPackage.sacred || !truthPackage.stateKey) {
      return NextResponse.json(
        { error: "truthPackage (com sacred e stateKey) é obrigatório" },
        { status: 400 }
      );
    }

    const result = await expandNarrative(truthPackage, question, theme);

    return NextResponse.json({
      narrativeExpansion: result.narrativeExpansion,
      sections: result.sections,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao expandir narrativa" },
      { status: 500 }
    );
  }
}
