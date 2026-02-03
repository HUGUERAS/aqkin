# Verifica se tudo está pronto para deploy
# Uso: .\scripts\VERIFICAR_PRE_DEPLOY.ps1

$PROJECT_ROOT = Join-Path $PSScriptRoot ".." | Resolve-Path
Set-Location $PROJECT_ROOT

$erros = @()
$avisos = @()

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO PRÉ-DEPLOY" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Arquivos necessários
Write-Host ">>> Verificando arquivos..." -ForegroundColor Yellow
if (-not (Test-Path "apps")) { $erros += "Pasta 'apps' não encontrada" }
if (-not (Test-Path "database")) { $erros += "Pasta 'database' não encontrada" }
if (-not (Test-Path "scripts\deploy-hostinger.sh")) { $erros += "scripts\deploy-hostinger.sh não encontrado" }
if (-not (Test-Path "scripts\deploy-completo.sh")) { $erros += "scripts\deploy-completo.sh não encontrado" }
if (-not (Test-Path "scripts\DEPLOY_TUDO.ps1")) { $erros += "scripts\DEPLOY_TUDO.ps1 não encontrado" }

# 2. Backend
Write-Host ">>> Verificando backend..." -ForegroundColor Yellow
if (-not (Test-Path "apps\api\main.py")) { $erros += "apps\api\main.py não encontrado" }
if (-not (Test-Path "apps\api\requirements.txt")) { $erros += "apps\api\requirements.txt não encontrado" }
if (-not (Test-Path "apps\api\db.py")) { $erros += "apps\api\db.py não encontrado" }
if (-not (Test-Path "apps\api\auth.py")) { $erros += "apps\api\auth.py não encontrado" }

# 3. Frontend
Write-Host ">>> Verificando frontend..." -ForegroundColor Yellow
if (-not (Test-Path "apps\web\.env")) { $avisos += "apps\web\.env não encontrado (mas será criado no build)" }
if (Test-Path "apps\web\.env") {
    $envContent = Get-Content "apps\web\.env" -Raw
    if ($envContent -notmatch "VITE_API_URL=https://api.bemreal.com") {
        $avisos += "apps\web\.env pode não ter VITE_API_URL=https://api.bemreal.com"
    }
}
if (-not (Test-Path "apps\web\dist")) { $avisos += "Frontend não buildado (apps/web/dist). O DEPLOY_TUDO.ps1 vai buildar automaticamente." }

# 4. Arquivos de deploy
Write-Host ">>> Verificando arquivos de deploy..." -ForegroundColor Yellow
if (-not (Test-Path "aqkin.tar.gz")) { $avisos += "aqkin.tar.gz não existe (será criado pelo DEPLOY_TUDO.ps1)" }

# 5. Resultado
Write-Host ""
if ($erros.Count -eq 0 -and $avisos.Count -eq 0) {
    Write-Host "✅ TUDO PRONTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximo passo:" -ForegroundColor Yellow
    Write-Host "  .\scripts\DEPLOY_TUDO.ps1" -ForegroundColor White
} else {
    if ($erros.Count -gt 0) {
        Write-Host "❌ ERROS ENCONTRADOS:" -ForegroundColor Red
        $erros | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        Write-Host ""
    }
    if ($avisos.Count -gt 0) {
        Write-Host "⚠️  AVISOS:" -ForegroundColor Yellow
        $avisos | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        Write-Host ""
    }
    if ($erros.Count -eq 0) {
        Write-Host "✅ Pode prosseguir (só avisos, nada crítico)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximo passo:" -ForegroundColor Yellow
        Write-Host "  .\scripts\DEPLOY_TUDO.ps1" -ForegroundColor White
    }
}

Write-Host ""
