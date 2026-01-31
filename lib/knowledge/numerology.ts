/**
 * Numerologia — número regente a partir do nome (Pitágoras).
 * Dicionário de tendências e frases por número (1–9, 11, 22) para respostas coerentes.
 */

import { pickIndexByKeywords } from "./keywordMatch";

export type RulingNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22;

/** Mapa letra → valor (Pitágoras) */
const LETTER_VALUES: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

function reduceToDigit(n: number): number {
  if (n === 11 || n === 22) return n;
  while (n > 9) {
    n = String(n).split("").reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Calcula o número regente (Pitágoras) a partir do nome completo.
 * Soma os valores das letras, reduz a um dígito (ou mantém 11/22).
 */
export function getRulingNumberFromName(fullName: string): RulingNumber {
  const name = (fullName || "").toUpperCase().replace(/\s+/g, "").replace(/[^A-ZÀ-Ú]/g, "");
  if (!name.length) return 7;
  let sum = 0;
  for (const char of name) {
    const v = LETTER_VALUES[char] ?? LETTER_VALUES[char.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase()];
    if (v) sum += v;
  }
  if (sum === 0) return 7;
  while (sum > 99) {
    sum = String(sum).split("").reduce((s, d) => s + parseInt(d, 10), 0);
  }
  if (sum === 11 || sum === 22) return sum as 11 | 22;
  return reduceToDigit(sum) as RulingNumber;
}

/**
 * Life Path Number (data de nascimento) — soma dos dígitos da data reduzida a 1–9 ou 11/22.
 * Ex.: 1990-05-15 → 1+9+9+0+0+5+1+5 = 30 → 3.
 */
export function getLifePathNumber(birthDate: string): RulingNumber {
  const digits = (birthDate || "").replace(/\D/g, "");
  if (!digits.length) return 7;
  let sum = 0;
  for (const d of digits) sum += parseInt(d, 10);
  if (sum === 0) return 7;
  while (sum > 99) {
    sum = String(sum).split("").reduce((s, d) => s + parseInt(d, 10), 0);
  }
  if (sum === 11 || sum === 22) return sum as 11 | 22;
  return reduceToDigit(sum) as RulingNumber;
}

/** Expression/Destiny Number = número regente do nome (alias semântico). */
export function getExpressionNumber(fullName: string): RulingNumber {
  return getRulingNumberFromName(fullName);
}

/** Entrada do dicionário por número: tendências e frases para o oráculo */
export type NumberTraitsEntry = {
  number: RulingNumber;
  name: string;
  shortTrait: string;
  tendencies: string[];
  challenges: string[];
  phrases: string[];
};

const NUMBERS_DICTIONARY: NumberTraitsEntry[] = [
  {
    number: 1,
    name: "Líder",
    shortTrait: "Iniciativa, independência, unidade.",
    tendencies: ["liderança natural", "vontade forte", "criatividade pioneira", "autoconfiança", "individualidade"],
    challenges: ["rigidez", "solidão", "impatência", "ego inflado"],
    phrases: [
      "Seu número fala de unidade: o um que contém o todo.",
      "A tendência do um é liderar; a sabedoria é saber quando seguir.",
      "Independência e iniciativa são seus dons; a entrega é o desafio.",
      "O um não precisa provar nada; já é completo.",
    ],
  },
  {
    number: 2,
    name: "Diplomata",
    shortTrait: "Cooperação, sensibilidade, parceria.",
    tendencies: ["diplomacia", "intuição", "parceria", "harmonia", "paciência"],
    challenges: ["dependência", "indecisão", "evitar conflito a qualquer custo"],
    phrases: [
      "Seu número traz o dom da escuta e do equilíbrio.",
      "Dois é a dança entre eu e o outro; nenhum existe sem o outro.",
      "Sensibilidade é força quando não vira fuga.",
      "A cooperação que você busca começa em você mesmo.",
    ],
  },
  {
    number: 3,
    name: "Comunicador",
    shortTrait: "Expressão, criatividade, alegria.",
    tendencies: ["comunicação", "criatividade", "otimismo", "sociabilidade", "expressão"],
    challenges: ["superficialidade", "dispersão", "crítica excessiva"],
    phrases: [
      "Seu número é a trindade: corpo, mente e espírito em expressão.",
      "Criatividade e alegria são seus canais; a profundidade os completa.",
      "O três não precisa falar por falar; o silêncio também expressa.",
      "Comunicação verdadeira nasce do que você é, não do que você mostra.",
    ],
  },
  {
    number: 4,
    name: "Construtor",
    shortTrait: "Estabilidade, trabalho, raiz.",
    tendencies: ["disciplina", "organização", "confiabilidade", "persistência", "estrutura"],
    challenges: ["rigidez", "medo de mudança", "workaholic"],
    phrases: [
      "Seu número constrói; a base que você busca está em você.",
      "Quatro é a terra: firmeza e paciência. A flexibilidade é o complemento.",
      "O trabalho que importa é o trabalho interior.",
      "Estabilidade não é imobilidade; é centro em movimento.",
    ],
  },
  {
    number: 5,
    name: "Livre",
    shortTrait: "Liberdade, mudança, experiência.",
    tendencies: ["versatilidade", "curiosidade", "liberdade", "adaptação", "sentidos"],
    challenges: ["inquietude", "compromisso difícil", "excesso de estímulo"],
    phrases: [
      "Seu número anseia liberdade; a verdadeira liberdade é interior.",
      "Cinco sentidos, cinco direções — o centro é o sexto.",
      "Mudança constante pode esconder o que não quer ser visto.",
      "A liberdade que você busca já habita o instante.",
    ],
  },
  {
    number: 6,
    name: "Cuidador",
    shortTrait: "Responsabilidade, amor, serviço.",
    tendencies: ["cuidado", "responsabilidade", "harmonia doméstica", "justiça", "beleza"],
    challenges: ["sacrifício excessivo", "controle", "culpa"],
    phrases: [
      "Seu número cuida; lembre-se de cuidar de quem cuida.",
      "Seis é o equilíbrio entre dar e receber; ambos são um.",
      "O amor que você oferece começa no amor por si.",
      "Responsabilidade sem autocuidado vira peso.",
    ],
  },
  {
    number: 7,
    name: "Buscador",
    shortTrait: "Reflexão, mistério, sabedoria.",
    tendencies: ["introspecção", "espiritualidade", "análise", "intuição", "solidão criativa"],
    challenges: ["isolamento", "cinismo", "fuga do mundo"],
    phrases: [
      "Seu número busca o invisível; ele já está em você.",
      "Sete é o sábio que sabe que não sabe.",
      "A busca exterior reflete a busca interior.",
      "Mistério e silêncio são seus aliados; use-os com compaixão.",
    ],
  },
  {
    number: 8,
    name: "Realizador",
    shortTrait: "Poder, abundância, manifestação.",
    tendencies: ["ambição", "organização", "autoridade", "material e espiritual", "justiça"],
    challenges: ["materialismo", "controle", "workaholic"],
    phrases: [
      "Seu número manifesta; o poder verdadeiro é o que não precisa provar.",
      "Oito é o infinito deitado: abundância sem apego.",
      "Realização externa reflete realização interna.",
      "Poder e humildade podem coexistir quando o ego se acalma.",
    ],
  },
  {
    number: 9,
    name: "Humanitário",
    shortTrait: "Completude, entrega, sabedoria.",
    tendencies: ["generosidade", "visão ampla", "desapego", "compaixão", "ciclos"],
    challenges: ["martírio", "idealismo rígido", "dificuldade em receber"],
    phrases: [
      "Seu número completa o ciclo; o nove devolve tudo ao um.",
      "Humanitarismo começa no humano que você é.",
      "Entrega e desapego são dons quando não viram fuga.",
      "A sabedoria do nove é saber que já está completo.",
    ],
  },
  {
    number: 11,
    name: "Visionário",
    shortTrait: "Inspiração, intuição elevada, canal.",
    tendencies: ["intuição forte", "idealismo", "inspiração", "sensibilidade", "visão"],
    challenges: ["nervosismo", "expectativas altas", "fuga da materialidade"],
    phrases: [
      "Onze é o número mestre: ponte entre mundos.",
      "Sua intuição é canal; aterrar evita dispersão.",
      "Visionários precisam de pés no chão para realizar a visão.",
      "A inspiração que você sente pode servir ao mundo sem você se perder nela.",
    ],
  },
  {
    number: 22,
    name: "Mestre Construtor",
    shortTrait: "Visão prática, realização em larga escala.",
    tendencies: ["capacidade de realizar grandes projetos", "equilíbrio ideal e prático", "liderança", "organização"],
    challenges: ["pressão", "perfeccionismo", "sobrecarga"],
    phrases: [
      "Vinte e dois constrói no mundo o que o onze vislumbra.",
      "Seu número pode manifestar o que serve a muitos; o cuidado consigo vem primeiro.",
      "Mestre construtor não é quem faz tudo, é quem faz o essencial.",
      "A realização em larga escala começa na paz interior.",
    ],
  },
];

export function getNumberTraits(num: RulingNumber): NumberTraitsEntry {
  const entry = NUMBERS_DICTIONARY.find((e) => e.number === num);
  return entry ?? NUMBERS_DICTIONARY.find((e) => e.number === 7)!;
}

export function getRandomPhraseForNumber(
  num: RulingNumber,
  seed?: number,
  preferKeywords?: string[]
): string {
  const entry = getNumberTraits(num);
  const pool = entry.phrases;
  const i =
    preferKeywords?.length
      ? pickIndexByKeywords(pool, (p) => p, preferKeywords, seed)
      : seed !== undefined
        ? Math.abs(Math.floor(seed)) % pool.length
        : Math.floor(Math.random() * pool.length);
  return pool[i] ?? entry.phrases[0];
}

export function getRandomTendencyForNumber(num: RulingNumber, seed?: number): string {
  const entry = getNumberTraits(num);
  const pool = entry.tendencies;
  const i = seed !== undefined ? Math.abs(Math.floor(seed)) % pool.length : Math.floor(Math.random() * pool.length);
  return pool[i] ?? entry.tendencies[0];
}
