/**
 * Dicionário amplo de significados Jyotish — efeitos na consciência e na experiência humana.
 * Por Rashi (signo lunar) e Nakshatra: temas de consciência, efeitos psicológicos, frases para o oráculo.
 * Tudo em português; Rashis e Nakshatras populados.
 */

import type { RashiKey, NakshatraKey } from "./types";
import { pickIndexByKeywords } from "./keywordMatch";

export type RashiMeaningEntry = {
  key: RashiKey;
  namePt: string;
  /** Temas que afetam a consciência (clareza, ação, repouso, etc.) */
  consciousnessThemes: string[];
  /** Efeitos na experiência psicológica e emocional */
  psychologicalEffects: string[];
  /** Frases curtas para usar na resposta do oráculo (sem sânscrito) */
  suggestedPhrases: string[];
};

export type NakshatraMeaningEntry = {
  key: NakshatraKey;
  namePt: string;
  consciousnessThemes: string[];
  psychologicalEffects: string[];
  suggestedPhrases: string[];
};

/** Signos lunares (Rashi) — significados para consciência e resposta. Tudo em português. */
export const RASHI_MEANINGS: RashiMeaningEntry[] = [
  {
    key: "mesha",
    namePt: "Áries",
    consciousnessThemes: ["início", "coragem", "ação imediata", "novo começo", "impulso vital"],
    psychologicalEffects: ["tendência a liderar", "impaciência com obstáculos", "necessidade de movimento", "identidade através da ação", "medo de ser ignorado"],
    suggestedPhrases: [
      "O seu mapa sugere impulso e novo começo; a sabedoria está em saber quando pausar.",
      "A energia do seu signo lunar fala de coragem; a pausa é o complemento.",
      "Iniciativa e ação são forças; a escuta interior as equilibra.",
      "O primeiro passo já está dado quando você respira; não precisa provar nada.",
      "Coragem e movimento andam juntos; parar também é ato de coragem.",
      "O novo começo que você busca habita neste instante.",
      "Impulso vital pede direção; a direção nasce da quietude.",
      "Liderar começa por escutar o que em você já sabe.",
      "Ação sem pausa vira fuga; a pausa devolve o sentido.",
    ],
  },
  {
    key: "vrishabha",
    namePt: "Touro",
    consciousnessThemes: ["estabilidade", "sensorial", "terra", "segurança", "beleza"],
    psychologicalEffects: ["necessidade de segurança material e emocional", "apego ao que é estável", "prazer nos sentidos", "paciência e persistência", "medo de perda"],
    suggestedPhrases: [
      "O seu mapa sugere raiz e estabilidade; a leveza é o complemento.",
      "A terra no seu signo lunar pede paciência; a flexibilidade evita rigidez.",
      "Estabilidade e beleza são dons; o desapego os libera.",
      "Segurança que vem de dentro não depende do que você acumula.",
      "O sensorial pede presença; o corpo é o primeiro templo.",
      "Paciência e persistência constroem; a pressa desfaz.",
      "A beleza que você busca já habita no que você é.",
      "Raiz forte permite voar; sem raiz, o vento leva.",
      "O prazer dos sentidos encontra paz na gratidão.",
    ],
  },
  {
    key: "mithuna",
    namePt: "Gêmeos",
    consciousnessThemes: ["comunicação", "curiosidade", "dualidade", "movimento mental", "conexão"],
    psychologicalEffects: ["mente ágil e versátil", "necessidade de variedade", "dificuldade em aprofundar", "comunicação como canal", "medo do tédio"],
    suggestedPhrases: [
      "O seu mapa sugere comunicação e curiosidade; a profundidade é o complemento.",
      "A dualidade do seu signo lunar pede centro; a pergunta e a resposta são uma.",
      "Variedade e movimento são dons; o silêncio os completa.",
      "A mente ágil encontra repouso quando o corpo é ouvido.",
      "Conexão verdadeira nasce do que você não diz.",
      "Curiosidade sem julgamento abre portas; a pressa fecha.",
      "O que você comunica e o que você escuta são um só ato.",
      "Movimento mental pede ancoragem; a respiração ancora.",
      "Variedade é riqueza quando o centro não se perde.",
    ],
  },
  {
    key: "karka",
    namePt: "Câncer",
    consciousnessThemes: ["emoção", "memória", "nutrição", "proteção", "casa"],
    psychologicalEffects: ["sensibilidade emocional", "necessidade de cuidar e ser cuidado", "memória viva do passado", "proteção como expressão de amor", "medo de rejeição"],
    suggestedPhrases: [
      "O seu mapa sugere emoção e cuidado; o autocuidado vem primeiro.",
      "A lua no seu signo fala de memória; o presente é o lugar da cura.",
      "Nutrição e proteção são dons; cuidar de si não é egoísmo.",
      "A memória que dói pode ser visitada sem ser repetida.",
      "Quem nutre merece ser nutrido; aceitar cuidado é dar cuidado.",
      "Casa é onde o corpo se sente seguro; comece por aí.",
      "Emoção não é obstáculo; é o rio que leva à clareza.",
      "Proteger o que ama começa por proteger a própria paz.",
      "O passado habita no corpo; o presente é o único lugar de mudança.",
    ],
  },
  {
    key: "simha",
    namePt: "Leão",
    consciousnessThemes: ["centro", "coração", "reconhecimento", "criatividade", "luz"],
    psychologicalEffects: ["necessidade de ser visto e reconhecido", "generosidade e orgulho", "criatividade como expressão", "lealdade", "medo da invisibilidade"],
    suggestedPhrases: [
      "O seu mapa sugere coração e centro; a humildade é o complemento.",
      "A luz do seu signo lunar pede reconhecimento; a luz interior não depende de aplausos.",
      "Criatividade e lealdade são dons; o ego em excesso os ofusca.",
      "Ser o centro não exige que todos olhem; basta você se ver.",
      "Generosidade que vem do coração não cobra retorno.",
      "O que você cria já tem valor antes de ser visto.",
      "Reconhecimento externo é bônus; o interno é base.",
      "Lealdade a si vem antes da lealdade ao papel.",
      "Luz que brilha sem exigir aplausos ilumina mais longe.",
    ],
  },
  {
    key: "kanya",
    namePt: "Virgem",
    consciousnessThemes: ["discernimento", "serviço", "pureza", "organização", "precisão"],
    psychologicalEffects: ["necessidade de ordem e utilidade", "crítica interna forte", "serviço como sentido", "perfeccionismo", "medo do caos"],
    suggestedPhrases: [
      "O seu mapa sugere discernimento e serviço; a aceitação é o complemento.",
      "A precisão do seu signo lunar pede perfeição; o humano é imperfeito e válido.",
      "Organização e utilidade são dons; a rigidez pode doer.",
      "Servir com amor não exige ser perfeito; exige estar presente.",
      "A ordem que acalma e a que aprisiona são diferentes; sinta a diferença.",
      "Discernir é separar o essencial do acessório; você já sabe o essencial.",
      "Utilidade não é só fazer; é também ser.",
      "A crítica interna pode ser substituída por curiosidade.",
      "Pureza não é ausência de erro; é intenção clara.",
    ],
  },
  {
    key: "tula",
    namePt: "Libra",
    consciousnessThemes: ["equilíbrio", "relação", "justiça", "beleza", "parceria"],
    psychologicalEffects: ["necessidade de harmonia e parceria", "indecisão entre opções", "estética e diplomacia", "evitar conflito", "medo da solidão"],
    suggestedPhrases: [
      "O seu mapa sugere equilíbrio e relação; o centro próprio é o complemento.",
      "A balança do seu signo lunar pede decisão; o equilíbrio começa em você.",
      "Harmonia e justiça são dons; agradar a todos não é possível.",
      "Decidir a partir de si não é egoísmo; é honestidade.",
      "A parceria que sustenta nasce de dois centros, não de um que anula o outro.",
      "Beleza e justiça pedem ação; a ação começa no corpo que escuta.",
      "Indecisão pode ser sabedoria: esperar o momento certo.",
      "Conflito evitado a qualquer custo vira conflito interno.",
      "O equilíbrio que você busca já existe no instante em que você para.",
    ],
  },
  {
    key: "vrischika",
    namePt: "Escorpião",
    consciousnessThemes: ["transformação", "profundidade", "poder", "morte e renascimento", "intimidade"],
    psychologicalEffects: ["intensidade emocional", "necessidade de verdade oculta", "capacidade de regeneração", "ciúme e controle", "medo da traição"],
    suggestedPhrases: [
      "O seu mapa sugere transformação e profundidade; a entrega é o complemento.",
      "A crise no seu signo lunar pode ser portal; o controle excessivo trava.",
      "Poder e intimidade são dons; a confiança os libera.",
      "O que você esconde de si pode ser o que mais precisa de luz.",
      "Regeneração não apaga o passado; integra-o.",
      "Intensidade emocional é força quando não vira explosão.",
      "A verdade oculta que você guarda pode ser dita primeiro a você mesmo.",
      "Morte e renascimento são metáforas do corpo; permita-se mudar.",
      "Ciúme e controle diminuem quando a confiança em si cresce.",
    ],
  },
  {
    key: "dhanu",
    namePt: "Sagitário",
    consciousnessThemes: ["sentido", "expansão", "filosofia", "liberdade", "verdade"],
    psychologicalEffects: ["necessidade de significado e aventura", "otimismo e honestidade", "expansão mental e física", "dogmatismo possível", "medo do aprisionamento"],
    suggestedPhrases: [
      "O seu mapa sugere sentido e expansão; o aqui e agora é o complemento.",
      "A seta do seu signo lunar aponta para o alto; o chão também é sagrado.",
      "Liberdade e verdade são dons; a prática no corpo os encarna.",
      "A filosofia que você busca está no gesto diário, não só no pensamento.",
      "Aventura e significado andam juntos quando o corpo vai junto.",
      "Otimismo sem raiz vira fuga; a raiz é o instante presente.",
      "Expansão mental encontra limite no corpo; honre esse limite.",
      "Verdade que liberta não precisa ser dogmática.",
      "O sentido que você procura já habita na pergunta que você faz.",
    ],
  },
  {
    key: "makara",
    namePt: "Capricórnio",
    consciousnessThemes: ["estrutura", "tempo", "dever", "realização", "autoridade"],
    psychologicalEffects: ["necessidade de construir e realizar", "disciplina e paciência", "responsabilidade forte", "frieza emocional possível", "medo do fracasso"],
    suggestedPhrases: [
      "O seu mapa sugere estrutura e dever; o afeto é o complemento.",
      "A montanha do seu signo lunar pede paciência; o instante também conta.",
      "Realização e disciplina são dons; o corpo e o coração merecem cuidado.",
      "Construir legado começa por cuidar de quem constrói.",
      "Tempo longo e tempo curto coexistem; o agora é o único que você tem.",
      "Responsabilidade sem autocuidado vira peso; o cuidado libera.",
      "Autoridade verdadeira não precisa provar; basta ser.",
      "O dever que esgota não é destino; é padrão que pode mudar.",
      "Fracasso e sucesso são passagens; o que fica é o que você aprende.",
    ],
  },
  {
    key: "kumbha",
    namePt: "Aquário",
    consciousnessThemes: ["liberdade", "humanidade", "inovação", "futuro", "desapego"],
    psychologicalEffects: ["necessidade de liberdade e igualdade", "visão de futuro", "originalidade e rebeldia", "frieza emocional possível", "medo da convenção"],
    suggestedPhrases: [
      "O seu mapa sugere liberdade e humanidade; o corpo é o complemento.",
      "O futuro no seu signo lunar pede encarnação; a mudança começa em você.",
      "Inovação e amizade são dons; a conexão humana aquece.",
      "Visão de futuro que ignora o corpo vira fuga.",
      "Igualdade e liberdade começam em como você se trata.",
      "Originalidade não exige romper com tudo; pode ser um gesto novo no cotidiano.",
      "O que você idealiza para o mundo pode começar no seu entorno.",
      "Desapego das convenções não precisa ser frieza; pode ser amor ampliado.",
      "Humanidade que você defende inclui a sua; cuide de si.",
    ],
  },
  {
    key: "mina",
    namePt: "Peixes",
    consciousnessThemes: ["dissolução", "devoção", "entrega", "transcendência", "compaixão"],
    psychologicalEffects: ["sensibilidade e compaixão", "necessidade de transcendência", "confusão entre eu e outro", "arte e devoção", "medo da realidade dura"],
    suggestedPhrases: [
      "O seu mapa sugere entrega e dissolução; os pés no chão são o complemento.",
      "O oceano do seu signo lunar pede margens; a presença é a margem.",
      "Compaixão e arte são dons; a fuga da realidade pode doer.",
      "Transcendência que ignora o corpo adia a paz.",
      "Confusão entre eu e outro se dissolve quando você se enxerga com clareza.",
      "Devoção e compaixão crescem quando você se inclui no círculo.",
      "A realidade dura também é passagem; a presença a atravessa.",
      "Arte que nasce da entrega não precisa ser perfeita.",
      "Dissolver limites não é perder-se; é encontrar-se no que é maior.",
    ],
  },
];

/** Nakshatras (27 estações lunares) — significados para consciência e resposta. Tudo em português. */
export const NAKSHATRA_MEANINGS: NakshatraMeaningEntry[] = [
  {
    key: "ashwini",
    namePt: "Estrela do Cavalo",
    consciousnessThemes: ["início rápido", "cura", "movimento"],
    psychologicalEffects: ["impulso de começar", "capacidade de curar", "inquietude"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de novo começo; a pausa também cura.",
      "A energia do seu mapa pede movimento; a cura começa quando você para.",
      "Início rápido e cura são dons; a paciência complementa.",
      "Impulso de começar pede direção; a direção nasce da escuta.",
      "Quem cura também precisa ser curado; permita-se receber.",
      "Movimento sem pausa vira inquietude; a pausa devolve o foco.",
      "O primeiro passo já está dado quando você respira.",
      "Cura que vem de dentro não depende de remédio alheio.",
      "Inquietude é sinal de vida; a quietude é o lugar de resposta.",
    ],
  },
  {
    key: "bharani",
    namePt: "A Portadora",
    consciousnessThemes: ["carregar", "transformação", "renúncia"],
    psychologicalEffects: ["capacidade de carregar peso", "transformação através da perda", "intensidade"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de carregar e soltar; a entrega libera.",
      "A transformação no seu mapa passa pela renúncia; soltar é ganhar.",
      "Carregar e transformar são dons; não carregue sozinho.",
      "A portadora que não deposita o peso cansa; deposite em você mesmo às vezes.",
      "Intensidade que transforma não precisa ser dramática.",
      "Perda e ganho são dois lados do mesmo movimento.",
      "Quem carrega peso merece descanso; o descanso não é fraqueza.",
      "Renúncia que libera não é sacrifício vazio; é escolha clara.",
      "Transformação através da perda é portal; a compaixão por si abre a porta.",
    ],
  },
  {
    key: "krittika",
    namePt: "Chama",
    consciousnessThemes: ["purificação", "corte", "claridade", "início pelo fogo", "discernimento"],
    psychologicalEffects: ["necessidade de limpar o que não serve", "impulsividade e honestidade cortante", "capacidade de iluminar", "intolerância ao que é obscuro", "medo da sujeira moral"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de chama e purificação; a compaixão suaviza o corte.",
      "A claridade do seu mapa pede discernimento; o fogo que limpa não precisa queimar o outro.",
      "Início pelo fogo é dom; a pausa evita o incêndio.",
      "Purificação que queima sem amor deixa cicatriz; a compaixão acalma.",
      "Corte que separa o essencial do supérfluo é dom; use com cuidado.",
      "Honestidade cortante pode ser dita com suavidade.",
      "O que você limpa em si reflete no que você vê no mundo.",
      "Discernimento não é julgamento; é clareza que libera.",
      "Fogo que ilumina também aquece; não precisa destruir.",
    ],
  },
  {
    key: "rohini",
    namePt: "Estrela Vermelha",
    consciousnessThemes: ["fertilidade", "beleza", "crescimento", "atração", "abundância"],
    psychologicalEffects: ["necessidade de beleza e harmonia", "capacidade de nutrir e atrair", "apego ao que floresce", "sensualidade e charme", "medo da esterilidade"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de fertilidade e beleza; a entrega ao ciclo completa.",
      "A abundância do seu mapa pede gratidão; o que floresce também passa.",
      "Crescimento e atração são dons; o desapego permite renascer.",
      "Beleza que atrai sem apegar é liberdade.",
      "Fertilidade não é só gerar; é nutrir o que já nasceu.",
      "Sensualidade e charme são canais; a consciência os guia.",
      "O que floresce em você merece ser visto por você primeiro.",
      "Abundância interior não depende da externa; cultive-a.",
      "Ciclo de florescimento e queda é natural; resistir à queda trava o próximo florescer.",
    ],
  },
  {
    key: "mrigashira",
    namePt: "Cabeça do Cervo",
    consciousnessThemes: ["busca", "curiosidade", "suavidade", "exploração", "gentileza"],
    psychologicalEffects: ["necessidade de buscar e descobrir", "mente inquieta e gentil", "dificuldade em fixar", "encanto pela jornada", "medo de ficar preso"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de busca e gentileza; o repouso também é caminho.",
      "A curiosidade do seu mapa pede direção; nem toda busca precisa de destino.",
      "Exploração e suavidade são dons; o centro evita a dispersão.",
      "Mente inquieta encontra paz quando o corpo é o ancoradouro.",
      "Gentileza na jornada não é lentidão; é respeito pelo processo.",
      "Descobrir e buscar são prazeres; fixar é escolha, não obrigação.",
      "Encanto pela jornada não precisa de meta final para ter sentido.",
      "Suavidade e exploração andam juntos quando você não se julga.",
      "O centro que evita dispersão não prende; sustenta.",
    ],
  },
  {
    key: "ardra",
    namePt: "Úmida",
    consciousnessThemes: ["tempestade", "transformação pela dor", "clareza após a chuva", "ruptura", "renovação"],
    psychologicalEffects: ["intensidade emocional e mental", "capacidade de atravessar crises", "tendência à tormenta interior", "honestidade que fere", "medo da fragilidade"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de tempestade e renovação; depois da chuva vem a clareza.",
      "A transformação no seu mapa passa pela dor; a compaixão por si acalma.",
      "Ruptura e renovação são dons; a calma não é fraqueza.",
      "Intensidade emocional é força quando não vira autodestruição.",
      "Atravessar crise é habilidade; pedir apoio não é falha.",
      "Honestidade que fere pode ser dita com timing e amor.",
      "Tormenta interior pede escuta; a escuta acalma.",
      "Fragilidade reconhecida é o primeiro passo da resistência.",
      "Renovação após a chuva não apaga o que houve; integra.",
    ],
  },
  {
    key: "punarvasu",
    namePt: "Boa Estrela",
    consciousnessThemes: ["retorno", "renovação", "esperança", "segunda chance", "nutrição"],
    psychologicalEffects: ["capacidade de recomeçar", "otimismo e fé no amanhã", "necessidade de lar e raiz", "adaptação após perda", "medo de não ser acolhido"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de retorno e boa estrela; cada recomeço é sagrado.",
      "A renovação no seu mapa pede esperança; a segunda chance começa em você.",
      "Retorno e nutrição são dons; permita-se ser nutrido.",
      "Recomeçar não é apagar o passado; é escolher de novo a partir dele.",
      "Boa estrela não é sorte cega; é abertura ao que vem.",
      "Lar e raiz são necessidades; honre-as sem fechar-se.",
      "Adaptação após perda é força; a dor não precisa ser escondida.",
      "Segunda chance começa quando você se perdoa.",
      "Esperança que nutre não ignora a dificuldade; a atravessa.",
    ],
  },
  {
    key: "pushya",
    namePt: "Nutritiva",
    consciousnessThemes: ["nutrição", "cuidado", "proteção", "abundância interior", "sacralidade"],
    psychologicalEffects: ["necessidade de nutrir e ser nutrido", "devoção e cuidado com o que ama", "generosidade e proteção", "apego ao papel de cuidador", "medo da escassez"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de nutrição e cuidado; quem nutre também precisa ser nutrido.",
      "A abundância no seu mapa começa por dentro; o autocuidado não é egoísmo.",
      "Cuidado e proteção são dons; a entrega equilibra.",
      "Sacralidade do que você nutre não exige sacrifício de si.",
      "Devoção e cuidado andam juntos quando você se inclui no círculo.",
      "Generosidade que esgota não sustenta; recarregue-se.",
      "Proteção que aprisiona vira peso; proteja com espaço.",
      "Abundância interior multiplica quando compartilhada sem apego.",
      "Medo da escassez diminui quando você confia no ciclo.",
    ],
  },
  {
    key: "ashlesha",
    namePt: "Abraço",
    consciousnessThemes: ["abraço", "proteção que envolve", "mistério", "profundidade emocional", "transformação"],
    psychologicalEffects: ["intensidade na relação", "necessidade de união profunda", "desconfiança e proteção", "capacidade de regeneração", "medo de ser traído"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de abraço e profundidade; a confiança libera o abraço.",
      "A proteção no seu mapa pode virar prisão; soltar também é amar.",
      "Profundidade e transformação são dons; a leveza complementa.",
      "União profunda nasce de dois inteiros; não de um que engole o outro.",
      "Desconfiança que protege pode ser suavizada com comunicação.",
      "Regeneração após crise é dom; permita-se tempo.",
      "Mistério na relação pode coexistir com transparência.",
      "Abraço que sufoca não é amor; é medo.",
      "Profundidade emocional pede expressão; guardar demais adoece.",
    ],
  },
  {
    key: "magha",
    namePt: "Grande",
    consciousnessThemes: ["grandeza", "ancestralidade", "honra", "luz", "reconhecimento"],
    psychologicalEffects: ["necessidade de honra e reconhecimento", "orgulho da linhagem e do próprio valor", "generosidade e autoridade", "medo da humilhação", "desejo de deixar legado"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de grandeza e honra; a humildade não diminui.",
      "A luz no seu mapa pede reconhecimento; a luz interior não depende de aplausos.",
      "Ancestralidade e legado são dons; o presente também é sagrado.",
      "Orgulho da linhagem pode conviver com gratidão pelo que você constrói hoje.",
      "Autoridade que serve não oprime; inspire.",
      "Medo da humilhação diminui quando você não depende do julgamento alheio.",
      "Deixar legado começa por viver bem o instante.",
      "Grandeza que exige aplauso é frágil; a que vem de dentro sustenta.",
      "Honra e reconhecimento são desejos legítimos; não precisam definir seu valor.",
    ],
  },
  {
    key: "purva-phalguni",
    namePt: "Primeira Vermelha",
    consciousnessThemes: ["prazer", "criatividade", "união", "beleza", "celebração"],
    psychologicalEffects: ["necessidade de prazer e beleza", "criatividade e charme", "desejo de parceria e reconhecimento", "tendência ao excesso", "medo da rejeição"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de prazer e criatividade; o equilíbrio evita o excesso.",
      "A beleza no seu mapa pede celebração; celebrar a si é válido.",
      "União e criatividade são dons; a solidão também nutre.",
      "Prazer que não fere a si nem ao outro é liberdade.",
      "Criatividade que nasce do corpo não precisa ser obra-prima.",
      "Desejo de parceria pode começar por parceria consigo.",
      "Tendência ao excesso pede consciência; não culpa.",
      "Rejeição que dói não define seu valor; define apenas um momento.",
      "Celebração do que você é não depende de plateia.",
    ],
  },
  {
    key: "uttara-phalguni",
    namePt: "Segunda Vermelha",
    consciousnessThemes: ["parceria", "equilíbrio", "reciprocidade", "amizade", "aliança"],
    psychologicalEffects: ["necessidade de parceria equilibrada", "capacidade de compartilhar poder", "lealdade e diplomacia", "medo de ficar só", "desejo de reconhecimento mútuo"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de parceria e reciprocidade; o centro próprio sustenta a aliança.",
      "A aliança no seu mapa pede equilíbrio; dar e receber são um só.",
      "Parceria e amizade são dons; a independência interior fortalece.",
      "Compartilhar poder não é perder poder; é multiplicar.",
      "Lealdade e diplomacia andam juntos quando a verdade é dita com cuidado.",
      "Medo de ficar só pode ser suavizado pela relação consigo.",
      "Reconhecimento mútuo nasce de dois que se veem.",
      "Parceria equilibrada não exige que um anule o outro.",
      "Amizade que sustenta não cobra; oferece.",
    ],
  },
  {
    key: "hasta",
    namePt: "Mão",
    consciousnessThemes: ["habilidade", "fazer", "destreza", "cura pelas mãos", "concretização"],
    psychologicalEffects: ["necessidade de criar com as mãos", "capacidade de concretizar ideias", "criticidade e perfeccionismo", "serviço através do fazer", "medo de não ser útil"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de mão e habilidade; o fazer a partir do ser.",
      "A destreza no seu mapa pede concretização; a pausa também é produtiva.",
      "Fazer e curar são dons; permita-se receber.",
      "Concretizar ideias pede tempo; não exija de si o instantâneo.",
      "Serviço através do fazer ganha sentido quando o ser está presente.",
      "Medo de não ser útil pode ser questionado; você já é.",
      "Mão que cria também merece repouso.",
      "Curar pelas mãos é dom; receber cuidado também.",
      "Habilidade que nasce da prática não precisa ser perfeita no primeiro gesto.",
    ],
  },
  {
    key: "chitra",
    namePt: "Brilhante",
    consciousnessThemes: ["beleza", "ordem", "construção", "brilho", "forma"],
    psychologicalEffects: ["necessidade de ordem e beleza", "capacidade de construir e embelezar", "crítica ao que é feio ou caótico", "perfeccionismo estético", "medo do caos"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de brilho e forma; a imperfeição também é humana.",
      "A beleza no seu mapa pede construção; a aceitação do que é evita sofrimento.",
      "Ordem e brilho são dons; a flexibilidade evita rigidez.",
      "Construir e embelezar são atos de amor; não de controle.",
      "Crítica ao caos pode ser suavizada pela compaixão ao que está em desordem.",
      "Perfeccionismo estético pode conviver com a aceitação do imperfeito.",
      "Medo do caos diminui quando você confia no processo.",
      "Forma que libera é diferente da forma que aprisiona.",
      "Brilho que vem de dentro não depende de cenário perfeito.",
    ],
  },
  {
    key: "swati",
    namePt: "Independente",
    consciousnessThemes: ["liberdade", "movimento", "independência", "vento", "mudança"],
    psychologicalEffects: ["necessidade de liberdade e espaço", "adaptação e movimento", "dificuldade em comprometer-se", "diplomacia e leveza", "medo de ser preso"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de liberdade e vento; a raiz permite voar.",
      "A independência no seu mapa pede movimento; o compromisso pode ser livre.",
      "Liberdade e mudança são dons; o centro evita a dispersão.",
      "Espaço e liberdade são necessidades; honre-as sem ferir o outro.",
      "Adaptação não é perda de identidade; é flexibilidade.",
      "Comprometer-se a partir de escolha é liberdade; por obrigação, é prisão.",
      "Leveza e diplomacia andam juntos quando você não carrega o que não é seu.",
      "Medo de ser preso pode ser aliviado pela confiança em si.",
      "Vento que leva também traz; permita-se ser trazido.",
    ],
  },
  {
    key: "vishakha",
    namePt: "Ramo",
    consciousnessThemes: ["determinação", "objetivo", "vitória", "persistência", "fruto"],
    psychologicalEffects: ["necessidade de vencer obstáculos", "determinação e competitividade", "capacidade de esperar o fruto", "tendência à impaciência", "medo de falhar"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de ramo e objetivo; o caminho também é o fruto.",
      "A determinação no seu mapa pede persistência; a paciência complementa.",
      "Vitória e fruto são dons; a entrega ao processo libera.",
      "Vencer obstáculos não exige vencer a si mesmo.",
      "Competitividade saudável não precisa anular o outro.",
      "Esperar o fruto com paciência não é passividade; é sabedoria.",
      "Medo de falhar diminui quando o processo vale mais que o resultado.",
      "Determinação que esgota pede repouso; repousar não é desistir.",
      "O fruto que você busca pode estar no gesto que você faz hoje.",
    ],
  },
  {
    key: "anuradha",
    namePt: "Sucesso",
    consciousnessThemes: ["sucesso", "amizade", "devoção", "aliança", "fidelidade"],
    psychologicalEffects: ["necessidade de sucesso através da relação", "devoção e lealdade", "capacidade de cultivar amizades profundas", "medo da traição", "desejo de reconhecimento"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de sucesso e amizade; a fidelidade a si vem primeiro.",
      "A devoção no seu mapa pede aliança; não só aos outros, também a você.",
      "Sucesso e fidelidade são dons; o autocuidado sustenta.",
      "Sucesso através da relação não exige anulação de si.",
      "Devoção e lealdade crescem quando você se inclui no pacto.",
      "Amizades profundas nascem de presença; não de performance.",
      "Medo da traição pode ser suavizado pela confiança em si.",
      "Reconhecimento que vem dos outros é bônus; o seu próprio sustenta.",
      "Cultivar amizade consigo é a primeira aliança.",
    ],
  },
  {
    key: "jyestha",
    namePt: "A Maior",
    consciousnessThemes: ["poder", "proteção", "mistério", "autoridade", "transformação"],
    psychologicalEffects: ["necessidade de poder e proteção", "intensidade e ciúme possíveis", "capacidade de liderar em crise", "medo de ser superado", "desejo de ser o primeiro"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de poder e proteção; a humildade não diminui.",
      "A autoridade no seu mapa pede serviço; o poder verdadeiro não oprime.",
      "Proteção e transformação são dons; a confiança libera.",
      "Poder que protege não precisa dominar.",
      "Intensidade e ciúme podem ser transmutados em presença e cuidado.",
      "Liderar em crise é dom; pedir apoio não o anula.",
      "Medo de ser superado diminui quando você não compete consigo.",
      "Ser o primeiro não é obrigação; é escolha quando faz sentido.",
      "Mistério que protege não precisa ser muralha.",
    ],
  },
  {
    key: "mula",
    namePt: "Raiz",
    consciousnessThemes: ["raiz", "origem", "investigação", "ruptura para renascer", "verdade oculta"],
    psychologicalEffects: ["necessidade de ir à raiz", "capacidade de questionar tudo", "crise como portal", "honestidade radical", "medo do vazio"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de raiz e origem; a investigação leva à verdade.",
      "A ruptura no seu mapa pode ser renascimento; a raiz que corta também sustenta.",
      "Raiz e verdade são dons; a compaixão por si acalma.",
      "Ir à raiz não exige destruir; pode ser escavar com cuidado.",
      "Questionar tudo pode conviver com confiar em algo.",
      "Crise como portal pede coragem; não heroísmo solitário.",
      "Honestidade radical não precisa ser brutal.",
      "Medo do vazio diminui quando você habita o instante.",
      "Verdade oculta que emerge traz alívio; permita-se revelar.",
    ],
  },
  {
    key: "purva-ashadha",
    namePt: "Primeira Invencível",
    consciousnessThemes: ["invencibilidade", "vitória", "vontade", "não desistir", "fogo"],
    psychologicalEffects: ["necessidade de vencer e não desistir", "vontade forte e competitividade", "capacidade de inspirar", "impaciência com derrota", "medo de parecer fraco"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de invencibilidade; a entrega também é força.",
      "A vitória no seu mapa pode ser interior; o que não desiste de si.",
      "Vontade e fogo são dons; a pausa recarrega.",
      "Vencer e não desistir podem incluir desistir do que não serve.",
      "Competitividade que inspira não precisa esmagar.",
      "Impaciência com derrota pode ser transmutada em aprendizado.",
      "Medo de parecer fraco diminui quando a vulnerabilidade é aceita.",
      "Fogo que impulsiona não precisa queimar; pode aquecer.",
      "Invencibilidade verdadeira às vezes é saber quando recuar.",
    ],
  },
  {
    key: "uttara-ashadha",
    namePt: "Segunda Invencível",
    consciousnessThemes: ["vitória duradoura", "estabilidade no triunfo", "paciência", "legado", "firmeza"],
    psychologicalEffects: ["necessidade de vitória que permaneça", "paciência e persistência", "capacidade de construir legado", "medo de perder o que conquistou", "desejo de reconhecimento eterno"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de vitória duradoura; o instante também é eterno.",
      "O legado no seu mapa começa no agora; cada passo conta.",
      "Firmeza e paciência são dons; a flexibilidade evita quebra.",
      "Vitória que permanece não depende só de você; aceite o que não controla.",
      "Persistência e paciência andam juntos quando o objetivo vale a pena.",
      "Medo de perder o conquistado pode ser suavizado pela gratidão.",
      "Reconhecimento eterno é ilusão; o que fica é o que você viveu.",
      "Estabilidade no triunfo pede humildade; a montanha também erode.",
      "Legado que sustenta não é monumento; é gesto repetido com amor.",
    ],
  },
  {
    key: "shravana",
    namePt: "Escuta",
    consciousnessThemes: ["escuta", "aprendizado", "recepção", "sabedoria que ouve", "comunicação"],
    psychologicalEffects: ["capacidade de ouvir e aprender", "necessidade de ser ouvido", "sabedoria através da escuta", "medo do silêncio ou da surdez", "desejo de transmitir"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de escuta; a sabedoria que ouve também se ouve.",
      "A escuta no seu mapa pede receptividade; o silêncio fala.",
      "Escuta e aprendizado são dons; a voz interior merece atenção.",
      "Ouvir e aprender são atos de humildade; não de inferioridade.",
      "Necessidade de ser ouvido é legítima; comunique-a com gentileza.",
      "Sabedoria através da escuta não exige silêncio absoluto; exige presença.",
      "Medo do silêncio pode ser explorado; o que ele esconde?",
      "Transmitir o que você aprendeu é dom; receber também.",
      "A voz interior que merece atenção às vezes sussurra; aproxime-se.",
    ],
  },
  {
    key: "dhanishta",
    namePt: "Riqueza",
    consciousnessThemes: ["riqueza", "abundância", "ritmo", "música", "prosperidade"],
    psychologicalEffects: ["necessidade de prosperidade material e espiritual", "ritmo e capacidade de sincronizar", "generosidade quando pleno", "medo da pobreza", "desejo de compartilhar riqueza"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de riqueza e ritmo; a abundância começa por dentro.",
      "A prosperidade no seu mapa pede compartilhar; dar e receber são um.",
      "Ritmo e abundância são dons; a gratidão multiplica.",
      "Prosperidade material e espiritual podem coexistir; uma não anula a outra.",
      "Ritmo e sincronia nascem da escuta; do corpo e do outro.",
      "Generosidade quando pleno não exige esvaziar-se.",
      "Medo da pobreza diminui quando você confia no ciclo de dar e receber.",
      "Compartilhar riqueza é ato de liberdade; não de obrigação.",
      "Música e ritmo são metáforas do fluxo; permita-se fluir.",
    ],
  },
  {
    key: "shatabhisha",
    namePt: "Cem Curas",
    consciousnessThemes: ["cura", "mistério", "solidão", "renovação", "dissolução"],
    psychologicalEffects: ["capacidade de curar e ser curado", "necessidade de solidão criativa", "mistério e introspecção", "medo da exposição", "desejo de transformar"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de cura e mistério; a solidão também cura.",
      "As cem curas no seu mapa começam em você; permita-se ser curado.",
      "Renovação e dissolução são dons; a presença acalma.",
      "Curar e ser curado são dois lados do mesmo movimento.",
      "Solidão criativa não é isolamento; é encontro consigo.",
      "Mistério e introspecção podem conviver com abertura ao outro.",
      "Medo da exposição pode ser respeitado; não precisa ser vencido à força.",
      "Transformar é dom; ser transformado também.",
      "Dissolução que renova não apaga; integra.",
    ],
  },
  {
    key: "purva-bhadra",
    namePt: "Primeira Auspiciosa",
    consciousnessThemes: ["auspício", "início sagrado", "fogo transformador", "purificação", "novo ciclo"],
    psychologicalEffects: ["necessidade de começos auspiciosos", "intensidade e purificação", "capacidade de quebrar padrões", "impulsividade possível", "medo do que é impuro"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de auspício e novo ciclo; cada instante pode ser sagrado.",
      "O início no seu mapa pede purificação; a compaixão por si é o primeiro passo.",
      "Fogo transformador e novo ciclo são dons; a pausa evita queima.",
      "Começos auspiciosos não exigem condições perfeitas; exigem intenção clara.",
      "Intensidade e purificação andam juntos quando o amor está presente.",
      "Quebrar padrões pode ser gradual; não só explosivo.",
      "Impulsividade possível pode ser canalizada; não reprimida.",
      "Medo do impuro pode ser suavizado pela aceitação do humano.",
      "Novo ciclo que renasce não nega o que passou; honra-o e segue.",
    ],
  },
  {
    key: "uttara-bhadra",
    namePt: "Segunda Auspiciosa",
    consciousnessThemes: ["estabilidade auspiciosa", "fundação", "serpente que sustenta", "profundidade", "transformação lenta"],
    psychologicalEffects: ["necessidade de base estável", "capacidade de sustentar transformações", "profundidade emocional", "medo do colapso", "desejo de legado estável"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de fundação auspiciosa; a paciência constrói.",
      "A profundidade no seu mapa pede raiz; a transformação lenta também transforma.",
      "Estabilidade e profundidade são dons; a flexibilidade evita rigidez.",
      "Fundação que sustenta não precisa ser rígida; pode ser viva.",
      "Sustentar transformações é habilidade; não carregue sozinho.",
      "Profundidade emocional pede expressão; guardar demais adoece.",
      "Medo do colapso diminui quando você confia no que construiu.",
      "Legado estável não é imutável; é resiliente.",
      "Transformação lenta também transforma; não despreze o tempo.",
    ],
  },
  {
    key: "revati",
    namePt: "Próspera",
    consciousnessThemes: ["prosperidade", "nutrição final", "entrega", "completude", "transição"],
    psychologicalEffects: ["necessidade de completar ciclos", "capacidade de nutrir até o fim", "entrega e generosidade", "medo de perder o que foi construído", "desejo de deixar bênção"],
    suggestedPhrases: [
      "O tom da sua estação lunar fala de prosperidade e completude; a entrega é a última nutrição.",
      "A transição no seu mapa pede entrega; o que termina também começa.",
      "Prosperidade e completude são dons; permita-se receber o ciclo.",
      "Completar ciclos é ato de amor; não de obrigação.",
      "Nutrir até o fim não exige esgotar-se; nutra-se também.",
      "Entrega e generosidade andam juntos quando você se inclui no dar.",
      "Medo de perder o construído pode ser suavizado pela gratidão pelo que foi.",
      "Deixar bênção não exige grandeza; exige presença.",
      "Transição que honra o que passou abre espaço para o que vem.",
    ],
  },
];

function getRashiMeaning(rashi: RashiKey): RashiMeaningEntry | undefined {
  return RASHI_MEANINGS.find((e) => e.key === rashi);
}

function getNakshatraMeaning(nakshatra: NakshatraKey): NakshatraMeaningEntry | undefined {
  return NAKSHATRA_MEANINGS.find((e) => e.key === nakshatra);
}

/** Retorna uma frase do dicionário de significados Jyotish para o chart (Rashi ou Nakshatra); em português. */
export function getJyotishPhraseForChart(
  chart: { moonRashi?: RashiKey; moonNakshatra?: NakshatraKey },
  seed?: number,
  preferKeywords?: string[]
): string | null {
  const rashiEntry = chart.moonRashi ? getRashiMeaning(chart.moonRashi) : undefined;
  const nakshatraEntry = chart.moonNakshatra ? getNakshatraMeaning(chart.moonNakshatra) : undefined;

  const rashiPhrases = rashiEntry?.suggestedPhrases ?? [];
  const nakshatraPhrases = nakshatraEntry?.suggestedPhrases ?? [];
  const combined = [...rashiPhrases, ...nakshatraPhrases].filter(Boolean);
  if (combined.length === 0) return null;

  const i =
    preferKeywords?.length
      ? pickIndexByKeywords(combined, (p) => p, preferKeywords, seed)
      : seed !== undefined
        ? Math.abs(Math.floor(seed)) % combined.length
        : Math.floor(Math.random() * combined.length);
  return combined[i] ?? null;
}

/**
 * Interpretação Jyotish para leitura (mapa pessoal) — usa temas de consciência e
 * efeitos psicológicos em forma narrativa, sem as frases prontas do oráculo.
 */
export function getJyotishReadingInterpretation(
  chart: { moonRashi?: RashiKey; moonNakshatra?: NakshatraKey },
  _seed?: number
): string | null {
  const rashiEntry = chart.moonRashi ? getRashiMeaning(chart.moonRashi) : undefined;
  const nakshatraEntry = chart.moonNakshatra ? getNakshatraMeaning(chart.moonNakshatra) : undefined;
  if (!rashiEntry && !nakshatraEntry) return null;

  const parts: string[] = [];

  if (rashiEntry) {
    const themes = rashiEntry.consciousnessThemes?.slice(0, 4).join(", ") ?? "";
    const effects = rashiEntry.psychologicalEffects?.slice(0, 3).join("; ") ?? "";
    if (themes) parts.push(`O signo lunar ${rashiEntry.namePt} traz à tona temas como ${themes}.`);
    if (effects) parts.push(`Na experiência psicológica isso pode se manifestar como ${effects}.`);
  }

  if (nakshatraEntry) {
    const nThemes = nakshatraEntry.consciousnessThemes?.slice(0, 3).join(", ") ?? "";
    const nEffects = nakshatraEntry.psychologicalEffects?.slice(0, 2).join("; ") ?? "";
    if (nThemes) parts.push(`A estação lunar ${nakshatraEntry.namePt} acrescenta ${nThemes}.`);
    if (nEffects) parts.push(`Na dinâmica interna pode aparecer como ${nEffects}.`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}
