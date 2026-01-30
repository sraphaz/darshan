# Esteiras de deploy (GitHub Actions)

Resumo das workflows de CI e deploy e como configurar os secrets para deploy na Vercel.  
**Arquivos:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/release.yml`.  
**Ver também:** `docs/DEPLOY_INFRA.md` (infra e variáveis de ambiente).

---

## Workflows

| Workflow   | Arquivo           | Gatilho                    | O que faz |
|------------|-------------------|----------------------------|-----------|
| **CI**     | `ci.yml`          | Push e PR em `main`/`master` | Lint, test, build; upload do artefato `build/` (1 dia). |
| **Deploy** | `deploy.yml`      | Push em `main`/`master` e `workflow_dispatch` | Verifica secrets → build → deploy **produção** na Vercel. Falha se secrets ausentes. |
| **Release**| `release.yml`     | Release publicado ou tag `v*` | Build, bundle artefato, upload; deploy opcional (se secrets configurados). |

---

## Deploy na Vercel (secrets)

Para a esteira **Deploy** (e o deploy opcional da **Release**) publicar na Vercel, configure estes **secrets** no repositório:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret             | Onde obter |
|--------------------|------------|
| **VERCEL_TOKEN**   | [Vercel → Account → Tokens](https://vercel.com/account/tokens): crie um token com escopo **Full Account** (ou o mínimo necessário para deploy). |
| **VERCEL_ORG_ID**  | No [Vercel Dashboard](https://vercel.com/dashboard): projeto → **Settings → General**. Campo **Project ID** (ou em **Team/Org**: ID da organização). Ou rode `vercel link` localmente e veja em `.vercel/project.json` o `orgId`. |
| **VERCEL_PROJECT_ID** | No Vercel: projeto → **Settings → General**. Campo **Project ID**. Ou em `.vercel/project.json` após `vercel link` (campo `projectId`). |

### Obter IDs via CLI (opcional)

```bash
npm i -g vercel
vercel login
vercel link
# Abra .vercel/project.json: orgId = VERCEL_ORG_ID, projectId = VERCEL_PROJECT_ID
```

---

## Comportamento

### CI (`ci.yml`)

- Roda em **todo push e em todo PR** para `main` ou `master`.
- Não faz deploy; só valida (lint, test, build).
- Útil para garantir que o merge não quebra o build.

### Deploy (`deploy.yml`)

- Roda em **push em `main`** (ou `master`) e em **execução manual** (Actions → Deploy → Run workflow).
- **Primeiro passo:** verifica se `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` existem.
  - Se **falhar algum:** o job falha com mensagem indicando qual secret falta e o link desta doc.
  - Se **todos existirem:** faz checkout, restore de cache (npm + Next.js), `npm ci`, `npm run build`, deploy na Vercel com `--prod`.
- É a esteira principal de **deploy contínuo** ao mergear em `main`.

### Release (`release.yml`)

- Roda ao **publicar uma release** ou ao dar **push em tag `v*`** (ex.: `v0.1.0`).
- Sempre: build, geração do artefato (bundle) e upload do artefato.
- Deploy na Vercel **só roda** se os três secrets estiverem configurados; caso contrário, o deploy é ignorado e a workflow termina em sucesso (artefato fica disponível).

---

## Cache

- **npm:** cache de dependências (via `actions/setup-node` com `cache: "npm"`).
- **Next.js:** na **Deploy**, o diretório `.next/cache` é restaurado/guardado com `actions/cache@v4` para acelerar builds seguintes.

---

## Resumo rápido

1. **Só CI (sem deploy):** não é preciso configurar nenhum secret; as workflows de deploy vão falhar ou ser ignoradas.
2. **Deploy em todo push em `main`:** configure **VERCEL_TOKEN**, **VERCEL_ORG_ID** e **VERCEL_PROJECT_ID** nos secrets do repositório; a workflow **Deploy** fará o deploy em produção.
3. **Deploy também em release/tag:** com os mesmos secrets, a **Release** também fará deploy quando houver release publicada ou tag `v*`.

---

## Configurar as esteiras (passo a passo)

1. **Secrets (para deploy na Vercel)**  
   No GitHub: **Settings → Secrets and variables → Actions → New repository secret**.  
   Crie: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (valores conforme tabela acima).

2. **Ver execuções**  
   Aba **Actions** do repositório: cada push/PR em `main` dispara **CI**; cada push em `main` dispara **Deploy** (se os secrets estiverem configurados).

3. **Disparar Release**  
   Crie uma tag `v*` (ex.: `v0.1.0`) e dê push, ou publique uma **Release** em **Releases**. A esteira **Release** gera o artefato e, se os secrets existirem, faz deploy na Vercel.

4. **Deploy manual**  
   Em **Actions → Deploy → Run workflow** você pode rodar a esteira de deploy sem dar push em `main`.

Ver também: `docs/DEPLOY_INFRA.md`, `docs/BUILD_RELEASE.md`.
