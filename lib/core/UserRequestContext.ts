/**
 * Contexto canônico da requisição do usuário para qualquer endpoint Darshan.
 * Padroniza modo, tema, texto, pergunta e perfil.
 */

export type Theme =
  | "general"
  | "love"
  | "career"
  | "year"
  | "health"
  | "spirituality";

export type Mode = "universal" | "personal";

export type UserRequestContext = {
  mode: Mode;
  theme?: Theme;
  /** Texto digitado (input natural) */
  userText?: string;
  /** Pergunta explícita */
  question?: string;
  /** Opcional: texto curto / estado de humor */
  moodHint?: string;
  profile?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
  };
  /** Id para histórico/cooldown (ex.: email do usuário) */
  userKey?: string;
};
