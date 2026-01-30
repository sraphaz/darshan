# Versionamento e deploy por mudança de versão

Este documento descreve a **fonte da versão**, o **fluxo de bump** e como o **deploy em produção** é disparado pela **mudança de versão** (tag `v*`).

---

## 1. Fonte da versão

A versão do app é a **única fonte de verdade** em:

- **`package.json`** — campo `version` (ex.: `"0.1.0"`).

Toda a pipeline de release (build, artefato, GitHub Release, deploy) usa essa versão. Ao criar uma **tag git** `vX.Y.Z`, ela deve corresponder ao `version` do `package.json`; a esteira **Release** falha se não coincidir.

---

## 2. SemVer (MAJOR.MINOR.PATCH)

| Tipo    | Quando usar                    | Exemplo     |
|---------|----------------------------------|-------------|
| **patch** | Correções, pequenos ajustes     | 0.1.0 → 0.1.1 |
| **minor** | Novas funcionalidades compatíveis | 0.1.1 → 0.2.0 |
| **major** | Mudanças incompatíveis          | 0.2.0 → 1.0.0 |

---

## 3. Fluxo: bump → tag → push → deploy

O **deploy em produção mediante mudança de versão** acontece quando você **dá push em uma tag `v*`**. A esteira **Release** roda: build, bundle, criação da **GitHub Release** (com o artefato anexado) e deploy na Vercel.

### Passo a passo

1. **Bump + tag (local)**  
   Escolha o tipo (patch, minor, major) e rode com `--tag` para atualizar `package.json`, criar commit e tag git:

   ```bash
   npm run version:patch:tag   # 0.1.0 → 0.1.1, commit + tag v0.1.1
   # ou
   npm run version:minor:tag   # 0.1.1 → 0.2.0, commit + tag v0.2.0
   npm run version:major:tag   # 0.2.0 → 1.0.0, commit + tag v1.0.0
   ```

   Isso executa `node scripts/bump-version.js <tipo> --tag`: altera `package.json`, faz commit e cria a tag `vX.Y.Z`.

2. **Push da branch e da tag**  
   Envie a branch (com o commit do bump) e a tag para o remoto:

   ```bash
   git push origin main
   git push origin v0.1.1
   ```

   Ou, se a tag já foi criada pelo script: `git push origin main --follow-tags` (ou `git push origin v0.1.1`).

3. **O que acontece no GitHub**  
   O **push da tag `v*`** dispara a esteira **Release** (`.github/workflows/release.yml`):

   - **Build & Bundle:** instala deps, restaura cache Next.js, faz build, gera o artefato (tarball) e faz upload como artifact.
   - **Create GitHub Release:** cria a release para essa tag e anexa o tarball (só em push de tag, não em “release published”).
   - **Deploy (Vercel):** se os secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estiverem configurados, faz deploy em **produção** na Vercel.

Ou seja: **mudança de versão = nova tag `v*` = Release workflow = deploy em produção** (além do artefato e da GitHub Release).

---

## 4. Comandos de versionamento

| Objetivo              | Comando |
|-----------------------|--------|
| Bump patch (só arquivo) | `npm run version:patch` |
| Bump minor (só arquivo) | `npm run version:minor` |
| Bump major (só arquivo) | `npm run version:major` |
| Bump patch + commit + tag | `npm run version:patch:tag` |
| Bump minor + commit + tag | `npm run version:minor:tag` |
| Bump major + commit + tag | `npm run version:major:tag` |

Script direto (sem npm):

```bash
node scripts/bump-version.js patch --tag    # bump + commit + tag
node scripts/bump-version.js patch --no-git  # só package.json (ex.: em CI)
```

---

## 5. Deploy contínuo vs deploy por versão

| Modo | Gatilho | Workflow | Uso |
|------|---------|----------|-----|
| **Deploy contínuo** | Push em `main` (ou `master`) | **Deploy** (`deploy.yml`) | Cada merge em `main` gera deploy em produção na Vercel. |
| **Deploy por versão** | Push da tag `v*` (ex.: `v0.1.1`) | **Release** (`release.yml`) | Build, artefato, GitHub Release e deploy em produção. Versão definida pela tag. |

- Se você quiser **produção só quando houver nova versão**, use apenas o fluxo de **tag** (bump + tag + push da tag) e opcionalmente desative ou deixe manual o **Deploy** em push para `main` (por exemplo, usando apenas `workflow_dispatch` no `deploy.yml`).
- Se quiser **produção a cada merge em `main`** e **também** artefato + release quando houver tag, mantenha as duas esteiras (Deploy + Release) como estão.

---

## 6. Verificação de versão na Release

Na esteira **Release**, quando o gatilho é **push de tag**:

- A versão usada no build e no artefato é obtida da **tag** (ex.: `v0.1.1` → `0.1.1`).
- Há um passo que **verifica** se o `version` do `package.json` (no commit da tag) é igual à versão da tag. Se forem diferentes, a workflow **falha**, com mensagem orientando o uso de `npm run version:patch:tag` (ou minor/major) e o push da branch e da tag.

Assim, a versão do artefato e da GitHub Release sempre bate com a tag e com o `package.json`.

---

## 7. Resumo rápido

1. **Versão** está em `package.json`.
2. **Bump com tag:** `npm run version:patch:tag` (ou minor/major).
3. **Enviar:** `git push origin main` e `git push origin vX.Y.Z` (ou `git push --follow-tags`).
4. O **push da tag** dispara a esteira **Release**: build, bundle, GitHub Release com artefato e deploy na Vercel (se os secrets estiverem configurados).

Ver também: `docs/DEPLOY_WORKFLOWS.md`, `docs/BUILD_RELEASE.md`, `docs/DEPLOY_INFRA.md`.
