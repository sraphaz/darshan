# Roadmap Parte 2 — Human Design, Year Engine, Ayurveda

Este documento descreve os **próximos passos** do engine offline do Darshan após a base atual (AstronomicalCore, SymbolicMap, Insights, Composer, leituras modulares). Tudo continua **sem IA**, determinístico e expansível.

---

## 1. Human Design real (BodyGraph completo)

**Estado atual:** stub em `lib/engines/humanDesignEngine.ts` — retorna tipo/autoridade/perfil fixos quando há `core.planets`; senão `null`.

**Objetivo:** Cálculo real de Human Design a partir das posições planetárias (e opcionalmente hora/local para casas).

**Entregas sugeridas:**

- **Gates (64)** — posições planetárias em signos → ativação de portas (ex.: Sol em 15° Áries → Porta 51).
- **Canais** — pares de portas ativadas (Sol/Lua, etc.) → definição de canais.
- **Tipo** — Generator, Manifestor, Projector, Reflector, Manifesting Generator a partir dos centros definidos/abertos.
- **Autoridade** — Emocional, Sacral, Ego, etc., a partir do corpo gráfico.
- **Perfil** — 1/4, 4/6, etc. (linhas consciente/inconsciente).
- **Centros** — definido/aberto por centro (Head, Ajna, Throat, G, Heart, Sacral, Solar Plexus, Spleen, Root).

**Fontes:** Cálculo HD usa posições planetárias (e às vezes casas). Existem tabelas de portas por grau/signo; APIs ou libs especializadas em BodyGraph podem ser integradas. O core já pode fornecer `planets` quando Swiss Ephemeris estiver ativo.

**Inserção no pipeline:** `humanDesignEngine(core)` deixa de ser stub e passa a calcular tipo, autoridade, perfil, centros (e opcionalmente gates/canais). Os insights em `lib/insights/humanDesignInsights.ts` e o dicionário `lib/dictionaries/humanDesign.ts` já estão preparados para chaves como `hd.type.*`, `hd.authority.*`; basta alimentar com dados reais.

---

## 2. Year Engine (trânsitos + dashas)

**Estado atual:** Leituras de ano usam os mesmos insights do mapa natal (tópico `year`); não há trânsitos nem dashas.

**Objetivo:** Enriquecer a leitura de ano com:

- **Trânsitos** — posições atuais dos planetas (ou da Lua) em relação ao mapa natal (ex.: “Lua em trânsito em seu Sol natal”).
- **Dashas** — períodos védicos (ex.: Mahadasha, Antardasha) a partir da data de nascimento e da data “do ano” (ou hoje).

**Entregas sugeridas:**

- Módulo **trânsitos:** dado mapa natal (core no nascimento) e data de referência (ex.: ano corrente), calcular posições na data de referência e comparar com o natal (aspectos, trânsito por casa/signo).
- Módulo **dashas:** dado nascimento e data de referência, calcular qual Mahadasha/Antardasha está ativa (Vimshottari ou outro sistema).
- **Insights de ano** — novas regras em `lib/insights/` que geram keys como `jyotish.transit.*`, `jyotish.dasha.*`; dicionário com frases para esses keys.
- **Composer** — tópico `year` passa a incluir insights de trânsito/dasha além dos atuais (natal + year).

**Dependência:** Cálculo de posições para uma data arbitrária (nascimento vs. “hoje” ou “ano”). Com **Swiss Ephemeris** integrado, isso fica direto; com só mhah-panchang, pode ser limitado a Lua/Nakshatra para o ano.

---

## 3. Ayurveda Engine (corporal)

**Estado atual:** Não existe; o Action Engine usa frases genéricas de prática (respiração, pausa, etc.).

**Objetivo:** Sugerir práticas corporais e rotinas alinhadas ao mapa (dosha, constituição, momento do dia/estação).

**Entregas sugeridas:**

- **Constituição (dosha)** — derivar Vata/Pitta/Kapha (ou predominância) a partir do mapa (ex.: elementos por signos planetários, Lua, Ascendente) e/ou perguntas simples (opcional).
- **Insights Ayurveda** — novo sistema em `lib/insights/` (ex.: `ayurveda.dosha.*`, `ayurveda.season.*`) com regras determinísticas.
- **Dicionário** — `lib/dictionaries/ayurveda.ts` ou `action.ts` ampliado com frases de prática (respiração, alimentação, movimento) por dosha/momento.
- **Action Engine** — além das frases atuais, incluir sugestões de prática corporal (ex.: “Prática mínima: 7 respirações lentas ao acordar”) baseadas em insights Ayurveda quando disponíveis.

**Nota:** Pode começar com regras simples (ex.: Lua em signos de fogo → Pitta; Lua em signos de ar → Vata) e expandir depois com estação do ano, hora do dia, etc.

---

## Ordem sugerida

1. **Swiss Ephemeris** — integrar em `swissProvider.ts` (ver [SWISS_EPHEMERIS_INTEGRATION.md](./SWISS_EPHEMERIS_INTEGRATION.md)) para ter planetas completos e casas; habilita Human Design e trânsitos com mais precisão.
2. **Human Design real** — gates, canais, tipo, autoridade, perfil; alimentar `humanDesignEngine` e dicionários.
3. **Year Engine** — trânsitos e dashas; ampliar insights e dicionário para o tópico `year`.
4. **Ayurveda Engine** — dosha + práticas corporais; novos insights e Action.

Cada passo pode ser feito de forma incremental sem quebrar o pipeline atual.
