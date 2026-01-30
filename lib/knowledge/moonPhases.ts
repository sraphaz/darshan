/**
 * Fases da lua — simbologia profunda para consciência e oráculo.
 * Usado em hovers e contexto do TimeHeader (Luz do Tempo).
 */

export type MoonPhaseKey =
  | "Lua nova"
  | "Lua crescente"
  | "Lua quarto crescente"
  | "Lua cheia"
  | "Lua minguante"
  | "Lua quarto minguante";

export interface MoonPhaseEntry {
  /** Rótulo exibido (igual à chave). */
  label: string;
  /** Resumo profundo da simbologia — uma linha para hover. */
  hover: string;
  /** Texto expandido para contexto/IA (opcional). */
  symbolism?: string;
}

const MOON_PHASES: Record<MoonPhaseKey, MoonPhaseEntry> = {
  "Lua nova": {
    label: "Lua nova",
    hover: "Semente no escuro. O que ainda não nasceu pede silêncio e intenção.",
    symbolism:
      "Invisível no céu, a lua nova simboliza o princípio absoluto, o vazio fértil, o momento antes do germe. Em muitas tradições é tempo de definir intenções, limpar o passado e confiar no que virá sem forçar. O inconsciente e o sonho ganham força; a ação visível pode esperar.",
  },
  "Lua crescente": {
    label: "Lua crescente",
    hover: "O que foi lançado na nova agora brota. Crescimento suave, confiança no ritmo.",
    symbolism:
      "A lua crescente (foice no céu) marca o despertar da intenção em gesto. Energia de expansão, mas ainda delicada: plantar, iniciar, abrir-se ao novo sem exigir resultado imediato. Simboliza esperança ativa, o corpo que se abre ao ciclo e a consciência que aceita o tempo.",
  },
  "Lua quarto crescente": {
    label: "Lua quarto crescente",
    hover: "Meio caminho entre intenção e realização. Decisão e esforço consciente.",
    symbolism:
      "Quarto crescente é o equilíbrio dinâmico entre o invisível (nova) e o pleno (cheia). Momento de consolidar escolhas, enfrentar obstáculos com clareza e comprometer-se com o que se iniciou. Em muitas culturas é tempo de trabalho ritual, disciplina e alinhamento entre desejo e ação.",
  },
  "Lua cheia": {
    label: "Lua cheia",
    hover: "Plenitude visível. Revelação, colheita e entrega ao que está completo.",
    symbolism:
      "A lua cheia é o ápice do ciclo lunar: tudo o que foi semeado e nutrido se revela. Simboliza iluminação, clareza emocional, celebração e gratidão. Também é tempo de deixar ir o que já cumpriu sua função — colher e liberar. O consciente e o inconsciente se encontram; a sombra e a luz são visíveis.",
  },
  "Lua minguante": {
    label: "Lua minguante",
    hover: "O ciclo se recolhe. Soltar, perdoar e preparar o solo para o novo.",
    symbolism:
      "A lua minguante representa o declínio consciente da luz visível e o crescimento do espaço interior. Tempo de desapego, limpeza, perdão e digestão do que foi vivido. Simboliza sabedoria que vem do deixar ir, da humildade diante do fim do ciclo e da confiança no repouso antes da nova semente.",
  },
  "Lua quarto minguante": {
    label: "Lua quarto minguante",
    hover: "Último quarto: integração. O que foi vivido vira memória e ensinamento.",
    symbolism:
      "Quarto minguante é o espelho do quarto crescente: em vez de construir para fora, integra-se para dentro. Momento de revisar, aprender com o ciclo e preparar conscientemente o terreno para a lua nova. Simboliza maturidade do ciclo, discernimento e a passagem suave da ação para o repouso.",
  },
};

/**
 * Retorna a entrada da fase lunar pelo rótulo (ex.: "Lua nova", "Lua cheia").
 * Se não encontrar, retorna entrada genérica para "Lua".
 */
export function getMoonPhaseEntry(phaseLabel: string): MoonPhaseEntry {
  const key = phaseLabel as MoonPhaseKey;
  if (key in MOON_PHASES) return MOON_PHASES[key];
  return {
    label: phaseLabel,
    hover: "Cada fase lunar traz um tom; este instante pede escuta.",
    symbolism: "A lua marca o ritmo entre visível e invisível, ação e repouso.",
  };
}

/**
 * Texto curto para hover da lua (simbologia em uma linha).
 */
export function getMoonPhaseHover(phaseLabel: string): string {
  return getMoonPhaseEntry(phaseLabel).hover;
}
