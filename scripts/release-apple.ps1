# Fluxo de release para Apple (App Store / TestFlight)
# Uso: .\scripts\release-apple.ps1 [--bump patch|minor|major] [--bundle] [--skip-build]
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

Write-Host "=== Release Apple (App Store) ===" -ForegroundColor Cyan

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
Write-Host "--- Proximos passos (Apple) ---" -ForegroundColor Green
Write-Host "1. Web/PWA: faça deploy do build. No iOS o usuario pode 'Adicionar à Tela de Inicio' (PWA)."
Write-Host "2. App Store (app nativo com Capacitor):"
Write-Host "   - Requer macOS e Xcode. Adicione Capacitor: npx cap add ios && npx cap sync"
Write-Host "   - Abra ios/App/App.xcworkspace no Xcode, configure signing e versao (CFBundleShortVersionString)."
Write-Host "   - Archive > Distribute App > App Store Connect. Ou TestFlight para testes."
Write-Host "3. App Store Connect: https://appstoreconnect.apple.com - crie app, preencha metadados, envie o build via Xcode."
Write-Host ""
