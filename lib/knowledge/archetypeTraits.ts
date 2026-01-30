/**
 * Dicionário de traits dos arquétipos — personalidade, tendências, desafios, frases.
 * Populado para evitar replicação e permitir respostas orgânicas offline.
 */

import type { ArchetypeKey } from "./types";
import { pickIndexByKeywords } from "./keywordMatch";

export type ArchetypeTraitsEntry = {
  key: ArchetypeKey;
  name: string;
  shortTrait: string;
  personality: string[];
  tendencies: string[];
  challenges: string[];
  keywords: string[];
  phrases: string[];
};

const ARCHETYPE_TRAITS: ArchetypeTraitsEntry[] = [
  {
    key: "pioneiro",
    name: "Pioneiro",
    shortTrait: "Iniciativa, coragem, novo começo.",
    personality: ["corajoso", "impulsivo", "líder natural", "direto", "energético"],
    tendencies: ["iniciar projetos", "romper limites", "ação imediata", "independência", "competição saudável"],
    challenges: ["impaciência", "agressividade", "esquecer o outro", "queimar etapas"],
    keywords: ["fogo", "início", "coragem", "Aries", "Mesha"],
    phrases: [
      "O pioneiro em você não precisa provar nada; já é o primeiro passo.",
      "Iniciativa e coragem são dons; a pausa é o complemento.",
      "O novo começo que você busca começa no agora.",
      "O mapa sugere impulso; a sabedoria é saber quando frear.",
      "Seu arquétipo traz fogo; a terra o sustenta.",
    ],
  },
  {
    key: "raiz",
    name: "Raiz",
    shortTrait: "Estabilidade, sensorial, Terra.",
    personality: ["estável", "sensual", "persistente", "prático", "paciente"],
    tendencies: ["construir bases", "apreciar beleza", "acumular segurança", "ritual", "corpo"],
    challenges: ["rigidez", "possessividade", "medo de mudança", "lentidão excessiva"],
    keywords: ["terra", "estabilidade", "Touro", "Vrishabha", "sensorial"],
    phrases: [
      "A raiz em você não precisa mais do que já tem; já está plantada.",
      "Estabilidade e sensorial são dons; a leveza é o complemento.",
      "O que você busca em segurança está na presença.",
      "Seu arquétipo traz terra; o céu a completa.",
      "Ritual e corpo são seus aliados; a rigidez é o desafio.",
    ],
  },
  {
    key: "mensageiro",
    name: "Mensageiro",
    shortTrait: "Comunicação, curiosidade, dualidade.",
    personality: ["curioso", "versátil", "comunicativo", "intelectual", "adaptável"],
    tendencies: ["aprender", "conectar ideias", "variedade", "perguntas", "movimento"],
    challenges: ["superficialidade", "dispersão", "nervosismo", "dificuldade em aprofundar"],
    keywords: ["ar", "comunicação", "Gêmeos", "Mithuna", "dualidade"],
    phrases: [
      "O mensageiro em você não precisa dizer tudo; o silêncio também comunica.",
      "Comunicação e curiosidade são dons; a profundidade é o complemento.",
      "A pergunta que você faz já contém a resposta.",
      "Seu arquétipo traz ar; a terra o ancora.",
      "Variedade e movimento são seus aliados; o centro é o desafio.",
    ],
  },
  {
    key: "cuidador",
    name: "Cuidador",
    shortTrait: "Emoção, memória, nutrição.",
    personality: ["sensível", "protetor", "intuitivo", "emocional", "acolhedor"],
    tendencies: ["cuidar", "lembrar", "nutrir", "proteger", "casa e família"],
    challenges: ["apego excessivo", "mágoa", "fuga em fantasia", "dependência emocional"],
    keywords: ["água", "emoção", "Câncer", "Karka", "memória"],
    phrases: [
      "O cuidador em você não precisa carregar todos; cuide de quem cuida.",
      "Emoção e memória são dons; o desapego é o complemento.",
      "A nutrição que você oferece começa em você mesmo.",
      "Seu arquétipo traz água; o sol a aquece.",
      "Proteção e acolhimento são seus aliados; o apego é o desafio.",
    ],
  },
  {
    key: "soberano",
    name: "Soberano",
    shortTrait: "Centro, coração, reconhecimento.",
    personality: ["generoso", "orgulhoso", "criativo", "leal", "dramático"],
    tendencies: ["liderar com coração", "reconhecimento", "criatividade", "proteger os seus", "centro de atenção"],
    challenges: ["orgulho excessivo", "vaidade", "raiva", "necessidade de aplausos"],
    keywords: ["fogo", "coração", "Leão", "Simha", "centro"],
    phrases: [
      "O soberano em você não precisa de coroa; já é o centro.",
      "Coração e reconhecimento são dons; a humildade é o complemento.",
      "O que você busca em brilho está na luz interior.",
      "Seu arquétipo traz sol; a sombra o equilibra.",
      "Criatividade e lealdade são seus aliados; o ego é o desafio.",
    ],
  },
  {
    key: "servidor",
    name: "Servidor",
    shortTrait: "Precisão, discernimento, serviço.",
    personality: ["analítico", "modesto", "eficiente", "crítico", "útil"],
    tendencies: ["organizar", "purificar", "servir", "discernir", "perfeição"],
    challenges: ["perfeccionismo", "crítica excessiva", "ansiedade", "negação do corpo"],
    keywords: ["terra", "discernimento", "Virgem", "Kanya", "serviço"],
    phrases: [
      "O servidor em você não precisa ser perfeito; já é completo.",
      "Precisão e discernimento são dons; a aceitação é o complemento.",
      "O serviço que você oferece começa no autocuidado.",
      "Seu arquétipo traz pureza; a imperfeição é humana.",
      "Organização e utilidade são seus aliados; a rigidez é o desafio.",
    ],
  },
  {
    key: "harmonizador",
    name: "Harmonizador",
    shortTrait: "Equilíbrio, relação, justiça.",
    personality: ["diplomático", "estético", "relacional", "justo", "indeciso"],
    tendencies: ["equilibrar", "parceria", "beleza", "justiça", "evitar conflito"],
    challenges: ["indecisão", "dependência do outro", "superficialidade", "evitar conflito a qualquer custo"],
    keywords: ["ar", "equilíbrio", "Libra", "Tula", "relação"],
    phrases: [
      "O harmonizador em você não precisa agradar a todos; já é equilíbrio.",
      "Relação e justiça são dons; o centro próprio é o complemento.",
      "O equilíbrio que você busca está na decisão interior.",
      "Seu arquétipo traz balança; o peso de um lado é humano.",
      "Parceria e beleza são seus aliados; a indecisão é o desafio.",
    ],
  },
  {
    key: "transformador",
    name: "Transformador",
    shortTrait: "Profundidade, morte-renascimento, poder.",
    personality: ["intenso", "investigativo", "poderoso", "secretivo", "regenerador"],
    tendencies: ["transformar", "investigar", "poder", "intimidade", "crise como portal"],
    challenges: ["ciúme", "controle", "raiva", "manipulação"],
    keywords: ["água", "transformação", "Escorpião", "Vrischika", "poder"],
    phrases: [
      "O transformador em você não precisa controlar; já é renascimento.",
      "Profundidade e poder são dons; a entrega é o complemento.",
      "A morte que você teme é a porta do novo.",
      "Seu arquétipo traz fogo oculto; a confiança o libera.",
      "Crise e regeneração são seus aliados; o controle é o desafio.",
    ],
  },
  {
    key: "sabedor",
    name: "Sabedor",
    shortTrait: "Sentido, filosofia, expansão.",
    personality: ["otimista", "filósofo", "aventureiro", "honesto", "expansionista"],
    tendencies: ["buscar sentido", "ensinar", "viajar", "liberdade", "visão ampla"],
    challenges: ["excesso de idealismo", "impaciência com limites", "dogmatismo", "fuga do cotidiano"],
    keywords: ["fogo", "sabedoria", "Sagitário", "Dhanu", "expansão"],
    phrases: [
      "O sabedor em você não precisa de mais conhecimento; já é a busca.",
      "Sentido e expansão são dons; o aqui e agora é o complemento.",
      "A filosofia que você busca está no corpo presente.",
      "Seu arquétipo traz seta; o alvo é o instante.",
      "Liberdade e verdade são seus aliados; o dogma é o desafio.",
    ],
  },
  {
    key: "estruturador",
    name: "Estruturador",
    shortTrait: "Tempo, dever, realização.",
    personality: ["disciplinado", "ambicioso", "paciente", "responsável", "reservado"],
    tendencies: ["construir legado", "cumprir dever", "tempo longo", "autoridade", "realização"],
    challenges: ["frieza emocional", "rigidez", "medo de falha", "workaholic"],
    keywords: ["terra", "estrutura", "Capricórnio", "Makara", "tempo"],
    phrases: [
      "O estruturador em você não precisa de mais conquistas; já é a montanha.",
      "Dever e realização são dons; o afeto é o complemento.",
      "O legado que você busca começa no presente vivido.",
      "Seu arquétipo traz tempo; o instante é eterno.",
      "Disciplina e paciência são seus aliados; a rigidez é o desafio.",
    ],
  },
  {
    key: "visionario",
    name: "Visionário",
    shortTrait: "Liberdade, humanidade, futuro.",
    personality: ["original", "humanitário", "rebelde", "intelectual", "desapegado"],
    tendencies: ["inovar", "igualdade", "liberdade", "amizade", "futuro"],
    challenges: ["frieza emocional", "teimosia", "utopia", "dificuldade em encarnar"],
    keywords: ["ar", "liberdade", "Aquário", "Kumbha", "humanidade"],
    phrases: [
      "O visionário em você não precisa mudar o mundo; já é a mudança.",
      "Liberdade e humanidade são dons; o corpo é o complemento.",
      "O futuro que você vislumbra começa no agora compartilhado.",
      "Seu arquétipo traz ar; a terra o ancora.",
      "Inovação e amizade são seus aliados; a desconexão é o desafio.",
    ],
  },
  {
    key: "dissolvente",
    name: "Dissolvente",
    shortTrait: "Dissolução, devoção, entrega.",
    personality: ["sensível", "devoto", "artístico", "escapista", "compassivo"],
    tendencies: ["entrega", "devoção", "arte", "dissolver limites", "transcendência"],
    challenges: ["fuga da realidade", "vitimização", "confusão", "dependência"],
    keywords: ["água", "dissolução", "Peixes", "Mina", "entrega"],
    phrases: [
      "O dissolvente em você não precisa escapar; já é o oceano.",
      "Entrega e devoção são dons; os pés no chão são o complemento.",
      "A transcendência que você busca está na presença.",
      "Seu arquétipo traz água; as margens a contêm.",
      "Compaixão e arte são seus aliados; a fuga é o desafio.",
    ],
  },
];

export function getArchetypeTraits(key: ArchetypeKey): ArchetypeTraitsEntry | undefined {
  return ARCHETYPE_TRAITS.find((t) => t.key === key);
}

export function getRandomArchetypePhrase(
  key: ArchetypeKey,
  seed?: number,
  preferKeywords?: string[]
): string {
  const entry = getArchetypeTraits(key);
  if (!entry) return "O arquétipo que você carrega é uma porta, não uma cela.";
  const pool = entry.phrases;
  const i =
    preferKeywords?.length
      ? pickIndexByKeywords(pool, (p) => p, preferKeywords, seed)
      : seed !== undefined
        ? Math.abs(Math.floor(seed)) % pool.length
        : Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0];
}

export function getRandomArchetypeTendency(key: ArchetypeKey, seed?: number): string {
  const entry = getArchetypeTraits(key);
  if (!entry) return "";
  const pool = entry.tendencies;
  const i = seed !== undefined ? Math.abs(Math.floor(seed)) % pool.length : Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0];
}
