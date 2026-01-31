# Dicionário offline — base de conhecimento

O Darshan pode responder **sem IA**, usando apenas uma base de conhecimento local. Isso permite:

- Interpretar minimamente o mapa e o perfil do usuário
- Dar respostas a partir de formulações internas, textos clássicos (Upanishads, Bhagavad Gita, Yoga Sutras), arquétipos e traits
- Numerologia: número regente a partir do nome (Pitágoras) e tendências por número
- Calcular signos védicos (Rashi) e nakshatras: com **mhah-panchang** quando instalado (`npm install mhah-panchang`), senão aproximações locais

## Estrutura

```
lib/
  knowledge/
    types.ts         — Tipos (perfil, chart, arquétipos, formulações)
    formulations.ts  — Formulações internas (muitas frases para evitar replicação)
    upanishads.ts    — Afirmações das Upanishads (legado)
    classicTexts.ts  — Textos clássicos organizados: Upanishads, Bhagavad Gita, Yoga Sutras
    archetypes.ts    — Arquétipos e fórmulas (Rashi, nakshatra → arquétipo)
    archetypeTraits.ts — Dicionário de traits dos arquétipos (personalidade, tendências, frases)
    numerology.ts    — Número regente do nome + dicionário por número (1–9, 11, 22)
    vedic.ts         — Jyotish: mhah-panchang (opcional) ou cálculos simplificados
    index.ts         — Reexportações
  oracleOffline.ts   — Oráculo: perfil + seed → formulação + arquétipo + clássico + numerologia
```

## Como funciona

1. **Perfil** (nome, data, local, horário) é enviado na requisição (modo mock ou quando a IA está desligada).
2. **Chart védico simplificado**: `vedic.ts` calcula a partir de data (e opcionalmente hora):
   - Signo solar sidereal (Rashi) — aproximado com ayanamsa fixo
   - Signo lunar e nakshatra — aproximados quando há data + hora
3. **Arquétipos**: `archetypes.ts` mapeia Rashi e nakshatra para arquétipos (Pioneiro, Raiz, Cuidador, etc.).
4. **Oráculo**: `oracleOffline.ts` escolhe formulações e trechos das Upanishads conforme o arquétipo e monta uma mensagem em 1–7 blocos (formato igual ao da IA).

## Onde expandir

- **Formulações**: editar `lib/knowledge/formulations.ts` — adicionar entradas em `FORMULATIONS`.
- **Upanishads**: editar `lib/knowledge/upanishads.ts` — adicionar em `UPANISHAD_AFFIRMATIONS`.
- **Arquétipos**: editar `lib/knowledge/archetypes.ts` — ajustar `ARCHETYPES`, `RASHI_NAMES`, `NAKSHATRA_KEYS` e as funções de mapeamento.
- **Cálculos védicos**: em `lib/knowledge/vedic.ts` as posições são aproximadas. Para precisão (efemérides reais), integrar uma biblioteca como Swiss Ephemeris ou equivalente em JS.

## Uso na API

Quando a requisição vem com `mock: true`, a rota `/api/darshan` usa o **Instant Light Engine** (`composeInstantLight(perfil, { recentSacredIds })`) em vez da IA: texto sagrado + (se houver perfil) insight e prática do mapa + pergunta. A resposta tem o mesmo formato (`message`, `phase`) e opcionalmente `sacredId` para o cliente enviar em `recentSacredIds` e reduzir repetição. Ver [INSTANT_LIGHT_ENGINE.md](./INSTANT_LIGHT_ENGINE.md).

## Limitações atuais

- **Efemérides**: Sol e Lua são aproximados por fórmulas simples; não substituem efeméride profissional.
- **Ayanamsa**: valor fixo (~24°); para precisão, usar Lahiri ou outro ayanamsa por data.
- **Casas e planetas**: apenas Sol e Lua simplificados; não há casas, ascendente nem outros planetas no cálculo offline.

Expandir o dicionário (mais formulações, Upanishads e refinamento dos arquétipos) melhora a qualidade das respostas offline sem depender da IA.
