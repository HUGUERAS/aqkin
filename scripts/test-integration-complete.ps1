# Script PowerShell para teste completo de integração
# Testa banco de dados, API e frontend

Write-Host "=" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "🧪 Teste Completo de Integração - Módulo Financeiro" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se as migrations SQL foram aplicadas
Write-Host "1️⃣ Verificando Migrations no Banco de Dados..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   ⚠️  Execute manualmente no Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "   📄 scripts/check-financeiro-migrations.sql" -ForegroundColor White
Write-Host ""
Write-Host "   Ou verifique manualmente:" -ForegroundColor Yellow
Write-Host "   - Tabela 'orcamentos' existe" -ForegroundColor White
Write-Host "   - Tabela 'despesas' existe" -ForegroundColor White
Write-Host "   - RLS habilitado" -ForegroundColor White
Write-Host "   - Políticas RLS criadas" -ForegroundColor White
Write-Host ""

# 2. Verificar se a API está rodando
Write-Host "2️⃣ Verificando API..." -ForegroundColor Yellow
Write-Host ""

$apiUrl = $env:VITE_API_URL
if (-not $apiUrl) {
    Write-Host "   ⚠️  VITE_API_URL não configurado" -ForegroundColor Yellow
    Write-Host "   💡 Configure em apps/web/.env" -ForegroundColor White
    $apiUrl = "http://0.0.0.0:8000"
}

Write-Host "   Testando: $apiUrl" -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API está respondendo" -ForegroundColor Green
        $apiOk = $true
    } else {
        Write-Host "   ❌ API retornou status: $($response.StatusCode)" -ForegroundColor Red
        $apiOk = $false
    }
} catch {
    Write-Host "   ❌ API não está acessível" -ForegroundColor Red
    Write-Host "   💡 Inicie a API com: cd apps/api && uvicorn main:app --reload --port 8000" -ForegroundColor White
    $apiOk = $false
}

Write-Host ""

# 3. Verificar endpoints da API
if ($apiOk) {
    Write-Host "3️⃣ Verificando Endpoints da API..." -ForegroundColor Yellow
    Write-Host ""
    
    $endpoints = @(
        "/api/orcamentos",
        "/api/despesas",
        "/api/pagamentos"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$apiUrl$endpoint" -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   ⚠️  $endpoint - Não requer autenticação (deveria retornar 401)" -ForegroundColor Yellow
        } catch {
            if ($_.Exception.Response.StatusCode.value__ -eq 401) {
                Write-Host "   ✅ $endpoint - Protegido (401)" -ForegroundColor Green
            } elseif ($_.Exception.Response.StatusCode.value__ -eq 403) {
                Write-Host "   ✅ $endpoint - Protegido (403)" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $endpoint - Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "   📚 Documentação Swagger: $apiUrl/docs" -ForegroundColor Cyan
    Write-Host ""
}

# 4. Verificar frontend
Write-Host "4️⃣ Verificando Frontend..." -ForegroundColor Yellow
Write-Host ""

$webPort = 4200
$webUrl = "http://0.0.0.0:$webPort"

try {
    $response = Invoke-WebRequest -Uri $webUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Frontend está rodando em $webUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Acesse: $webUrl" -ForegroundColor White
    Write-Host "   2. Faça login como topógrafo" -ForegroundColor White
    Write-Host "   3. Navegue para /topografo/orcamentos" -ForegroundColor White
    Write-Host "   4. Navegue para /topografo/financeiro" -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Frontend não está rodando" -ForegroundColor Yellow
    Write-Host "   💡 Inicie com: npx nx serve web" -ForegroundColor White
}

Write-Host ""

# 5. Resumo
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 Resumo" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if ($apiOk) {
    Write-Host "✅ API: Funcionando" -ForegroundColor Green
} else {
    Write-Host "❌ API: Não está rodando" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Checklist Manual:" -ForegroundColor Cyan
Write-Host "   [ ] Migrations aplicadas no Supabase" -ForegroundColor White
Write-Host "   [ ] API rodando e respondendo" -ForegroundColor White
Write-Host "   [ ] Frontend rodando" -ForegroundColor White
Write-Host "   [ ] Login funcionando" -ForegroundColor White
Write-Host "   [ ] Tela de Orçamentos funcionando" -ForegroundColor White
Write-Host "   [ ] Tela de Financeiro funcionando" -ForegroundColor White
Write-Host ""
