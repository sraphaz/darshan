# Checklist de lançamento — Darshan

Use este checklist antes de colocar o app em produção.

---

## 1. Infra e deploy

- [ ] Repositório no GitHub (ou GitLab) e deploy configurado (ex.: Vercel).
- [ ] Domínio definido (ex.: `darshan.app` ou `*.vercel.app`).
- [ ] HTTPS ativo (Vercel/Netlify já fornecem).

---

## 2. Variáveis de ambiente (produção)

- [ ] **IA:** pelo menos uma chave: `GOOGLE_AI_API_KEY` e/ou `OPENAI_API_KEY` e/ou `ANTHROPIC_API_KEY`.
- [ ] **Auth (código por e-mail):** `RESEND_API_KEY` e `RESEND_FROM` (domínio verificado no Resend).
- [ ] **Auth (Google):** `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`; URIs de redirecionamento no Google Cloud incluem `https://seu-dominio.com/api/auth/callback/google`.
- [ ] **Pagamento:** pelo menos um:
  - [ ] Stripe: `STRIPE_SECRET_KEY`; no Stripe Dashboard, URLs de sucesso/cancelamento usam seu domínio. Para Google Pay: ative **Wallets** em Configurações > Métodos de pagamento. Recomendado: `STRIPE_WEBHOOK_SECRET` e endpoint `https://seu-dominio.com/api/webhooks/stripe` (evento `checkout.session.completed`).
  - [ ] Mercado Pago: `MERCADOPAGO_ACCESS_TOKEN`; a URL de notificação (`https://seu-dominio.com/api/webhooks/mercadopago`) deve ser acessível.
- [ ] **Financeiro (opcional):** `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`; migration aplicada no Supabase.
- [ ] **Admin:** `CONFIG_SECRET` definido (para página /config e exportação CSV).

---

## 3. Testes antes do lanço

- [ ] Login por código e por Google funcionando em produção.
- [ ] Comprar créditos: fluxo completo (modal → checkout → retorno → saldo atualizado).
- [ ] Revelação com IA consumindo créditos e atualizando saldo (e ledger, se Supabase).
- [ ] Página /config acessível apenas com `CONFIG_SECRET`.
- [ ] Exportação CSV (usage e payments) com header `X-Config-Key`.

---

## 4. Mercado Pago (se usar)

- [ ] Access Token de **produção** em `MERCADOPAGO_ACCESS_TOKEN`.
- [ ] Webhook recebendo notificações (verificar logs ou painel do MP).
- [ ] Teste de compra em produção (valor baixo) e confirmação de créditos + registro em `payments` (se Supabase).

---

## 5. Stripe (se usar)

- [ ] Chave **secreta** de produção (`sk_live_...`) em `STRIPE_SECRET_KEY`.
- [ ] URLs de sucesso e cancelamento no Stripe apontando para o domínio real.
- [ ] (Opcional) Webhook Stripe `checkout.session.completed` para creditar mesmo se o usuário não voltar à página.

---

## 6. Monitoramento e suporte

- [ ] Logs e auditoria (`LOG_DIR`, `audit`) revisados para não expor dados sensíveis.
- [ ] Página de suporte (?) com informações de contato e como adicionar créditos.
- [ ] Limites de uso (`RATE_LIMIT_PER_MINUTE`, `DAILY_AI_LIMIT`) definidos conforme política.

---

## Resumo mínimo para “lançar”

1. Deploy na Vercel (ou equivalente) com domínio e HTTPS.
2. Pelo menos uma API de IA configurada.
3. Auth (código por e-mail e/ou Google) configurada para produção.
4. Pelo menos um gateway de pagamento (Stripe ou Mercado Pago) em produção.
5. Teste completo: login → comprar créditos → usar revelação com IA.
6. `CONFIG_SECRET` definido e Supabase (opcional) com migration aplicada.

Depois disso, o app está pronto para uso real.
