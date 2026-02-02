# Configura chave SSH no VPS (elimina senha)
# Uso: .\scripts\CONFIGURAR_SSH_KEY.ps1

$VPS_IP = "76.13.113.9"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_ed25519.pub"

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "Erro: Chave SSH não encontrada em $SSH_KEY" -ForegroundColor Red
    Write-Host "Gere uma chave primeiro com:" -ForegroundColor Yellow
    Write-Host "  ssh-keygen -t ed25519 -f $SSH_KEY -N '""'" -ForegroundColor Cyan
    exit 1
}

$PUBLIC_KEY = Get-Content $SSH_KEY -Raw

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR SSH KEY NO VPS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chave pública encontrada:" -ForegroundColor Green
Write-Host $PUBLIC_KEY -ForegroundColor Gray
Write-Host ""
Write-Host "Agora copie a chave para o VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Conecte no VPS:" -ForegroundColor White
Write-Host "   ssh root@${VPS_IP}" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. No VPS, rode estes comandos:" -ForegroundColor White
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Cyan
Write-Host "   chmod 700 ~/.ssh" -ForegroundColor Cyan
Write-Host "   echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU copie e cole este comando completo:" -ForegroundColor Yellow
Write-Host ""
$command = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
Write-Host "   $command" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Teste (sem senha):" -ForegroundColor White
Write-Host "   ssh -i $env:USERPROFILE\.ssh\id_ed25519 root@${VPS_IP}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se conectar sem pedir senha, está funcionando!" -ForegroundColor Green
Write-Host ""
