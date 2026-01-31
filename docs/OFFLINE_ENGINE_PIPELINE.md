# Pipeline offline — engine high-end (sem IA)

Este documento descreve a arquitetura do **engine offline** do Darshan: núcleo astronômico multi-provider, engines (Jyotish, numerologia, Human Design), mapa simbólico, insights determinísticos, dicionários e leituras modulares. Tudo roda **sem IA**, com lógica e dados determinísticos.

---

## Visão geral do pipeline

```
User Profile (nome, data, hora, local)
        ↓
AstronomicalCore (multi-provider: Swiss Ephemeris → mhah-panchang)
        ↓
Engines (Jyotish + Numerologia + Human Design)
        ↓
SymbolicMap universal
        ↓
Insight Rules determinísticas
        ↓
Narrative Composer offline
        ↓
Readings modulares (general / love / career / year) + Action
        ↓
API endpoints temáticos
```

---

## 1. Core astronômico (`lib/core/`)

- **types.ts** — `AstronomicalCore` (providerUsed, julianDay?, planets?, moonRashi?, nakshatra?, ascendant?, houses?), `CoreProfile`.
- **ephemerisProvider.ts** — interface `EphemerisProvider` (name, compute(profile)).
- **providers/mhahProvider.ts** — mhah-panchang (Lua: Rashi + Nakshatra). **Não removido;** fallback oficial.
- **providers/swissProvider.ts** — stub Swiss Ephemeris (lança para fallback; futuro: @fusionstrings/panchangam ou sweph-wasm).
- **ephemerisResolver.ts** — `computeAstronomicalCore(profile)`: tenta Swiss, depois mhah; nada quebra.

---

## 2. Engines (`lib/engines/`)

- **jyotishEngine.ts** — só símbolos: moonRashi, nakshatra, planets, houses, precisionLevel.
- **numerologyEngine.ts** — número regente e traits (refator do conhecimento em `lib/knowledge/numerology`).
- **humanDesignEngine.ts** — stub (retorna null se não houver planetas; tipo/autoridade/perfil fixos quando houver).
- **buildSymbolicMap.ts** — `buildSymbolicMap(profile)` → { core, jyotish, numerology, humanDesign }.

---

## 3. Insights (`lib/insights/`)

- **types.ts** — `Insight` (key, weight, system, topic, evidence?), `InsightTopic`, `InsightSystem`.
- **jyotishInsights.ts** — regras por nakshatra e rashi (general, love, career, year).
- **numerologyInsights.ts** — regras por número regente (general, career, love, year).
- **humanDesignInsights.ts** — regras HD (stub).
- **collectInsights.ts** — `collectAllInsights(map)` agrega todos os insights.

Nada aleatório; cada insight tem key justificável pelo mapa.

---

## 4. Dicionários (`lib/dictionaries/`)

- **jyotish.ts** — `JYOTISH_PHRASES` (chaves por rashi/nakshatra e tópico).
- **numerology.ts** — `NUMEROLOGY_PHRASES` (chaves por número regente e tópico).
- **humanDesign.ts** — `HD_PHRASES` (tipo, autoridade).
- **action.ts** — `ACTION_PHRASES` (práticas concretas).
- **index.ts** — `phraseFor(key)` resolve frase por chave (primeira do array; futuro: seed para variedade).

---

## 5. Narrative Composer (`lib/narrative/`)

- **composer.ts** — `composeReading(insights, topic)`: filtra por tópico, ordena por peso, pega até 5 insights, resolve frase por key, junta com `\n\n`. Evita redundância; sempre justifica via key → dictionary.

---

## 6. Leituras modulares (`lib/readings/`)

- **generalReading.ts** — `getGeneralReading(profile)` → { reading, action }.
- **loveReading.ts** — `getLoveReading(profile)` → { reading, action }.
- **careerReading.ts** — `getCareerReading(profile)` → { reading, action }.
- **yearReading.ts** — `getYearReading(profile)` → { reading, action }.
- **actionReading.ts** — `getActionReading(profile)` → string (prática final).

Toda leitura termina com **Action** (prática concreta).

---

## 7. Integração com o Darshan atual

- **oracleOffline.ts** — usa chart védico + primeiro arquétipo + seed para revelação do orb (1–3 blocos, ritual rápido).
- **readingOffline.ts** — usa **Engine 2.0**: `buildSymbolicMap(profile)` (lib/symbolic) → `getGeneral(map)`, `getLove(map)`, `getCareer(map)`, `getYear(map)`, `getAction(map)` (composer modular). Retorna `{ general, love, career, year, action }`. Ver [ENGINE_2.0.md](./ENGINE_2.0.md).

Nada do engine anterior foi removido; mhah-panchang continua como fallback.

---

## 8. APIs temáticas

| Método | Rota | Corpo | Resposta |
|--------|------|--------|----------|
| POST | `/api/reading/general` | `{ profile?: CoreProfile }` | `{ map, reading, action }` |
| POST | `/api/reading/love` | `{ profile?: CoreProfile }` | `{ map, reading, action }` |
| POST | `/api/reading/career` | `{ profile?: CoreProfile }` | `{ map, reading, action }` |
| POST | `/api/reading/year` | `{ profile?: CoreProfile }` | `{ map, reading, action }` |

Cada resposta inclui o **mapa simbólico** (core, jyotish, numerology, humanDesign), o **texto da leitura** e a **ação** (prática final).

---

## Princípios

- Nada depende de IA.
- Nada substitui mhah-panchang; Swiss Ephemeris entra como camada premium opcional.
- Insights são determinísticos e justificáveis.
- Leituras são modulares e expansíveis.
- Action sempre presente (menos etéreo).

---

## Próximos passos (Parte 2)

- **Swiss Ephemeris:** ver [SWISS_EPHEMERIS_INTEGRATION.md](./SWISS_EPHEMERIS_INTEGRATION.md) para integrar @fusionstrings/panchangam ou @fusionstrings/swiss-eph em `swissProvider.ts`.
- **Human Design real:** gates, canais, tipo, autoridade, perfil (BodyGraph completo).
- **Year Engine:** trânsitos e dashas para enriquecer a leitura de ano.
- **Ayurveda Engine:** dosha e práticas corporais no Action Engine.

Detalhes e ordem sugerida: [ROADMAP_PARTE_2.md](./ROADMAP_PARTE_2.md).
