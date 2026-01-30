# Destravar build: encerra Node, limpa cache e roda build
# Execute no PowerShell fora do Cursor: .\build-local.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Encerrando processos Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Limpando pastas de cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

Write-Host "Rodando build..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build concluido. Para testar: npm run start" -ForegroundColor Green
} else {
    Write-Host "Build falhou. Tente: npm run dev (modo desenvolvimento)" -ForegroundColor Red
}
