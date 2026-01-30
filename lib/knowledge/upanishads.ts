/**
 * Afirmações contínuas das Upanishads — trechos para o oráculo offline.
 * Fonte: textos clássicos (traduções/adaptações em português).
 */

import type { UpanishadEntry } from "./types";

export const UPANISHAD_AFFIRMATIONS: UpanishadEntry[] = [
  { id: "u1", text: "Aquilo que não pode ser pensado pela mente, mas pelo qual a mente pensa — conhece isso como Brahman.", source: "Kena" },
  { id: "u2", text: "O que não pode ser visto pelo olho, mas pelo qual o olho vê — conhece isso como Brahman.", source: "Kena" },
  { id: "u3", text: "Isto é pleno; aquilo é pleno. Do pleno nasce o pleno. Tomando o pleno do pleno, o pleno permanece.", source: "Isha" },
  { id: "u4", text: "No interior do ser reside o Ser; quem o vê alcança a paz.", source: "Isha" },
  { id: "u5", text: "Como pássaro preso à corda, o homem preso ao corpo não vê a liberdade.", source: "Mundaka" },
  { id: "u6", text: "Conhece o Atman como o senhor da carruagem; o corpo é a carruagem.", source: "Katha" },
  { id: "u7", text: "O que está aqui está ali; o que está ali está aqui. Quem vê multiplicidade aqui, da morte à morte vai.", source: "Katha" },
  { id: "u8", text: "Levanta-te, desperta, aproxima-te dos mestres e conhece. Afiada como o fio da navalha é a senda, diz o sábio.", source: "Katha" },
  { id: "u9", text: "Não pelo discurso, não pela mente, não pelo olho se alcança o Atman. Só quem diz 'É Ele' o alcança.", source: "Kena" },
  { id: "u10", text: "O Ser que reside no coração é menor que um grão de mostarda e maior que os céus.", source: "Chandogya" },
  { id: "u11", text: "Tat tvam asi — Isso és tu.", source: "Chandogya" },
  { id: "u12", text: "Aquele que conhece Brahman torna-se Brahman.", source: "Mundaka" },
  { id: "u13", text: "A paz que está além do entendimento — assim é o conhecedor de Brahman.", source: "Kena" },
  { id: "u14", text: "O silêncio do sábio é a sua resposta.", source: "adaptado" },
  { id: "u15", text: "O que você busca já está em você. A pergunta e a resposta são o mesmo movimento.", source: "adaptado" },
];

export function getUpanishadById(id: string): UpanishadEntry | undefined {
  return UPANISHAD_AFFIRMATIONS.find((u) => u.id === id);
}

export function getUpanishadsByArchetype(archetypeKey: string): UpanishadEntry[] {
  return UPANISHAD_AFFIRMATIONS.filter(
    (u) => !u.archetypeHints?.length || u.archetypeHints.includes(archetypeKey)
  );
}

export function getRandomUpanishad(archetypeKey?: string): UpanishadEntry {
  const pool = archetypeKey
    ? getUpanishadsByArchetype(archetypeKey)
    : UPANISHAD_AFFIRMATIONS;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? UPANISHAD_AFFIRMATIONS[0];
}
