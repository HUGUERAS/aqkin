# Prepara tudo para upload - só falta arrastar no WinSCP
# Uso: .\scripts\PREPARAR_UPLOAD.ps1

$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path
Set-Location $PROJECT_ROOT

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  PREPARANDO ARQUIVOS PARA UPLOAD" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Criar tar.gz se não existir
if (-not (Test-Path "aqkin.tar.gz")) {
    Write-Host ">>> Criando aqkin.tar.gz..." -ForegroundColor Yellow
    if (-not (Test-Path "apps")) { Write-Host "Erro: pasta apps nao encontrada."; exit 1 }
    if (-not (Test-Path "database")) { Write-Host "Erro: pasta database nao encontrada."; exit 1 }
    & tar -czf aqkin.tar.gz apps database
    if ($LASTEXITCODE -ne 0) { Write-Host "Erro no tar."; exit 1 }
    Write-Host "OK: aqkin.tar.gz criado" -ForegroundColor Green
} else {
    Write-Host "OK: aqkin.tar.gz ja existe" -ForegroundColor Green
}

# 2. Build frontend se não existir
if (-not (Test-Path "apps\web\dist")) {
    Write-Host ">>> Build do frontend..." -ForegroundColor Yellow
    Set-Location "apps\web"
    & npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro: build falhou." -ForegroundColor Red
        exit 1
    }
    Set-Location $PROJECT_ROOT
    Write-Host "OK: Frontend buildado" -ForegroundColor Green
} else {
    Write-Host "OK: Frontend ja buildado" -ForegroundColor Green
}

# 3. Criar pasta temporária com tudo organizado
$UPLOAD_DIR = "UPLOAD_PARA_VPS"
if (Test-Path $UPLOAD_DIR) { Remove-Item $UPLOAD_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $UPLOAD_DIR | Out-Null
New-Item -ItemType Directory -Path "$UPLOAD_DIR\backend" | Out-Null
New-Item -ItemType Directory -Path "$UPLOAD_DIR\frontend" | Out-Null
New-Item -ItemType Directory -Path "$UPLOAD_DIR\scripts" | Out-Null

# Copiar arquivos
Copy-Item "aqkin.tar.gz" "$UPLOAD_DIR\backend\"
Copy-Item "apps\web\dist\*" "$UPLOAD_DIR\frontend\" -Recurse
Copy-Item "scripts\deploy-hostinger.sh" "$UPLOAD_DIR\scripts\"
Copy-Item "scripts\deploy-completo.sh" "$UPLOAD_DIR\scripts\"
Copy-Item "scripts\ENV_VARS_VPS.sh" "$UPLOAD_DIR\scripts\"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ARQUIVOS PRONTOS!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pasta criada: $UPLOAD_DIR" -ForegroundColor Yellow
Write-Host ""
Write-Host "Estrutura:" -ForegroundColor White
Write-Host "  $UPLOAD_DIR\" -ForegroundColor Cyan
Write-Host "    backend\" -ForegroundColor Cyan
Write-Host "      aqkin.tar.gz → /var/www/" -ForegroundColor Gray
Write-Host "    frontend\" -ForegroundColor Cyan
Write-Host "      (conteudo de dist/) → /var/www/html/" -ForegroundColor Gray
Write-Host "    scripts\" -ForegroundColor Cyan
Write-Host "      deploy-*.sh → /root/" -ForegroundColor Gray
Write-Host ""
Write-Host "Agora:" -ForegroundColor Yellow
Write-Host "1. Abra WinSCP" -ForegroundColor White
Write-Host "2. Conecte em 76.13.113.9 (root)" -ForegroundColor White
Write-Host "3. Arraste as pastas conforme indicado acima" -ForegroundColor White
Write-Host ""
