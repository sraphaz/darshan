# Estado real — PR #3 Engine 2.1 (atual)

Este documento corrige avaliações desatualizadas. **Todos os blocos críticos listados abaixo já estão implementados** neste repositório.

---

## ✅ CRÍTICO 1 — Input Parser multi-eixos — **IMPLEMENTADO**

| Item | Arquivo | Status |
|------|---------|--------|
| Normalização | `lib/dictionaries/inputNormalization.json` | ✅ |
| Verbos | `lib/dictionaries/inputVerbs.json` | ✅ |
| Temas | `lib/dictionaries/inputThemes.json` | ✅ |
| Perguntas | `lib/dictionaries/inputQuestions.json` | ✅ |
| Emoções → stateKey | `lib/dictionaries/inputEmotions.json` | ✅ |
| normalizeInput | `lib/input/normalizeInput.ts` | ✅ |
| intentParser | `lib/input/intentParser.ts` | ✅ |
| stateScorer | `lib/input/stateScorer.ts` | ✅ |

**Pipeline em uso:** `userText` → normalize → parseIntent → pickBestState → preferredStateKey em `app/api/instant-light/route.ts` → composeInstantLight (sacredRemedy). O usuário influencia o offline via texto natural; a ponte “o que digitou → stateKey” existe.

---

## ✅ CRÍTICO 2 — Truth Package padrão — **IMPLEMENTADO**

| Item | Arquivo | Status |
|------|---------|--------|
| Entrada canônica | `lib/core/UserRequestContext.ts` (Theme, Mode, UserRequestContext) | ✅ |
| Saída canônica | `lib/core/DarshanTruthPackage.ts` (DarshanTruthPackage, SacredCorpusKey) | ✅ |

Instant Light retorna sempre **DarshanTruthPackage** (mode, theme, stateKey, diagnosis, sacred, practice, food, contemplativeQuestion, meta.generatedAt, etc.). Readings e IA usam o mesmo payload.

---

## ✅ CRÍTICO 3 — Unificação do pipeline — **IMPLEMENTADO**

**Motor oficial:** `lib/sacredRemedy/*` (diagnosisEngine, sacredSelector, ayurvedaActionSelector, instantLightComposer).

Não há dois pipelines. Wrappers antigos (`lib/instantLight`, `lib/sacred`, `lib/diagnosis`) foram **removidos**: nenhum código importava deles. Todas as rotas (`/api/instant-light`, `/api/darshan`) e testes usam **apenas** `@/lib/sacredRemedy`. Zero duplicação.

---

## ✅ CRÍTICO 4 — IA como expansão opcional — **IMPLEMENTADO**

| Item | Arquivo | Status |
|------|---------|--------|
| Narrative Gateway | `lib/ai/narrativeGateway.ts` (expandNarrative) | ✅ |
| Endpoint | `app/api/ai/expand/route.ts` (POST) | ✅ |

IA recebe **truthPackage + question + theme**; não recalcula diagnóstico, apenas expande narrativa (guardrails no prompt).

---

## ✅ CRÍTICO 5 — Numerologia profunda — **IMPLEMENTADO**

| Item | Onde | Status |
|------|------|--------|
| lifePathNumber (data) | `lib/engines/numerologyEngine.ts`, `lib/knowledge/numerology.ts`, `lib/symbolic/builder.ts` | ✅ |
| expressionNumber (nome completo) | Idem | ✅ |
| soulUrgeNumber (vogais) | Idem | ✅ |
| personalityNumber (consoantes) | Idem | ✅ |
| SymbolicMap.numerology | `lib/symbolic/builder.ts`, `lib/symbolic/types.ts` | ✅ |
| diagnosisEngine | Usa `map.numerology` (lifePath, soulUrge, expression, personality) em diagnóstico personal | ✅ |

---

## ⚠️ Pendências (não críticas para “premium fechado”)

- **Corpus premium completo:** Yoga Sutras 196 (hoje há `yoga_sutras_full.json` com muitas entradas; expansão editorial para 196 + Puranas/Upanishads em escala é backlog).
- Wrappers removidos: `lib/instantLight`, `lib/sacred`, `lib/diagnosis` foram deletados; só existe `lib/sacredRemedy`.

---

## Resumo

- **Input Parser:** existe; texto do usuário → stateKey → Instant Light.
- **Truth Package:** existe; UserRequestContext + DarshanTruthPackage; Instant Light e IA usam o mesmo formato.
- **Engine único:** sacredRemedy é o único truth engine; wrappers antigos foram removidos (não existem mais `lib/instantLight`, `lib/sacred`, `lib/diagnosis`).
- **IA Expansion:** narrativeGateway + POST /api/ai/expand implementados.
- **Numerologia:** lifePath, expression, soulUrge, personality no SymbolicMap e no diagnosis.

O produto está **premium fechado** nos 5 críticos; o que resta é expansão de conteúdo (corpus).

**Build:** prebuild corrigido (ENOENT quando `build` não existe); tipos TS em `instant-light/route` e `instantLightComposer` ajustados; `npm run build` passa.
