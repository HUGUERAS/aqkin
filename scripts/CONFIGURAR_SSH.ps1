# Configura SSH para não abrir Bloco de Notas
# Uso: .\scripts\CONFIGURAR_SSH.ps1

$SSH_CONFIG = "$env:USERPROFILE\.ssh\config"
$SSH_DIR = "$env:USERPROFILE\.ssh"

# Criar pasta .ssh se não existir
if (-not (Test-Path $SSH_DIR)) {
    New-Item -ItemType Directory -Path $SSH_DIR -Force | Out-Null
    Write-Host "Pasta .ssh criada" -ForegroundColor Green
}

# Criar/atualizar config
$CONFIG_CONTENT = @"
# Configuração para bemreal.com VPS
Host bemreal
    HostName 76.13.113.9
    User root
    PreferredAuthentications password
    PubkeyAuthentication no
    StrictHostKeyChecking no
    UserKnownHostsFile $env:USERPROFILE\.ssh\known_hosts_bemreal

Host bemreal-key
    HostName 76.13.113.9
    User root
    IdentityFile $env:USERPROFILE\.ssh\id_ed25519
    PreferredAuthentications publickey
    StrictHostKeyChecking no
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
Write-Host "  CONFIGURAÇÃO SSH ATUALIZADA" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você pode usar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  scp arquivo bemreal:/destino" -ForegroundColor Cyan
Write-Host "  ssh bemreal" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU se tiver chave SSH configurada:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  scp arquivo bemreal-key:/destino" -ForegroundColor Cyan
Write-Host "  ssh bemreal-key" -ForegroundColor Cyan
Write-Host ""
Write-Host "Isso pode resolver o problema do Bloco de Notas." -ForegroundColor Green
Write-Host ""
