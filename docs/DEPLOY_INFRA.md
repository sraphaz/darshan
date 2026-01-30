# Infraestrutura e deploy — Darshan

## É serverless?

**Depende de onde você faz o deploy:**

| Onde deploya | Modelo | Comportamento |
|---------------|--------|----------------|
| **Vercel** (recomendado) | Serverless | Cada rota em `app/api/*` vira uma **serverless function**; páginas podem ser estáticas ou SSR. Sem servidor fixo; paga por execução. |
| **Netlify** | Serverless | API routes viram Netlify Functions. |
| **AWS Amplify / Lambda@Edge** | Serverless | Next.js é adaptado para funções serverless. |
| **VPS, Railway, Render, Fly.io** (com `next start`) | **Não** serverless | Roda um processo Node contínuo (`next start`). Você paga por tempo de servidor ligado. |
| **Docker + VPS/Kubernetes** | **Não** serverless | Container com Node; `next start` rodando o tempo todo. |

O projeto é **Next.js 15 (App Router)** com rotas em `app/api/`. Não tem configuração especial de “serverless” no código: o mesmo código funciona em qualquer um dos cenários acima. **Se você subir na Vercel, sim, fica serverless.**

---

## Infra necessária (resumo)

### 1. Hospedagem da aplicação

- **Opção A (serverless):** [Vercel](https://vercel.com) — conecta ao GitHub, deploy automático a cada push. Grátis para hobby.
- **Opção B (servidor):** VPS (DigitalOcean, AWS EC2, etc.) ou PaaS (Railway, Render, Fly.io) — você roda `npm run build` e `npm run start` (ou usa Docker).

### 2. Variáveis de ambiente (produção)

Defina no painel da plataforma (Vercel → Settings → Environment Variables, etc.):

| Variável | Obrigatório para | Descrição |
|----------|-------------------|-----------|
| **IA** | | |
| `GOOGLE_AI_API_KEY` e/ou `OPENAI_API_KEY` e/ou `ANTHROPIC_API_KEY` | IA viva | Pelo menos um provedor para revelações com IA. |
| `DARSHAN_AI_PROVIDER` | Opcional | `openai` \| `anthropic` \| `google`. |
| **Auth** | | |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login com Google | OAuth no Google Cloud Console. |
| `RESEND_API_KEY`, `RESEND_FROM` | Código por e-mail em produção | Envio do código de login. |
| **Pagamento** | | |
| `STRIPE_SECRET_KEY` | Comprar créditos (Stripe) | Checkout + Google Pay + Stripe Link. |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe (recomendado) | Credita mesmo se o usuário não voltar à página (Google Pay, etc.). Ver Dashboard > Webhooks. |
| `MERCADOPAGO_ACCESS_TOKEN` | Comprar créditos (Mercado Pago) | Checkout Pro (PIX, cartão). Ver `docs/PAYMENTS_MERCADOPAGO.md`. |
| **Financeiro (opcional)** | | |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Log de uso, ledger, pagamentos | Banco para ai_usage_log, payments, credit_ledger. |
| **Admin** | | |
| `CONFIG_SECRET` | Página /config e export CSV | Código secreto para config e exportação. |

O restante (reCAPTCHA, DATA_DIR, LOG_DIR, etc.) segue o `.env.example`.

### 3. Serviços externos (se usar)

- **Supabase** — projeto + migration aplicada (`supabase/migrations/...`). Só precisa se for usar módulo financeiro (log de uso, pagamentos, export).
- **Stripe** — conta + chave secreta; em produção configure as URLs de sucesso/cancelamento do Checkout.
- **Mercado Pago** — aplicação + Access Token; em produção a `notification_url` deve ser acessível (ex.: `https://seu-dominio.com/api/webhooks/mercadopago`).
- **Resend** — conta + domínio verificado para envio de e-mail.
- **Google Cloud** — projeto para OAuth (Login com Google) e, se usar, Gemini (API key).

Nenhum desses exige servidor seu: são APIs externas. A aplicação em si pode ser 100% serverless (ex.: Vercel).

---

## Processo de deploy (recomendado: Vercel, serverless)

### Passo a passo

1. **Repositório**  
   Código no GitHub (ou GitLab/Bitbucket).

2. **Vercel**  
   - Acesse [vercel.com](https://vercel.com), login com GitHub.  
   - **Add New Project** → importe o repositório do Darshan.  
   - **Root Directory:** se o Next.js estiver numa subpasta (ex.: `darshan`), defina essa pasta como raiz do projeto.  
   - **Build Command:** `npm run build` (ou `pnpm build` / `yarn build`).  
   - **Output Directory:** deixe o padrão (Vercel detecta Next.js).  
   - **Install Command:** `npm install`.

3. **Variáveis de ambiente**  
   Em **Settings → Environment Variables**, crie cada variável listada acima para **Production** (e, se quiser, Preview).

4. **Deploy**  
   Clique em **Deploy**. O primeiro deploy roda o build; os próximos podem ser automáticos a cada push na branch conectada.

5. **Domínio**  
   Vercel oferece um domínio `*.vercel.app`. Em **Settings → Domains** você pode apontar um domínio próprio.

6. **Stripe (produção)**  
   No Stripe Dashboard, em **Checkout / redirects**, use as URLs do seu domínio (ex.: `https://seu-app.vercel.app/?checkout=success&session_id={CHECKOUT_SESSION_ID}`).

7. **Google OAuth (produção)**  
   No Google Cloud Console, em **Credenciais → URIs de redirecionamento**, adicione `https://seu-dominio.com/api/auth/callback/google`.

8. **Supabase (opcional)**  
   Rode a migration no projeto Supabase (SQL Editor ou `supabase db push`). Coloque `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` nas variáveis do Vercel.

Com isso, a aplicação sobe **serverless** na Vercel: cada chamada a `app/api/*` é uma função serverless; não há processo Node permanente.

---

## Esteiras de deploy (CI/CD)

As esteiras de **GitHub Actions** estão em `.github/workflows/`. Configuração detalhada e secrets: **`docs/DEPLOY_WORKFLOWS.md`**. **Versionamento e deploy por mudança de versão:** **`docs/VERSIONING_AND_DEPLOY.md`**.

| Esteira   | Arquivo       | Gatilho                         | O que faz |
|-----------|---------------|----------------------------------|-----------|
| **CI**    | `ci.yml`      | Push e PR em `main`/`master`    | Lint, test, build; artefato do build (1 dia). |
| **Deploy**| `deploy.yml`  | Push em `main`/`master` ou manual | Build + deploy **produção** na Vercel. Exige secrets (ver doc). |
| **Release** | `release.yml` | Release publicada ou tag `v*`  | Versão da tag; build, bundle, GitHub Release (push tag), deploy opcional na Vercel. Ver `docs/VERSIONING_AND_DEPLOY.md`. |

Para deploy automático na Vercel, configure no repositório (**Settings → Secrets and variables → Actions**) os secrets **VERCEL_TOKEN**, **VERCEL_ORG_ID** e **VERCEL_PROJECT_ID** (ver `docs/DEPLOY_WORKFLOWS.md`).

---

## Deploy com servidor (não serverless)

Se quiser rodar em VPS ou container:

1. No servidor (ou no Docker): `npm ci`, `npm run build`, `npm run start`.
2. Use um processo em segundo plano (systemd, PM2) ou um Dockerfile que rode `next start`.
3. Na frente, um reverse proxy (Nginx, Caddy) com HTTPS.
4. As mesmas variáveis de ambiente devem estar disponíveis no ambiente (arquivo `.env` ou variáveis do sistema/container).

Exemplo mínimo de **Dockerfile** (multi-stage):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Aqui **não** é serverless: um único processo Node atende todas as requisições.

---

## Build, bump e release (Android / Apple)

Para gerar o artefato, fazer bump de versão e publicar nas lojas, use os scripts e a documentação em **`docs/BUILD_RELEASE.md`**:

- **Bump:** `npm run version:patch` (ou `minor`/`major`); com tag git: `npm run version:patch:tag`.
- **Bundle:** `npm run build` (saída em `build/`); artefato zip/tar.gz: `npm run bundle:artifact` (saída em `dist/`).
- **Release Android:** `.\scripts\release-android.ps1 --bump patch --bundle` (depois: Play Console ou TWA/Capacitor).
- **Release Apple:** `.\scripts\release-apple.ps1 --bump patch --bundle` (depois: Xcode + App Store Connect).

---

## Resumo

| Pergunta | Resposta |
|----------|----------|
| O app é serverless? | **Sim**, se você fizer deploy na Vercel (ou Netlify, etc.). **Não**, se rodar `next start` em VPS/container. |
| Infra mínima para subir? | Hospedagem (ex.: Vercel) + variáveis de ambiente (pelo menos uma API de IA; auth e Stripe conforme uso). |
| Processo de deploy recomendado? | Repo no GitHub → Vercel → configurar env vars → Deploy. Opcional: Supabase, Stripe, Resend, Google OAuth conforme necessidade. |
| Esteiras de deploy (CI/CD)? | **CI** (lint/test/build), **Deploy** (push em `main` → Vercel) e **Release** (tag `v*` → artefato + GitHub Release + deploy). Versionamento: `docs/VERSIONING_AND_DEPLOY.md`, workflows: `docs/DEPLOY_WORKFLOWS.md`. |
