# Sistema financeiro — custos de IA, créditos e exportação

Sistema simples e auditável para rastrear custos de IA, consumo de créditos e exportação para contabilidade.

---

## Princípio

O Darshan tem dois modos:

1. **Offline** (biblioteca interna) → custo zero, não consome créditos.
2. **IA viva** (OpenAI, Anthropic ou Gemini) → custo variável; cada chamada é registrada e debita créditos.

Toda chamada paga é registrada com precisão (uso de tokens, custo estimado, créditos).

---

## O que é registrado (obrigatório)

Em cada chamada ao endpoint `/api/darshan` que usa IA, é gravado:

| Campo | Descrição |
|-------|-----------|
| **Identificação** | user_id (email/sessão), timestamp, provider (openai \| anthropic \| gemini), model |
| **Tokens e custo** | input_tokens, output_tokens, total_tokens, estimated_cost_usd, estimated_cost_brl |
| **Créditos** | credits_before, credits_after, credits_spent |
| **Contexto** | mode (now \| question), question_length, response_length |
| **Resultado** | success, safety_flags (quando aplicável) |

---

## Banco de dados (Supabase)

As tabelas ficam no Supabase. Migration em:

`supabase/migrations/20250129000000_finance_tables.sql`

### 1. `users`

- `id` (UUID, PK)
- `email` (único)
- `credits_balance` (inteiro ≥ 0)
- `plan` (ex.: free)
- `created_at`, `updated_at`

### 2. `ai_usage_log`

- `id`, `user_id` (FK users), `provider`, `model`
- `input_tokens`, `output_tokens`, `total_tokens`
- `cost_usd`, `cost_brl`
- `credits_spent`, `mode`, `question_length`, `response_length`
- `success`, `safety_flags`, `created_at`

### 3. `payments`

- `id`, `user_id` (FK users), `provider` (stripe \| mercadopago)
- `amount_brl`, `credits_added`, `status` (pending \| completed \| failed \| refunded)
- `external_id`, `created_at`

### 4. `credit_ledger` (auditável)

- `id`, `user_id` (FK users)
- `change_amount` (+/-)
- `reason` (purchase \| darshan_call \| admin_adjust)
- `related_usage_id` (FK ai_usage_log), `related_payment_id` (FK payments)
- `created_at`

---

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `PLATFORM_FEE_PERCENT` | Não (padrão: 30) | Taxa da plataforma em % (0–100). Usado em descrições e meta custo vs faturamento. Ver `lib/finance/platformFee.ts`. |
| `RATE_LIMIT_PER_MINUTE` | Não (padrão: 5) | Requisições de IA por minuto por usuário. 0 = desativado. Ver `lib/usageLimits.ts`. |
| `DAILY_AI_LIMIT` | Não (padrão: 30) | Respostas de IA por dia por usuário. 0 = desativado. Ver `lib/usageLimits.ts`. |
| `SUPABASE_URL` | Sim (para finance) | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Sim (para finance) | Chave de serviço (service role) do Supabase |
| `CONFIG_SECRET` | Sim (para export) | Código admin para exportação CSV |

Sem Supabase, o app continua usando **cookie** para créditos; o log de uso e o ledger não são gravados no banco.

---

## Lógica de créditos

- **Antes de chamar a IA:** verifica se `credits_balance` (ou cookie) ≥ 13 (ou valor configurado). Se não, retorna fallback offline.
- **Ao chamar a IA:** após resposta válida, debita créditos (13 por revelação) e registra no `credit_ledger` com `reason = darshan_call` e `related_usage_id` apontando para o registro em `ai_usage_log`.

---

## Estimativa de custo

Função: `estimateCost(provider, input_tokens, output_tokens)` em `lib/finance/costEstimator.ts`.

Tabela interna (por 1M tokens, USD):

| Provedor | Input (1M) | Output (1M) |
|----------|------------|-------------|
| OpenAI (mini) | $0.15 | $0.60 |
| Anthropic | $3 | $15 |
| Gemini (Flash) | $0.35 | $0.53 |

Conversão USD → BRL: valor fixo configurável (padrão 5.0); use `setUsdToBrl(rate)` para ajustar. Opcionalmente, `refreshUsdToBrlCache()` busca cotação na [DolarAPI](https://br.dolarapi.com) com **cache de 24h** (chamada só quando o cache expira; usado em `/api/darshan` antes de `estimateCost`).

---

## Exportação financeira (admin)

Requer `CONFIG_SECRET` no header ou query:

- **Header:** `X-Config-Key: <CONFIG_SECRET>` ou `Authorization: Bearer <CONFIG_SECRET>`
- **Query:** `?key=<CONFIG_SECRET>`

### GET /api/admin/export-usage

CSV com uso de IA no período.

**Query:** `range=day|week|month` (padrão: month)

**Colunas:** user_id (email), provider, total_calls, total_tokens, total_cost_brl, credits_spent, revenue_estimate

Exemplo:

```bash
curl -H "X-Config-Key: SEU_CONFIG_SECRET" "https://seu-dominio.com/api/admin/export-usage?range=month"
```

### GET /api/admin/export-payments

CSV com pagamentos.

**Colunas:** user_id (email), amount_brl, credits_added, status, created_at

Exemplo:

```bash
curl -H "X-Config-Key: SEU_CONFIG_SECRET" "https://seu-dominio.com/api/admin/export-payments"
```

---

## Arquitetura (lib/finance)

| Arquivo | Responsabilidade |
|---------|-------------------|
| `costEstimator.ts` | estimateCost(provider, input_tokens, output_tokens); taxas e USD→BRL |
| `creditsManager.ts` | getCreditsBalance, debitCredits, addCredits, recordPayment, addCreditsForPurchase; users + payments + credit_ledger |
| `usageLogger.ts` | logAiUsage; grava em ai_usage_log |
| `exportCsv.ts` | usageToCsv, paymentsToCsv; geração de CSV |
| `types.ts` | AiUsageEntry, AiUsageProvider, UsageMode |

Não mistura com UI; usado apenas em API e server.

---

## Fluxo em /api/darshan

1. Verifica sessão e saldo (cookie ou Supabase).
2. Chama o conector de IA; obtém `text` e `usage` (tokens).
3. Após resposta válida:
   - Calcula custo com `estimateCost`.
   - Grava em `ai_usage_log` com `logAiUsage`.
   - Debita créditos com `debitCredits(..., relatedUsageId)`.
4. Atualiza cookie de créditos e retorna resposta.

---

## Checkout e pagamentos

- **POST /api/checkout/fulfill:** após confirmar pagamento Stripe, chama `addCreditsForPurchase`, que:
  - Com Supabase: insere em `payments` (provider: stripe, amount_brl, credits_added, status: completed, external_id: sessionId) e em `credit_ledger` (reason: purchase, related_payment_id).
  - Sem Supabase: soma créditos ao cookie.
- **GET /api/credits:** usa `getCreditsBalance(session.email, fromCookie)`; quando Supabase está configurado, retorna o saldo do banco.

---

## Próximos passos (após instalar a lib)

1. **Aplicar a migration**
   - No [Supabase Dashboard](https://app.supabase.com) → SQL Editor, cole o conteúdo de `supabase/migrations/20250129000000_finance_tables.sql` e execute.
   - Ou, com Supabase CLI: `supabase db push`.

2. **Configurar variáveis**
   - No `.env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (e `CONFIG_SECRET` para exportação CSV).

3. **Testar**
   - Fazer login, comprar créditos via Stripe; em seguida conferir em `payments` e `credit_ledger` no Supabase.
   - Fazer uma revelação com IA e conferir em `ai_usage_log` e `credit_ledger`.
   - Exportar CSV: `GET /api/admin/export-usage?range=month` e `GET /api/admin/export-payments` com header `X-Config-Key: <CONFIG_SECRET>`.
