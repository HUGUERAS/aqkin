# Configurar SSH no Windows para deploy via chave
# IMPORTANTE: Este script configura o SSH de forma SEGURA
# Não desabilita verificação de host key

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAÇÃO SSH (SEGURA)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Carregar configuração de deployment
$deployEnvPath = Join-Path $PSScriptRoot ".." ".deploy.env"
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

$SSH_CONFIG = "$env:USERPROFILE\.ssh\config"
$SSH_DIR = "$env:USERPROFILE\.ssh"

# Criar pasta .ssh se não existir
if (-not (Test-Path $SSH_DIR)) {
    New-Item -ItemType Directory -Path $SSH_DIR -Force | Out-Null
    Write-Host "Pasta .ssh criada" -ForegroundColor Green
}

# Criar/atualizar config SEGURA (SEM StrictHostKeyChecking=no)
$CONFIG_CONTENT = @"
# Configuração para bemreal.com VPS (SEGURA)
# SEGURANÇA: Host key verification HABILITADA
Host bemreal
    HostName $VPS_IP
    User root
    PreferredAuthentications password
    PubkeyAuthentication no
    # StrictHostKeyChecking mantido no padrão (ask) para primeira conexão

Host bemreal-key
    HostName $VPS_IP
    User root
    IdentityFile $env:USERPROFILE\.ssh\id_ed25519
    PreferredAuthentications publickey
    # StrictHostKeyChecking mantido no padrão (ask) para primeira conexão
"@

if (Test-Path $SSH_CONFIG) {
    $existing = Get-Content $SSH_CONFIG -Raw
    if ($existing -notmatch "Host bemreal") {
        Add-Content $SSH_CONFIG "`n$CONFIG_CONTENT"
        Write-Host "Configuração adicionada ao SSH config" -ForegroundColor Green
    } else {
        Write-Host "Configuração já existe no SSH config" -ForegroundColor Yellow
    }
} else {
    Set-Content $SSH_CONFIG $CONFIG_CONTENT
    Write-Host "Arquivo SSH config criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAÇÃO SSH ATUALIZADA (SEGURA)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Na primeira conexão, você será" -ForegroundColor Yellow
Write-Host "solicitado a verificar a chave do host." -ForegroundColor Yellow
Write-Host "Digite 'yes' após verificar o fingerprint." -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora você pode usar:" -ForegroundColor Green
Write-Host ""
Write-Host "  scp arquivo bemreal:/destino" -ForegroundColor Cyan
Write-Host "  ssh bemreal" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU se tiver chave SSH configurada:" -ForegroundColor Green
Write-Host ""
Write-Host "  scp arquivo bemreal-key:/destino" -ForegroundColor Cyan
Write-Host "  ssh bemreal-key" -ForegroundColor Cyan
Write-Host ""
