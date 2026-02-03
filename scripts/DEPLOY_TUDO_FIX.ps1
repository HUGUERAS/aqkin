# Deploy completo bemreal.com - SEM abrir Bloco de Notas
# Uso: .\scripts\DEPLOY_TUDO_FIX.ps1

$ErrorActionPreference = "Stop"
$VPS_IP = "76.13.113.9"
$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path

Set-Location $PROJECT_ROOT
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY COMPLETO - bemreal.com" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se tar.gz existe
if (-not (Test-Path "aqkin.tar.gz")) {
    Write-Host ">>> Criando aqkin.tar.gz..." -ForegroundColor Yellow
    if (-not (Test-Path "apps")) { Write-Host "Erro: pasta apps nao encontrada."; exit 1 }
    if (-not (Test-Path "database")) { Write-Host "Erro: pasta database nao encontrada."; exit 1 }
    & tar -czf aqkin.tar.gz apps database
    if ($LASTEXITCODE -ne 0) { Write-Host "Erro no tar."; exit 1 }
    Write-Host "OK: aqkin.tar.gz criado" -ForegroundColor Green
} else {
    Write-Host "OK: aqkin.tar.gz ja existe" -ForegroundColor Green
}

# 2. Verificar se dist existe
if (-not (Test-Path "apps\web\dist")) {
    Write-Host ">>> Build do frontend..." -ForegroundColor Yellow
    Set-Location "apps\web"
    & npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro: build falhou. Rode: cd apps/web && npm run build" -ForegroundColor Red
        exit 1
    }
    Set-Location $PROJECT_ROOT
    Write-Host "OK: Frontend buildado" -ForegroundColor Green
} else {
    Write-Host "OK: Frontend ja buildado (apps/web/dist)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  SOLUÇÃO: Upload via comandos manuais" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para evitar o Bloco de Notas, rode estes comandos MANUALMENTE" -ForegroundColor Yellow
Write-Host "no PowerShell (um de cada vez, digite a senha quando pedir):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Backend:" -ForegroundColor White
Write-Host "   scp aqkin.tar.gz root@${VPS_IP}:/var/www/" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Frontend:" -ForegroundColor White
Write-Host "   scp -r apps\web\dist\* root@${VPS_IP}:/var/www/html/" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Scripts:" -ForegroundColor White
Write-Host "   scp scripts\deploy-hostinger.sh scripts\deploy-completo.sh scripts\ENV_VARS_VPS.sh root@${VPS_IP}:/root/" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU use WinSCP / FileZilla para fazer upload via interface gráfica:" -ForegroundColor Yellow
Write-Host "   Servidor: ${VPS_IP}" -ForegroundColor White
Write-Host "   Usuário: root" -ForegroundColor White
Write-Host "   Senha: (sua senha do VPS)" -ForegroundColor White
Write-Host ""
Write-Host "Depois, no VPS (ssh root@${VPS_IP}):" -ForegroundColor Yellow
Write-Host "   source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh" -ForegroundColor Cyan
Write-Host ""
