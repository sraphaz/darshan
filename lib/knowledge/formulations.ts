/**
 * Formulações internas — frases curtas do oráculo (offline).
 * Podem ser combinadas com arquétipos e afirmações das Upanishads.
 */

import type { FormulationEntry } from "./types";
import { pickIndexByKeywords } from "./keywordMatch";

export const FORMULATIONS: FormulationEntry[] = [
  { id: "f1", text: "O momento pede presença." },
  { id: "f2", text: "Respire e sinta o que já está aqui." },
  { id: "f3", text: "A luz do tempo não aponta para fora; ela revela o que pulsa em você." },
  { id: "f4", text: "O oráculo não adivinha — ele devolve." },
  { id: "f5", text: "Traga a pergunta ao corpo." },
  { id: "f6", text: "O que o silêncio responde?" },
  { id: "f7", text: "Cada fase lunar traz um tom; este instante pede escuta." },
  { id: "f8", text: "O mapa não define — sugere. Você é maior que qualquer aspecto." },
  { id: "f9", text: "Permita-se pausar." },
  { id: "f10", text: "O que em você quer ser ouvido?" },
  { id: "f11", text: "Respire e deixe o agora falar." },
  { id: "f12", text: "O que em você já sabe?" },
  { id: "f13", text: "O tempo pede pausa. Respire e tente novamente quando se sentir pronto." },
  { id: "f14", text: "Devolva a pergunta à consciência." },
  { id: "f15", text: "Samskaras e karmas são padrões; a presença os dissolve." },
  { id: "f16", text: "Sattva, rajas, tamas — o equilíbrio está no corpo que escuta." },
  { id: "f17", text: "O elemento que predomina neste instante pede reconhecimento, não luta." },
  { id: "f18", text: "O arquétipo que você carrega é uma porta, não uma cela." },
  { id: "f19", text: "O corpo não mente; ele guarda a verdade do instante." },
  { id: "f20", text: "A pergunta que você trouxe já é o primeiro passo da resposta." },
  { id: "f21", text: "Nenhum mapa diz quem você é; diz apenas o terreno que você atravessa." },
  { id: "f22", text: "O presente é o único tempo em que a mudança acontece." },
  { id: "f23", text: "O que você chama de problema pode ser o começo do caminho." },
  { id: "f24", text: "A consciência que observa já é maior que o que é observado." },
  { id: "f25", text: "Respirar com atenção é o primeiro ato de presença." },
  { id: "f26", text: "O número que te rege fala de tendência, não de destino." },
  { id: "f27", text: "Arquétipo e número são lentes; quem vê é você." },
  { id: "f28", text: "A tendência do seu número encontra equilíbrio na consciência." },
  { id: "f29", text: "Karma não é punição; é padrão que a atenção pode transformar." },
  { id: "f30", text: "O que em você já sabe não precisa de prova; precisa de escuta." },
  { id: "f31", text: "A lua no mapa fala de emoção; o sol, de direção; você é ambos e mais." },
  { id: "f32", text: "Nakshatra e Rashi são tons; a música é sua." },
  { id: "f33", text: "Entre o que o mapa sugere e o que você escolhe está a liberdade." },
  { id: "f34", text: "O silêncio não é vazio; é onde a resposta nasce." },
  { id: "f35", text: "Devolver a pergunta ao corpo é devolver a pergunta à vida." },
  { id: "f36", text: "O que você busca fora já está dentro, em outra forma." },
  { id: "f37", text: "Presença não é ausência de pensamento; é não se perder nele." },
  { id: "f38", text: "O instante não pede explicação; pede experiência." },
  { id: "f39", text: "Seu número regente revela tendências; a consciência revela escolha." },
  { id: "f40", text: "A sabedoria dos textos clássicos é a mesma que o corpo já conhece." },
];

export function getFormulationById(id: string): FormulationEntry | undefined {
  return FORMULATIONS.find((f) => f.id === id);
}

export function getFormulationsByArchetype(archetypeKey: string): FormulationEntry[] {
  return FORMULATIONS.filter(
    (f) => !f.archetypeHints?.length || f.archetypeHints.includes(archetypeKey)
  );
}

export function getRandomFormulation(
  archetypeKey?: string,
  seed?: number,
  preferKeywords?: string[]
): FormulationEntry {
  const pool = archetypeKey
    ? getFormulationsByArchetype(archetypeKey)
    : FORMULATIONS;
  const i =
    preferKeywords?.length
      ? pickIndexByKeywords(pool, (e) => e.text, preferKeywords, seed)
      : seed !== undefined
        ? Math.abs(Math.floor(seed)) % pool.length
        : Math.floor(Math.random() * pool.length);
  return pool[i] ?? FORMULATIONS[0];
}
