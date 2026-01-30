# Darshan — Luz do Tempo

**Oráculo minimalista do presente.** Não prevê; revela. Experiência ritual de silêncio, clareza simbólica e ação mínima correta.

---

## O que é

Darshan devolve o usuário a:

- presença  
- o momento vivo  
- fluxo emocional  
- consciência corporal  
- um passo por vez  

Não é sobre informação em excesso nem fatalismo.  
É uma chave, revelada em camadas.

---

## Experiência central

Uma única interface. Sempre.

O usuário entra com:

- uma pergunta  
- ou nada  

Darshan responde com uma **revelação em fases** (ritual): Luz, Jyotish, arquétipo, elemento, consciência, prática mínima e pergunta de presença. Cada revelação com IA consome créditos; o modo “oráculo offline” não consome créditos.

---

## Governança

O Darshan é guiado por:

- o Protocolo Darshan (revelação não fatalista)  
- Ayurveda como equilíbrio (não como medicina)  
- os 12 Pétalas da Mãe (Sri Aurobindo)  

Paz, sinceridade, equanimidade.

---

## Stack técnico

- **Next.js 15** (App Router)  
- **Auth:** sessão em cookie; login por código (Resend) ou Google OAuth  
- **IA:** OpenAI, Anthropic ou Google (Gemini) — configurável  
- **Pagamentos:** Stripe (cartão, Google Pay, Stripe Link) e/ou Mercado Pago (PIX, cartão)  
- **Opcional:** Supabase (log de uso, ledger, export CSV)  

---

## Documentação

Toda a documentação está em **`docs/`**. Índice completo por tema:

**[→ docs/README.md — Índice da documentação](docs/README.md)**

Resumo por categoria:

| Tema | Documentos principais |
|------|------------------------|
| **Visão e produto** | [PRODUCT_VISION](docs/PRODUCT_VISION.md), [ORACLE_CONSTITUTION](docs/ORACLE_CONSTITUTION.md), [TWELVE_PETALS_GOVERNANCE](docs/TWELVE_PETALS_GOVERNANCE.md) |
| **Fluxos e regras** | [FLUXO_E_REGRAS](docs/FLUXO_E_REGRAS.md), [FLUXO_ORACULO_OFFLINE](docs/FLUXO_ORACULO_OFFLINE.md) |
| **Auth e pagamentos** | [AUTH_CREDITS_GOOGLE_PAY](docs/AUTH_CREDITS_GOOGLE_PAY.md), [PAYMENTS_MERCADOPAGO](docs/PAYMENTS_MERCADOPAGO.md), [PRECIFICACAO_CREDITOS](docs/PRECIFICACAO_CREDITOS.md) |
| **Deploy e release** | [DEPLOY_INFRA](docs/DEPLOY_INFRA.md), [DEPLOY_WORKFLOWS](docs/DEPLOY_WORKFLOWS.md), [VERSIONING_AND_DEPLOY](docs/VERSIONING_AND_DEPLOY.md), [BUILD_RELEASE](docs/BUILD_RELEASE.md) |
| **API e arquitetura** | [API_SPEC](docs/API_SPEC.md), [TECH_ARCHITECTURE](docs/TECH_ARCHITECTURE.md) |
| **Admin e operação** | [ADMIN_CONFIG_ACCESS](docs/ADMIN_CONFIG_ACCESS.md), [LAUNCH_CHECKLIST](docs/LAUNCH_CHECKLIST.md) |

---

## Ambiente

Use **`.env.example`** como modelo. Variáveis principais:

- **IA:** `GOOGLE_AI_API_KEY` e/ou `OPENAI_API_KEY` e/ou `ANTHROPIC_API_KEY`  
- **Auth:** `RESEND_API_KEY`, `RESEND_FROM` (código por e-mail); `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google)  
- **Pagamento:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e/ou `MERCADOPAGO_ACCESS_TOKEN`  
- **Admin:** `CONFIG_SECRET` (página /config e export CSV)  

Detalhes: [DEPLOY_INFRA](docs/DEPLOY_INFRA.md) e [LAUNCH_CHECKLIST](docs/LAUNCH_CHECKLIST.md).

---

## Aviso

Darshan é uma ferramenta de presença e bem-estar.  
Não substitui cuidados médicos ou psicológicos.

---

## Licença

MIT — ver [LICENSE](LICENSE).

---

## Repositório (GitHub)

- **Descrição sugerida (About):** *Oráculo minimalista do presente. Next.js, Stripe, Mercado Pago, deploy por versão.*
- **Tópicos (Topics):** `nextjs` `oracle` `ritual` `minimal` `presence` `stripe` `mercadopago` `vercel` `typescript`
