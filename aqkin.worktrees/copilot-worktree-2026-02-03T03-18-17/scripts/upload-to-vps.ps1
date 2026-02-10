
# Upload do projeto para o VPS Hostinger
# Execute no PowerShell: .\scripts\upload-to-vps.ps1

$ErrorActionPreference = "Stop"
$VPS_IP = "76.13.113.9"
$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path

Set-Location $PROJECT_ROOT
Write-Host "Pasta: $PROJECT_ROOT"

if (-not (Test-Path "apps")) { Write-Host "Erro: pasta apps nao encontrada."; exit 1 }
if (-not (Test-Path "database")) { Write-Host "Erro: pasta database nao encontrada."; exit 1 }

Write-Host "Empacotando apps e database..."
if (Test-Path aqkin.tar.gz) { Remove-Item aqkin.tar.gz -Force }
& tar -czf aqkin.tar.gz apps database
if ($LASTEXITCODE -ne 0) { Write-Host "Erro no tar."; exit 1 }

if (-not (Test-Path aqkin.tar.gz)) {
    Write-Host "Erro: aqkin.tar.gz nao foi criado."
    exit 1
}
$size = (Get-Item aqkin.tar.gz).Length / 1KB
Write-Host "Arquivo criado: aqkin.tar.gz ($([math]::Round($size, 1)) KB)"

Write-Host ""
Write-Host "Agora rode este comando NO MESMO POWERSHELL (vai pedir a senha aqui):"
Write-Host ""
Write-Host "  scp aqkin.tar.gz root@${VPS_IP}:/var/www/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Digite a senha do VPS quando pedir (nao aparece na tela)."
Write-Host ""
Write-Host "Depois, no VPS (ssh root@${VPS_IP}), execute:"
Write-Host "  mkdir -p /var/www/aqkin"
Write-Host "  cd /var/www && tar -xzf aqkin.tar.gz -C aqkin"
Write-Host "  bash /root/deploy-hostinger.sh"
Write-Host ""
Write-Host "--- Depois da API no ar: upload do frontend ---"
Write-Host "  scp -r apps\web\dist\* root@${VPS_IP}:/var/www/html/"
Write-Host "  scp scripts\deploy-frontend-vps.sh root@${VPS_IP}:/root/"
Write-Host "  No VPS: bash /root/deploy-frontend-vps.sh"
Write-Host ""
