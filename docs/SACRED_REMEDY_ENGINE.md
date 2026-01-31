# Sacred Remedy Engine — núcleo offline medicinal

Motor **paralelo** ao fluxo atual do Darshan. Não substitui `/api/darshan`; adiciona um endpoint e uma pilha dedicada ao “texto como remédio”.

---

## 1. O que é

- **Diagnóstico consciente:** klesha + samkhya guna + qualidades ayurvédicas (excesso/deficiência).
- **Corpus sagrado taggeado:** yoga_sutras, puranas, upanishads com `kleshaTargets` e `qualities`.
- **Seleção dirigida:** texto sagrado escolhido por klesha e qualidades (anti-repetição por `avoidIds`).
- **Matriz de remédios (50 estados):** cada estado mapeia klesha, samkhyaGuna, qualidades, prática, alimento, pergunta.

---

## 2. Onde está

| Peça | Caminho |
|------|---------|
| Tipos | `lib/sacredRemedy/types.ts` |
| Diagnosis Engine | `lib/sacredRemedy/diagnosisEngine.ts` |
| Sacred Selector | `lib/sacredRemedy/sacredSelector.ts` |
| Instant Light Composer | `lib/sacredRemedy/instantLightComposer.ts` |
| Yoga Sutras completos (196) | `lib/dictionaries/sacred/yoga_sutras_full.json` |
| Puranas | `lib/dictionaries/sacred/puranas.json` |
| Upanishads | `lib/dictionaries/sacred/upanishads.json` |
| Matriz de remédios | `lib/dictionaries/remedyMatrix.json` |
| Endpoint | **GET** `/api/instant-light` |

---

## 3. Intent Parser (multi-eixo offline)

Classificação do texto do usuário **sem IA**, por dicionários:

- **Verbo:** feel / seek / fear / want / conflict / reflect (`lib/dictionaries/inputVerbs.json`).
- **Sujeito:** self / other / relational (eu, meu vs ele, ela vs nós).
- **Tema:** love / career / health / spirituality (`lib/dictionaries/inputThemes.json`).
- **Emoção → stateCandidates:** anxiety, grief, anger, etc. → estados da RemedyMatrix (`lib/dictionaries/inputEmotions.json`).

**State Scorer** escolhe o `bestStateKey` por pesos: emoção +3, verbClass fear +2, tema +1, sujeito other +1.

| Peça | Caminho |
|------|---------|
| Intent Parser | `lib/input/intentParser.ts` |
| State Scorer | `lib/input/stateScorer.ts` |
| Dicionários | `lib/dictionaries/inputVerbs.json`, `inputThemes.json`, `inputEmotions.json` |

Se a request incluir `userText`, o pipeline usa `parseIntent(userText)` → `scoreState(intent)` → `preferredStateKey` no diagnosis, e a resposta fica conectada ao input (ex.: "Tenho medo de perder meu relacionamento" → stateKey anxiety/love, sutra e prática coerentes).

---

## 4. GET /api/instant-light

- **Método:** GET (sem corpo; sem créditos; sem IA).
- **Query (opcional):**  
  `fullName`, `birthDate`, `birthTime`, `birthPlace`, **`userText`**, `recentSacredIds`, `recentStateKeys`.
- **userText:** quando informado, Intent Parser + State Scorer definem `preferredStateKey` e a resposta é dirigida ao estado/tema detectado.
- **Com perfil (nome ou data):** `diagnosisPersonal(SymbolicMap)` + insight do mapa + prática + pergunta.
- **Sem perfil:** `diagnosisUniversal()` + texto sagrado dirigido + prática + pergunta.

**Resposta:**

```json
{
  "sacredText": "...",
  "insight": "...",
  "practice": "...",
  "food": "...",
  "sleep": "...",
  "routine": "...",
  "question": "...",
  "sacredId": "yoga_sutras.YS.1.33",
  "stateKey": "anxiety"
}
```

- `insight` só vem quando há perfil (personal).
- `food`, `sleep`, `routine` (Ayurveda high-end) vêm quando há qualidades em excesso e dosha; opcionais.
- `sacredId` e `stateKey` para o cliente enviar em `recentSacredIds` / `recentStateKeys` e reduzir repetição.

---

## 5. Fluxo do motor

1. **Diagnóstico:**  
   - Com perfil → `diagnosisPersonal(profile)` (mapa → guna dominante → estado da matriz).  
   - Sem perfil → `diagnosisUniversal()` (estado por seed + recentStateKeys).
2. **Remédio:** `getRemedyForDiagnosis(diagnosis)` → prática, pergunta, referência sagrada (fallback).
3. **Texto sagrado:** `selectSacredText({ kleshaTargets, qualities, avoidIds, seed })` → entrada do corpus (yoga_sutras / puranas / upanishads).
4. **Composição:** sacredText (do selector ou verse da matriz) + insight (se personal) + practice + question.

---

## 5. Formato do corpus sagrado

Cada entrada em `yoga_sutras.json`, `puranas.json`, `upanishads.json`:

```json
{
  "id": "YS.1.33",
  "text": "Amizade, compaixão, alegria e equanimidade...",
  "kleshaTargets": ["raga", "dvesha"],
  "qualities": ["chala", "ruksha", "tikshna", "ushna", "khara"]
}
```

- **kleshaTargets:** kleśas que o texto ajuda a equilibrar.
- **qualities:** qualidades ayurvédicas associadas (para matching com o diagnóstico).
- **themes:** (opcional) temas para matching futuro (ex.: presença, medo, amor) — usado na expansão premium.

---

## 7. Relação com o resto do produto

- **Motor único:** `lib/sacredRemedy` é o único pipeline Instant Light; `lib/instantLight`, `lib/sacred` e `lib/diagnosis` foram removidos (P0).
- **`/api/darshan` (POST, mock/IA):** no mock usa **apenas** Sacred Remedy (`composeInstantLight` de `lib/sacredRemedy`); cooldown server-side quando usuário logado.
- **`/api/instant-light` (GET):** motor novo, só offline, só Sacred Remedy (diagnóstico + corpus taggeado + matriz + prática + pergunta).
- **Leitura offline narrativa (`readingOffline`, `oracleOffline`):** segue separada; o Instant Light do Sacred Remedy é outra camada (resposta estruturada: sacredText, insight, practice, question).

---

## 7. Engine 2.1 — Ayurveda + corpus expandido

- **AyurvedicQuality (20 gunas)** em `types.ts`: guru/laghu, snigdha/ruksha, sita/ushna, manda/tikshna, sthira/chala, mridu/kathina, vishada/picchila, shlakshna/khara, sukshma/sthula, sandra/drava, sara.
- **Diagnosis** retorna `ayurvedicQualities.excess` e `deficient`; **prakriti/dosha** do mapa enriquece o diagnóstico (dosha → qualidades típicas em excesso).
- **Ayurveda Action Selector** (`ayurvedaActionSelector.ts`): prática e alimento concretos por qualidade (ruksha → oleação, chala → grounding, tikshna → cooling, etc.).
- **remedyMatrix.json**: 50 estados (incl. burnout, solitude, grief, jealousy, numbness, hypercontrol, shame, impatience, despair, envy, restlessness, boredom, overwhelm, isolation, perfectionism, avoidance, irritability, self_doubt, longing, acceptance).
- **Corpus sagrado:** Yoga Sutras 196 (`yoga_sutras_full.json`), puranas ~80, upanishads ~52; todas com `kleshaTargets` e `qualities` (e `themes` opcional).

## 9. Engine 2.1 — Unificação e cooldown (pós-PR #3)

- **P0 — Engine único:** `/api/darshan` (mock) e GET `/api/instant-light` usam apenas `lib/sacredRemedy`. `lib/instantLight`, `lib/sacred` e `lib/diagnosis` foram removidos.
- **P1 — Cooldown autônomo:** Quando o usuário está logado, o servidor busca `recentSacredIds` e `recentStateKeys` em `getRecentInstantLightIds(userEmail, 50, 7)` (últimos 7 dias) e registra uso em `recordInstantLightUse`. Cliente não controla; cooldown de 7 dias por sacredId. Tabela `instant_light_uses` (migração `20250129110000_instant_light_uses.sql`).
- **P2 — Numerologia completa:** `getSoulUrgeNumber(fullName)` (vogais) e `getPersonalityNumber(fullName)` (consoantes) em `lib/knowledge/numerology.ts`. SymbolicMap inclui `soulUrgeNumber` e `personalityNumber`.

## 9. Engine 2.1 — Concluído (P3, P4, numerologia, cooldown instant-light)

- **Numerologia no diagnóstico:** `ConsciousDiagnosis.numerologyFromMap` (lifePath, soulUrge, expression, personality); seed em `diagnosisPersonal` influenciado por lifePath/soulUrge para coerência.
- **Ayurveda high-end:** `getFullActionsForQualitiesWithDosha(qualities, dosha, { maxSuggestions: 3 })` — prioridade por dosha (vata/pitta/kapha), combina prática, alimento, sono e rotina; resposta Instant Light inclui `food`, `sleep`, `routine` quando aplicável.
- **Cooldown GET /api/instant-light:** Com sessão (cookie), o servidor busca `getRecentInstantLightIds(session.email)` e registra uso com `recordInstantLightUse`; query params são fallback para anônimos.
- **Corpus expandido:** Yoga Sutras 100+ (YS.2.51–YS.3.10 adicionados), Puranas 80+, Upanishads 50+.

## 11. Testes e refinamentos (Engine 2.1 finalization)

- **Testes:** `__tests__/lib/sacredRemedy/` — diagnosisEngine, sacredSelector, ayurvedaActionSelector, instantLightComposer (determinismo, universal vs personal, anti-repetição, 20 gunas). Executar: `npx jest __tests__/lib/sacredRemedy`.
- **Campo themes:** `SacredCorpusEntry.themes?: string[]` opcional para matching futuro (corpus premium).
- **Nakshatra → klesha:** mapa `NAKSHATRA_KLESHA_TENDENCY` em diagnosisEngine; diagnóstico personal prefere remédios cujo klesha coincide com a tendência da nakshatra lunar.

## 11. Testes de integração

- **`__tests__/api/instant-light.route.test.ts`:** GET `/api/instant-light` — modo anônimo, modo personal (query), cooldown server-side com sessão mock (getRecentInstantLightIds, recordInstantLightUse), formato da resposta (food, sleep, routine opcionais). Executar: `npx jest __tests__/api/instant-light.route.test`.

## 13. Próximos passos (editorial)

- Corpus premium (196 Sutras já concluído; 300+ Puranas, 200 Upanishads) com themes em todas as entradas.

---

## 13. Status dos críticos (Engine 2.1 Premium)

Ver **`docs/ENGINE_21_PREMIUM_STATUS.md`** para verificação dos bloqueadores e estratégicos: CRÍTICO 1 (numerologia), CRÍTICO 2 (cooldown 7 dias server-side), CRÍTICO 3 (pipeline único), P1 (Ayurveda premium), P2 (corpus). Cooldown de 7 dias: `getRecentInstantLightIds(userEmail, 50, 7)` retorna só usos dos últimos 7 dias; selector evita repetir sacredIds/stateKeys nesse período.

## 15. O que falta (resumo)

| Área | Item | Status |
|------|------|--------|
| **Engine 2.1** | Pipeline único, numerologia, cooldown, Ayurveda 20/20 + sono/rotina, testes unit + integração | ✅ Concluído |
| **Corpus** | Yoga Sutras 196 | ✅ Concluído |
| **Corpus** | Puranas 300–500 trechos medicinais | ⏳ Em progresso (~106 entradas, **todas com themes**; backlog editorial para 300+) |
| **Corpus** | Upanishads ~200 + themes em entradas | ✅ **Todas as ~64 entradas com themes**; backlog editorial para 200 |
| **Ayurveda** | Prioridade por estação (`season`) e hora (`hour`) em `GetActionsWithDoshaOptions` | ✅ Implementado (getSeasonFromDate, getHourPeriodFromDate; composer passa ao getFullActionsForQualitiesWithDosha) |
| **Doc** | PR3_ENGINE_21_STATUS: atualizar se ainda citar lib/instantLight como wrapper | Pequena correção |
