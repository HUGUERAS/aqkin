# Gera chave SSH para não precisar digitar senha
# Uso: .\scripts\GERAR_SSH_KEY.ps1
# Depois: copie a chave pública para o VPS

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  GERAR CHAVE SSH (sem senha)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa_bemreal"

if (Test-Path $KEY_PATH) {
    Write-Host "Chave ja existe: $KEY_PATH" -ForegroundColor Yellow
    Write-Host "Quer gerar nova? (s/n): " -NoNewline -ForegroundColor Yellow
    $resposta = Read-Host
    if ($resposta -ne "s") {
        Write-Host "OK, usando chave existente." -ForegroundColor Green
        exit 0
    }
}

Write-Host "Gerando chave SSH..." -ForegroundColor Yellow
ssh-keygen -t rsa -b 4096 -f $KEY_PATH -N '""' -C "bemreal-deploy"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao gerar chave." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  CHAVE GERADA!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora copie a chave publica para o VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra o arquivo:" -ForegroundColor White
Write-Host "   $KEY_PATH.pub" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Copie TODO o conteudo" -ForegroundColor White
Write-Host ""
Write-Host "3. No VPS, rode:" -ForegroundColor White
Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Cyan
Write-Host "   echo 'COLE_A_CHAVE_AQUI' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Depois, use assim:" -ForegroundColor White
Write-Host "   scp -i $KEY_PATH arquivo root@76.13.113.9:/destino" -ForegroundColor Cyan
Write-Host ""
Write-Host "OU configure no SSH config:" -ForegroundColor Yellow
Write-Host "   Adicione em $env:USERPROFILE\.ssh\config:" -ForegroundColor White
Write-Host "   Host bemreal" -ForegroundColor Cyan
Write-Host "     HostName 76.13.113.9" -ForegroundColor Cyan
Write-Host "     User root" -ForegroundColor Cyan
Write-Host "     IdentityFile $KEY_PATH" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depois use: scp arquivo bemreal:/destino" -ForegroundColor Cyan
Write-Host ""
