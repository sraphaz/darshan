# Arquitetura Técnica Minimal — Darshan

## Stack
- Next.js
- Supabase (auth + perfil)
- OpenAI API

## Pagamentos
- Stripe (internacional)
- Mercado Pago (Brasil: PIX + cartão)

Fluxo:
User → Paywall → Mercado Pago Checkout → Webhook → Premium Enabled

## Fluxo do Oráculo
Input → TimePulse → Prompt → JSON 7 steps → Reveal UI

## Regra
Uma tela para sempre.
Profundidade no backend.
