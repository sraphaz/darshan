import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getConnector } from "@/lib/ai";
import { loadMasterPrompt } from "@/lib/darshanPrompt";
import { getConfig } from "@/lib/configStore";
import { PHASE_NAMES } from "@/lib/darshan";
import { composeInstantLight } from "@/lib/sacredRemedy";
import { getSessionFromCookie } from "@/lib/auth";
import {
  getCreditsFromCookie,
  creditsCookieHeader,
  CREDITS_PER_AI_REQUEST,
} from "@/lib/credits";
import {
  getCreditsBalance,
  debitCredits,
  logAiUsage,
  estimateCost,
  refreshUsdToBrlCache,
  type AiUsageProvider,
} from "@/lib/finance";
import { logger } from "@/lib/logger";
import { checkAndRecordRateLimit, checkDailyLimit, recordDailyRequest } from "@/lib/usageLimits";
import { isSupabaseConfigured } from "@/lib/supabase";
import { saveRevelation, getRecentInstantLightIds, recordInstantLightUse } from "@/lib/historyStorage";

export const dynamic = "force-dynamic";

function buildUserContext(userProfile: {
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
}): string {
  const parts: string[] = [];
  if (userProfile.fullName?.trim()) parts.push(`Nome completo: ${userProfile.fullName.trim()}`);
  if (userProfile.birthDate?.trim()) parts.push(`Data de nascimento: ${userProfile.birthDate.trim()}`);
  if (userProfile.birthPlace?.trim()) parts.push(`Local de nascimento: ${userProfile.birthPlace.trim()}`);
  if (userProfile.birthTime?.trim()) parts.push(`Horário de nascimento: ${userProfile.birthTime.trim()}`);
  if (parts.length === 0) return "";
  return `\n\nMapa do usuário (dados para interpretação, NÃO para citar literalmente):\n${parts.join("\n")}\n\nUse o mapa para derivar aspectos astrológicos, arquétipos, traços de personalidade, samskaras, karmas ou kleshas que aqueles dados sugerem — fale sobre o que esse mapa traz como resultado/theme, não repita o dado em si. Pode chamar o usuário pelo nome (primeiro nome) às vezes. Evite referências diretas aos dados (ex.: não cite cidade, data ou horário) e evite trocadilhos com nomes ou lugares.`;
}

function buildHistoryContext(history: { userMessage?: string; darshanMessage: string }[]): string {
  if (!history.length) return "";
  const lines = history.map(
    (t) => `${t.userMessage ? `Usuário: ${t.userMessage}\n` : ""}Darshan: ${t.darshanMessage}`
  );
  return `\n\nHistórico desta sessão (use como semente para uma NOVA resposta coerente; NUNCA repita frases ou blocos já ditos):\n${lines.join("\n\n")}`;
}

const REVELATION_INSTRUCTION = `Elabore UMA única mensagem em português, orgânica e dinâmica, inspirada no espírito do Darshan (presença, tempo vivo, corpo, silêncio, devolução à consciência). Não siga ordem fixa nem liste tópicos; deixe o texto fluir em torno do mesmo tema (a pergunta ou intenção do usuário).

OBRIGATÓRIO — retorno e elo de sentido:
- Dê um retorno ao usuário a partir do que o mapa e a pergunta sugerem: fale sobre aspectos astrológicos, arquétipos, traços de personalidade, samskaras, karmas ou kleshas identificados — o resultado ou o tema que aqueles dados trazem, não os dados em si.
- Pode chamar o usuário pelo nome (primeiro nome) às vezes, com naturalidade.
- Evite referências diretas aos dados (não cite cidade, data, horário) e evite trocadilhos com nome, local ou qualquer dado do mapa. Crie elo de sentido entre pergunta, histórico e a interpretação (arquétipos, karma, kleshas, tendências), não com os dados crus.

Use quebras de linha (\\n\\n) apenas quando fizer sentido separar um bloco do outro para leitura (telas de transição). De 1 a no máximo 7 blocos; cada bloco = no máximo 1 ou 2 frases curtas. Nunca repita o que já foi dito no histórico; use o histórico e a nova pergunta como semente para uma revelação coerente e diferente.`;

const PHASE_ROLES: Record<number, string> = {
  1: "Dê UMA frase-oráculo (Luz): curta, poética, que abra o presente.",
  2: "Dê UMA mensagem sobre o Pulso Jyotish do agora: qualidade do tempo, fase lunar, momento do dia. Se tiver mapa do usuário, use para considerações astrológicas sutis.",
  3: "Dê UMA mensagem sobre o Arquétipo Chinês do ciclo anual vigente.",
  4: "Dê UMA mensagem sobre o Elemento predominante (Ayurveda: Terra/Água/Fogo/Ar/Éter) para este momento.",
  5: "Dê UMA mensagem sobre Consciência / guna (Sattva/Rajas/Tamas) em linguagem humana.",
  6: "Dê UMA prática corporal segura e mínima (30–90 segundos).",
  7: "Dê UMA pergunta final que devolva à presença (ex.: O que em você já sabe?).",
};

const MOCK_MESSAGES = [
  "O momento pede presença.\n\nRespire e sinta o que já está aqui.\n\nO que em você já sabe?",
  "A luz do tempo não aponta para fora.\n\nEla revela o que já pulsa em você.\n\nPermita-se pausar.",
  "O oráculo não adivinha — ele devolve.\n\nTraga a pergunta ao corpo.\n\nO que o silêncio responde?",
  "Cada fase lunar traz um tom.\n\nEste instante pede escuta, não resposta.\n\nO que em você quer ser ouvido?",
  "O mapa não define — sugere.\n\nVocê é maior que qualquer aspecto.\n\nRespire e deixe o agora falar.",
];

function getMockMessage(messages: string[] = MOCK_MESSAGES): string {
  const list = messages.length > 0 ? messages : MOCK_MESSAGES;
  const i = Math.floor(Math.random() * list.length);
  return list[i] ?? list[0];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const useMock = body.mock === true;
  const revelation = body.revelation === true;
  const phase = revelation ? 1 : Math.min(7, Math.max(1, Number(body.phase) || 1));
  const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  const history: { userMessage?: string; darshanMessage: string }[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (t: unknown) =>
            t && typeof t === "object" && "darshanMessage" in t && typeof (t as { darshanMessage: unknown }).darshanMessage === "string"
        )
        .map((t: { userMessage?: string; darshanMessage: string }) => ({
          userMessage: typeof (t as { userMessage?: string }).userMessage === "string" ? (t as { userMessage: string }).userMessage : undefined,
          darshanMessage: String((t as { darshanMessage: string }).darshanMessage),
        }))
    : [];

  const userProfile = body.userProfile && typeof body.userProfile === "object"
    ? {
        fullName: typeof body.userProfile.fullName === "string" ? body.userProfile.fullName : undefined,
        birthDate: typeof body.userProfile.birthDate === "string" ? body.userProfile.birthDate : undefined,
        birthPlace: typeof body.userProfile.birthPlace === "string" ? body.userProfile.birthPlace : undefined,
        birthTime: typeof body.userProfile.birthTime === "string" ? body.userProfile.birthTime : undefined,
      }
    : {};
  const recentSacredIds = Array.isArray(body.recentSacredIds)
    ? body.recentSacredIds.filter((id: unknown) => typeof id === "string")
    : [];

  const config = getConfig();
  const mockMessages =
    config.mockMessagesOverride?.length
      ? config.mockMessagesMode === "replace"
        ? config.mockMessagesOverride
        : [...MOCK_MESSAGES, ...config.mockMessagesOverride]
    : MOCK_MESSAGES;

  // IA desativada (mock): Sacred Remedy Engine (único composer).
  // Cooldown autônomo: se usuário logado, buscar recentSacredIds/recentStateKeys no servidor e registrar uso.
  if (useMock) {
    const cookieStore = await cookies();
    const session = getSessionFromCookie(cookieStore.toString());
    let recentSacredIdsRes = recentSacredIds;
    let recentStateKeysRes = Array.isArray(body.recentStateKeys)
      ? body.recentStateKeys.filter((k: unknown) => typeof k === "string")
      : [];
    if (session?.email) {
      const recent = await getRecentInstantLightIds(session.email, 20);
      if (recent.sacredIds.length || recent.stateKeys.length) {
        recentSacredIdsRes = recent.sacredIds.length ? recent.sacredIds : recentSacredIdsRes;
        recentStateKeysRes = recent.stateKeys.length ? recent.stateKeys : recentStateKeysRes;
      }
    }
    const res = composeInstantLight(userProfile, {
      recentSacredIds: recentSacredIdsRes,
      recentStateKeys: recentStateKeysRes,
    });
    if (session?.email && res.sacredId) {
      recordInstantLightUse(session.email, { sacredId: res.sacredId, stateKey: res.stateKey ?? undefined }).catch(() => {});
    }
    const parts: string[] = [];
    if (res.sacredText?.trim()) parts.push(res.sacredText.trim());
    if (res.insight?.trim()) parts.push(res.insight.trim());
    if (res.practice?.trim()) parts.push(res.practice.trim());
    if (res.food?.trim()) parts.push(res.food.trim());
    if (res.question?.trim()) parts.push(res.question.trim());
    const message = parts.length > 0 ? parts.join("\n\n") : getMockMessage(mockMessages);
    return NextResponse.json({
      message,
      phase: 1,
      sacredId: res.sacredId,
      stateKey: res.stateKey,
    } satisfies { message: string; phase: number; sacredId?: string; stateKey?: string });
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = getSessionFromCookie(cookieHeader);
  if (!session) {
    return NextResponse.json(
      { message: "Faça login para usar a IA.", phase: 1, needsLogin: true },
      { status: 401 }
    );
  }
  if (!checkAndRecordRateLimit(session.email)) {
    return NextResponse.json(
      { message: "Muitas requisições. Aguarde um minuto e tente novamente.", phase: 1 },
      { status: 429 }
    );
  }
  const dailyLimit = await checkDailyLimit(session.email);
  if (!dailyLimit.allowed) {
    return NextResponse.json(
      {
        message: `Limite diário de revelações atingido (${dailyLimit.count}/${dailyLimit.limit}). Volte amanhã.`,
        phase: 1,
      },
      { status: 429 }
    );
  }
  const creditsPerRevelation = config.creditsPerRevelation ?? CREDITS_PER_AI_REQUEST;
  const balanceFromCookie = getCreditsFromCookie(cookieHeader);
  const balance = await getCreditsBalance(session.email, balanceFromCookie);
  if (balance < creditsPerRevelation) {
    return NextResponse.json(
      { message: "Créditos insuficientes. Adicione créditos para usar a IA.", phase: 1, needsCredits: true },
      { status: 402 }
    );
  }
  // Só chamamos a IA quando há créditos suficientes; o débito ocorre apenas após retorno com sucesso (mais abaixo).

  const defaultMaster = loadMasterPrompt();
  const masterOverride = config.masterPromptOverride?.trim();
  const masterPrompt =
    !masterOverride
      ? defaultMaster
      : config.masterPromptMode === "replace"
        ? masterOverride
        : `${defaultMaster}\n\n${masterOverride}`;
  const defaultRevelation = REVELATION_INSTRUCTION;
  const revelationOverride = config.revelationInstructionOverride?.trim();
  const revelationInstruction =
    !revelationOverride
      ? defaultRevelation
      : config.revelationInstructionMode === "replace"
        ? revelationOverride
        : `${defaultRevelation}\n\n${revelationOverride}`;
  const userContext = buildUserContext(userProfile);
  const historyContext = buildHistoryContext(history);

  const connector = getConnector();
  if (!connector) {
    const fallback = "O tempo pede presença. Respire e sinta o agora.";
    return NextResponse.json({ message: fallback, phase: 1 } satisfies { message: string; phase: number });
  }

  try {
    let userContent: string;
    if (revelation) {
      userContent = `${revelationInstruction}\n\n`;
      if (userMessage) userContent += `Pergunta ou intenção do usuário: ${userMessage}\n\n`;
      if (userContext) userContent += userContext;
      if (historyContext) userContent += historyContext;
      userContent += `\nRetorne APENAS um JSON válido, sem markdown: {"message": "sua mensagem em português (use \\n\\n entre blocos; 1 a 7 blocos; cada bloco = 1 ou 2 frases curtas)"}. Fale sobre aspectos/arquétipos/samskaras/karmas/kleshas que o mapa e a pergunta sugerem; pode usar o nome do usuário às vezes. Não cite dados do mapa literalmente nem faça trocadilhos. Mensagem orgânica, sempre nova e diferente do histórico.`;
    } else {
      const phaseRole = PHASE_ROLES[phase] ?? PHASE_NAMES[phase] ?? `Fase ${phase}.`;
      userContent = `Diretriz para esta etapa: ${phaseRole}\n\n`;
      if (userMessage) userContent += (phase === 1 ? "Pergunta ou intenção do usuário: " : "O que o usuário disse agora: ") + `${userMessage}\n\n`;
      if (userContext) userContent += userContext;
      if (historyContext) userContent += historyContext;
      userContent += `\nRetorne APENAS um JSON válido, sem markdown: {"message": "sua resposta em português (use \\n\\n entre blocos; 1 a 7 blocos; cada bloco = 1 ou 2 frases curtas)", "phase": ${phase}}. Fale sobre aspectos/arquétipos/samskaras/karmas/kleshas que o mapa sugere; pode usar o nome do usuário às vezes. Não cite dados do mapa literalmente nem faça trocadilhos. Mensagem orgânica e SEMPRE nova; nunca repita o histórico.`;
    }

    const result = await connector.complete(masterPrompt, userContent);
    const raw = result.text;

    if (!raw) {
      // IA não retornou conteúdo — não debitar créditos.
      return NextResponse.json({
        message: "O momento pede silêncio. Deixe a resposta nascer em você.",
        phase: 1,
      } satisfies { message: string; phase: number });
    }

    let parsed: { message?: string; phase?: number };
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(cleaned) as { message?: string; phase?: number };
    } catch {
      // Resposta da IA inválida (JSON quebrado) — não debitar créditos.
      return NextResponse.json({
        message: raw.slice(0, 2000) || "Respire. O que em você já sabe?",
        phase: 1,
      } satisfies { message: string; phase: number });
    }

    const message = typeof parsed.message === "string" ? parsed.message.trim() : "";

    // Provedor para log/custo: google -> gemini
    const provider: AiUsageProvider = connector.id === "google" ? "gemini" : (connector.id as AiUsageProvider);
    const modelName =
      connector.id === "openai"
        ? (process.env.OPENAI_MODEL ?? "gpt-4o-mini")
        : connector.id === "anthropic"
          ? (process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514")
          : (process.env.GOOGLE_MODEL ?? "gemini-2.5-flash");
    const inputTokens = result.usage?.input_tokens ?? Math.ceil(userContent.length / 4);
    const outputTokens = result.usage?.output_tokens ?? Math.ceil((message || raw).length / 4);
    const totalTokens = inputTokens + outputTokens;
    await refreshUsdToBrlCache();
    const { costUsd, costBrl } = estimateCost(provider, inputTokens, outputTokens);
    const mode = revelation ? "question" : "now";

    const usageLogId = await logAiUsage(
      {
        provider,
        model: modelName,
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd,
        costBrl,
        creditsSpent: creditsPerRevelation,
        mode,
        questionLength: userMessage.length,
        responseLength: (message || raw).length,
        success: true,
      },
      { userEmail: session.email }
    );

    const debitResult = await debitCredits(session.email, creditsPerRevelation, "darshan_call", {
      relatedUsageId: usageLogId ?? undefined,
      currentBalanceFromCookie: balance,
    });

    if (!isSupabaseConfigured()) {
      recordDailyRequest(session.email);
    }
    const finalMessage = message || "Respire. O que em você já sabe?";
    if (revelation) {
      await saveRevelation(session.email, {
        questionText: userMessage || null,
        responseText: finalMessage,
      });
    }
    const res = NextResponse.json({
      message: finalMessage,
      phase: revelation ? 1 : (parsed.phase ?? phase),
      creditsUsed: creditsPerRevelation,
      balance: debitResult.newBalance,
    } satisfies { message: string; phase: number; creditsUsed?: number; balance?: number });
    res.headers.set("Set-Cookie", creditsCookieHeader(debitResult.newBalance));
    return res;
  } catch (err) {
    // Erro de rede, timeout ou exceção da IA — não debitar créditos.
    const errMessage = err instanceof Error ? err.message : String(err);
    const errCode = err && typeof err === "object" && "status" in err ? (err as { status?: number }).status : null;
    logger.error("darshan IA request failed", {
      connector: connector.id,
      message: errMessage,
      status: errCode ?? undefined,
    });
    const is429 = errCode === 429 || /quota|exceeded|limit/i.test(errMessage);
    const message = is429
      ? "Limite de uso da API atingido. Adicione créditos em platform.openai.com (Billing) ou use outro provedor no .env.local."
      : "O tempo pede pausa. Respire e tente novamente quando se sentir pronto.";
    return NextResponse.json({
      message,
      phase: 1,
    } satisfies { message: string; phase: number });
  }
}
