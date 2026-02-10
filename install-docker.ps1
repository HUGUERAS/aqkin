param()

# Script que pede elevação automática se não for admin
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Solicitando permissões de Administrador..." -ForegroundColor Yellow
    
    $arguments = "& '" + $myinvocation.mycommand.definition + "'"
    Start-Process powershell -Verb runAs -ArgumentList $arguments
    Exit
}

Write-Host ""
Write-Host "🐳 Instalando Docker no WSL..." -ForegroundColor Green
Write-Host ""

# Passo 1: Reiniciar WSL
Write-Host "[1/4] Reiniciando WSL..." -ForegroundColor Cyan
wsl --shutdown 2>$null
Start-Sleep -Seconds 2

# Passo 2: Instalar Docker e Docker Compose
Write-Host "[2/4] Instalando Docker..." -ForegroundColor Cyan
wsl bash -c "sudo apt-get update -qq && sudo apt-get install -y -qq docker.io docker-compose"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na instalação" -ForegroundColor Red
    pause
    exit 1
}

# Passo 3: Iniciar Docker daemon
Write-Host "[3/4] Iniciando Docker daemon..." -ForegroundColor Cyan
wsl bash -c "sudo service docker start"

Start-Sleep -Seconds 2

# Passo 4: Verificar instalação
Write-Host "[4/4] Verificando..." -ForegroundColor Cyan
$dockerVersion = wsl bash -c "docker --version 2>/dev/null"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Docker instalado e iniciado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Versão: $dockerVersion" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Próximo passo: rodar os containers" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute no PowerShell:" -ForegroundColor Yellow
Write-Host "  wsl bash /mnt/c/Users/User/aqkin/aqkin/docker-setup.sh" -ForegroundColor White
Write-Host ""

pause
