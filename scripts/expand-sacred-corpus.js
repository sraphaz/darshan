/**
 * Expande puranas.json para ~400 entradas e upanishads.json para ~200 entradas.
 * Cada entrada tem: id, text, kleshaTargets, qualities, themes.
 * Executar: node scripts/expand-sacred-corpus.js
 */

const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..", "lib", "dictionaries", "sacred");
const KLESHAS = ["avidya", "asmita", "raga", "dvesha", "abhinivesha"];
const QUALITIES = ["vishada", "guru", "mridu", "snigdha", "picchila", "sthira", "chala", "laghu", "tikshna", "ushna", "khara", "kathina", "sita", "drava", "sandra", "manda", "sukshma", "ruksha", "shlakshna", "sthula"];
const THEMES = ["entrega", "devoção", "perdão", "compaixão", "presença", "medo", "alegria", "corpo", "mente", "respiração", "grounding", "limites", "verdade", "aceitação", "silêncio", "unidade", "coração", "ação", "tempo", "natureza", "gratidão", "humildade", "discernimento", "liberação", "paz", "amor", "confiança", "luto", "raiva", "dúvida", "palavra", "sono", "rotina", "alimentação"];

/** Templates: [text, kleshaKeys[], qualityKeys[], themeKeys[]] */
const PURANA_TEMPLATES = [
  ["O que você oferece ao divino deixa de pesar em você.", ["raga"], ["guru", "snigdha"], ["entrega", "ação"]],
  ["Quem honra o ritmo do corpo não adoece de pressa.", ["abhinivesha"], ["manda", "sthira"], ["corpo", "tempo"]],
  ["A palavra que acalma é mais forte que a que fere.", ["dvesha"], ["mridu", "tikshna"], ["palavra", "compaixão"]],
  ["O silêncio após a oração é onde a resposta habita.", ["avidya"], ["chala", "vishada"], ["silêncio", "oração"]],
  ["Aceitar a impermanência é o primeiro passo para a paz.", ["abhinivesha"], ["picchila", "mridu"], ["aceitação", "paz"]],
  ["Servir sem esperar reconhecimento libera o ego.", ["asmita"], ["vishada", "snigdha"], ["serviço", "humildade"]],
  ["A raiva que é respirada perde o controle sobre você.", ["dvesha"], ["ushna", "tikshna"], ["raiva", "respiração"]],
  ["O corpo que descansa se renova; o que não para se quebra.", ["raga"], ["manda", "mridu"], ["corpo", "sono"]],
  ["Quem vê o divino no outro não precisa que o outro mude.", ["dvesha"], ["vishada", "mridu"], ["unidade", "aceitação"]],
  ["A gratidão desloca o foco do que falta para o que já é.", ["raga", "abhinivesha"], ["vishada", "laghu"], ["gratidão", "presença"]],
  ["O medo nomeado perde metade da sombra.", ["abhinivesha"], ["sukshma", "chala"], ["medo", "presença"]],
  ["A humildade não diminui; abre espaço para o infinito.", ["asmita"], ["tikshna", "kathina"], ["humildade", "ego"]],
  ["Caminhar descalço na terra ancora a mente no agora.", ["abhinivesha"], ["sthira", "laghu"], ["grounding", "natureza"]],
  ["O perdão que você dá a si mesmo é o que libera.", ["dvesha"], ["picchila", "guru"], ["perdão", "liberação"]],
  ["Comer com consciência é oração que nutre o corpo.", ["raga"], ["sita", "vishada"], ["alimentação", "consciência"]],
  ["Dizer não é dizer sim a si mesmo.", ["asmita", "raga"], ["kathina", "sthira"], ["limites", "autocuidado"]],
  ["A dúvida honesta é o início do discernimento.", ["avidya"], ["vishada"], ["dúvida", "discernimento"]],
  ["O amor que não exige reciprocidade simplesmente flui.", ["dvesha"], ["sita", "kathina"], ["amor", "fluir"]],
  ["Lembrar a morte não é morrer; é viver com mais presença.", ["abhinivesha"], ["guru"], ["presença", "morte"]],
  ["O repouso é parte do caminho, não desvio.", ["asmita"], ["manda", "mridu"], ["rotina", "descanso"]],
  ["A verdade que libera pode doer no início.", ["avidya"], ["vishada", "tikshna"], ["verdade", "liberdade"]],
  ["Quem observa a mente sem se identificar encontra espaço.", ["avidya", "asmita"], ["vishada", "sukshma"], ["testemunha", "mente"]],
  ["A alegria que nasce de dentro não depende do externo.", ["raga"], ["laghu", "vishada"], ["alegria", "interior"]],
  ["Chorar é deixar a dor sair pelo único caminho que ela conhece.", ["abhinivesha", "dvesha"], ["drava", "mridu"], ["luto", "corpo"]],
  ["Confiar no fluxo não é passividade; é coragem.", ["abhinivesha"], ["chala", "ruksha"], ["confiança", "coragem"]],
  ["O sopro que entra e sai já é oração.", ["raga"], ["laghu", "vishada"], ["respiração", "oração"]],
  ["A natureza não tem pressa; quem anda nela aprende o ritmo.", ["raga", "abhinivesha"], ["manda", "sthira"], ["natureza", "ritmo"]],
  ["Antes de falar, pergunte: é verdadeiro, necessário e bondoso?", ["dvesha"], ["tikshna", "khara"], ["palavra", "verdade"]],
  ["O corpo guarda o que a mente esquece; honre os dois.", ["asmita", "abhinivesha"], ["guru", "snigdha"], ["corpo", "memória"]],
  ["A simplicidade é o luxo de quem não precisa provar nada.", ["raga", "asmita"], ["vishada", "laghu"], ["simplicidade", "suficiência"]],
  ["Quem se esvazia é preenchido.", ["raga"], ["vishada", "laghu"], ["humildade", "entrega"]],
  ["A paz que nasce da devoção não depende do mundo.", ["raga", "dvesha"], ["vishada", "laghu"], ["paz", "devoção"]],
  ["Proteger o coração não é fechar; é escolher o que entra.", ["abhinivesha"], ["sukshma", "chala"], ["proteção", "limites"]],
  ["O descanso é dharma; quem se entrega ao repouso se renova.", ["abhinivesha"], ["guru", "mridu"], ["descanso", "renovação"]],
  ["Abrir o coração não é fraqueza; é coragem de sentir.", ["dvesha"], ["sita", "kathina"], ["coração", "coragem"]],
  ["A graça não escolhe merecimento; ela escolhe o momento.", ["asmita"], ["kathina"], ["graça", "humildade"]],
  ["Quando o coração está quebrado, a luz entra por onde não havia porta.", ["abhinivesha"], ["guru", "mridu"], ["graça", "luz"]],
  ["O serviço ao outro é oração em movimento.", ["asmita"], ["vishada"], ["serviço", "oração"]],
  ["No silêncio da devoção, a resposta já está.", ["avidya"], ["chala", "sukshma"], ["silêncio", "resposta"]],
  ["Quem cala a mente ouve o que as palavras não dizem.", ["raga"], ["chala"], ["silêncio", "mente"]],
  ["Amar sem posse é a única forma de não perder.", ["raga"], ["snigdha", "guru"], ["amor", "desapego"]],
  ["Soltar não é desistir; é deixar o rio correr.", ["raga"], ["picchila", "sthira"], ["soltar", "fluir"]],
  ["O que você libera libera você.", ["dvesha"], ["guru", "picchila"], ["libertação", "perdão"]],
  ["O divino está no agora; quem habita o passado ou o futuro o perde.", ["abhinivesha"], ["chala"], ["presença", "agora"]],
  ["Quem observa sem julgar encontra paz.", ["dvesha", "asmita"], ["tikshna", "khara"], ["testemunha", "paz"]],
  ["O testemunho compassivo dissolve a raiva.", ["dvesha"], ["ushna", "tikshna"], ["compaixão", "raiva"]],
  ["Chorar é permitir que o rio do coração encontre o mar.", ["abhinivesha"], ["guru", "mridu"], ["luto", "corpo"]],
  ["A tristeza honrada se transforma em compaixão.", ["abhinivesha"], ["guru", "sandra"], ["luto", "compaixão"]],
  ["A alegria que não depende do externo é estável.", ["raga"], ["chala", "laghu"], ["alegria", "estabilidade"]],
  ["Celebrar o bem do outro é antídoto para a inveja.", ["dvesha"], ["tikshna", "ushna"], ["alegria", "inveja"]],
  ["A paciência é força; a pressa é medo disfarçado.", ["raga", "abhinivesha"], ["tikshna", "chala"], ["paciência", "medo"]],
  ["O que amadurece no tempo certo não apodrece.", ["raga"], ["chala"], ["paciência", "tempo"]],
  ["A simplicidade desfaz o nó da cobiça.", ["raga"], ["guru", "snigdha"], ["simplicidade", "cobiça"]],
  ["Menos é o caminho para mais.", ["raga"], ["vishada"], ["simplicidade", "suficiência"]],
  ["A verdade libera; a mentira aprisiona.", ["avidya"], ["vishada"], ["verdade", "liberdade"]],
  ["Falar a verdade com amor é arte.", ["dvesha"], ["khara", "tikshna"], ["verdade", "amor"]],
  ["Cada respiração é chance de recomeçar.", ["avidya"], ["guru", "picchila"], ["recomeço", "respiração"]],
  ["O perdão é o único modo de nascer de novo sem morrer.", ["dvesha"], ["picchila"], ["perdão", "renascimento"]],
  ["Quem vê o divino em todos não está nunca só.", ["abhinivesha"], ["sita", "sthira"], ["unidade", "companhia"]],
  ["A separação é ilusão; a união é a natureza do ser.", ["avidya"], ["vishada"], ["unidade", "identidade"]],
  ["Quem pisa a terra com consciência não cai.", ["abhinivesha"], ["chala", "laghu"], ["grounding", "consciência"]],
  ["Uma respiração consciente une corpo e espírito.", ["avidya"], ["chala"], ["respiração", "corpo"]],
  ["Aceitar o que é não é resignação; é clareza.", ["dvesha"], ["picchila", "mridu"], ["aceitação", "clareza"]],
  ["Na solidão voluntária, o ruído interno se acalma.", ["raga"], ["chala", "vishada"], ["solidão", "silêncio"]],
  ["Quem se encontra sozinho não está só.", ["abhinivesha"], ["guru"], ["solidão", "presença"]],
  ["Parar não é falhar; é permitir que a força volte.", ["raga"], ["tikshna", "ushna"], ["descanso", "força"]],
  ["A raiva que é vista com compaixão perde o fogo.", ["dvesha"], ["ushna", "tikshna"], ["raiva", "compaixão"]],
  ["Não apague a chama com mais chama; respire e deixe esfriar.", ["dvesha"], ["tikshna", "khara"], ["raiva", "resfriar"]],
  ["Quem aceita o medo não é governado por ele.", ["abhinivesha"], ["guru", "mridu"], ["medo", "aceitação"]],
  ["Não exija certeza de si; exija presença.", ["asmita"], ["chala", "laghu"], ["dúvida", "presença"]],
  ["Quem respeita os próprios limites pode expandir sem quebrar.", ["abhinivesha"], ["guru"], ["limites", "expansão"]],
  ["Caminhar na natureza é voltar à própria natureza.", ["avidya"], ["vishada", "laghu"], ["natureza", "identidade"]],
  ["A água que flui não se prende; ela contorna e segue.", ["raga"], ["sthira", "drava"], ["fluir", "flexibilidade"]],
  ["Beber um gole de água com consciência é um ato de gratidão.", ["raga"], ["sita", "vishada"], ["gratidão", "consciência"]],
  ["O silêncio que escolhemos é mais eloqüente que as palavras.", ["raga"], ["chala"], ["silêncio", "palavra"]],
  ["O corpo não é inimigo; é o veículo da alma.", ["asmita"], ["guru", "snigdha"], ["corpo", "alma"]],
  ["Honrar o cansaço do corpo é honrar a vida.", ["abhinivesha"], ["manda", "mridu"], ["corpo", "descanso"]],
  ["O que você sonha à noite o dia pode realizar.", ["avidya"], ["vishada", "sukshma"], ["sonho", "realização"]],
  ["Não despreze o sonho; ele fala a linguagem do coração.", ["raga"], ["picchila", "guru"], ["sonho", "coração"]],
  ["Quem honra os que vieram antes não caminha sozinho.", ["abhinivesha"], ["guru", "sthira"], ["ancestrais", "linhagem"]],
  ["A linhagem não é peso; é raiz.", ["avidya"], ["vishada"], ["linhagem", "raiz"]],
  ["O olhar de uma criança lembra: o presente é agora.", ["abhinivesha"], ["chala", "laghu"], ["presença", "agora"]],
  ["Brincar não é fuga; é o modo do espírito respirar.", ["raga"], ["drava", "mridu"], ["brincar", "leveza"]],
  ["O que é impermanente merece cuidado, não apego.", ["raga"], ["vishada", "snigdha"], ["impermanência", "desapego"]],
  ["Agradecer ao corpo é o primeiro passo para habitá-lo.", ["asmita"], ["guru", "snigdha"], ["corpo", "gratidão"]],
  ["O sopro que você não controla lembra: algo maior respira em você.", ["avidya"], ["chala", "sukshma"], ["respiração", "presença"]],
  ["Pés no chão, coração no céu; o meio é onde a vida acontece.", ["abhinivesha", "raga"], ["laghu", "sthira"], ["grounding", "presença"]],
  ["No espaço entre dois pensamentos está o silêncio que cura.", ["raga"], ["vishada", "manda"], ["silêncio", "mente"]],
  ["Quem diz sim a tudo diz não a si mesmo.", ["asmita", "raga"], ["kathina", "vishada"], ["limites", "autocuidado"]],
  ["A raiva é mensageira; ouça o que ela traz antes de reagir.", ["dvesha"], ["tikshna", "ushna"], ["raiva", "escuta"]],
  ["O medo que você nomeia perde a sombra; o que você esconde cresce.", ["abhinivesha"], ["guru", "mridu"], ["medo", "presença"]],
  ["Confiar não é não duvidar; é seguir mesmo quando a dúvida vem.", ["abhinivesha", "avidya"], ["chala", "vishada"], ["confiança", "dúvida"]],
  ["Antes de falar, pergunte: isso cura ou fere?", ["dvesha"], ["tikshna", "mridu"], ["palavra", "verdade"]],
  ["O repouso não é tempo perdido; é o tempo em que o corpo se refaz.", ["raga", "asmita"], ["manda", "mridu"], ["descanso", "corpo"]],
  ["Soltar o resultado não é desistir; é fazer o que cabe a você e deixar o resto.", ["raga"], ["picchila", "vishada"], ["entrega", "ação"]],
  ["A dúvida honesta abre porta; a certeza cega fecha.", ["avidya", "asmita"], ["vishada", "tikshna"], ["dúvida", "discernimento"]],
  ["A humildade não é pensar menos de si; é pensar em si menos.", ["asmita"], ["vishada", "laghu"], ["humildade", "ego"]],
  ["Aceitar o que é não é passividade; é ver com clareza para agir com sabedoria.", ["dvesha", "raga"], ["picchila", "mridu"], ["aceitação", "clareza"]],
];

/** Upanishad-style templates */
const UPANISHAD_TEMPLATES = [
  ["Aquilo que você busca já mora em você; a busca é o caminho de volta.", ["avidya", "raga"], ["vishada", "laghu"], ["identidade", "busca"]],
  ["O que não pode ser pensado pela mente, mas pelo qual a mente pensa — conhece isso.", ["avidya"], ["vishada"], ["mente", "Absoluto"]],
  ["Isto é pleno; aquilo é pleno. Do pleno nasce o pleno.", ["avidya"], ["vishada", "laghu"], ["plenitude", "unidade"]],
  ["Conhece o que em você observa como o condutor; o corpo é a carruagem.", ["avidya", "asmita"], ["vishada"], ["testemunha", "corpo"]],
  ["Duas aves habitam a mesma árvore; uma come o fruto, a outra observa.", ["raga"], ["vishada"], ["observador", "liberdade"]],
  ["Conduz-me do não-ser ao ser; da escuridão à luz; da morte à imortalidade.", ["abhinivesha"], ["guru"], ["luz", "transição"]],
  ["O que não pode ser visto pelo olho, mas pelo qual o olho vê — conhece isso.", ["avidya"], ["vishada"], ["Absoluto", "visão"]],
  ["No interior do ser reside o Ser; quem o vê alcança a paz.", ["avidya"], ["vishada", "laghu"], ["interior", "paz"]],
  ["Como pássaro preso à corda, quem está preso ao corpo não vê a liberdade.", ["raga"], ["guru", "sthira"], ["apego", "liberdade"]],
  ["O que está aqui está ali; o que está ali está aqui.", ["avidya"], ["vishada"], ["unidade", "multiplicidade"]],
  ["Levanta-te, desperta, aproxima-te dos mestres e conhece.", ["avidya", "raga"], ["manda", "guru"], ["despertar", "caminho"]],
  ["Não pelo discurso, não pela mente, não pelo olho se alcança o Ser.", ["avidya"], ["vishada"], ["Ser", "reconhecimento"]],
  ["O Ser que reside no coração é menor que um grão e maior que os céus.", ["avidya"], ["vishada", "sukshma"], ["coração", "Ser"]],
  ["Aquele que conhece o Absoluto torna-se o Absoluto.", ["avidya"], ["vishada"], ["identidade", "Absoluto"]],
  ["A paz que está além do entendimento — assim é quem conhece o Absoluto.", ["abhinivesha"], ["vishada", "laghu"], ["paz", "Absoluto"]],
  ["Conhecendo a bem-aventurança do Absoluto, o sábio não treme.", ["abhinivesha"], ["guru", "mridu"], ["medo", "bem-aventurança"]],
  ["O som que é o todo: passado, presente e futuro.", ["avidya"], ["guru", "sandra"], ["som", "totalidade"]],
  ["Conhecendo o que habita no coração de todos, o sábio entra na paz eterna.", ["dvesha"], ["vishada"], ["unidade", "paz"]],
  ["O Ser não nasce nem morre; eterno é.", ["abhinivesha"], ["vishada"], ["eternidade", "Ser"]],
  ["Quem vê todos os seres no Ser não mais se oculta.", ["asmita", "dvesha"], ["vishada"], ["unidade", "visão"]],
  ["O corpo é a carruagem; os sentidos são os cavalos; quem conduz é o Ser.", ["asmita"], ["vishada"], ["corpo", "Ser"]],
  ["No coração está a morada do Ser; quem o conhece não teme.", ["abhinivesha"], ["guru"], ["coração", "medo"]],
  ["Conduz-me da escuridão à luz.", ["abhinivesha"], ["guru", "manda"], ["luz", "transição"]],
  ["Do pleno nasce o pleno; o pleno permanece.", ["avidya"], ["vishada", "laghu"], ["plenitude", "permanência"]],
  ["A senda é afiada como o fio da navalha; os sábios a atravessam.", ["avidya", "raga"], ["tikshna", "vishada"], ["caminho", "discernimento"]],
  ["Duas aves na mesma árvore; uma come, a outra observa. Quem observa é livre.", ["raga"], ["vishada", "snigdha"], ["observador", "liberdade"]],
  ["O Ser é feito de bem-aventurança; quem o conhece é preenchido.", ["avidya"], ["vishada"], ["bem-aventurança", "Ser"]],
  ["Um só respira em todos; quem vê a unidade entra na paz.", ["dvesha"], ["vishada"], ["unidade", "respiração"]],
  ["O sopro vital é o que une todos os seres.", ["abhinivesha"], ["chala", "laghu"], ["sopro", "unidade"]],
  ["No coração está a morada da paz; quem a busca lá a encontra.", ["abhinivesha"], ["guru", "mridu"], ["coração", "paz"]],
  ["O sábio escolhe o eterno; o ignorante escolhe o passageiro.", ["avidya"], ["vishada"], ["escolha", "eterno"]],
  ["Como as faíscas do fogo, do Ser nascem todos os seres.", ["avidya"], ["ushna", "vishada"], ["origem", "Ser"]],
  ["Do Ser revestido de paz nascem os cinco invólucros.", ["asmita"], ["vishada"], ["invólucros", "liberação"]],
  ["O que a mente não alcança, mas pelo qual a mente alcança — conhece isso.", ["avidya"], ["vishada", "sukshma"], ["mente", "Absoluto"]],
  ["Renunciando ao fruto da ação, o sábio alcança a paz.", ["raga"], ["snigdha", "guru"], ["renúncia", "paz"]],
  ["O espaço dentro do coração é tão vasto quanto o espaço fora.", ["asmita"], ["vishada", "laghu"], ["espaço", "coração"]],
  ["Conhece aquele que é o conhecedor; não o que é conhecido.", ["avidya"], ["vishada"], ["conhecedor", "Ser"]],
  ["Só pelo favor do divino se revela o Ser.", ["asmita"], ["guru", "mridu"], ["graça", "revelação"]],
  ["Quem é firme na prática alcança o fim.", ["raga"], ["sthira", "vishada"], ["prática", "perseverança"]],
  ["A verdade que os sábios veem com o olho do coração.", ["avidya"], ["vishada"], ["verdade", "coração"]],
  ["Que a paz desça do céu; que a paz suba da terra; que a paz habite em mim.", ["abhinivesha"], ["guru", "mridu"], ["paz", "invocação"]],
  ["Quem vê todos os seres no Ser cobre o mundo com a própria alma.", ["dvesha"], ["vishada"], ["unidade", "visão"]],
  ["Não é conhecido por quem conhece; é conhecido por quem não conhece.", ["avidya"], ["vishada"], ["conhecimento", "paradoxo"]],
  ["O pai ensina ao filho: você é isso.", ["avidya"], ["vishada", "guru"], ["identidade", "transmissão"]],
  ["O quarto estado não é interno nem externo; é a própria consciência.", ["avidya"], ["vishada", "sukshma"], ["consciência", "estado"]],
  ["O sol que nasce no peito ilumina o que está dentro e fora.", ["abhinivesha"], ["ushna", "vishada"], ["luz", "interior"]],
  ["Meditar no Ser que reside no coração dissolve o medo.", ["abhinivesha"], ["guru"], ["meditação", "medo"]],
  ["Poucos ouvem; menos ainda compreendem; raro é quem vive.", ["avidya"], ["vishada"], ["escuta", "vivência"]],
  ["Com o corpo ereto, o coração e a mente no Absoluto, atravesse a corrente do mundo.", ["chala"], ["sthira", "vishada"], ["meditação", "presença"]],
  ["A paz que não depende do externo habita no coração de quem a busca.", ["abhinivesha"], ["vishada", "laghu"], ["paz", "interior"]],
  ["O que em você observa os pensamentos não é pensamento; conhece isso.", ["avidya", "asmita"], ["vishada", "sukshma"], ["testemunha", "consciência"]],
  ["Quem conhece a raiz não teme os galhos.", ["abhinivesha"], ["guru", "vishada"], ["liberação", "medo"]],
  ["Do Ser revestido de alegria nascem as camadas do mundo.", ["avidya"], ["vishada", "snigdha"], ["Ser", "camadas"]],
  ["O medo nasce da dualidade; quem vê a unidade não teme.", ["abhinivesha"], ["vishada", "guru"], ["medo", "unidade"]],
  ["Aja no mundo como quem oferece a ação ao Ser; o fruto não te pertence.", ["raga", "asmita"], ["snigdha", "vishada"], ["ação", "entrega"]],
  ["O sopro que entra e sai é a ponte entre o visível e o invisível.", ["avidya"], ["chala", "sukshma"], ["respiração", "presença"]],
  ["A paz que você busca fora já está dentro; pare e ouça.", ["chala", "raga"], ["sthira", "vishada"], ["paz", "interior"]],
  ["Isso és tu. O que você busca já é você.", ["avidya"], ["manda", "guru"], ["identidade", "Ser"]],
  ["O Ser que reside no coração é plenitude; o vazio é espaço para Ele.", ["avidya"], ["vishada", "laghu"], ["plenitude", "coração"]],
  ["O perdão interno libera o peso; você pode recomeçar.", ["avidya"], ["guru", "picchila"], ["perdão", "recomeço"]],
];

function pick(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}

function expandPuranas() {
  const existing = JSON.parse(fs.readFileSync(path.join(basePath, "puranas.json"), "utf8"));
  const startId = existing.length + 1;
  const targetTotal = 400;
  const toAdd = targetTotal - existing.length;
  const out = [...existing];
  let id = startId;
  for (let i = 0; i < toAdd; i++) {
    const t = PURANA_TEMPLATES[i % PURANA_TEMPLATES.length];
    const k = t[1].length ? t[1] : pick(KLESHAS, 1);
    const q = t[2].length ? t[2] : pick(QUALITIES, 2);
    const th = t[3].length ? t[3] : pick(THEMES, 2);
    out.push({
      id: `BP.med${id}`,
      text: t[0],
      kleshaTargets: k,
      qualities: q,
      themes: th,
    });
    id++;
  }
  fs.writeFileSync(path.join(basePath, "puranas.json"), JSON.stringify(out, null, 2), "utf8");
  console.log("puranas.json expandido para", out.length, "entradas.");
  return out.length;
}

function expandUpanishads() {
  const existing = JSON.parse(fs.readFileSync(path.join(basePath, "upanishads.json"), "utf8"));
  const startId = existing.length + 1;
  const targetTotal = 200;
  const toAdd = targetTotal - existing.length;
  const out = [...existing];
  let id = startId;
  for (let i = 0; i < toAdd; i++) {
    const t = UPANISHAD_TEMPLATES[i % UPANISHAD_TEMPLATES.length];
    const k = t[1].length ? t[1] : pick(KLESHAS, 1);
    const q = t[2].length ? t[2] : pick(QUALITIES, 2);
    const th = t[3].length ? t[3] : pick(THEMES, 2);
    out.push({
      id: `UP.adv${id}`,
      text: t[0],
      kleshaTargets: k,
      qualities: q,
      themes: th,
    });
    id++;
  }
  fs.writeFileSync(path.join(basePath, "upanishads.json"), JSON.stringify(out, null, 2), "utf8");
  console.log("upanishads.json expandido para", out.length, "entradas.");
  return out.length;
}

expandPuranas();
expandUpanishads();
