/**
 * Insight — resultado de regras determinísticas por sistema (Jyotish, numerologia, HD).
 * Nunca aleatório; sempre justificável pelo mapa.
 */

export type InsightTopic = "general" | "love" | "career" | "year" | "action";
export type InsightSystem = "jyotish" | "numerology" | "humanDesign";

export type Insight = {
  key: string;
  weight: number;
  system: InsightSystem;
  topic: InsightTopic;
  evidence?: unknown;
};
