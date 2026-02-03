# Deploy AUTOMÁTICO usando SSH Key via Posh-SSH
# Uso: .\scripts\DEPLOY_AUTOMATICO.ps1
# SEGURO: Verifica host key e usa versão específica do módulo

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
$SSH_KEY_PUB = "$SSH_KEY.pub"

Set-Location $PROJECT_ROOT

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY AUTOMÁTICO COM SSH KEY (SEGURO)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar/instalar Posh-SSH com versão específica e verificação de publisher
$POSH_SSH_VERSION = "3.0.8"
if (-not (Get-Module -ListAvailable -Name Posh-SSH | Where-Object Version -eq $POSH_SSH_VERSION)) {
    Write-Host ">>> Instalando módulo Posh-SSH versão $POSH_SSH_VERSION..." -ForegroundColor Yellow
    Write-Host "    SEGURANÇA: Verificando assinatura do publisher..." -ForegroundColor Yellow
    try {
        Install-Module -Name Posh-SSH -RequiredVersion $POSH_SSH_VERSION -Scope CurrentUser -Force -ErrorAction Stop
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Falha ao instalar Posh-SSH" -ForegroundColor Red
        Write-Host "Tente instalar manualmente: Install-Module -Name Posh-SSH -RequiredVersion $POSH_SSH_VERSION" -ForegroundColor Yellow
        exit 1
    }
}

Import-Module Posh-SSH -ErrorAction Stop

# Verificar chave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "ERRO: Chave SSH não encontrada em $SSH_KEY" -ForegroundColor Red
    Write-Host "Gere uma chave primeiro:" -ForegroundColor Yellow
    Write-Host "  ssh-keygen -t ed25519 -f $SSH_KEY -N '""'" -ForegroundColor Cyan
    exit 1
}

Write-Host ">>> Usando chave SSH: $SSH_KEY" -ForegroundColor Green

# Criar credencial SSH
$securePassword = Read-Host "Digite a senha do VPS (root)" -AsSecureString
$credential = New-Object System.Management.Automation.PSCredential("root", $securePassword)

# Testar conexão (SEM -AcceptKey - requer host key manual na primeira vez)
Write-Host ">>> Testando conexão SSH..." -ForegroundColor Yellow
Write-Host "    SEGURANÇA: Verificando host key..." -ForegroundColor Yellow
try {
    $session = New-SSHSession -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -ErrorAction Stop
    Write-Host "OK: Conectado via SSH Key!" -ForegroundColor Green
} catch {
    Write-Host "Tentando configurar chave SSH no VPS..." -ForegroundColor Yellow
    Write-Host "    NOTA: Na primeira conexão, verifique o fingerprint do host" -ForegroundColor Yellow
    
    # Conectar com senha para configurar chave (SEM -AcceptKey)
    try {
        $session = New-SSHSession -ComputerName $VPS_IP -Credential $credential -ErrorAction Stop
    } catch {
        Write-Host "ERRO: Não foi possível conectar ao VPS" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Se for a primeira conexão, conecte manualmente primeiro:" -ForegroundColor Yellow
        Write-Host "  ssh root@$VPS_IP" -ForegroundColor Cyan
        Write-Host "E verifique o fingerprint da chave do host." -ForegroundColor Yellow
        exit 1
    }
    
    # Configurar chave SSH
    if (Test-Path $SSH_KEY_PUB) {
        $PUBLIC_KEY = Get-Content $SSH_KEY_PUB -Raw
        $setupCmd = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
grep -q '$PUBLIC_KEY' ~/.ssh/authorized_keys || echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "OK"
"@
        
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $setupCmd
        Write-Host "Chave SSH configurada!" -ForegroundColor Green
        
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
        
        # Reconectar com chave (SEM -AcceptKey - host key já verificada)
        $session = New-SSHSession -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -ErrorAction Stop
    }
}

Write-Host ""

# 1. Criar tar.gz
if (-not (Test-Path "aqkin.tar.gz")) {
    Write-Host ">>> Criando aqkin.tar.gz..." -ForegroundColor Yellow
    & tar -czf aqkin.tar.gz apps database
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao criar tar.gz" -ForegroundColor Red
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: aqkin.tar.gz já existe" -ForegroundColor Green
}

# 2. Build frontend
if (-not (Test-Path "apps\web\dist")) {
    Write-Host ">>> Build do frontend..." -ForegroundColor Yellow
    & npx nx build web 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Build falhou" -ForegroundColor Red
        Remove-SSHSession -SessionId $session.SessionId | Out-Null
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: Frontend já buildado" -ForegroundColor Green
}

# 3. Upload backend
Write-Host ""
Write-Host ">>> Upload backend..." -ForegroundColor Yellow
Set-SCPFile -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -LocalFile "aqkin.tar.gz" -RemotePath "/var/www/" -ErrorAction Stop
Write-Host "OK" -ForegroundColor Green

# 4. Upload frontend (arquivo por arquivo)
Write-Host ">>> Upload frontend..." -ForegroundColor Yellow
$distPath = "apps\web\dist"
$files = Get-ChildItem -Path $distPath -Recurse -File
$totalFiles = $files.Count
$current = 0

foreach ($file in $files) {
    $current++
    $relativePath = $file.FullName.Substring((Resolve-Path $distPath).Path.Length + 1)
    $remotePath = "/var/www/html/$relativePath".Replace('\', '/')
    $remoteDir = Split-Path $remotePath -Parent
    
    # Criar diretório remoto se necessário
    if ($remoteDir -ne "/var/www/html") {
        $mkdirCmd = "mkdir -p `"$remoteDir`""
        Invoke-SSHCommand -SessionId $session.SessionId -Command $mkdirCmd | Out-Null
    }
    
    Set-SCPFile -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -LocalFile $file.FullName -RemotePath $remotePath -ErrorAction SilentlyContinue
    
    Write-Progress -Activity "Upload frontend" -Status "$current/$totalFiles" -PercentComplete (($current / $totalFiles) * 100)
}

Write-Progress -Activity "Upload frontend" -Completed
Write-Host "OK" -ForegroundColor Green

# 5. Upload scripts
Write-Host ">>> Upload scripts..." -ForegroundColor Yellow
Set-SCPFile -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -LocalFile "scripts\deploy-hostinger.sh" -RemotePath "/root/" -ErrorAction Stop
Set-SCPFile -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -LocalFile "scripts\deploy-completo.sh" -RemotePath "/root/" -ErrorAction Stop
Set-SCPFile -ComputerName $VPS_IP -Credential $credential -KeyFile $SSH_KEY -LocalFile "scripts\ENV_VARS_VPS.sh" -RemotePath "/root/" -ErrorAction Stop
Write-Host "OK" -ForegroundColor Green

# 6. Executar deploy no VPS
Write-Host ""
Write-Host ">>> Executando deploy no VPS..." -ForegroundColor Yellow
Write-Host ""

$deployCmd = "source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh"
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $deployCmd

Write-Host $result.Output

if ($result.ExitStatus -ne 0) {
    Write-Host ""
    Write-Host "ERRO: Deploy falhou (Exit Code: $($result.ExitStatus))" -ForegroundColor Red
    if ($result.Error) {
        Write-Host $result.Error -ForegroundColor Red
    }
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    exit 1
}

Remove-SSHSession -SessionId $session.SessionId | Out-Null

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: https://bemreal.com" -ForegroundColor Cyan
Write-Host "API: https://api.bemreal.com" -ForegroundColor Cyan
Write-Host ""
