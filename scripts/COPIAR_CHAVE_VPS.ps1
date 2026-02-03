# Copia chave SSH para o VPS automaticamente
# Uso: .\scripts\COPIAR_CHAVE_VPS.ps1
# Vai pedir senha UMA VEZ, depois nunca mais!

$VPS_IP = "76.13.113.9"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_ed25519.pub"

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "Erro: Chave SSH não encontrada." -ForegroundColor Red
    exit 1
}

$PUBLIC_KEY = Get-Content $SSH_KEY -Raw

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  COPIANDO CHAVE SSH PARA O VPS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Digite a senha do VPS (última vez!):" -ForegroundColor Yellow
Write-Host ""

# Criar script temporário para rodar no VPS
$tempScript = [System.IO.Path]::GetTempFileName()
$scriptContent = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "Chave SSH configurada com sucesso!"
"@
Set-Content $tempScript $scriptContent

# Copiar script para VPS e executar
Write-Host ">>> Copiando chave para o VPS..." -ForegroundColor Yellow
& scp $tempScript "root@${VPS_IP}:/tmp/setup-ssh-key.sh" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> Configurando chave no VPS..." -ForegroundColor Yellow
    & ssh "root@${VPS_IP}" "bash /tmp/setup-ssh-key.sh && rm /tmp/setup-ssh-key.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==============================================" -ForegroundColor Green
        Write-Host "  CHAVE SSH CONFIGURADA!" -ForegroundColor Green
        Write-Host "==============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora você pode usar:" -ForegroundColor Yellow
        Write-Host "   ssh root@${VPS_IP}" -ForegroundColor Cyan
        Write-Host "   scp arquivo root@${VPS_IP}:/destino" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "SEM precisar digitar senha!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao configurar chave no VPS." -ForegroundColor Red
    }
} else {
    Write-Host "Erro ao copiar script. Configure manualmente:" -ForegroundColor Red
    Write-Host "   ssh root@${VPS_IP}" -ForegroundColor Cyan
    Write-Host "   mkdir -p ~/.ssh && chmod 700 ~/.ssh" -ForegroundColor Cyan
    Write-Host "   echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
}

Remove-Item $tempScript -ErrorAction SilentlyContinue
Write-Host ""
