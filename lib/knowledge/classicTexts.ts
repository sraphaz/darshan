/**
 * Textos clássicos organizados por fonte — Upanishads, Bhagavad Gita, Yoga Sutras.
 * Classificados por guna (sattva, rajas, tamas) e por arquétipo.
 * Textos em português; termos originais substituídos por equivalentes abrangentes (sem sânscrito para o usuário).
 */

import type { ArchetypeKey, Guna } from "./types";
import { pickIndexByKeywords } from "./keywordMatch";

export type { Guna };

export type ClassicTextEntry = {
  id: string;
  source: "upanishad" | "bhagavad-gita" | "yoga-sutras" | "outro";
  work?: string;
  text: string;
  /** Qualidade predominante do trecho (clareza/equilíbrio, ação, repouso) */
  guna?: Guna;
  /** Arquétipos com os quais o trecho combina (vazio = neutro) */
  archetypeHints?: ArchetypeKey[];
};

const UPANISHADS: ClassicTextEntry[] = [
  { id: "up1", source: "upanishad", work: "Kena", guna: "sattva", text: "Aquilo que não pode ser pensado pela mente, mas pelo qual a mente pensa — conhece isso como o Absoluto." },
  { id: "up2", source: "upanishad", work: "Kena", guna: "sattva", text: "O que não pode ser visto pelo olho, mas pelo qual o olho vê — conhece isso como o Absoluto." },
  { id: "up3", source: "upanishad", work: "Isha", guna: "sattva", archetypeHints: ["dissolvente", "raiz"], text: "Isto é pleno; aquilo é pleno. Do pleno nasce o pleno. Tomando o pleno do pleno, o pleno permanece." },
  { id: "up4", source: "upanishad", work: "Isha", guna: "sattva", text: "No interior do ser reside o Ser; quem o vê alcança a paz." },
  { id: "up5", source: "upanishad", work: "Mundaka", guna: "rajas", archetypeHints: ["pioneiro", "sabedor"], text: "Como pássaro preso à corda, o homem preso ao corpo não vê a liberdade." },
  { id: "up6", source: "upanishad", work: "Katha", guna: "sattva", archetypeHints: ["servidor", "estruturador"], text: "Conhece o que em você observa como o condutor da carruagem; o corpo é a carruagem." },
  { id: "up7", source: "upanishad", work: "Katha", guna: "sattva", text: "O que está aqui está ali; o que está ali está aqui. Quem vê só a multiplicidade, da morte à morte vai." },
  { id: "up8", source: "upanishad", work: "Katha", guna: "rajas", archetypeHints: ["pioneiro", "transformador"], text: "Levanta-te, desperta, aproxima-te dos mestres e conhece. Afiada como o fio da navalha é a senda, diz o sábio." },
  { id: "up9", source: "upanishad", work: "Kena", guna: "sattva", text: "Não pelo discurso, não pela mente, não pelo olho se alcança o Ser. Só quem diz 'É Ele' o alcança." },
  { id: "up10", source: "upanishad", work: "Chandogya", guna: "sattva", archetypeHints: ["cuidador", "dissolvente"], text: "O Ser que reside no coração é menor que um grão de mostarda e maior que os céus." },
  { id: "up11", source: "upanishad", work: "Chandogya", guna: "sattva", text: "Isso és tu." },
  { id: "up12", source: "upanishad", work: "Mundaka", guna: "sattva", text: "Aquele que conhece o Absoluto torna-se o Absoluto." },
  { id: "up13", source: "upanishad", work: "Kena", guna: "sattva", text: "A paz que está além do entendimento — assim é quem conhece o Absoluto." },
  { id: "up14", source: "upanishad", work: "Taittiriya", guna: "sattva", text: "Conhecendo a bem-aventurança do Absoluto, o sábio não treme diante de nada." },
  { id: "up15", source: "upanishad", work: "Mandukya", guna: "tamas", archetypeHints: ["dissolvente", "raiz"], text: "O som que é o todo: o passado, o presente e o futuro." },
  { id: "up16", source: "upanishad", work: "Shvetashvatara", guna: "sattva", text: "Conhecendo o que habita no coração de todos os seres, o sábio entra na paz eterna." },
  { id: "up17", source: "upanishad", work: "Brihadaranyaka", guna: "rajas", archetypeHints: ["transformador", "visionario"], text: "Conduz-me do não-ser ao ser; conduz-me da escuridão à luz; conduz-me da morte à imortalidade." },
  { id: "up18", source: "upanishad", work: "Katha", guna: "sattva", text: "O Ser não nasce nem morre; não nasceu, não nascerá; eterno é." },
  { id: "up19", source: "upanishad", work: "Isha", guna: "sattva", archetypeHints: ["harmonizador", "dissolvente"], text: "Quem vê todos os seres no Ser e o Ser em todos os seres não mais se oculta." },
  { id: "up20", source: "upanishad", work: "Mundaka", guna: "sattva", text: "Duas aves, companheiras unidas, habitam a mesma árvore; uma come o fruto, a outra observa sem comer." },
];

const BHAGAVAD_GITA: ClassicTextEntry[] = [
  { id: "bg1", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "O que é nascimento, o que é morte, o que é ser e não ser — conhece isso e age sem apego." },
  { id: "bg2", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", archetypeHints: ["harmonizador", "servidor"], text: "Aquele que vê inação na ação e ação na inação é sábio entre os homens." },
  { id: "bg3", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "rajas", archetypeHints: ["estruturador", "soberano"], text: "Faze o que deves fazer; melhor é o próprio dever, mesmo imperfeito, que o dever alheio bem feito." },
  { id: "bg4", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "O sábio não se perturba nem pela alegria nem pela dor; permanece igual em ambos." },
  { id: "bg5", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", archetypeHints: ["cuidador", "dissolvente"], text: "Quando a consciência se estabiliza, a tristeza dissolve-se." },
  { id: "bg6", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "Aquele que não odeia nem deseja, que age sem apego ao fruto, alcança a paz." },
  { id: "bg7", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "O corpo é efêmero; o que mora no corpo é eterno, inatingível." },
  { id: "bg8", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "rajas", archetypeHints: ["pioneiro", "sabedor"], text: "Oferece a mente e o coração; com a prática, chegarás." },
  { id: "bg9", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", archetypeHints: ["harmonizador", "dissolvente"], text: "Quem vê o Um em todos os seres e todos os seres no Um nunca se perde." },
  { id: "bg10", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "Entre os que dissipam as trevas, está a luz da consciência." },
  { id: "bg11", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "Quem age dedicando as ações ao Absoluto, abandonando o apego, não é manchado pela consequência dos atos." },
  { id: "bg12", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", text: "A paz vem para quem não odeia nenhum ser, quem é amigo e compassivo." },
  { id: "bg13", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "sattva", archetypeHints: ["sabedor", "servidor"], text: "O campo conhece o Campo; quem conhece isso conhece a libertação." },
  { id: "bg14", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "rajas", archetypeHints: ["pioneiro", "soberano"], text: "Quando a luz do conhecimento brilha em todos os sentidos, então se diz que o sol nasceu." },
  { id: "bg15", source: "bhagavad-gita", work: "Bhagavad Gita", guna: "rajas", text: "Corta a dúvida com a espada do conhecimento; refugia-te na prática; levanta-te." },
];

const YOGA_SUTRAS: ClassicTextEntry[] = [
  { id: "ys1", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "Yoga é a cessação das flutuações da mente." },
  { id: "ys2", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "Quando a mente está em silêncio, o observador repousa em sua própria natureza." },
  { id: "ys3", source: "yoga-sutras", work: "Yoga Sutras", guna: "rajas", archetypeHints: ["estruturador", "servidor"], text: "A prática constante e o desapego são os meios." },
  { id: "ys4", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "A atitude em relação ao que pode ser evitado é: não é meu, não sou isso." },
  { id: "ys5", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "Quando a verdade é conhecida, a ação e seus frutos não mais prendem." },
  { id: "ys6", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", archetypeHints: ["raiz", "cuidador"], text: "O contentamento traz felicidade suprema." },
  { id: "ys7", source: "yoga-sutras", work: "Yoga Sutras", guna: "rajas", text: "A prática torna-se firme quando mantida por muito tempo, sem interrupção." },
  { id: "ys8", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "A respiração observada acalma a mente." },
  { id: "ys9", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "Quando a consciência se volta para dentro, surge o estado de fluir." },
  { id: "ys10", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "O sofrimento que ainda não veio pode ser evitado." },
  { id: "ys11", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "A causa do sofrimento é a identificação do observador com o observado." },
  { id: "ys12", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "O presente é o único tempo que existe; o passado e o futuro são projeções." },
  { id: "ys13", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "A clareza surge quando a mente reflete a luz do Ser." },
  { id: "ys14", source: "yoga-sutras", work: "Yoga Sutras", guna: "sattva", text: "O fruto da prática é a estabilidade e a leveza." },
  { id: "ys15", source: "yoga-sutras", work: "Yoga Sutras", guna: "rajas", archetypeHints: ["pioneiro", "visionario"], text: "Quando o esforço se torna alegria, a prática está enraizada." },
];

const ALL_CLASSIC_TEXTS: ClassicTextEntry[] = [
  ...UPANISHADS,
  ...BHAGAVAD_GITA,
  ...YOGA_SUTRAS,
];

/** Mapeia arquétipo → guna predominante (para filtrar textos clássicos) */
export const ARCHETYPE_TO_GUNA: Record<string, Guna> = {
  pioneiro: "rajas",
  raiz: "tamas",
  mensageiro: "rajas",
  cuidador: "tamas",
  soberano: "rajas",
  servidor: "sattva",
  harmonizador: "sattva",
  transformador: "rajas",
  sabedor: "sattva",
  estruturador: "tamas",
  visionario: "rajas",
  dissolvente: "tamas",
};

export function getClassicTextById(id: string): ClassicTextEntry | undefined {
  return ALL_CLASSIC_TEXTS.find((e) => e.id === id);
}

export function getClassicTextsBySource(source: ClassicTextEntry["source"]): ClassicTextEntry[] {
  return ALL_CLASSIC_TEXTS.filter((e) => e.source === source);
}

/** Textos que combinam com o arquétipo (e opcionalmente com a guna do arquétipo) */
export function getClassicTextsByArchetypeAndGuna(
  archetypeKey: string,
  preferGuna?: Guna
): ClassicTextEntry[] {
  const guna = preferGuna ?? ARCHETYPE_TO_GUNA[archetypeKey];
  return ALL_CLASSIC_TEXTS.filter((e) => {
    const matchGuna = !e.guna || e.guna === guna;
    const matchArchetype = !e.archetypeHints?.length || e.archetypeHints.includes(archetypeKey);
    return matchGuna && matchArchetype;
  });
}

export function getRandomClassicText(seed?: number): ClassicTextEntry {
  const i = seed !== undefined
    ? Math.abs(Math.floor(seed)) % ALL_CLASSIC_TEXTS.length
    : Math.floor(Math.random() * ALL_CLASSIC_TEXTS.length);
  return ALL_CLASSIC_TEXTS[i] ?? ALL_CLASSIC_TEXTS[0];
}

/** Escolhe um texto clássico relacionado ao arquétipo (e à guna); fallback para lista total */
export function getRandomClassicTextForArchetype(
  archetypeKey: string,
  seed?: number,
  preferKeywords?: string[]
): ClassicTextEntry {
  const pool = getClassicTextsByArchetypeAndGuna(archetypeKey);
  const list = pool.length > 0 ? pool : ALL_CLASSIC_TEXTS;
  const i =
    preferKeywords?.length
      ? pickIndexByKeywords(list, (e) => e.text, preferKeywords, seed)
      : seed !== undefined
        ? Math.abs(Math.floor(seed)) % list.length
        : Math.floor(Math.random() * list.length);
  return list[i] ?? ALL_CLASSIC_TEXTS[0];
}

export function getRandomClassicTextFromSource(source: ClassicTextEntry["source"], seed?: number): ClassicTextEntry {
  const pool = getClassicTextsBySource(source);
  const i = seed !== undefined
    ? Math.abs(Math.floor(seed)) % pool.length
    : Math.floor(Math.random() * pool.length);
  return pool[i] ?? pool[0];
}

export { UPANISHADS, BHAGAVAD_GITA, YOGA_SUTRAS, ALL_CLASSIC_TEXTS };
