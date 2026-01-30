# Fluxo de release para Android (Google Play)
# Uso: .\scripts\release-android.ps1 [--bump patch|minor|major] [--bundle] [--skip-build]
# --bump: faz bump de versão antes do build
# --bundle: gera o zip do artefato em dist/
# --skip-build: não roda build (apenas instruções)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptRoot "..")

$Bump = ""
$Bundle = $false
$SkipBuild = $false
for ($i = 0; $i -lt $args.Count; $i++) {
    if ($args[$i] -eq "--bump" -and $i + 1 -lt $args.Count) { $Bump = $args[$i + 1]; $i++ }
    elseif ($args[$i] -eq "--bundle") { $Bundle = $true }
    elseif ($args[$i] -eq "--skip-build") { $SkipBuild = $true }
}

Write-Host "=== Release Android (Google Play) ===" -ForegroundColor Cyan

if ($Bump -match "^(patch|minor|major)$") {
    Write-Host "Bump de versao: $Bump" -ForegroundColor Yellow
    node scripts/bump-version.js $Bump --no-git
}

if (-not $SkipBuild) {
    Write-Host "Build Next.js..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($Bundle) {
    Write-Host "Gerando artefato (zip)..." -ForegroundColor Yellow
    & (Join-Path $scriptRoot "bundle-artifact.ps1")
}

Write-Host ""
Write-Host "--- Proximos passos (Android) ---" -ForegroundColor Green
Write-Host "1. Web/PWA: faça deploy do build (Vercel, etc.). O app pode ser 'Adicionar à tela inicial' no Android."
Write-Host "2. Google Play (TWA ou app nativo):"
Write-Host "   - TWA (Trusted Web Activity): use bubblewrap para empacotar a URL do seu site em um APK/AAB."
Write-Host "     https://github.com/GoogleChromeLabs/bubblewrap"
Write-Host "   - Ou adicione Capacitor ao projeto e gere o AAB: npx cap add android && npx cap sync && (em android/) ./gradlew bundleRelease"
Write-Host "3. Play Console: https://play.google.com/console - crie app, faça upload do AAB, preencha loja e envie para revisao."
Write-Host ""
