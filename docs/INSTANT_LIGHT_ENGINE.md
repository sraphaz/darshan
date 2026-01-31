# Instant Light Engine — Sacred Library + Personal Insight

O Darshan é **duas coisas ao mesmo tempo**:

1. **Universal Light (Instant Light)** — qualquer pessoa, sem cadastro, sem mapa: um sutra, um verso purânico, uma prática mínima, uma pergunta final.
2. **Personal Light** — quando a pessoa fornece dados (nome, data/hora de nascimento): o mesmo Instant Light **filtrado e ancorado no SymbolicMap** (tradição + mapa pessoal + destino simbólico).

O **grande tesouro** do Darshan são os textos sagrados (Purāṇas, Yoga Sūtras, Upanishads, Bhagavad Gita). Eles **não são substituídos** pelo mapa; o mapa é uma **camada adicional**.

---

## Arquitetura: Sacred Remedy Matrix + Diagnosis Engine

O Instant Light usa a **matriz de remédios** (30 estados) e o **diagnóstico consciente**:

- **Camada 1 — Prakṛti (Jyotish):** dosha/elemento do mapa (Lua + Nakshatra).
- **Camada 2 — Sāṃkhya Guṇas (3):** estado macro (sattva/rajas/tamas) — “céu interno”.
- **Camada 3 — Ayurvedic Qualities (20):** qualidades em excesso/deficiência (prática, alimento).

```
light = SacredVerse(remedy) + [InsightFromMap se perfil] + Practice(remedy) + Question(remedy)
```

- **selectRemedy(profile?, { seed, recentSacredIds })** escolhe uma entrada da matriz:
  - Com perfil: filtra por guna dominante do mapa (arquétipo → guna) e evita `recentSacredIds`.
  - Sem perfil: escolhe entre todas por seed, evitando repetição.
- Cada entrada traz: **verso sagrado** (embutido), **prática**, **alimento**, **pergunta**.
- Nunca aleatório puro; cooldown via `recentSacredIds`.

---

## 1. Sacred Library Engine (`lib/sacred/`)

- **pickSacredText({ themeTags?, avoidLastIds?, seed? })** — escolhe um texto sagrado com:
  - **Rotação determinística** (seed, ex.: dailySeed).
  - **Evitar repetição** (avoidLastIds = cooldown).
  - **Tags temáticas** (filtrar por source, guna, archetype).
- Fonte atual: `lib/knowledge/classicTexts` (Upanishads, Bhagavad Gita, Yoga Sutras).
- Estrutura de dicionário em `lib/dictionaries/sacred/` (ex.: `yoga_sutras.json`) com `id`, `verse`, `tags` para expansão futura.

---

## 2. Diagnosis Engine + Remedy Matrix (`lib/diagnosis/`)

- **remedyMatrix.json** — 30 estados (ansiedade, apego, medo, raiva, letargia, clareza, etc.).
- Cada estado: **klesha**, **samkhyaGuna**, **qualities**, **sacred** (corpus, id, verse), **practice**, **food**, **question**.
- **selectRemedy(profile?, { seed, recentSacredIds })** — seleção determinística com cooldown.
- **getPrakritiFromMap(map)**, **getDominantSamkhyaGuna(map)**, **buildDiagnosisFromMapAndRemedy(map, remedy)**.
- Tipos: `SamkhyaGuna`, `AyurvedicQuality`, `ConsciousDiagnosis`, `RemedyMatrixEntry`.

## 3. Instant Light Composer (`lib/instantLight/`)

- **composeInstantLight(profile?, options?)** → `{ message, sacredId }`.
- Fonte do conteúdo: **matriz de remédios** (selectRemedy) — verso + prática + pergunta da entrada.
- **Com perfil:** adiciona insight do mapa (getGeneral) entre verso e prática.
- **sacredId** = `corpus.id` (ex.: `yoga_sutras.YS.1.33`) para cooldown.

---

## 4. API Darshan (modo mock)

- **POST /api/darshan** com `mock: true`:
  - Chama **composeInstantLight(userProfile, { recentSacredIds })**.
  - **Sem perfil** (sem nome/data) → Universal Light.
  - **Com perfil** → Personal Light.
- Resposta inclui **sacredId** para o cliente acumular e enviar em `recentSacredIds` nas próximas requisições.

---

## 5. Numerologia expandida (SymbolicMap)

- **lifePathNumber** — data de nascimento (soma dos dígitos reduzida a 1–9 ou 11/22).
- **expressionNumber** — nome completo (número regente / Pitágoras).
- **rulingNumber** — mantido para compatibilidade (= expressionNumber).
- Retornado em `map.numerology` (POST /api/map, leituras offline).

---

## 6. Onde está cada peça

| Peça | Arquivo / pasta |
|------|------------------|
| Remedy Matrix (30 estados) | `lib/dictionaries/remedyMatrix.json` |
| Diagnosis Engine | `lib/diagnosis/diagnosisEngine.ts` |
| Tipos Diagnosis | `lib/diagnosis/types.ts` |
| Sacred Picker | `lib/sacred/sacredPicker.ts` |
| Instant Light Composer | `lib/instantLight/instantLightComposer.ts` |
| Textos clássicos (fonte) | `lib/knowledge/classicTexts.ts` |
| lifePathNumber / expressionNumber | `lib/knowledge/numerology.ts`, `lib/symbolic/builder.ts` |
| /api/darshan (mock) | `app/api/darshan/route.ts` → composeInstantLight |

---

## 7. Resultado

- **Darshan universal** (sem cadastro) — texto sagrado + prática + pergunta.
- **Darshan pessoal** (com mapa) — texto sagrado + insight do mapa + prática do mapa + pergunta.
- **Textos sagrados preservados e rotacionados** (seed + avoidLastIds).
- **Personalização elegante** quando o mapa existe.
- **Numerologia mais profunda** (lifePath + expression).
- **getOfflineRevelation** continua disponível em `lib/oracleOffline.ts` para outros fluxos; o modo mock da API passou a usar o Instant Light híbrido.
