# Symbolic Map Engine — Motor simbólico offline

O Darshan possui **motor simbólico real**: mapa calculado (Jyotish + Numerologia + Human Design), readings modulares por tema e Narrative Composer offline. Tudo **sem IA**, determinístico e expansível.

---

## Visão geral

| Camada | O que é | Onde está |
|--------|---------|-----------|
| **A — Engines** | Cálculo estruturado (só dados) | `lib/engines/`, `lib/symbolic/`, `lib/core/` |
| **B — Readings** | Interpretação por tema | `lib/readings/`, `lib/insights/` |
| **C — Composer** | Frase humana a partir do mapa | `lib/narrative/`, `lib/dictionaries/` |

- **SymbolicMap único** é a base; engines preenchem; readings consomem por tema.
- O usuário acessa por pergunta: "relacionamento" → módulo love, "trabalho" → career, "ano" → year, "visão geral" → general.

---

## 1. SymbolicMap (objeto canônico)

Dois fluxos coexistem (sem redundância de lógica):

1. **`lib/symbolic/`** — Mapa canônico para **leitura offline** (getOfflineReading, /api/map, /api/reading):
   - `types.ts` — `SymbolicMap`: jyotish (moonRashi, nakshatra, archetypeKey), numerology (rulingNumber), archetypes, themes, evidence.
   - `builder.ts` — `buildSymbolicMap(profile)` síncrono: usa `computeVedicChartSimplified` (vedic + resolver) e `getRulingNumberFromName`.

2. **`lib/engines/`** — Mapa com **core astronômico** (Swiss Ephemeris / mhah-panchang) para Oracle e APIs que precisam de planetas/casas:
   - `buildSymbolicMap.ts` — `buildSymbolicMap(profile)` **async**: chama `computeAstronomicalCore`, depois `jyotishEngine`, `numerologyEngine`, `humanDesignEngine`.
   - Retorna: `{ core, jyotish, numerology, humanDesign }`.

**Uso recomendado:**
- **Leitura temática e APIs offline** → `lib/symbolic` (builder síncrono).
- **Oracle e integrações que usam planetas/casas** → `lib/engines` (builder async).

---

## 2. Engines determinísticos

### Jyotish (`lib/engines/jyotishEngine.ts`)

- **jyotishEngine(core)** — Retorna: moonRashi, nakshatra, planets, houses, precisionLevel.
- **getNakshatraProfile(core)** — Perfil interpretativo: nakshatra, moonRashi, namePt, consciousnessThemes, psychologicalEffects, archetypeHints (para Composer/Readings).
- **detectYogas(core)** — Lista de yogas detectados (ex.: nakshatra-X, moon-in-Y, chandra-surya-same-sign). Expandir depois com Neecha Bhanga, etc.

### Numerologia (`lib/engines/numerologyEngine.ts`)

- Calcula número regente a partir do nome e data; usado pelo SymbolicMap e pelos insights de ação.

### Human Design (`lib/engines/humanDesignEngine.ts`)

- Stub plugável: type, authority, profile. Cálculo real (gates/channels) virá depois.

### Core astronômico (`lib/core/`)

- **ephemerisResolver** — Escolhe provider (Swiss Ephemeris ou mhah-panchang).
- **swissProvider** — Planetas, casas, ascendente; deriva moonRashi/nakshatra da longitude lunar (Lahiri).

---

## 3. Interpretação modular (Readings)

Cada reading consome o **mesmo mapa** e um **tema**:

| Tema (API) | Tópico interno | Função |
|------------|----------------|--------|
| general | general | `getGeneral(map)` |
| love / relationship | love | `getLove(map)` |
| career / work | career | `getCareer(map)` |
| year / yearly | year | `getYear(map)` |
| action | action | `getAction(map)` |

- **`lib/readings/symbolicReadings.ts`** — `getReadingByTheme(map, theme)` mapeia theme → topic e chama `composeReading(map, topic)`.
- **`lib/insights/`** — Regras determinísticas por sistema (Jyotish, numerologia, action); cada insight tem key, topic, weight, evidence.
- **`lib/narrative/composer.ts`** — `composeReading(map, topic)`: coleta insights do mapa, filtra por topic, ordena por peso, top 3, `phraseFor(key)` → texto.

Nada de frase solta: tudo derivado do mapa e dos dicionários.

---

## 4. Narrative Composer e dicionários

- **composeReading(map, topic)** — Entrada principal: SymbolicMap + tópico → texto da leitura.
- **phraseFor(key)** — Resolve frase por chave (action.n.X → action.X; action.archetype.X com fallback).
- **lib/narrative/dictionaryLoader.ts** — `getMergedDictionaries()`: agrega Jyotish, HD, Action, Numerologia, PHRASES_FOR_SYMBOLIC.
- **lib/narrative/phraseTemplates.ts** — `getPhraseForInsight(key)`, `getPhraseForContext(ctx)` para chamadas que já têm placements/theme.

Dicionários em código: `lib/dictionaries/` (jyotish, humanDesign, action, numerology, phrasesForSymbolic). Expansão futura: JSON em /dictionaries se desejado.

---

## 5. APIs offline

| Endpoint | Uso | Retorno |
|---------|-----|---------|
| **POST /api/map** | Mapa completo (sem IA, sem créditos) | `{ map: SymbolicMap }` |
| **POST /api/reading?theme=** | Leitura temática (general \| love \| relationship \| career \| work \| year \| yearly \| action) | `{ map, reading, theme }` |
| **POST /api/map/personal** | Mapa pessoal + leitura (IA ou offline conforme parâmetro) | Ver doc do endpoint |

Body em ambos: `{ profile: { fullName?, birthDate?, birthTime?, birthPlace? } }`.

---

## 6. Onde está cada peça

| Peça | Arquivo / pasta |
|------|------------------|
| SymbolicMap (canônico) | `lib/symbolic/types.ts`, `builder.ts` |
| SymbolicMap (com core) | `lib/engines/buildSymbolicMap.ts` |
| Jyotish calculate / getNakshatraProfile / detectYogas | `lib/engines/jyotishEngine.ts` |
| Numerologia | `lib/engines/numerologyEngine.ts` |
| Human Design (stub) | `lib/engines/humanDesignEngine.ts` |
| General / Love / Career / Year / Action readings | `lib/readings/symbolicReadings.ts` |
| Leitura por tema (API) | `getReadingByTheme(map, theme)` em symbolicReadings |
| Composer | `lib/narrative/composer.ts` |
| Dictionary loader | `lib/narrative/dictionaryLoader.ts` |
| Phrase templates | `lib/narrative/phraseTemplates.ts` |
| Dicionários | `lib/dictionaries/*.ts` |
| getOfflineReading (wrapper) | `lib/readingOffline.ts` |
| POST /api/map | `app/api/map/route.ts` |
| POST /api/reading?theme= | `app/api/reading/route.ts` |

---

## 7. Fluxo resumido

1. **Mapa:** `buildSymbolicMap(profile)` (symbolic ou engines) → SymbolicMap.
2. **Insights:** `collectInsightsForSymbolicMap(map)` → lista de Insight (key, topic, weight, evidence).
3. **Leitura por tema:** `composeReading(map, topic)` → filtra insights por topic, top 3, phraseFor(key) → texto.
4. **API:** POST /api/map retorna o mapa; POST /api/reading?theme=X retorna mapa + reading para o tema.

Sem aleatoriedade solta; sem duplicar conteúdo entre temas; expansão por novos engines e dicionários.
