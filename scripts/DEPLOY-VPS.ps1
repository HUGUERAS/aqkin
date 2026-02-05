#!/usr/bin/env pwsh
# 🚀 DEPLOY DOCKER to VPS - Automatizado
# User: root | Host: 76.13.113.9
# Customizado para seu setup

# ========================================
# CONFIGURAR AQUI
# ========================================
$GitHubUsername = "HUGUERAS"  # ← CONFIGURADO ✅
$GitHubRepo = "HUGUERAS/ativreal-monorepo"  # ← CONFIGURADO ✅

# ========================================
$VpsHost = "76.13.113.9"
$VpsUser = "root"
$VpsPort = "22"
$VpsPath = "/home/bemreal/ativreal-monorepo"
$Branch = "main"
$Registry = "ghcr.io"

# ========================================
# START
# ========================================

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ 🚀 DEPLOY DOCKER à VPS (root@76.13.113.9)        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

# 1. Verificar Docker Local
Write-Host "📦 PASSO 1: Verificar Docker" -ForegroundColor Cyan
try {
    $Version = docker --version
    Write-Host "  ✅ Docker instalado: $Version`n" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker não encontrado! Instale em: https://docker.com/products/docker-desktop`n" -ForegroundColor Red
    exit 1
}

# 2. Pedir GitHub Token
Write-Host "🔐 PASSO 2: GitHub Token" -ForegroundColor Cyan
Write-Host "  Criar em: https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "  Scopes: write:packages, read:packages, delete:packages`n" -ForegroundColor Gray

$GithubTokenSecure = Read-Host "  Cole seu GitHub Token"
$GithubToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($GithubTokenSecure))

# 3. Login Docker
Write-Host "`n📤 PASSO 3: Login GitHub Container Registry" -ForegroundColor Cyan
Write-Host "  Fazendo login..." -ForegroundColor Gray
$GithubToken | docker login ghcr.io -u $GitHubUsername --password-stdin
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Login bem-sucedido!`n" -ForegroundColor Green
} else {
    Write-Host "  ❌ Falha no login!`n" -ForegroundColor Red
    exit 1
}

# 4. Build imagens
Write-Host "🏗️  PASSO 4: Build Docker Images" -ForegroundColor Cyan

$ApiImage = "$Registry/$GitHubRepo-api:$Branch"
$WebImage = "$Registry/$GitHubRepo-web:$Branch"

Write-Host "  Building: $ApiImage" -ForegroundColor Gray
docker build -t $ApiImage -f apps/api/Dockerfile . --progress=plain
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Build API falhou!`n" -ForegroundColor Red; exit 1 }
Write-Host "  ✅ API built`n" -ForegroundColor Green

Write-Host "  Building: $WebImage" -ForegroundColor Gray
docker build -t $WebImage -f apps/web/Dockerfile . --progress=plain
if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Build Web falhou!`n" -ForegroundColor Red; exit 1 }
Write-Host "  ✅ Web built`n" -ForegroundColor Green

# 5. Push para GHCR
Write-Host "☁️  PASSO 5: Push para GitHub Container Registry" -ForegroundColor Cyan

Write-Host "  Pushing API image..." -ForegroundColor Gray
docker push $ApiImage
Write-Host "  ✅ API pushed`n" -ForegroundColor Green

Write-Host "  Pushing Web image..." -ForegroundColor Gray
docker push $WebImage
Write-Host "  ✅ Web pushed`n" -ForegroundColor Green

# 6. Deploy na VPS
Write-Host "🚢 PASSO 6: Deploy na VPS" -ForegroundColor Cyan

$DeployCmd = @"
cd $VpsPath
echo '📥 Pulling images...'
docker pull $ApiImage
docker pull $WebImage

echo '🛑 Stopping old containers...'
docker-compose -f docker-compose.prod.yml down || true

echo '🔄 Starting containers...'
docker-compose -f docker-compose.prod.yml up -d

echo '⏳ Waiting...'
sleep 5

echo '✅ Done!'
docker-compose -f docker-compose.prod.yml ps
"@

Write-Host "  Conectando via SSH..." -ForegroundColor Gray
$DeployCmd | ssh -p $VpsPort "$VpsUser@$VpsHost" "bash -s"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Deploy bem-sucedido!`n" -ForegroundColor Green
} else {
    Write-Host "  ❌ Deploy falhou!`n" -ForegroundColor Red
    exit 1
}

# 7. Health Check
Write-Host "🏥 PASSO 7: Health Check" -ForegroundColor Cyan
Start-Sleep 2

Write-Host "  Testando API..." -ForegroundColor Gray
$Health = ssh -p $VpsPort "$VpsUser@$VpsHost" "curl -s http://localhost:8000/health"
if ($Health) {
    Write-Host "  ✅ API respondendo: $Health`n" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ API ainda iniciando... (tente em 10s)`n" -ForegroundColor Yellow
}

# Done!
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ DEPLOY COMPLETO!                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🌐 Acesse:" -ForegroundColor Cyan
Write-Host "  • Web:   https://bemreal.com" 
Write-Host "  • API:   https://api.bemreal.com/health"
Write-Host "  • Logs:  ssh root@$VpsHost `"cd $VpsPath && docker-compose logs -f`"`n"

Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Verifique em https://bemreal.com"
Write-Host "  2. Se houver erro 502: aguarde 30 segundos (still warming up)"
Write-Host "  3. Ver logs: ssh root@$VpsHost 'cd $VpsPath && docker-compose logs -f api'"
