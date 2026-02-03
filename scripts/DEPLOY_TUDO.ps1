# Deploy Completo (Backend + Frontend) usando SSH Key
# SEGURO: Verifica host key e usa variáveis de ambiente
# Uso: .\scripts\DEPLOY_TUDO.ps1

# Carregar configuração de deployment
$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path
$deployEnvPath = Join-Path $PROJECT_ROOT ".deploy.env"

if (-not (Test-Path $deployEnvPath)) {
    Write-Host "ERRO: Arquivo .deploy.env não encontrado!" -ForegroundColor Red
    Write-Host "Copie .deploy.env.example para .deploy.env e configure." -ForegroundColor Yellow
    exit 1
}

# Ler variáveis do .deploy.env
Get-Content $deployEnvPath | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Variable -Name $name -Value $value -Scope Script
    }
}

if (-not $VPS_IP) {
    Write-Host "ERRO: VPS_IP não configurado em .deploy.env" -ForegroundColor Red
    exit 1
}

$SSH_KEY = if ($SSH_KEY_PATH) { $SSH_KEY_PATH } else { "$env:USERPROFILE\.ssh\id_ed25519" }

Set-Location $PROJECT_ROOT

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY COMPLETO (SEGURO)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar chave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "ERRO: Chave SSH não encontrada em $SSH_KEY" -ForegroundColor Red
    Write-Host "Gere uma chave primeiro:" -ForegroundColor Yellow
    Write-Host "  ssh-keygen -t ed25519 -f $SSH_KEY -N '""'" -ForegroundColor Cyan
    exit 1
}

Write-Host ">>> Usando chave SSH: $SSH_KEY" -ForegroundColor Green
Write-Host ">>> VPS: $VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "SEGURANÇA: Host key será verificado" -ForegroundColor Yellow
Write-Host "Na primeira conexão, confirme o fingerprint digitando 'yes'" -ForegroundColor Yellow
Write-Host ""

# 1. Criar tar.gz
if (-not (Test-Path "aqkin.tar.gz")) {
    Write-Host ">>> Criando aqkin.tar.gz..." -ForegroundColor Yellow
    & tar -czf aqkin.tar.gz apps database
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao criar tar.gz" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: aqkin.tar.gz ja existe" -ForegroundColor Green
}

# 2. Build frontend
if (-not (Test-Path "apps\web\dist")) {
    Write-Host ">>> Build do frontend..." -ForegroundColor Yellow
    & npx nx build web 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Build falhou" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: Frontend ja buildado" -ForegroundColor Green
}

# 3. Upload backend
Write-Host ""
Write-Host ">>> Upload backend (tar.gz)..." -ForegroundColor Yellow
& scp -i $SSH_KEY "aqkin.tar.gz" "root@${VPS_IP}:/var/www/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Upload do backend falhou" -ForegroundColor Red
    exit 1
}
Write-Host "OK" -ForegroundColor Green

# 4. Upload frontend
Write-Host ">>> Upload frontend (dist)..." -ForegroundColor Yellow
& scp -i $SSH_KEY -r "apps\web\dist\*" "root@${VPS_IP}:/var/www/html/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Upload do frontend falhou" -ForegroundColor Red
    exit 1
}
Write-Host "OK" -ForegroundColor Green

# 5. Upload scripts
Write-Host ">>> Upload scripts..." -ForegroundColor Yellow
& scp -i $SSH_KEY "scripts\deploy-hostinger.sh" "scripts\deploy-completo.sh" "root@${VPS_IP}:/root/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Upload dos scripts falhou" -ForegroundColor Red
    exit 1
}
Write-Host "OK" -ForegroundColor Green

# 6. Executar deploy no VPS
Write-Host ""
Write-Host ">>> Executando deploy no VPS..." -ForegroundColor Yellow
& ssh -i $SSH_KEY "root@${VPS_IP}" "source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Deploy falhou" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: https://bemreal.com" -ForegroundColor Cyan
Write-Host "API: https://api.bemreal.com" -ForegroundColor Cyan
Write-Host ""
