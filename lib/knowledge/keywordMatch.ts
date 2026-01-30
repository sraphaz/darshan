/**
 * Extração de palavras da mensagem do usuário e pontuação de frases por relevância.
 * Usado pelo oráculo offline para preferir frases que relacionam com o que o usuário digitou.
 */

/** Palavras comuns em português que não ajudam a relacionar com frases do oráculo */
const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "um", "uma", "uns", "umas",
  "que", "em", "no", "na", "nos", "nas", "por", "para", "com", "sem", "ao", "aos", "às",
  "pelo", "pela", "pelos", "pelas", "seu", "sua", "seus", "suas", "me", "meu", "minha",
  "te", "tu", "ele", "ela", "isso", "este", "esta", "esse", "essa", "nós", "vós", "eles", "elas",
  "ou", "mas", "se", "porque", "como", "quando", "onde", "qual", "quais", "quem", "quanto",
  "ser", "estar", "ter", "fazer", "há", "foi", "são", "era", "sou", "somos", "é", "será",
  "pode", "posso", "podem", "já", "mais", "menos", "muito", "bem", "mal", "só", "apenas",
  "também", "ainda", "assim", "então", "aqui", "ali", "agora", "sempre", "nunca", "nada", "tudo",
]);

const MIN_WORD_LENGTH = 2;

/**
 * Normaliza uma palavra para comparação (minúscula, sem acentos opcional).
 */
function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/**
 * Extrai palavras significativas da mensagem do usuário para preferência na seleção de frases.
 * Remove stopwords e palavras muito curtas.
 */
export function extractKeywords(message: string | undefined | null): string[] {
  if (!message || typeof message !== "string") return [];
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const words = normalized.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    if (w.length < MIN_WORD_LENGTH) continue;
    if (STOPWORDS.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
  }
  return out;
}

/**
 * Pontua um texto pela quantidade de palavras-chave que aparecem nele.
 * Retorna o número de keywords que aparecem no texto (normalizado, sem acentos).
 */
export function scoreByKeywords(text: string, keywords: string[]): number {
  if (!text || keywords.length === 0) return 0;
  const lower = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  let score = 0;
  for (const k of keywords) {
    if (k.length < MIN_WORD_LENGTH) continue;
    if (lower.includes(k)) score += 1;
  }
  return score;
}

/**
 * Dado um array de itens com texto, retorna o índice do item preferido:
 * prefere os que têm maior score por keywords; em empate ou sem keywords, usa seed para escolher.
 */
export function pickIndexByKeywords<T>(
  items: T[],
  getText: (item: T) => string,
  keywords: string[],
  seed?: number
): number {
  if (items.length === 0) return 0;
  if (keywords.length === 0) {
    const i = seed !== undefined ? Math.abs(Math.floor(seed)) % items.length : Math.floor(Math.random() * items.length);
    return i;
  }
  const scores = items.map((item) => scoreByKeywords(getText(item), keywords));
  const maxScore = Math.max(...scores);
  const bestIndices = scores
    .map((s, i) => (s === maxScore ? i : -1))
    .filter((i) => i >= 0);
  if (bestIndices.length === 0) return 0;
  const i =
    seed !== undefined
      ? bestIndices[Math.abs(Math.floor(seed)) % bestIndices.length]
      : bestIndices[Math.floor(Math.random() * bestIndices.length)];
  return i;
}
