# Prepara TUDO para upload via WinSCP
# Uso: .\scripts\PREPARAR_TUDO.ps1
# Depois: arraste UPLOAD_PARA_VPS no WinSCP

$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path
Set-Location $PROJECT_ROOT

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  PREPARANDO TUDO PARA UPLOAD" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Criar tar.gz
if (-not (Test-Path "aqkin.tar.gz")) {
    Write-Host ">>> Criando aqkin.tar.gz..." -ForegroundColor Yellow
    & tar -czf aqkin.tar.gz apps database
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: aqkin.tar.gz ja existe" -ForegroundColor Green
}

# 2. Build frontend
if (-not (Test-Path "apps\web\dist")) {
    Write-Host ">>> Build do frontend..." -ForegroundColor Yellow
    & npx nx build web 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Build falhou. Rode manualmente: npx nx build web" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "OK: Frontend ja buildado" -ForegroundColor Green
}

# 3. Criar pasta organizada
$UPLOAD_DIR = "UPLOAD_PARA_VPS"
if (Test-Path $UPLOAD_DIR) { Remove-Item $UPLOAD_DIR -Recurse -Force }
New-Item -ItemType Directory -Path "$UPLOAD_DIR\backend" | Out-Null
New-Item -ItemType Directory -Path "$UPLOAD_DIR\frontend" | Out-Null
New-Item -ItemType Directory -Path "$UPLOAD_DIR\scripts" | Out-Null

Copy-Item "aqkin.tar.gz" "$UPLOAD_DIR\backend\"
Copy-Item "apps\web\dist\*" "$UPLOAD_DIR\frontend\" -Recurse
Copy-Item "scripts\deploy-hostinger.sh" "$UPLOAD_DIR\scripts\"
Copy-Item "scripts\deploy-completo.sh" "$UPLOAD_DIR\scripts\"
Copy-Item "scripts\ENV_VARS_VPS.sh" "$UPLOAD_DIR\scripts\"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  PRONTO!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pasta criada: $UPLOAD_DIR" -ForegroundColor Yellow
Write-Host ""
Write-Host ""
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host "  PRÓXIMO PASSO: WinSCP" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra WinSCP (https://winscp.net)" -ForegroundColor White
Write-Host "2. Conecte:" -ForegroundColor White
Write-Host "   Servidor: 76.13.113.9" -ForegroundColor Cyan
Write-Host "   Usuário: root" -ForegroundColor Cyan
Write-Host "   Senha: (sua senha do VPS)" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Arraste (lado esquerdo → direito):" -ForegroundColor White
Write-Host ""
Write-Host "   backend\aqkin.tar.gz" -ForegroundColor Gray
Write-Host "   → /var/www/" -ForegroundColor Green
Write-Host ""
Write-Host "   TODO conteúdo de frontend\" -ForegroundColor Gray
Write-Host "   → /var/www/html/" -ForegroundColor Green
Write-Host ""
Write-Host "   TODOS arquivos de scripts\" -ForegroundColor Gray
Write-Host "   → /root/" -ForegroundColor Green
Write-Host ""
Write-Host "4. No VPS (SSH):" -ForegroundColor White
Write-Host "   ssh root@76.13.113.9" -ForegroundColor Cyan
Write-Host "   source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh" -ForegroundColor Cyan
Write-Host ""
