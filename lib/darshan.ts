export type DarshanTurn = {
  phase: number;
  userMessage?: string;
  darshanMessage: string;
};

export type DarshanPhaseResponse = {
  message: string;
  phase: number;
};

export const PHASE_NAMES: Record<number, string> = {
  1: "Luz — frase-oráculo",
  2: "Pulso Jyotish — qualidade do tempo agora",
  3: "Arquétipo Chinês — ciclo anual vigente",
  4: "Elemento — Ayurveda (Terra/Água/Fogo/Ar/Éter)",
  5: "Consciência — guna predominante (Sattva/Rajas/Tamas)",
  6: "Ação mínima — prática corporal segura (30–90s)",
  7: "Pergunta final — devolução à presença",
};
