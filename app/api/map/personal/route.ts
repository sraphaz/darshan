/**
 * Mapa pessoal — resumo completo por IA (Jyotish, numerologia, arquétipos).
 * Custa 9 créditos; pode ser refeito quantas vezes o usuário quiser.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConnector } from "@/lib/ai";
import { getSessionFromCookie } from "@/lib/auth";
import {
  getCreditsFromCookie,
  creditsCookieHeader,
  CREDITS_PER_PERSONAL_MAP,
} from "@/lib/credits";
import { getCreditsBalance, debitCredits, logAiUsage, estimateCost, refreshUsdToBrlCache } from "@/lib/finance";
import type { AiUsageProvider } from "@/lib/finance";
import { logger } from "@/lib/logger";
import { getConfig } from "@/lib/configStore";
import { getOfflineReading, getOfflineReadingFullText } from "@/lib/readingOffline";
import { saveReading } from "@/lib/historyStorage";
import { computeVedicChartSimplified } from "@/lib/knowledge/vedic";
import { getRulingNumberFromName, getNumberTraits } from "@/lib/knowledge/numerology";
import { RASHI_NAMES } from "@/lib/knowledge/archetypes";
import type { RashiKey, NakshatraKey } from "@/lib/knowledge/types";

export const dynamic = "force-dynamic";

const ARCHETYPE_NAMES: Record<string, string> = {
  pioneiro: "Pioneiro",
  raiz: "Raiz",
  mensageiro: "Mensageiro",
  cuidador: "Cuidador",
  soberano: "Soberano",
  servidor: "Servidor",
  alquimista: "Alquimista",
  guerreiro: "Guerreiro",
  sábio: "Sábio",
  realizador: "Realizador",
  humanitário: "Humanitário",
  dissolvente: "Dissolvente",
};

const NAKSHATRA_NAMES: Record<string, string> = {
  ashwini: "Ashwini",
  bharani: "Bharani",
  krittika: "Krittika",
  rohini: "Rohini",
  mrigashira: "Mrigashira",
  ardra: "Ardra",
  punarvasu: "Punarvasu",
  pushya: "Pushya",
  ashlesha: "Ashlesha",
  magha: "Magha",
  "purva-phalguni": "Purva Phalguni",
  "uttara-phalguni": "Uttara Phalguni",
  hasta: "Hasta",
  chitra: "Chitra",
  swati: "Swati",
  vishakha: "Vishakha",
  anuradha: "Anuradha",
  jyestha: "Jyestha",
  mula: "Mula",
  "purva-ashadha": "Purva Ashadha",
  "uttara-ashadha": "Uttara Ashadha",
  shravana: "Shravana",
  dhanishta: "Dhanishta",
  shatabhisha: "Shatabhisha",
  "purva-bhadra": "Purva Bhadra",
  "uttara-bhadra": "Uttara Bhadra",
  revati: "Revati",
};

function buildMapContext(profile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): string {
  const chart = computeVedicChartSimplified({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
  });
  const rulingNumber = getRulingNumberFromName(profile.fullName ?? "");
  const numberTraits = getNumberTraits(rulingNumber);

  const parts: string[] = [];
  parts.push(`Nome: ${profile.fullName?.trim() || "(não informado)"}`);
  parts.push(`Data de nascimento: ${profile.birthDate?.trim() || "(não informado)"}`);
  if (profile.birthPlace?.trim()) parts.push(`Local: ${profile.birthPlace.trim()}`);
  if (profile.birthTime?.trim()) parts.push(`Horário: ${profile.birthTime.trim()}`);

  parts.push("");
  parts.push("--- Jyotish (mapa védico simplificado) ---");
  if (chart.moonRashi) {
    const rashiName = RASHI_NAMES[chart.moonRashi as RashiKey] ?? chart.moonRashi;
    parts.push(`Lua no signo (Rashi): ${rashiName}`);
  }
  if (chart.moonNakshatra) {
    const naksName = NAKSHATRA_NAMES[chart.moonNakshatra as NakshatraKey] ?? chart.moonNakshatra;
    parts.push(`Lua na estação lunar (Nakshatra): ${naksName}`);
  }
  if (chart.archetypeKeys?.length) {
    const archetypeNames = chart.archetypeKeys.map((k) => ARCHETYPE_NAMES[k] ?? k).join(", ");
    parts.push(`Arquétipos sugeridos pelo mapa: ${archetypeNames}`);
  }

  parts.push("");
  parts.push("--- Numerologia (Pitágoras) ---");
  parts.push(`Número regente: ${rulingNumber} — ${numberTraits.name}`);
  parts.push(`Traço curto: ${numberTraits.shortTrait}`);
  parts.push(`Tendências: ${numberTraits.tendencies.join("; ")}`);
  parts.push(`Desafios: ${numberTraits.challenges.join("; ")}`);

  return parts.join("\n");
}

const SYSTEM_PROMPT = `Você é um intérprete do Darshan. Sua tarefa é gerar uma leitura pessoal em português, harmoniosa e não repetitiva.

INÍCIO OBRIGATÓRIO (uma ou duas frases): Explique de forma breve, simples e agradável o que foi feito — que a leitura integra Sol regente, Lua, planetas, estações lunares (Nakshatras) e numerologia, em uma síntese única.

CORPO DA LEITURA (fluido, sem listas longas):
- Percorra o Sol regente, a Lua, cada planeta relevante e a convergência com Nakshatras e numerologia, sem repetir a mesma ideia.
- Use poucos termos em sânscrito; quando usar, explique em uma palavra ou deixe o contexto claro. Prefira português.
- Parágrafos curtos, quebras de linha (\\n\\n) quando fizer sentido. Nada de bullet points ou listas numeradas longas.
- Não cite dados crus (cidade, data ou horário); use só como base para interpretação.
- Linguagem clara, acolhedora e útil. Cada leitura deve ser única.

Retorne APENAS um JSON válido, sem markdown nem texto antes ou depois: {"message": "seu texto completo aqui"}.`;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json(
      { error: "Faça login para adquirir sua leitura.", needsLogin: true },
      { status: 401 }
    );
  }

  let body: { profile?: { fullName?: string; birthDate?: string; birthPlace?: string; birthTime?: string }; offline?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const profile = body.profile ?? {};
  const fullName = typeof profile.fullName === "string" ? profile.fullName.trim() : "";
  const birthDate = typeof profile.birthDate === "string" ? profile.birthDate.trim() : "";
  if (!fullName && !birthDate) {
    return NextResponse.json(
      { error: "Adicione nome e data de nascimento no seu perfil antes de gerar a leitura." },
      { status: 400 }
    );
  }

  const useOffline = body.offline === true;
  if (useOffline) {
    const sections = getOfflineReading(profile);
    const message = getOfflineReadingFullText(profile);
    const balanceFromCookie = getCreditsFromCookie(cookieHeader);
    const balance = await getCreditsBalance(session.email, balanceFromCookie);
    return NextResponse.json({
      message,
      sections,
      balance,
      creditsUsed: 0,
      offline: true,
    });
  }

  const readingConfig = getConfig();
  const creditsPerReading = readingConfig.creditsPerReading ?? CREDITS_PER_PERSONAL_MAP;
  const balanceFromCookie = getCreditsFromCookie(cookieHeader);
  const balance = await getCreditsBalance(session.email, balanceFromCookie);
  if (balance < creditsPerReading) {
    return NextResponse.json(
      {
        error: `Créditos insuficientes. A leitura custa ${creditsPerReading} créditos.`,
        needsCredits: true,
        balance,
      },
      { status: 402 }
    );
  }

  const connector = getConnector();
  if (!connector) {
    // Em dev: retorna mock para teste sem debitar créditos
    if (process.env.NODE_ENV === "development") {
      const mapContext = buildMapContext(profile);
      const mockMessage = `[Mock — dev] Leitura pessoal com base nos dados do perfil.\n\n${mapContext}\n\n--- Fim do mock. Em produção a IA gera o texto completo (Sol, Lua, planetas, Nakshatras, numerologia). ---`;
      return NextResponse.json({
        message: mockMessage,
        balance,
        creditsUsed: 0,
      });
    }
    return NextResponse.json(
      { error: "Serviço de IA indisponível. Tente mais tarde." },
      { status: 503 }
    );
  }

  const mapContext = buildMapContext(profile);
  const userContent = `Gere uma leitura pessoal completa com base no contexto abaixo.\n\n${mapContext}`;

  const readingOverride = readingConfig.readingInstructionOverride?.trim();
  const systemPrompt =
    !readingOverride
      ? SYSTEM_PROMPT
      : readingConfig.readingInstructionMode === "replace"
        ? readingOverride
        : `${SYSTEM_PROMPT}\n\n${readingOverride}`;

  try {
    const result = await connector.complete(systemPrompt, userContent);
    const raw = result.text;

    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo. Tente novamente." },
        { status: 500 }
      );
    }

    function extractMessageFromRaw(raw: string): string {
      let s = raw.trim().replace(/^=>\s*/i, "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      try {
        const parsed = JSON.parse(s) as { message?: string };
        if (typeof parsed.message === "string") return parsed.message.trim();
      } catch {
        const idx = s.search(/"message"\s*:\s*"/i);
        if (idx !== -1) {
          const start = s.indexOf('"', idx + 10) + 1;
          let end = start;
          for (let i = start; i < s.length; i++) {
            if (s[i] === "\\" && s[i + 1] === '"') { i++; continue; }
            if (s[i] === '"') { end = i; break; }
          }
          const extracted = s.slice(start, end).replace(/\\"/g, '"').replace(/\\n/g, "\n");
          if (extracted.length > 0) return extracted;
        }
      }
      return s.replace(/\}\s*$/, "").trim();
    }

    const message = extractMessageFromRaw(raw).slice(0, 15000) || raw.slice(0, 15000);

    const provider: AiUsageProvider = connector.id === "google" ? "gemini" : (connector.id as AiUsageProvider);
    const modelName =
      connector.id === "openai"
        ? (process.env.OPENAI_MODEL ?? "gpt-4o-mini")
        : connector.id === "anthropic"
          ? (process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514")
          : (process.env.GOOGLE_MODEL ?? "gemini-2.5-flash");
    const inputTokens = result.usage?.input_tokens ?? Math.ceil((systemPrompt.length + userContent.length) / 4);
    const outputTokens = result.usage?.output_tokens ?? Math.ceil(message.length / 4);
    const totalTokens = inputTokens + outputTokens;
    await refreshUsdToBrlCache();
    const { costUsd, costBrl } = estimateCost(provider, inputTokens, outputTokens);

    const usageLogId = await logAiUsage(
      {
        provider,
        model: modelName,
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
        costBrl,
        creditsSpent: creditsPerReading,
        mode: "personal_map",
        questionLength: userContent.length,
        responseLength: message.length,
        success: true,
      },
      { userEmail: session.email }
    );

    const debitResult = await debitCredits(session.email, creditsPerReading, "personal_map", {
      relatedUsageId: usageLogId ?? undefined,
      currentBalanceFromCookie: balance,
    });

    await saveReading(session.email, message);

    const res = NextResponse.json({
      message,
      balance: debitResult.newBalance,
      creditsUsed: creditsPerReading,
    });
    res.headers.set("Set-Cookie", creditsCookieHeader(debitResult.newBalance));
    return res;
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    logger.error("personal map IA request failed", { message: errMessage });
    return NextResponse.json(
      { error: "Não foi possível gerar a leitura. Tente novamente." },
      { status: 500 }
    );
  }
}
