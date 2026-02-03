# Script PowerShell para verificar configuração do Módulo Financeiro

Write-Host "🔍 Verificando configuração do Módulo Financeiro..." -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (Test-Path "apps/api/.env") {
    Write-Host "✅ apps/api/.env existe" -ForegroundColor Green
} else {
    Write-Host "❌ apps/api/.env não encontrado" -ForegroundColor Red
    Write-Host "   Copie apps/api/.env.example e configure as variáveis" -ForegroundColor Yellow
}

# Verificar se .env do web existe
if (Test-Path "apps/web/.env") {
    Write-Host "✅ apps/web/.env existe" -ForegroundColor Green
} else {
    Write-Host "❌ apps/web/.env não encontrado" -ForegroundColor Red
    Write-Host "   Copie apps/web/.env.example e configure as variáveis" -ForegroundColor Yellow
}

# Verificar se Python está instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python instalado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado" -ForegroundColor Red
}

# Verificar se pip está instalado
try {
    pip --version | Out-Null
    Write-Host "✅ pip instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ pip não encontrado" -ForegroundColor Red
}

# Verificar se node está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
}

# Verificar se nx está disponível
try {
    npx --version | Out-Null
    Write-Host "✅ npx disponível" -ForegroundColor Green
} catch {
    Write-Host "❌ npx não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute as migrações SQL no Supabase Dashboard" -ForegroundColor White
Write-Host "2. Configure as variáveis de ambiente (.env)" -ForegroundColor White
Write-Host "3. Inicie a API: cd apps/api && uvicorn main:app --reload" -ForegroundColor White
Write-Host "4. Inicie o frontend: npx nx serve web" -ForegroundColor White
Write-Host ""
Write-Host "Para mais detalhes, veja: TESTE_INTEGRAÇÃO.md" -ForegroundColor Yellow
