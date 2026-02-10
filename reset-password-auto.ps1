# Script que pede admin e reseta a senha do WSL
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Elevando para Administrador..." -ForegroundColor Yellow
    $arguments = "& '" + $myinvocation.mycommand.definition + "'"
    Start-Process powershell -Verb runAs -ArgumentList $arguments
    Exit
}

Write-Host ""
Write-Host "🔐 Resetando senha do WSL..." -ForegroundColor Green
Write-Host ""

# Reset a senha para 'senha123'
Write-Host "Reseting senha do usuário 'serhugo' para 'senha123'..." -ForegroundColor Cyan
wsl --user root -e bash -c "echo 'serhugo:senha123' | chpasswd"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Senha resetada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sua nova senha: senha123" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Agora instale Docker com:" -ForegroundColor Cyan
    Write-Host "  powershell -ExecutionPolicy Bypass -File C:\Users\User\aqkin\aqkin\install-docker.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Erro ao resetar senha" -ForegroundColor Red
}

pause
