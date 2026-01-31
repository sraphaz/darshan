/**
 * Mapa simbólico canônico universal — base do Engine 2.0.
 * Estrutura: jyotish, numerology, archetypes, themes, evidence.
 * Objeto canônico do Darshan; reutilizável por Oracle e leituras premium.
 */

export type SymbolicMap = {
  jyotish: {
    moonRashi: string;
    nakshatra: string;
    archetypeKey: string;
  };
  numerology: {
    /** Número regente do nome (Pitágoras); mantido para compatibilidade. */
    rulingNumber: number;
    /** Life Path — data de nascimento (1–9, 11, 22). */
    lifePathNumber?: number;
    /** Expression/Destiny — nome completo (1–9, 11, 22). */
    expressionNumber?: number;
    /** Soul Urge — vogais do nome (desejo interior). */
    soulUrgeNumber?: number;
    /** Personality — consoantes do nome (máscara social). */
    personalityNumber?: number;
  };
  /** Arquétipos derivados do chart (primary = primeiro; keys = lista completa). */
  archetypes: {
    primary: string;
    keys: string[];
  };
  themes: string[];
  evidence: Record<string, unknown>;
};
