# Engine 2.1 — Gaps reais fechados (este PR)

Este documento registra o que foi **realmente** fechado em resposta aos gaps e próximos passos obrigatórios.

---

## P0 — Unificar Instant Light Engine ✅

**Situação anterior:** Existiam `lib/instantLight/*`, `lib/sacred/*`, `lib/diagnosis/*` em paralelo a `lib/sacredRemedy/*`.

**O que foi feito:**

- **Removidos** (duplicação eliminada):
  - `lib/instantLight/` (instantLightComposer.ts, index.ts)
  - `lib/sacred/` (index.ts, sacredPicker.ts, types.ts)
  - `lib/diagnosis/` (diagnosisEngine.ts, index.ts, types.ts)
- **Motor oficial único:** `lib/sacredRemedy/` — usado por:
  - GET `/api/instant-light`
  - POST `/api/darshan` (modo mock)

**Resultado:** Existe apenas um pipeline: `composeInstantLight()` de `lib/sacredRemedy`. Nenhum código importa mais de `lib/instantLight`, `lib/sacred` ou `lib/diagnosis`.

---

## P1 — Numerologia completa ✅

**Situação anterior:** `lib/engines/numerologyEngine.ts` expunha só ruling number; o review pedia life path, soul urge, personality, expression.

**O que já existia (e foi mantido):**

- **`lib/knowledge/numerology.ts`** já tinha:
  - `getLifePathNumber(birthDate)`
  - `getExpressionNumber(fullName)`
  - `getSoulUrgeNumber(fullName)` (vogais)
  - `getPersonalityNumber(fullName)` (consoantes)
- **`lib/symbolic/builder.ts`** (SymbolicMap usado pelo Sacred Remedy) já preenchia `lifePathNumber`, `expressionNumber`, `soulUrgeNumber`, `personalityNumber`.
- **`lib/sacredRemedy/diagnosisEngine.ts`** já usava numerologia no seed e em `numerologyFromMap`.

**O que foi feito neste PR:**

- **`lib/engines/numerologyEngine.ts`** foi expandido para retornar também:
  - `lifePathNumber` (data de nascimento)
  - `expressionNumber` (nome completo)
  - `soulUrgeNumber` (vogais)
  - `personalityNumber` (consoantes)
- Assim, o **SymbolicMap do engines** (usado por `lib/engines/buildSymbolicMap`) passa a expor numerologia completa; o Sacred Remedy continua usando `lib/symbolic/builder`, que já tinha numerologia completa.

**Resultado:** Numerologia profunda está em `lib/knowledge/numerology.ts` e integrada no SymbolicMap (symbolic + engines) e no diagnosisEngine.

---

## P2 — Yoga Sutras completos (196) ✅

**Situação anterior:** `yoga_sutras.json` tinha ~105 entradas; o corpus completo de Patañjali tem 196 sutras.

**O que foi feito:**

- Criado **`lib/dictionaries/sacred/yoga_sutras_full.json`** com **196 entradas**:
  - 105 entradas existentes (de `yoga_sutras.json`) com campo **`themes`** adicionado
  - 11 novas: YS.1.41–YS.1.51
  - 46 novas: YS.3.11–YS.3.56
  - 34 novas: YS.4.1–YS.4.34
- Cada entrada tem: **id**, **text**, **kleshaTargets**, **qualities**, **themes**.
- **`lib/sacredRemedy/sacredSelector.ts`** passou a carregar **`yoga_sutras_full.json`** em vez de `yoga_sutras.json`.
- Script **`scripts/generate-yoga-sutras-full.js`** gera o arquivo (para futuras expansões ou ajustes).

**Resultado:** O selector usa o corpus completo de 196 Yoga Sutras com tags obrigatórias (kleshaTargets, qualities, themes).

---

## P2 — Puranas 500 (backlog)

**Meta premium:** 300–500 trechos medicinais/arquetípicos, altamente taggeados (kleshaTargets, qualities, themes).

**Situação atual:** `puranas.json` tem ~80 entradas. A expansão para 300–500 é **trabalho editorial** (conteúdo + curadoria).

**Recomendação:** Tratar em PR ou sprint dedicado; manter estrutura atual e ir ampliando o arquivo aos poucos.

---

## P3 — Ayurveda high-end ✅ (20/20 + múltiplas qualities + dosha; sono/rotina adicionados)

**O que está feito:**

- **20/20 qualities** com antídotos reais (QUALITY_TO_PRACTICE, QUALITY_TO_FOOD).
- **Múltiplas qualities:** `getActionsForQualitiesWithDosha(qualities, dosha, { maxSuggestions: 3 })` combina até 3 práticas e 3 alimentos.
- **Prioridade por dosha:** ordenação por DOSHA_QUALITIES_PRIORITY (vata/pitta/kapha).
- **Sono e rotina:** QUALITY_TO_SLEEP e QUALITY_TO_ROUTINE; `getFullActionsForQualitiesWithDosha()` retorna practice, food, sleep, routine (opcionais para UI).

**Extensão futura (opcional):** prioridade por estação/hora — tipo `GetActionsWithDoshaOptions` já preparado para `season?` e `hour?` quando o composer passar contexto.

---

## P4 — Cooldown autônomo server-side ✅

**O que está feito:**

- **GET `/api/instant-light`:** com sessão (cookie), chama `getRecentInstantLightIds(session.email, 20)` e sobrescreve `recentSacredIds` / `recentStateKeys`; após responder, chama `recordInstantLightUse(session.email, { sacredId, stateKey })`.
- O cliente **não** precisa enviar recentIds; o servidor preenche e registra uso sozinho quando o usuário está logado.
- Query params são fallback apenas para usuário não logado.

---

## Resumo (Engine 2.1 Premium Final)

| Item | Status |
|------|--------|
| P0 — Unificar pipeline (apenas sacredRemedy) | ✅ Feito |
| P1 — Numerologia completa (life path, expression, soul urge, personality) | ✅ Feito |
| P2 — Corpus premium (Yoga Sutras 196; Puranas ~500) | ✅ Yoga 196; Puranas 500 ⏳ backlog |
| P3 — Ayurveda high-end (20/20, múltiplas, dosha, sono, rotina) | ✅ Feito |
| P4 — Cooldown autônomo server-side | ✅ Feito |

---

## Referências

- Motor oficial: `lib/sacredRemedy/` e `docs/SACRED_REMEDY_ENGINE.md`
- Numerologia: `lib/knowledge/numerology.ts`, `lib/engines/numerologyEngine.ts`
- Corpus Yoga Sutras completo: `lib/dictionaries/sacred/yoga_sutras_full.json`
- Geração do corpus: `node scripts/generate-yoga-sutras-full.js`
- Ayurveda high-end: `lib/sacredRemedy/ayurvedaActionSelector.ts` (QUALITY_TO_SLEEP, QUALITY_TO_ROUTINE, getFullActionsForQualitiesWithDosha)
- Cooldown: `lib/historyStorage.ts` (getRecentInstantLightIds, recordInstantLightUse), GET `/api/instant-light`
