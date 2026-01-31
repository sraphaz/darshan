# PR #3 — Resposta à avaliação (Engine 2.1 Finalization)

Este documento mapeia os **gaps** apontados na avaliação do PR #3 com o **estado atual** do código e as ações recomendadas.

---

## Resumo executivo

| Gap | Avaliação pediu | Estado atual | Ação |
|-----|-----------------|--------------|------|
| **#1** Duplicação de engines | Um único pipeline; remover/encapsular antigo | **Resolvido** | Nenhuma (já unificado) |
| **#2** Numerologia profunda | lifePath, expression, soulUrge, personality | **Resolvido** | Nenhuma |
| **#3** Cooldown server-side | Servidor autônomo; avoidIds internos; recordUse automático | **Resolvido** | Nenhuma |
| **#4** Ayurveda 20/20 | Antídotos completos + múltiplas qualities + prioridade dosha | **Parcial → Resolvido** | Completar shlakshna/sthula (feito neste doc) |
| **#5** Corpus premium | Sutras 196, Puranas 300–500, Upanishads ~200 + themes | **Pendente (editorial)** | Backlog; tipo `themes` opcional já documentado |

---

## GAP #1 — Duplicação de engines

**Pedido:** Engine 2.1 deve ter apenas UM pipeline oficial; remover/encapsular instantLight antigo; todos os endpoints chamam apenas um composer final.

**Estado atual:**

- **`/api/darshan`** (modo mock) e **GET `/api/instant-light`** importam e usam **apenas** `composeInstantLight` de **`@/lib/sacredRemedy`**.
- **`lib/instantLight`** é um **wrapper de compatibilidade**: reexporta `composeInstantLight` que delega para `lib/sacredRemedy`; retorno legado `{ message, sacredId }` para quem ainda importar daqui.
- **`lib/diagnosis`** e **`lib/sacred`** estão marcados como **@deprecated** / “Para Instant Light medicinal use lib/sacredRemedy”; **nenhum** import do fluxo Instant Light usa esses módulos.

**Conclusão:** **Resolvido.** Pipeline oficial é `lib/sacredRemedy`. Cliente único para diagnóstico + texto + prática + pergunta.

---

## GAP #2 — Numerologia profunda

**Pedido:** lifePathNumber (data), expressionNumber (nome), soulUrgeNumber (vogais), personalityNumber (consoantes); integrar no SymbolicMap; diagnosisEngine usa para precisão.

**Estado atual:**

- **`lib/knowledge/numerology.ts`**: `getLifePathNumber(birthDate)`, `getExpressionNumber(fullName)`, `getSoulUrgeNumber(fullName)`, `getPersonalityNumber(fullName)` implementados.
- **`lib/symbolic/builder.ts`**: SymbolicMap preenchido com `lifePathNumber`, `expressionNumber`, `soulUrgeNumber`, `personalityNumber`.
- **`lib/sacredRemedy/diagnosisEngine.ts`**: `diagnosisPersonal` usa `map.numerology`; seed efetivo = `seed + lifePath*31 + soulUrge`; diagnóstico retorna `numerologyFromMap` (lifePath, soulUrge, expression, personality).

**Conclusão:** **Resolvido.**

---

## GAP #3 — Cooldown/histórico autônomo

**Pedido:** instant-light não deve depender do cliente para avoidIds; servidor consulta historyStorage; recordUse automático no backend.

**Estado atual:**

- **GET `/api/instant-light`**: com **sessão** (cookie), chama `getRecentInstantLightIds(session.email, 20)` e sobrescreve `recentSacredIds` / `recentStateKeys` com o retorno do servidor; após responder, chama `recordInstantLightUse(session.email, { sacredId, stateKey })`.
- Query params `recentSacredIds` e `recentStateKeys` são **fallback** para usuário não logado.

**Conclusão:** **Resolvido.** Cooldown é autônomo quando há sessão; cliente não controla quando logado.

---

## GAP #4 — Ayurveda Action Selector completo

**Pedido:** Antídotos para as 20 qualities; múltiplas qualities; prioridade por dosha; recomendações alimentares e rotina prática.

**Estado atual:**

- **20 gunas:** QUALITY_TO_PRACTICE e QUALITY_TO_FOOD cobrem todas; **shlakshna** e **sthula** tinham "—" e foram preenchidos com antídotos concretos (ver commit associado).
- **Múltiplas qualities + dosha:** `getActionsForQualitiesWithDosha(qualities, dosha, { maxSuggestions: 3 })` ordena por dosha (vata/pitta/kapha), combina até 3 práticas e 3 alimentos; usado no composer quando há `prakritiFromJyotish.dosha`.

**Conclusão:** **Resolvido** (com a conclusão de shlakshna/sthula neste ciclo).

---

## GAP #5 — Corpus sagrado premium

**Pedido:** Yoga Sutras 196 completos; Puranas 300–500 excerpts; Upanishads ~200; cada entrada com kleshaTargets, ayurvedicQualities e **themes** obrigatórios.

**Estado atual:**

- Estrutura: `yoga_sutras.json`, `puranas.json`, `upanishads.json` com `kleshaTargets` e `qualities` (e opcionalmente `themes` no tipo, para expansão futura).
- Tamanho atual: Yoga Sutras ~100, Puranas ~80, Upanishads ~52.

**Conclusão:** **Pendente (editorial).** A meta 196 / 300+ / 200 é trabalho de conteúdo; recomendação: tratar em **próximo PR** ou backlog, com `themes` como campo opcional até a expansão. Testes e fechamento do Engine 2.1 não precisam bloquear nesse volume.

---

## Entregáveis do “Engine 2.1 Finalization” — checklist

| # | Entregável | Status |
|---|------------|--------|
| 1 | Unificar Instant Light em sacredRemedy | ✅ Feito |
| 2 | Remover instantLight antigo ou transformar em wrapper | ✅ Wrapper; deprecation explícita |
| 3 | Numerologia completa implementada | ✅ Feito |
| 4 | Cooldown autônomo server-side | ✅ Feito |
| 5 | Ayurveda Action Selector completo (20 qualities) | ✅ Feito (shlakshna/sthula preenchidos) |
| 6 | Corpus expandido (Sutras completos + Puranas excerpts) | ⏳ Backlog (atual ~100/80/52) |
| 7 | Testes (deterministic, cooldown, universal vs personal, numerology) | ⏳ Pendente |

---

## O que foi feito neste ciclo (próximas etapas)

- **Testes automatizados:** `__tests__/lib/sacredRemedy/` — diagnosisEngine, sacredSelector, ayurvedaActionSelector, instantLightComposer (determinismo, universal vs personal, anti-repetição, 20 gunas).
- **Campo themes:** `SacredCorpusEntry.themes?: string[]` opcional para expansão premium.
- **Refino Nakshatra → klesha:** mapa `NAKSHATRA_KLESHA_TENDENCY` em diagnosisEngine; diagnóstico personal prefere remédios que coincidem com o klesha da nakshatra lunar quando definido.

## O que permanece em backlog

- **Corpus em escala premium** (196 Sutras, 300+ Puranas, 200 Upanishads) e **themes** em todas as entradas — trabalho editorial.
- Testes de integração para GET `/api/instant-light` (cooldown com sessão mock).

---

## Referências

- Motor oficial: `lib/sacredRemedy/` e `docs/SACRED_REMEDY_ENGINE.md`
- Histórico e cooldown: `lib/historyStorage.ts` (`getRecentInstantLightIds`, `recordInstantLightUse`), tabela `instant_light_uses`
