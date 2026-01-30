# Build, Bump e Release — Android e Apple

Processo para gerar o artefato do app, fazer bump de versão e publicar nas lojas (Google Play e App Store).

---

## 1. Estratégia de versão (SemVer)

Versão no `package.json`: **MAJOR.MINOR.PATCH** (ex.: `0.1.0`).

| Tipo   | Quando usar              | Exemplo    |
|--------|---------------------------|------------|
| **patch** | Correções, pequenos ajustes | 0.1.0 → 0.1.1 |
| **minor** | Novas funcionalidades (compatível) | 0.1.1 → 0.2.0 |
| **major** | Mudanças incompatíveis    | 0.2.0 → 1.0.0 |

---

## 2. Bump de versão

### Script

```bash
node scripts/bump-version.js [patch|minor|major] [--tag] [--no-git]
```

- **patch | minor | major** — tipo do bump.
- **--tag** — cria commit em `package.json` e tag git `vX.Y.Z`.
- **--no-git** — não tenta commit nem tag (útil em CI).

### NPM scripts

| Comando            | Ação                          |
|--------------------|--------------------------------|
| `npm run version:patch` | Bump patch (0.1.0 → 0.1.1)     |
| `npm run version:minor` | Bump minor (0.1.1 → 0.2.0)     |
| `npm run version:major` | Bump major (0.2.0 → 1.0.0)     |

Exemplo com tag:

```bash
npm run version:patch -- --tag
```

---

## 3. Bundle (artefato)

Gera o build Next.js e empacota em um arquivo para deploy ou distribuição.

### PowerShell (Windows)

```powershell
.\scripts\bundle-artifact.ps1 [--version 1.2.3]
```

### Bash (Linux / macOS)

```bash
chmod +x scripts/bundle-artifact.sh
./scripts/bundle-artifact.sh [--version 1.2.3]
```

### NPM (cross-platform)

```bash
npm run bundle:artifact
```

Gera o build e o artefato em `dist/darshan-<versão>-<timestamp>.zip` (Windows) ou `.tar.gz` (Unix). Usa `scripts/bundle-artifact.js`.

### Saída

- **Pasta de build:** `build/` (Next.js, já gerada por `npm run build`).
- **Artefato empacotado:** `dist/darshan-<versão>-<timestamp>.zip` (Windows) ou `.tar.gz` (Unix).
  - Contém: `build/`, `package.json`, `package-lock.json`, `.env.example`, `VERSION`.

### Uso do artefato

- **Deploy serverless (Vercel, etc.):** use o conteúdo de `build/` ou faça deploy direto do repositório.
- **Deploy em servidor:** extraia o zip no servidor, `npm ci --omit=dev`, `npm run start`.
- **Mobile (Capacitor):** use o build como base; o passo de “bundle” ajuda a ter um pacote versionado antes de rodar `cap sync`.

---

## 4. Release Android (Google Play)

### Opção A: PWA / Web

1. Faça deploy do app (ex.: Vercel).
2. No Android, o usuário abre o site no Chrome e usa **“Adicionar à tela inicial”** (PWA).
3. Não é necessário publicar na Play Store para esse fluxo.

### Opção B: App na Play Store (TWA — Trusted Web Activity)

1. **Bump e build:**
   ```powershell
   .\scripts\release-android.ps1 --bump patch --bundle
   ```
2. **Bubblewrap** (empacota a URL do seu site em um app Android):
   - Instale: `npm install -g @bubblewrap/cli`
   - Inicialize: `bubblewrap init` (informe a URL do seu app em produção).
   - Gere o AAB: `bubblewrap build` (saída em `app-release.aab`).
3. **Play Console:** [Google Play Console](https://play.google.com/console) → criar app (ou usar existente) → Produção ou teste interno → upload do AAB.
4. Preencha ficha da loja (descrição, screenshots, política de privacidade) e envie para revisão.

### Opção C: App nativo (Capacitor)

1. Adicione Capacitor e a plataforma Android:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Darshan" "com.seudominio.darshan"
   npx cap add android
   ```
2. Configure `capacitor.config.ts` com a URL do seu app (ou use build local).
3. Após cada build web: `npx cap sync android`.
4. Abra o projeto Android: `npx cap open android` (Android Studio).
5. Em Android Studio: **Build > Generate Signed Bundle / APK** → AAB → assine e gere o `app-release.aab`.
6. Envie o AAB na Play Console (como na opção B).

### Script de release Android

```powershell
.\scripts\release-android.ps1 [--bump patch|minor|major] [--bundle] [--skip-build]
```

- **--bump** — bump de versão antes do build.
- **--bundle** — gera o zip do artefato em `dist/`.
- **--skip-build** — não roda build (apenas imprime os próximos passos).

---

## 5. Release Apple (App Store)

### Opção A: PWA / Web

1. Faça deploy do app.
2. No iOS, o usuário abre no Safari e usa **“Adicionar à Tela de Início”** (PWA).
3. Não é necessário publicar na App Store para esse fluxo.

### Opção B: App na App Store (Capacitor + Xcode)

Requer **macOS** e **Xcode**.

1. **Bump e build:**
   ```powershell
   .\scripts\release-apple.ps1 --bump patch --bundle
   ```
2. **Capacitor iOS:**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init "Darshan" "com.seudominio.darshan"
   npx cap add ios
   npx cap sync ios
   ```
3. Abra no Xcode: `npx cap open ios` (ou abra `ios/App/App.xcworkspace`).
4. No Xcode:
   - Selecione o target **App**.
   - **Signing & Capabilities:** escolha seu Team e provisionamento.
   - **General:** defina **Version** (ex.: 1.0.0) e **Build** (ex.: 1).
5. **Archive:** **Product > Archive** → **Distribute App** → **App Store Connect** (ou TestFlight).
6. **App Store Connect:** [App Store Connect](https://appstoreconnect.apple.com) → crie o app (ou use existente) → preencha metadados, screenshots, política de privacidade → selecione o build enviado e envie para revisão.

### Script de release Apple

```powershell
.\scripts\release-apple.ps1 [--bump patch|minor|major] [--bundle] [--skip-build]
```

Parâmetros iguais ao do Android.

---

## 6. Resumo dos comandos

| Objetivo              | Comando |
|-----------------------|--------|
| Bump patch            | `npm run version:patch` |
| Bump minor            | `npm run version:minor` |
| Bump major            | `npm run version:major` |
| Bump + tag git        | `npm run version:patch:tag` (ou `minor`/`major`) |
| Build                 | `npm run build` |
| Artefato (zip/tar.gz) | `npm run bundle:artifact` (ou `.\scripts\bundle-artifact.ps1` / `./scripts/bundle-artifact.sh`) |
| Release Android       | `.\scripts\release-android.ps1 --bump patch --bundle` |
| Release Apple         | `.\scripts\release-apple.ps1 --bump patch --bundle` |

---

## 7. CI/CD (GitHub Actions)

As esteiras estão em `.github/workflows/`. **Versionamento e deploy por mudança de versão:** ver **`docs/VERSIONING_AND_DEPLOY.md`**.

| Workflow   | Gatilho              | O que faz |
|------------|----------------------|-----------|
| **CI**     | Push e PR em `main`   | Lint, test, build; upload do `build/` (1 dia). |
| **Deploy** | Push em `main` ou manual | Build + deploy produção na Vercel (secrets configurados). |
| **Release**| Release publicado ou tag `v*` | Versão da tag; build, bundle, **GitHub Release** (em push de tag), deploy opcional na Vercel. |

### Habilitar deploy automático (Release / Deploy)

Em **Settings > Secrets and variables > Actions** do repositório, crie:

- `VERCEL_TOKEN` — token da Vercel (Account > Tokens).
- `VERCEL_ORG_ID` — ID da organização (Vercel dashboard).
- `VERCEL_PROJECT_ID` — ID do projeto (Settings do projeto).

Sem esses secrets, o job **Deploy** da esteira Release é ignorado (sucesso sem deploy); a esteira Deploy falha com mensagem clara.

### Fluxo de release (deploy por versão)

1. `npm run version:patch:tag` (ou minor/major) — atualiza `package.json`, commit e tag `vX.Y.Z`.
2. `git push origin main` e `git push origin vX.Y.Z` — dispara a esteira **Release**: build, artefato, GitHub Release com o tarball e deploy na Vercel.

Detalhes: **`docs/VERSIONING_AND_DEPLOY.md`**, **`docs/DEPLOY_WORKFLOWS.md`**.

### Outros (sugestão)

- **Android:** em CI com Bubblewrap ou Capacitor, gerar o AAB e enviar para Play Console.
- **Apple:** build e upload do IPA no macOS (Xcode Cloud ou Fastlane).
