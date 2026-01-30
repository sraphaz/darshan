# Popular o dicionário Jyotish (uma vez com IA)

O arquivo `lib/knowledge/jyotishMeanings.ts` contém o **dicionário de significados** por Rashi (signo lunar) e Nakshatra (estação lunar). Os 12 Rashis já estão preenchidos com temas de consciência, efeitos psicológicos e frases para o oráculo. As 27 Nakshatras têm estrutura mas muitas entradas com arrays vazios.

Você pode **popular uma única vez com IA** (ChatGPT, Claude, ou a API do próprio Darshan) e colar o resultado no código. Use o prompt abaixo.

---

## Objetivo

Gerar conteúdo **em português**, **sem termos em sânscrito** para o usuário final. Foco em:
- **consciousnessThemes**: como essa posição lunar afeta a consciência (ex.: clareza, ação, repouso, conexão, transformação).
- **psychologicalEffects**: efeitos na experiência emocional e psicológica (tendências, medos, dons, desafios).
- **suggestedPhrases**: frases curtas (1–2 linhas) que o oráculo pode usar na resposta, em tom poético e acolhedor, sem citar o nome do signo/nakshatra de forma técnica.

---

## Prompt para a IA

Copie e adapte (pode rodar por partes: primeiro as Nakshatras faltantes, depois revisar).

```
Preciso preencher um dicionário de significados da astrologia védica (Jyotish) para uso em um oráculo offline. Tudo deve ser em PORTUGUÊS e sem usar termos em sânscrito na resposta ao usuário (use equivalentes abrangentes: "o Absoluto", "o Ser", "consequência dos atos", etc.).

Para cada uma das 27 Nakshatras (estações lunares) listadas abaixo, gere um objeto com:
1. namePt: nome em português (tradução ou equivalente abrangente).
2. consciousnessThemes: array de 3 a 5 strings descrevendo como essa estação lunar afeta a consciência humana (ex.: "início rápido", "cura", "movimento", "entrega", "clareza").
3. psychologicalEffects: array de 3 a 5 strings descrevendo efeitos na experiência psicológica e emocional (tendências, dons, desafios, medos).
4. suggestedPhrases: array de 3 a 5 frases curtas (1–2 linhas) que um oráculo pode usar na resposta ao usuário. Tom: poético, acolhedor, sem citar o nome técnico da nakshatra; falar de "o seu mapa", "o tom da sua estação lunar", "a energia do momento", etc.

Lista das 27 Nakshatras (chaves em inglês para manter no código):
ashwini, bharani, krittika, rohini, mrigashira, ardra, punarvasu, pushya, ashlesha, magha, purva-phalguni, uttara-phalguni, hasta, chitra, swati, vishakha, anuradha, jyestha, mula, purva-ashadha, uttara-ashadha, shravana, dhanishta, shatabhisha, purva-bhadra, uttara-bhadra, revati.

Formato de saída: para cada nakshatra, um bloco como:
{ key: "krittika", namePt: "...", consciousnessThemes: ["...", "..."], psychologicalEffects: ["...", "..."], suggestedPhrases: ["...", "..."] }
```

---

## Onde colar o resultado

- Abra `lib/knowledge/jyotishMeanings.ts`.
- Substitua as entradas de `NAKSHATRA_MEANINGS` que estão com arrays vazios pelos objetos gerados pela IA.
- Mantenha as chaves `key` exatamente iguais (ashwini, bharani, krittika, …).
- Revise rapidamente: sem sânscrito na frase ao usuário; português claro; frases genéricas o suficiente para não parecerem diagnósticos.

Depois disso, o oráculo passará a usar também as frases de Nakshatra ao montar a resposta (via `getJyotishPhraseForChart`).
