# Engine 2.0 — Mapa simbólico + Composer modular + Readings temáticos

Este documento descreve o **motor profissional** do Darshan: **SymbolicMap → Insights → Composer → Readings modulares**. O Oracle offline continua existindo como “ritual rápido”; a **leitura profissional** é baseada neste mapa.

---

## Visão geral

```
Perfil (nome, data, hora, local)
        ↓
buildSymbolicMap(profile)  →  SymbolicMap canônico
        ↓
collectInsights(map)       →  Insight[] (key, topic, weight, evidence)
        ↓
composeReading(map, topic) →  texto por tópico (general | love | career | year | action)
        ↓
getOfflineReading(profile) →  { general, love, career, year, action }
```

- **SymbolicMap** é o objeto estruturado reutilizável (jyotish, numerology, themes, traits, evidence).
- **Insights** são interpretações determinísticas derivadas do mapa (não blocos fixos).
- **Composer** monta o texto por tópico a partir dos insights (composeReading(map, "love"), etc.).
- **Readings temáticos** existem: love, career, year, action — cada um chama composeReading(map, topic).
- **Action** é derivada de insights (número regente, arquétipo, geral), não fixa.

---

## 1. SymbolicMap canônico (`lib/symbolic/`)

- **SymbolicMap.ts** — ponto de entrada: exporta o tipo `SymbolicMap` e `buildSymbolicMap(profile)`.
- **types.ts** — estrutura:
  - `jyotish`: { moonRashi, nakshatra, archetypeKey }
  - `numerology`: { rulingNumber }
  - `themes`: string[]
  - `traits`: string[]
  - `evidence`: Record<string, unknown> (ex.: { chart } para auditoria e extensão)
- **builder.ts** — `buildSymbolicMap(profile)` usa `computeVedicChartSimplified` e `getRulingNumberFromName`; retorna o mapa com themes/traits vazios e evidence.chart.

Existe **mapa estruturado reutilizável**, não só cálculo solto.

---

## 2. Insight Layer (`lib/insights/`)

- **types.ts** — `Insight` = { key, topic, weight, evidence } (e system para compatibilidade).
- **jyotishInsightsForSymbolic.ts** — regras Jyotish (20+): por nakshatra e moonRashi; topics general, love, career, year.
- **collectInsightsForSymbolicMap.ts** — agrega insights Jyotish + **Action derivada do mapa**:
  - `action.n.{rulingNumber}` (numerologia)
  - `action.general`
  - `action.archetype.{archetypeKey}` (jyotish)

As interpretações são **derivadas** do mapa (key, topic, weight, evidence), não blocos fixos.

---

## 3. Narrative Composer (`lib/narrative/composer.ts`)

- **composeReading(map, topic)** — assinatura principal:
  - coleta insights do mapa;
  - filtra por `topic` (general | love | career | year | action);
  - ordena por peso;
  - pega top 3;
  - resolve frase por key (PHRASES[i.key][0]);
  - junta com `\n\n`.

Existe **composeReading(map, "love")**, **composeReading(map, "career")**, **composeReading(map, "year")**, **composeReading(map, "action")** — modularidade por tópico.

---

## 4. Readings modulares (`lib/readings/symbolicReadings.ts`)

Cada getter recebe o **mapa** e devolve texto para um tópico:

- **getGeneral(map)** → composeReading(map, "general")
- **getLove(map)** → composeReading(map, "love")
- **getCareer(map)** → composeReading(map, "career")
- **getYear(map)** → composeReading(map, "year")
- **getAction(map)** → composeReading(map, "action")

O produto pode oferecer “fale só sobre relacionamento”, “fale só sobre trabalho”, “fale sobre o ano atual” usando o mesmo mapa.

---

## 5. getOfflineReading(profile) — wrapper

- **lib/readingOffline.ts**:
  1. `map = buildSymbolicMap(profile)`
  2. `return { general: getGeneral(map), love: getLove(map), career: getCareer(map), year: getYear(map), action: getAction(map) }`

Retorno estruturado: **general, love, career, year, action**. A API `/api/map/personal?offline=true` usa esse objeto e pode enviar `sections` ao frontend.

---

## 6. Action derivada do mapa

A prática concreta (Action) **não é fixa**; vem dos insights:

- Número regente → `action.n.{n}` (ex.: número 5 → foco e limites).
- Arquétipo → `action.archetype.{archetypeKey}` (ex.: cuidador → boundary).
- Fallback → `action.general`.

Frases no dicionário (`phrasesForSymbolic.ts`, action.1 … action.30, action.general, action.archetype.*) são escolhidas por key com base no mapa.

---

## Resumo do estado

| Camada                 | Status |
|------------------------|--------|
| SymbolicMap universal  | ✅ lib/symbolic (jyotish, numerology, themes, traits, evidence) |
| Insight Rules          | ✅ key, topic, weight, evidence (Jyotish + Action por mapa) |
| Composer modular       | ✅ composeReading(map, topic) |
| Readings Love/Career/Year | ✅ getLove(map), getCareer(map), getYear(map) |
| Action baseado no mapa | ✅ action.n.X, action.archetype.X, action.general |
| getOfflineReading      | ✅ retorna { general, love, career, year, action } |

O Darshan tem **leituras temáticas reutilizáveis** baseadas no mesmo mapa simbólico (Engine 2.0). O Oracle continua como ritual rápido; a leitura profissional é map-based.
