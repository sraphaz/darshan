# Validação Engine 2.1 — status pós-PR #3

Estado atual do repositório após os commits do PR #3 (incl. unificação, cooldown e numerologia).

---

## ✅ Implementado

| Módulo | Status | Observação |
|--------|--------|------------|
| Symbolic Map Engine | ✅ | `lib/symbolic/`, `lib/engines/buildSymbolicMap.ts` |
| Sacred Remedy Engine | ✅ | **Engine oficial único:** `lib/sacredRemedy/` |
| Remedy Matrix (50 estados) | ✅ | `lib/dictionaries/remedyMatrix.json` |
| Corpus sagrado expandido | ✅ | yoga_sutras ~60, puranas ~40, upanishads ~30 (kleshaTargets + qualities) |
| Ayurveda Qualities (20 gunas) | ✅ | `lib/sacredRemedy/types.ts` + ayurvedaActionSelector |
| Instant Light Universal + Personal | ✅ | GET `/api/instant-light`; POST `/api/darshan` (mock) usa sacredRemedy |
| Readings modulares | ✅ | `/api/reading/*` (general, love, career, year) |
| Histórico e anti-repetição | ✅ | historyStorage, instant_light_uses, modal UI |
| Swiss Provider scaffold | ✅ | `lib/core/providers/swissProvider.ts` |
| **Unificação sem duplicação** | ✅ | **P0:** Apenas `lib/sacredRemedy` é o motor; `/api/darshan` e `/api/instant-light` importam só daqui. `lib/instantLight` é wrapper de compatibilidade. |
| **Numerologia profunda** | ✅ | **P1:** lifePathNumber (data), expressionNumber (nome), soulUrgeNumber (vogais), personalityNumber (consoantes) em `lib/knowledge/numerology.ts`; SymbolicMap inclui os quatro. |
| **Cooldown autônomo server-side** | ✅ | **P2:** Em `/api/darshan` (mock), se usuário logado: servidor chama `getRecentInstantLightIds(session.email)` e `recordInstantLightUse(session.email, { sacredId, stateKey })`. Tabela `instant_light_uses`. |

---

## Módulos legados (não usados pelo fluxo Instant Light)

- **`lib/diagnosis/`** — Cópia antiga do diagnosis; o fluxo usa `lib/sacredRemedy/diagnosisEngine.ts`. Mantido por referência; engine oficial é sacredRemedy.
- **`lib/sacred/`** — Sacred Picker (classicTexts); o fluxo Instant Light usa `lib/sacredRemedy/sacredSelector.ts` + `dictionaries/sacred/*.json`. Mantido por referência.
- **`lib/instantLight/`** — Re-export do sacredRemedy; retorna `{ message, sacredId }` para compatibilidade. Novo código deve usar `@/lib/sacredRemedy`.

---

## ⚠️ Parcial / próximo passo

| Item | Status | Próximo passo |
|------|--------|--------------|
| Human Design | ⚠️ Scaffold | humanDesignEngine.ts e humanDesignInsights existem; aprofundar quando integrar HD de fato. |
| Ayurveda action selector high-end | ⚠️ MVP | P3: antídotos para as 20 qualities completos, múltiplas qualities, prioridade por dosha. |
| Corpus premium | ⚠️ ~60/40/30 | P4: expandir para Sutras 100+, Puranas 80+, Upanishads 50+. |
| GET /api/instant-light com cooldown server-side | ⚠️ Cliente opcional | Endpoint não exige auth; cooldown server-side só em `/api/darshan` (mock) quando há sessão. Para instant-light autônomo seria preciso auth. |

---

## Resumo

- **Engine único:** `composeInstantLight()` está apenas em `lib/sacredRemedy`; chamado por `/api/darshan` (mock) e GET `/api/instant-light`.
- **Numerologia:** life path, expression, soul urge, personality no SymbolicMap.
- **Cooldown:** server-side em `/api/darshan` (mock) quando o usuário está logado; `instant_light_uses` + `getRecentInstantLightIds` / `recordInstantLightUse`.

Engine 2.1 está fechado para P0, P1 e P2; P3 (Ayurveda high-end) e P4 (corpus premium) são evolução editorial.
