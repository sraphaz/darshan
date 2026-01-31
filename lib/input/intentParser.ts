/**
 * Intent Parser offline — classificação multi-eixo do input do usuário.
 * Verbo, sujeito, tema, tipo de pergunta e emoção → stateCandidates ranqueados.
 * Sem IA; matching determinístico por dicionários.
 */

import { normalizeInput } from "./normalizeInput";
import inputVerbsJson from "@/lib/dictionaries/inputVerbs.json";
import inputThemesJson from "@/lib/dictionaries/inputThemes.json";
import inputEmotionsJson from "@/lib/dictionaries/inputEmotions.json";
import inputQuestionsJson from "@/lib/dictionaries/inputQuestions.json";

export type SubjectKey = "self" | "other" | "relational";
export type VerbClassKey = "feel" | "seek" | "fear" | "conflict" | "reflect";
export type ThemeKey = "general" | "love" | "career" | "year" | "health" | "spirituality";
export type QuestionTypeKey = "what" | "how" | "why" | "when" | "where" | "who";

/** Estado da RemedyMatrix (ex.: anxiety, grief) */
export type StateKey = string;

export type StateCandidate = {
  stateKey: string;
  score: number;
  matched: string[];
};

export type ParsedIntent = {
  subject: SubjectKey;
  verbClass: VerbClassKey | null;
  theme: ThemeKey;
  questionType?: QuestionTypeKey | null;
  emotionLabels: string[];
  stateCandidates: StateCandidate[];
  tokens?: string[];
};

type InputVerbsSchema = Record<string, string[]>;
type InputThemesSchema = Record<string, string[]>;
/** Aceita formato stateKey → keywords[] ou emotionLabel → { keywords, stateKeys } */
type InputEmotionsSchema = Record<
  string,
  string[] | { keywords: string[]; stateKeys: string[] }
>;
type InputQuestionsSchema = Record<string, string[]>;

const INPUT_VERBS = inputVerbsJson as InputVerbsSchema;
const INPUT_THEMES = inputThemesJson as InputThemesSchema;
const INPUT_EMOTIONS = inputEmotionsJson as InputEmotionsSchema;
const INPUT_QUESTIONS = inputQuestionsJson as InputQuestionsSchema;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function findVerbClass(normal: string): VerbClassKey | null {
  for (const [verb, phrases] of Object.entries(INPUT_VERBS)) {
    if (!Array.isArray(phrases)) continue;
    for (const p of phrases) {
      if (normal.includes(normalize(p))) return verb as VerbClassKey;
    }
  }
  return null;
}

function findSubject(normal: string): SubjectKey {
  const selfMarkers = ["eu ", "meu ", "minha ", "me ", "comigo", "estou ", "sinto "];
  const otherMarkers = ["ele ", "ela ", "dele", "dela", "ele.", "ela.", "outro", "outra"];
  const relMarkers = ["nós", "nosso", "nossa", "nos ", "conosco"];
  for (const m of relMarkers) {
    if (normal.includes(m)) return "relational";
  }
  for (const m of otherMarkers) {
    if (normal.includes(m)) return "other";
  }
  for (const m of selfMarkers) {
    if (normal.includes(m)) return "self";
  }
  return "self";
}

function findTheme(normal: string): ThemeKey {
  let best: ThemeKey = "general";
  let bestLen = 0;
  for (const [theme, keywords] of Object.entries(INPUT_THEMES)) {
    if (!Array.isArray(keywords)) continue;
    for (const kw of keywords) {
      if (kw && normal.includes(normalize(kw)) && kw.length > bestLen) {
        best = theme as ThemeKey;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

function findQuestionType(normal: string): QuestionTypeKey | null {
  for (const [qType, phrases] of Object.entries(INPUT_QUESTIONS)) {
    if (!Array.isArray(phrases)) continue;
    for (const p of phrases) {
      if (normal.includes(normalize(p))) return qType as QuestionTypeKey;
    }
  }
  return null;
}

function findEmotionsAndStates(normal: string): {
  emotionLabels: string[];
  stateCandidates: StateCandidate[];
} {
  const emotionLabels: string[] = [];
  const stateScores = new Map<string, { score: number; matched: string[] }>();
  for (const [key, data] of Object.entries(INPUT_EMOTIONS)) {
    let keywords: string[];
    let stateKeys: string[];
    if (Array.isArray(data) && data.length > 0) {
      keywords = data;
      stateKeys = [key];
    } else if (data && typeof data === "object" && !Array.isArray(data)) {
      const entry = data as { keywords: string[]; stateKeys: string[] };
      if (!entry?.keywords?.length || !entry?.stateKeys?.length) continue;
      keywords = entry.keywords;
      stateKeys = entry.stateKeys;
    } else continue;
    const matched: string[] = [];
    for (const kw of keywords) {
      if (kw && normal.includes(normalize(kw))) {
        matched.push(kw);
      }
    }
    if (matched.length > 0) {
      emotionLabels.push(key);
      const compoundBonus = normal.includes("medo de perder") || normal.includes("medo de") ? 1 : 0;
      const score = matched.length + compoundBonus;
      for (const sk of stateKeys) {
        const prev = stateScores.get(sk);
        if (!prev || score > prev.score) {
          stateScores.set(sk, { score, matched: [...matched] });
        } else if (score === prev.score) {
          prev.matched = [...new Set([...prev.matched, ...matched])];
        }
      }
    }
  }
  const stateCandidates: StateCandidate[] = Array.from(stateScores.entries()).map(
    ([stateKey, { score, matched }]) => ({ stateKey, score, matched })
  );
  stateCandidates.sort((a, b) => b.score - a.score);
  return { emotionLabels, stateCandidates };
}

/**
 * Classifica o texto do usuário em eixos: verbo, sujeito, tema, pergunta, emoção → stateCandidates ranqueados.
 * Usa normalizeInput (abreviações + ruído) antes do matching.
 */
export function parseIntent(userText: string | null | undefined): ParsedIntent | null {
  if (userText == null || typeof userText !== "string") return null;
  const raw = userText.trim();
  if (raw.length === 0) return null;
  const preprocessed = normalizeInput(raw);
  const normal = preprocessed
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
  if (normal.length === 0) return null;

  const verbClass = findVerbClass(normal);
  const subject = findSubject(normal);
  const theme = findTheme(normal);
  const questionType = findQuestionType(normal);
  const { emotionLabels, stateCandidates } = findEmotionsAndStates(normal);
  const tokens = normal.split(/\s+/).filter(Boolean);

  return {
    subject,
    verbClass,
    theme,
    questionType: questionType ?? undefined,
    emotionLabels,
    stateCandidates,
    tokens,
  };
}
