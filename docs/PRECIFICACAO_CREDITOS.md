# DARSHAN — Precificação por Créditos (OpenAI + Gemini) — v0.1

## Objetivo
Criar planos **muito acessíveis** (primeiro plano < R$10) usando **Fibonacci** como padrão organizador, mantendo:
- previsibilidade de custo
- margem saudável
- controle de consumo (sem "estourar" a conta de IA)

O Darshan já possui um modo offline (biblioteca/dicionário). A IA é um "modo vivo", pago por créditos.

---

## Conceitos

### O que é 1 crédito
- **1 crédito = 1 resposta com IA (1 consulta)** — modo ritual (curto), padrão.

Multiplicadores opcionais (futuro):
- Resposta **curta** (ritual): 1 crédito  
- Resposta **longa** (ensaio): 2 créditos  
- Resposta **longa + imagem/sigil**: 3 créditos  

**Recomendação Darshan:** manter o padrão "ritual" (1 crédito) como default.

---

## Planos Fibonacci (implementados)

### Série de créditos (Fibonacci)
- 13 créditos (Semente)
- 21 créditos (Trilho)
- 34 créditos (Caminho)
- 55 créditos (Portal)
- 89 créditos (Jornada)

### Preços (primeiro < R$10)
- R$ **8,90** — Semente (13 luzes)
- R$ **13,90** — Trilho (21 luzes)
- R$ **21,90** — Caminho (34 luzes)
- R$ **34,90** — Portal (55 luzes)
- R$ **55,90** — Jornada (89 luzes)

Constantes em código: `lib/credits.ts` — `CREDITS_PER_AI_REQUEST = 1`, `CREDIT_PACKAGES`.

---

## Regras de consumo
- 1 consulta = 1 crédito (modo ritual, curto). Multiplicadores: ritual=1, longo (aprofundar)=2, longo+imagem/sigil=3 — ver `getCreditsForRevelation(mode)` em `lib/credits.ts`.
- **Rate limit:** `RATE_LIMIT_PER_MINUTE` (0 = desativado; padrão 5 req/min por usuário). Implementado em `lib/usageLimits.ts` e aplicado em `POST /api/darshan`.
- **Limite diário:** `DAILY_AI_LIMIT` (0 = desativado; padrão 30 respostas/dia por usuário). Com Supabase usa contagem em `ai_usage_log`; sem Supabase usa contagem in-memory.

---

## Experiência do usuário
A interface mantém o **padrão de limpeza visual** já adotado no Darshan. Textos e botões ficam mínimos e consistentes com o produto; esta doc não prescreve copy obrigatório na UI — use o que couber sem poluir.
- Sem créditos: indicar saldo zero e ação de recarga (ex. botão de créditos / recarregar).
- Recarga: planos Semente, Trilho, Caminho, Portal, Jornada (labels em `lib/credits.ts`).

---

## Custo IA e margem (referência)
- Custo unitário por consulta (OpenAI/Gemini) tende a **centavos** (Cenário A curto: ~R$0,002–0,02; Cenário B longo: ~R$0,01–0,05).
- Meta: custo de IA **&lt; 10–20%** do faturamento.
- Receita por crédito nos planos: ~R$0,63–0,68; margem bruta estimada: alta.

### Taxa da plataforma (configurável)
A **taxa da plataforma** (margem usada em descrições e metas) é configurável por ambiente:
- **Variável:** `PLATFORM_FEE_PERCENT` (0–100). Padrão: 30.
- **Uso:** `lib/finance/platformFee.ts` — `getPlatformFeePercent()`, `getPlatformFeeDecimal()`.
- **API:** `GET /api/credits/cost` retorna `platformFeePercent` e descrição dinâmica.
- Ajuste o valor conforme a meta de margem (ex.: 20 para crescimento, 30 padrão).

---

## Recalcular com valores reais
1. Meça tokens médios por consulta (`input_tokens`, `output_tokens`).
2. Use preços por 1M tokens do provedor (ver `lib/finance/costEstimator.ts`).
3. Custo = (input × price_in + output × price_out) / 1_000_000; converta para BRL.
4. Ajuste pacotes e `setUsdToBrl()` conforme câmbio.
