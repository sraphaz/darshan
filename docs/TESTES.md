# Testes e cobertura

## Executar

```bash
npm install   # se ainda não instalou as deps (inclui Jest)
npm test      # roda os testes
npm run test:coverage   # testes + relatório de cobertura
```

## Meta de cobertura

- **90%** em linhas, funções e statements; **85%** em branches (configurado em `jest.config.mjs`).
- Cobertura é coletada apenas em **`lib/`**, exceto:
  - `lib/ai/**`, `lib/knowledge/**` (APIs externas e dados)
  - `lib/darshanPrompt.ts`, `lib/configStore.ts`, `lib/oracleOffline.ts`, `lib/email.ts`, `lib/userProfile.ts`, `lib/timepulse.ts`
  - `lib/**/index.ts`, `lib/**/types.ts` (re-exports e tipos)

## O que está coberto

- **lib/credits.ts** — formatPriceBRL, getCreditsFromCookie (incl. decodeURIComponent), creditsCookieHeader, clearCreditsCookieHeader
- **lib/auth.ts** — getSessionFromCookie (incl. null, malformado, email vazio), sessionCookieHeader, clearSessionCookieHeader
- **lib/dateFormatBr.ts** — toBrDate, fromBrDate (incl. ano 1900–2100), maskBrDate, maskBrTime, fromBrTime (incl. &lt; 3 dígitos)
- **lib/darshan.ts** — PHASE_NAMES
- **lib/stripe.ts** — getStripe, isStripeConfigured (com mock)
- **lib/supabase.ts** — getSupabase, isSupabaseConfigured (com mock)
- **lib/adminAuth.ts** — getSecretFromRequest (header, Bearer, query), checkAdminAuth (503, 401, ok)
- **lib/finance/costEstimator.ts** — setUsdToBrl, getUsdToBrl, estimateCost (openai, gemini, anthropic), getRates, refreshUsdToBrlCache (fetch ok, falha, JSON inválido, catch)
- **lib/finance/exportCsv.ts** — usageToCsv, paymentsToCsv (incl. escape vírgula/newline)
- **lib/finance/creditsManager.ts** — sem Supabase: getCreditsBalance, debitCredits, addCredits, recordPayment, addCreditsForPurchase; com Supabase (mock): getCreditsBalance (user existe/insere), debitCredits (user existe/cria/update erro/insert null), addCredits (existe/cria/insert null), recordPayment (existe/cria/insert null), addCreditsForPurchase
- **lib/finance/usageLogger.ts** — sem Supabase: null; com Supabase (mock): user existe + insert ok, user não existe + insert, insert falha (error), userEmail vazio sem userTableId
- **lib/logger.ts** — logger.debug, info, warn, error; appendFileSync throw; mkdirSync quando dir não existe; não chama mkdir quando existe
- **lib/audit.ts** — audit com/sem details; appendFileSync throw (catch)

## CI

O workflow em `.github/workflows/ci.yml` (se existir) deve rodar `npm run test:coverage` e falhar se a cobertura ficar abaixo do threshold.
