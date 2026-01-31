/**
 * Gera yoga_sutras_full.json com 196 sutras (existentes + 1.41-1.51, 3.11-3.56, 4.1-4.34).
 * Cada entrada tem: id, text, kleshaTargets, qualities, themes.
 * Executar: node scripts/generate-yoga-sutras-full.js
 */

const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..", "lib", "dictionaries", "sacred");
const existing = JSON.parse(fs.readFileSync(path.join(basePath, "yoga_sutras.json"), "utf8"));

const withThemes = existing.map((e) => ({
  ...e,
  themes: e.themes || ["yoga", "mente", "presença"],
}));

const extra = [
  { id: "YS.1.41", text: "Quando a mente se torna como cristal, há união do conhecedor, do conhecido e do ato de conhecer.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["mente", "concentração"] },
  { id: "YS.1.42", text: "A absorção com reflexão é a que mistura palavra, significado e conhecimento.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["meditação"] },
  { id: "YS.1.43", text: "Quando a memória é purificada, a absorção sem reflexão surge; o objeto brilha sozinho.", kleshaTargets: ["raga"], qualities: ["vishada", "laghu"], themes: ["mente", "presença"] },
  { id: "YS.1.44", text: "O mesmo se aplica à absorção com e sem semente.", kleshaTargets: [], qualities: ["vishada"], themes: ["yoga"] },
  { id: "YS.1.45", text: "O estado sem semente tem como objeto o indiferenciado.", kleshaTargets: ["abhinivesha"], qualities: ["guru"], themes: ["liberação"] },
  { id: "YS.1.46", text: "Essas são as absorções com semente.", kleshaTargets: [], qualities: ["vishada"], themes: ["yoga"] },
  { id: "YS.1.47", text: "Na clareza da absorção sem semente surge a paz.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["presença"] },
  { id: "YS.1.48", text: "O conhecimento que nasce ali é portador da verdade.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["discernimento"] },
  { id: "YS.1.49", text: "Diferente do que vem de testemunho ou inferência, pois tem por objeto o particular.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["conhecimento"] },
  { id: "YS.1.50", text: "A impressão nascida dele obstrui as outras impressões.", kleshaTargets: ["raga"], qualities: ["picchila"], themes: ["mente"] },
  { id: "YS.1.51", text: "Com a obstrução também dessa, surge a absorção sem semente.", kleshaTargets: ["abhinivesha"], qualities: ["guru"], themes: ["liberação"] },
];

const sutras3 = [
  { id: "YS.3.11", text: "O desaparecimento de toda dispersão e o surgimento da concentração única é o estado de samādhi.", kleshaTargets: ["chala"], qualities: ["chala", "sthira"], themes: ["concentração"] },
  { id: "YS.3.12", text: "Quando o passado e o presente são iguais, surge o fluxo único da mente.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["presença"] },
  { id: "YS.3.13", text: "Com isso se explicam a transformação das formas, do tempo e do estado.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["transformação"] },
  { id: "YS.3.14", text: "O substrato é o que possui as qualidades latentes, manifestas ou não manifestas.", kleshaTargets: [], qualities: ["vishada"], themes: ["natureza"] },
  { id: "YS.3.15", text: "A sucessão das transformações é a causa da sequência.", kleshaTargets: ["avidya"], qualities: ["chala"], themes: ["tempo"] },
  { id: "YS.3.16", text: "Pela restrição sobre as três transformações surge o conhecimento do passado e do futuro.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["conhecimento"] },
  { id: "YS.3.17", text: "A palavra, o objeto e a ideia se confundem; pela restrição sobre eles surge o conhecimento do som de todos os seres.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["escuta"] },
  { id: "YS.3.18", text: "Pela percepção direta das impressões surge o conhecimento das vidas anteriores.", kleshaTargets: ["raga"], qualities: ["picchila"], themes: ["memória"] },
  { id: "YS.3.19", text: "Pela restrição sobre as marcas mentais surge o conhecimento das mentes de outros.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["empatia"] },
  { id: "YS.3.20", text: "Não sobre o suporte, pois não é objeto dessa restrição.", kleshaTargets: [], qualities: ["vishada"], themes: ["yoga"] },
  { id: "YS.3.21", text: "Pela restrição sobre a forma do corpo, cortando a luz e o poder de ser visto, surge o desaparecimento.", kleshaTargets: ["asmita"], qualities: ["sukshma"], themes: ["corpo"] },
  { id: "YS.3.22", text: "O karma é rápido ou lento; pela restrição sobre ele surge o conhecimento da morte.", kleshaTargets: ["abhinivesha"], qualities: ["guru"], themes: ["tempo"] },
  { id: "YS.3.23", text: "Pela restrição sobre a amizade e outras forças surge o poder delas.", kleshaTargets: ["raga", "dvesha"], qualities: ["snigdha"], themes: ["relação"] },
  { id: "YS.3.24", text: "Pela restrição sobre a força do elefante e outras surge essa força.", kleshaTargets: ["asmita"], qualities: ["sthira"], themes: ["poder"] },
  { id: "YS.3.25", text: "O conhecimento do sutil, do oculto e do distante surge pela luz da percepção.", kleshaTargets: ["avidya"], qualities: ["vishada", "sukshma"], themes: ["conhecimento"] },
  { id: "YS.3.26", text: "Pela restrição sobre o sol surge o conhecimento do cosmos.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["cosmos"] },
  { id: "YS.3.27", text: "Sobre a lua surge o conhecimento da disposição das estrelas.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["tempo"] },
  { id: "YS.3.28", text: "Sobre a Estrela Polar surge o conhecimento do movimento das estrelas.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["orientação"] },
  { id: "YS.3.29", text: "Sobre o umbigo surge o conhecimento da constituição do corpo.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["corpo"] },
  { id: "YS.3.30", text: "Sobre a garganta surge a cessação da fome e da sede.", kleshaTargets: ["raga"], qualities: ["snigdha"], themes: ["corpo"] },
  { id: "YS.3.31", text: "Sobre o tubo curvo surge a estabilidade.", kleshaTargets: ["chala"], qualities: ["sthira"], themes: ["postura"] },
  { id: "YS.3.32", text: "Sobre a luz da coroa surge a visão dos Siddhas.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["luz"] },
  { id: "YS.3.33", text: "Ou por intuição surge todo conhecimento.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["conhecimento"] },
  { id: "YS.3.34", text: "Sobre o coração surge o conhecimento da mente.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["mente"] },
  { id: "YS.3.35", text: "A experiência e o Ser não se distinguem; a restrição sobre o que existe por si surge conhecimento do Ser.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["ser"] },
  { id: "YS.3.36", text: "Daí surgem intuição, audição, tato, visão, paladar e olfato.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["sentidos"] },
  { id: "YS.3.37", text: "São obstáculos à absorção; poderes na vida dispersa.", kleshaTargets: ["raga"], qualities: ["chala"], themes: ["yoga"] },
  { id: "YS.3.38", text: "Pelo relaxamento do vínculo e pelo conhecimento do fluxo surge a entrada em outro corpo.", kleshaTargets: ["abhinivesha"], qualities: ["sukshma"], themes: ["transformação"] },
  { id: "YS.3.39", text: "Pelo domínio do sopro ascendente surge a não aderência à água, ao lodo e às espinas.", kleshaTargets: ["chala"], qualities: ["laghu"], themes: ["pranayama"] },
  { id: "YS.3.40", text: "Pelo domínio do sopro mediano surge o brilho.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["luz"] },
  { id: "YS.3.41", text: "Pela restrição sobre a relação ouvido-espaço surge o ouvido divino.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["escuta"] },
  { id: "YS.3.42", text: "Pela restrição sobre a relação corpo-espaço e pela leveza do algodão surge a passagem pelo espaço.", kleshaTargets: ["asmita"], qualities: ["laghu"], themes: ["corpo"] },
  { id: "YS.3.43", text: "A atividade fora do corpo, não iluminada pela mente, é o véu grande; daí o desaparecimento do véu sobre a luz.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["mente"] },
  { id: "YS.3.44", text: "Pela restrição sobre o grosseiro, a forma, o sutil, a conexão e o propósito surge o domínio dos elementos.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["elementos"] },
  { id: "YS.3.45", text: "Daí surgem a minúcia, a perfeição do corpo e a não obstrução das funções.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["corpo"] },
  { id: "YS.3.46", text: "Perfeição do corpo é beleza, graça, força e firmeza de diamante.", kleshaTargets: ["asmita"], qualities: ["sthira"], themes: ["corpo"] },
  { id: "YS.3.47", text: "Pela restrição sobre a percepção, a natureza essencial, o eu e a conexão surge o domínio dos órgãos.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["sentidos"] },
  { id: "YS.3.48", text: "Daí surgem velocidade como a da mente, ação sem órgãos e domínio da matéria de origem.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["ação"] },
  { id: "YS.3.49", text: "Só para quem discerne a distinção entre sattva e Ser surge a soberania sobre todos os estados e sobre todo conhecimento.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["discernimento"] },
  { id: "YS.3.50", text: "Pelo desapego até a isso surge a semente do defeito destruída; isso é kaivalya.", kleshaTargets: ["raga", "abhinivesha"], qualities: ["vishada"], themes: ["liberação"] },
  { id: "YS.3.51", text: "Não haver atração pelos poderes quando convidados pelos guardiões dos mundos seria apego; seria o renascimento.", kleshaTargets: ["raga"], qualities: ["snigdha"], themes: ["desapego"] },
  { id: "YS.3.52", text: "Pela restrição sobre o momento e sua sucessão surge o conhecimento nascido do discernimento.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["tempo"] },
  { id: "YS.3.53", text: "Daí surge o discernimento do que é igual em espécie, caráter e lugar.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["conhecimento"] },
  { id: "YS.3.54", text: "O conhecimento nascido do discernimento é portador de tudo, em todo tempo, sem sucessão.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["conhecimento"] },
  { id: "YS.3.55", text: "Quando a pureza de sattva e do Ser é igual, surge kaivalya.", kleshaTargets: ["asmita"], qualities: ["vishada"], themes: ["liberação"] },
  { id: "YS.3.56", text: "Kaivalya é estabelecido quando os três gunas esgotaram seu propósito para o que vê.", kleshaTargets: ["avidya"], qualities: ["vishada"], themes: ["liberação"] },
];

const sutras4 = [];
for (let i = 1; i <= 34; i++) {
  const texts = [
    "Os poderes nascem do nascimento, de ervas, de mantra, de austeridade ou de absorção.",
    "A transformação em outra espécie é pelo preenchimento da natureza.",
    "O obstáculo não é causa; ele apenas remove o obstáculo, como o agricultor.",
    "Só a mente criada é o nascimento dos mundos criados.",
    "Mentes diversas têm um único objeto de concentração.",
    "A que tem meditação como semente é a que não nasce de outra.",
    "A ação do yogi não é branca nem negra; a dos outros é de três tipos.",
    "Delas surgem apenas as impressões para o fruto a ser experimentado.",
    "Memória e impressão têm a mesma forma; mesmo com separação de nascimento, lugar e tempo há continuidade.",
    "Não têm começo; o desejo de permanência é inato.",
    "Sendo sustentadas por causa, efeito, suporte e objeto, elas desaparecem quando elas desaparecem.",
    "O passado e o futuro existem em sua própria natureza; a diferença está nos caminhos da característica.",
    "Elas são manifestas ou sutis; têm a natureza dos gunas.",
    "A realidade do objeto está na unicidade da transformação.",
    "O objeto sendo o mesmo, a diferença das mentes é a diferença dos dois.",
    "E o objeto não depende de uma única mente; o que aconteceria quando não fosse percebido?",
    "O objeto é conhecido ou não pela mente que ele tinge.",
    "Sempre conhecida a mente que governa; ela não é tingida, pois é estável.",
    "Ela não se vê a si mesma.",
    "Não há dupla apresentação ao mesmo tempo.",
    "Se a outra fosse vista por outra mente, haveria regressão ao infinito e confusão de memória.",
    "Quando a natureza da consciência assume a forma, surge a consciência de si.",
    "A mente, tingida pelo que vê e pelo que vê, percebe todos os objetos.",
    "Ela existe para outro, pois é composta de inúmeras impressões.",
    "Para quem vê a distinção, cessa a reflexão sobre a própria natureza.",
    "Então a mente inclina para o discernimento e caminha para kaivalya.",
    "No meio surgem as impressões da distinção por causa das falhas.",
    "A remoção delas é como a dos kleshas.",
    "Quem, mesmo no fruto do discernimento, permanece em desapego total, surge o samādhi da nuvem de dharma.",
    " Daí cessa o sofrimento e a ação.",
    "Então o conhecimento livre de impurezas e de cobertura é infinito; o conhecível é pouco.",
    " Com isso os gunas esgotaram sua sequência de fins; a transformação cessa.",
    "A sequência é o momento; percebido no último instante.",
    "Kaivalya é a reversão dos gunas, sem propósito para o que vê; o estabelecimento do poder do que vê em sua própria natureza.",
  ];
  const t = texts[i - 1] || "Liberação e estabelecimento na própria natureza.";
  sutras4.push({
    id: `YS.4.${i}`,
    text: t,
    kleshaTargets: i <= 10 ? ["avidya"] : i <= 20 ? ["asmita"] : ["abhinivesha"],
    qualities: ["vishada"],
    themes: ["liberação", "mente", "yoga"],
  });
}

const full = [...withThemes, ...extra, ...sutras3, ...sutras4];
fs.writeFileSync(
  path.join(basePath, "yoga_sutras_full.json"),
  JSON.stringify(full, null, 2),
  "utf8"
);
console.log("yoga_sutras_full.json gerado com", full.length, "entradas.");
