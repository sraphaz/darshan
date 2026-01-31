# Sacred Remedy Engine — núcleo offline medicinal

Motor **paralelo** ao fluxo atual do Darshan. Não substitui `/api/darshan`; adiciona um endpoint e uma pilha dedicada ao “texto como remédio”.

---

## 1. O que é

- **Diagnóstico consciente:** klesha + samkhya guna + qualidades ayurvédicas (excesso/deficiência).
- **Corpus sagrado taggeado:** yoga_sutras, puranas, upanishads com `kleshaTargets` e `qualities`.
- **Seleção dirigida:** texto sagrado escolhido por klesha e qualidades (anti-repetição por `avoidIds`).
- **Matriz de remédios (30 estados):** cada estado mapeia klesha, samkhyaGuna, qualidades, prática, alimento, pergunta.

---

## 2. Onde está

| Peça | Caminho |
|------|---------|
| Tipos | `lib/sacredRemedy/types.ts` |
| Diagnosis Engine | `lib/sacredRemedy/diagnosisEngine.ts` |
| Sacred Selector | `lib/sacredRemedy/sacredSelector.ts` |
| Instant Light Composer | `lib/sacredRemedy/instantLightComposer.ts` |
| Yoga Sutras (taggeado) | `lib/dictionaries/sacred/yoga_sutras.json` |
| Puranas | `lib/dictionaries/sacred/puranas.json` |
| Upanishads | `lib/dictionaries/sacred/upanishads.json` |
| Matriz de remédios | `lib/dictionaries/remedyMatrix.json` |
| Endpoint | **GET** `/api/instant-light` |

---

## 3. GET /api/instant-light

- **Método:** GET (sem corpo; sem créditos; sem IA).
- **Query (opcional):**  
  `fullName`, `birthDate`, `birthTime`, `birthPlace`, `recentSacredIds`, `recentStateKeys`.
- **Com perfil (nome ou data):** `diagnosisPersonal(SymbolicMap)` + insight do mapa + prática + pergunta.
- **Sem perfil:** `diagnosisUniversal()` + texto sagrado dirigido + prática + pergunta.

**Resposta:**

```json
{
  "sacredText": "...",
  "insight": "...",
  "practice": "...",
  "question": "...",
  "sacredId": "yoga_sutras.YS.1.33",
  "stateKey": "anxiety"
}
```

- `insight` só vem quando há perfil (personal).
- `sacredId` e `stateKey` para o cliente enviar em `recentSacredIds` / `recentStateKeys` e reduzir repetição.

---

## 4. Fluxo do motor

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

---

## 6. Relação com o resto do produto

- **`/api/darshan` (POST, mock/IA):** continua como está (IA + fallback; 7 fases; `getOfflineRevelation` etc.). **Não foi alterado.**
- **`/api/instant-light` (GET):** motor novo, só offline, só Sacred Remedy (diagnóstico + corpus taggeado + matriz + prática + pergunta).
- **Leitura offline narrativa (`readingOffline`, `oracleOffline`):** segue separada; o Instant Light do Sacred Remedy é outra camada (resposta estruturada: sacredText, insight, practice, question).

---

## 7. Engine 2.1 — Ayurveda + corpus expandido

- **AyurvedicQuality (20 gunas)** em `types.ts`: guru/laghu, snigdha/ruksha, sita/ushna, manda/tikshna, sthira/chala, mridu/kathina, vishada/picchila, shlakshna/khara, sukshma/sthula, sandra/drava, sara.
- **Diagnosis** retorna `ayurvedicQualities.excess` e `deficient`; **prakriti/dosha** do mapa enriquece o diagnóstico (dosha → qualidades típicas em excesso).
- **Ayurveda Action Selector** (`ayurvedaActionSelector.ts`): prática e alimento concretos por qualidade (ruksha → oleação, chala → grounding, tikshna → cooling, etc.).
- **remedyMatrix.json**: 50 estados (incl. burnout, solitude, grief, jealousy, numbness, hypercontrol, shame, impatience, despair, envy, restlessness, boredom, overwhelm, isolation, perfectionism, avoidance, irritability, self_doubt, longing, acceptance).
- **Corpus sagrado**: yoga_sutras ~60 entradas, puranas ~40, upanishads ~30, todas com `kleshaTargets` e `qualities`.

## 8. Engine 2.1 — Unificação e cooldown (pós-PR #3)

- **P0 — Engine único:** `/api/darshan` (mock) e GET `/api/instant-light` usam apenas `lib/sacredRemedy`. `lib/instantLight` virou re-export/adaptador para compatibilidade.
- **P1 — Cooldown autônomo:** Quando o usuário está logado, o servidor busca `recentSacredIds` e `recentStateKeys` em `getRecentInstantLightIds(userEmail)` e registra uso em `recordInstantLightUse(userEmail, { sacredId, stateKey })`. Tabela `instant_light_uses` (migração `20250129110000_instant_light_uses.sql`).
- **P2 — Numerologia completa:** `getSoulUrgeNumber(fullName)` (vogais) e `getPersonalityNumber(fullName)` (consoantes) em `lib/knowledge/numerology.ts`. SymbolicMap inclui `soulUrgeNumber` e `personalityNumber`.

## 9. Próximos passos (editorial)

- Refinar mapeamento Nakshatra → tendência → klesha provável (para diagnóstico personal mais fino).
- P3: Ayurveda action selector high-end (múltiplas qualities, prioridade por dosha).
- P4: Corpus premium (Yoga Sutras 100+, Puranas 80+, Upanishads 50+).
- Testes automatizados para `diagnosisEngine`, `sacredSelector`, `ayurvedaActionSelector`, `composeInstantLight` e GET `/api/instant-light`.
