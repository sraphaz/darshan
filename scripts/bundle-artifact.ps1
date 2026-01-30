# Gera o artefato de deploy: build Next.js + empacota em zip
# Uso: .\scripts\bundle-artifact.ps1 [--version 1.2.3]
# Saída: dist/darshan-<version>-<timestamp>.zip (contém pasta build/ e arquivos úteis)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptRoot "..")

$version = "0.0.0"
foreach ($arg in $args) {
    if ($arg -eq "--version" -and $args[$args.IndexOf($arg) + 1]) {
        $version = $args[$args.IndexOf($arg) + 1]
        break
    }
}
if ($version -eq "0.0.0") {
    try {
        $pkg = Get-Content package.json -Raw | ConvertFrom-Json
        $version = $pkg.version
    } catch {
        $version = "0.1.0"
    }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$artifactName = "darshan-$version-$timestamp"
$distDir = "dist"
$zipName = "$artifactName.zip"

Write-Host "Versao: $version | Artefato: $zipName" -ForegroundColor Cyan

# Build
Write-Host "Rodando npm run build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Preparar pasta do artefato
$artifactDir = Join-Path $distDir $artifactName
if (Test-Path $artifactDir) { Remove-Item -Recurse -Force $artifactDir }
New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null

# Copiar build
Copy-Item -Recurse -Force build (Join-Path $artifactDir "build")
# Copiar arquivos úteis para deploy
foreach ($f in @("package.json", "package-lock.json", ".env.example")) {
    if (Test-Path $f) { Copy-Item -Force $f $artifactDir }
}
# Arquivo de versão
Set-Content -Path (Join-Path $artifactDir "VERSION") -Value "$version`n$timestamp"

# Zip
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }
$zipPath = Join-Path $distDir $zipName
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path (Join-Path $artifactDir "*") -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $artifactDir

Write-Host "Artefato gerado: $zipPath" -ForegroundColor Green
Write-Host "Para deploy: extraia o zip no servidor, npm ci --omit=dev e npm run start (ou use a pasta build com plataforma serverless)." -ForegroundColor Gray
