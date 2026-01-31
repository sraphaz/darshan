# Engine 2.1 Premium — Status dos Críticos e Estratégicos

Documento de verificação dos pontos críticos e estratégicos antes de merge (produto high-end).

---

## CRÍTICO 1 — Numerologia completa

**Requisito:** life path (data), soul urge (vogais), personality (consoantes), expression (nome completo). Integrar no SymbolicMap e diagnosisEngine.

**Estado:** ✅ **Implementado**

| Onde | O quê |
|------|--------|
| `lib/knowledge/numerology.ts` | `getLifePathNumber(birthDate)`, `getExpressionNumber(fullName)`, `getSoulUrgeNumber(fullName)`, `getPersonalityNumber(fullName)` |
| `lib/engines/numerologyEngine.ts` | Retorna `lifePathNumber`, `expressionNumber`, `soulUrgeNumber`, `personalityNumber` |
| `lib/symbolic/builder.ts` | SymbolicMap preenchido com os quatro números no objeto `numerology` |
| `lib/sacredRemedy/diagnosisEngine.ts` | `diagnosisPersonal` usa `map.numerology`; seed influenciado por lifePath/soulUrge; `numerologyFromMap` no diagnóstico |

---

## CRÍTICO 2 — Cooldown server-side autônomo

**Requisito:** selector nunca repete textos recentes; consultar historyStorage automaticamente; cooldown de 7 dias por sacredId; cliente não controla.

**Estado:** ✅ **Implementado**

| Onde | O quê |
|------|--------|
| `lib/historyStorage.ts` | `getRecentInstantLightIds(userEmail, limit, sinceDays?)` — quando `sinceDays === 7`, retorna só usos dos últimos 7 dias |
| `app/api/instant-light/route.ts` | Com sessão: chama `getRecentInstantLightIds(session.email, 50, 7)` e sobrescreve `recentSacredIds`/`recentStateKeys`; após resposta chama `recordInstantLightUse` |
| `lib/sacredRemedy/instantLightComposer.ts` | Recebe `recentSacredIds` e `recentStateKeys`; `selectSacredText({ avoidIds: recentSacredIds })` e diagnosis evita `recentStateKeys` |

Cliente não envia recentIds quando logado; servidor preenche e registra uso sozinho. Cooldown de 7 dias: apenas sacredIds/stateKeys usados nos últimos 7 dias entram na lista de evitação.

---

## CRÍTICO 3 — Pipeline único

**Requisito:** instant-light como motor oficial; /api/darshan wrapper ou legacy; evitar dois motores divergentes.

**Estado:** ✅ **Implementado**

| Onde | O quê |
|------|--------|
| `lib/sacredRemedy/` | Único motor: `diagnosisEngine`, `sacredSelector`, `ayurvedaActionSelector`, `instantLightComposer` |
| `lib/instantLight`, `lib/sacred`, `lib/diagnosis` | **Removidos** (não existem mais) |
| `GET /api/instant-light` | Usa `composeInstantLight` de `@/lib/sacredRemedy` |
| `POST /api/darshan` (modo mock) | Usa **o mesmo** `composeInstantLight` de `@/lib/sacredRemedy` |

Um único composer; dois endpoints consomem o mesmo motor. Sem duplicação.

---

## P1 — Ayurveda Action Selector premium

**Requisito:** 20/20 qualities com antídotos; múltiplas qualities (ruksha+chala+sukshma); rotina, sono, alimentação.

**Estado:** ✅ **Implementado**

| Onde | O quê |
|------|--------|
| `lib/sacredRemedy/ayurvedaActionSelector.ts` | `QUALITY_TO_PRACTICE`, `QUALITY_TO_FOOD`, `QUALITY_TO_SLEEP`, `QUALITY_TO_ROUTINE` para as 20 qualities |
| | `getActionsForQualitiesWithDosha`, `getFullActionsForQualitiesWithDosha` — múltiplas qualities, prioridade por dosha + season + hour |
| `lib/sacredRemedy/instantLightComposer.ts` | Usa `getFullActionsForQualitiesWithDosha`; resposta inclui `practice`, `food`, `sleep`, `routine` |
| `lib/sacredRemedy/types.ts` | `InstantLightResponse` com `food?`, `sleep?`, `routine?` |

---

## P2 — Corpus premium

**Requisito:** Yoga Sutras 196; Puranas 300–500 excerpts medicinais; Upanishads 200; kleshaTargets, qualities, themes obrigatórios.

**Estado:** ✅ **Completo**

| Item | Meta | Atual | Observação |
|------|------|--------|------------|
| Yoga Sutras | 196 | **196** | `lib/dictionaries/sacred/yoga_sutras_full.json`; sacredSelector usa este arquivo |
| Puranas | 300–500 | **400** | Todas com kleshaTargets, qualities, themes; script `scripts/expand-sacred-corpus.js` |
| Upanishads | 200 | **200** | Todas com kleshaTargets, qualities, themes; script `scripts/expand-sacred-corpus.js` |

Corpus premium fechado: 196 sutras + 400 puranas + 200 upanishads = 796 entradas no sacredSelector.

---

## O que ainda é heurístico / Engine 2.2

**Diagnosis Engine:** hoje usa prakriti/dosha do mapa (rashi lunar), qualities por dosha, nakshatra → klesha. **Não inclui ainda:** yogas, casas, aspectos, dashas, trânsitos anuais reais. Isso é escopo do **Engine 2.2 Jyotish High Precision** (Swiss Ephemeris default, casas, yogas, dashas, trânsitos), após fechar o 2.1 Premium.

---

## Resumo

| Bloqueador / P | Status |
|----------------|--------|
| CRÍTICO 1 — Numerologia completa | ✅ Feito |
| CRÍTICO 2 — Cooldown server-side (7 dias) | ✅ Feito |
| CRÍTICO 3 — Pipeline único | ✅ Feito |
| P1 — Ayurveda 20/20 + rotina/sono/alimentação | ✅ Feito |
| P2 — Corpus (196 sutras; Puranas 400; Upanishads 200) | ✅ Completo (796 entradas) |

**Engine 2.1 Premium:** críticos, P1 e P2 fechados. Corpus completo: 196 Yoga Sutras + 400 Puranas + 200 Upanishads. Próximo passo estratégico: Engine 2.2 Jyotish High Precision.
