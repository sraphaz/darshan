/**
 * AI Narrative Gateway — expansão narrativa opcional do Truth Package.
 * Recebe apenas o Truth Package e a pergunta do usuário; devolve texto expandido.
 * Guardrails: não alterar diagnóstico, não inventar remédio, não trocar sutra.
 */

import { getConnector } from "@/lib/ai";
import type { DarshanTruthPackage } from "@/lib/core/DarshanTruthPackage";
import type { Theme } from "@/lib/core/UserRequestContext";

export type NarrativeExpansionResult = {
  narrativeExpansion: string;
  sections?: { title: string; content: string }[];
};

const GUARDRAILS = `
Você é um assistente que apenas EXPANDE e CONTEXTUALIZA o conteúdo que recebeu.
Regras OBRIGATÓRIAS:
- NÃO altere o diagnóstico (klesha, guna, qualidades).
- NÃO invente remédios, práticas ou alimentos que não estejam no pacote.
- NÃO troque ou reescreva o texto sagrado (sutra/verso); pode citá-lo e comentar.
- NÃO contradiga o pacote. Sua função é explicar, suavizar a linguagem e conectar à pergunta do usuário.
- Use tom acolhedor e conciso. Resposta em português do Brasil.
`;

/**
 * Gera expansão narrativa a partir do Truth Package e da pergunta.
 * Se não houver conector de IA configurado, retorna fallback (resumo do próprio pacote).
 */
export async function expandNarrative(
  truthPackage: DarshanTruthPackage,
  question: string,
  theme: Theme
): Promise<NarrativeExpansionResult> {
  const connector = getConnector();
  const sacred = truthPackage.sacred?.text ?? "";
  const practiceTitle = truthPackage.practice?.title ?? "Prática";
  const practiceSteps = (truthPackage.practice?.steps ?? []).join("; ");
  const foodDo = (truthPackage.food?.do ?? []).join(", ");
  const questionText = truthPackage.question?.text ?? "";

  const packageSummary = `
[Diagnóstico] klesha: ${truthPackage.diagnosis?.klesha ?? ""}, guna: ${truthPackage.diagnosis?.samkhyaGuna ?? ""}, estado: ${truthPackage.stateKey}.
[Texto sagrado] ${sacred}
[Prática] ${practiceTitle}: ${practiceSteps}
[Alimentação] ${foodDo || "não especificado"}
[Pergunta de reflexão] ${questionText}
`.trim();

  const userContent = `
Pergunta do usuário: ${question || "Como lidar com isso?"}
Tema: ${theme}

Conteúdo canônico (apenas expandir/contextualizar; não alterar):
${packageSummary}
`.trim();

  const systemPrompt = `${GUARDRAILS}\n\nExpanda em 2-4 parágrafos curtos, conectando a pergunta ao conteúdo. Pode usar seções opcionais (ex.: "Contexto", "Prática sugerida", "Reflexão").`;

  if (!connector) {
    return {
      narrativeExpansion: `O Darshan trouxe para você: ${sacred}\n\nPrática: ${practiceSteps}\n${foodDo ? `Alimentação: ${foodDo}\n` : ""}Reflexão: ${questionText}`,
      sections: [
        { title: "Texto sagrado", content: sacred },
        { title: "Prática", content: practiceSteps },
        { title: "Reflexão", content: questionText },
      ],
    };
  }

  try {
    const result = await connector.complete(systemPrompt, userContent);
    const text = result?.text?.trim() ?? "";
    return {
      narrativeExpansion: text || packageSummary,
      sections: text ? undefined : [
        { title: "Texto sagrado", content: sacred },
        { title: "Prática", content: practiceSteps },
        { title: "Reflexão", content: questionText },
      ],
    };
  } catch {
    return {
      narrativeExpansion: packageSummary,
      sections: [
        { title: "Texto sagrado", content: sacred },
        { title: "Prática", content: practiceSteps },
        { title: "Reflexão", content: questionText },
      ],
    };
  }
}
