# Deploy Docker to VPS - PowerShell Script
# Para Windows - Automatiza build + push + deploy na VPS
# Customizado para: root@76.13.113.9

param(
    [string]$Branch = "main",
    [string]$VpsHost = "76.13.113.9",
    [string]$VpsUser = "root",
    [string]$VpsPort = "22",
    [string]$GitHubUsername = "",
    [string]$GitHubToken = ""
)

$ErrorActionPreference = "Stop"

$Registry = "ghcr.io"
# ALTERE AQUI COM SEU REPO
$Repo = "seu-github-username/ativreal-monorepo"
$VpsPath = "/home/bemreal/ativreal-monorepo"
$SshKey = "$HOME\.ssh\id_rsa"  # Ou "id_bemreal", "id_ed25519"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "🚀 DEPLOY DOCKER VPS - PowerShell Script" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Branch:        $Branch" 
Write-Host "  VPS Host:      $VpsHost" 
Write-Host "  VPS User:      $VpsUser"
Write-Host "  Repo:          $Repo"
Write-Host "  SSH Key:       $SshKey"
Write-Host "`n" -ForegroundColor Cyan

# Step 1: Validate Docker
Write-Host "✓ Checking Docker installation..." -ForegroundColor Yellow
try {
    $DockerVersion = docker --version
    Write-Host "  Found: $DockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker not found! Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Step 2: Validate SSH Connection
Write-Host "`n✓ Testing SSH connection..." -ForegroundColor Yellow
try {
    if (Test-Path $SshKey) {
        Write-Host "  Using SSH key: $SshKey" -ForegroundColor Cyan
        $SshCmd = @("ssh", "-i", $SshKey, "-p", $VpsPort, "$VpsUser@$VpsHost", "echo OK")
    } else {
        Write-Host "  SSH key not found at: $SshKey" -ForegroundColor Yellow
        Write-Host "  Trying default SSH..." -ForegroundColor Cyan
        $SshCmd = @("ssh", "-p", $VpsPort, "$VpsUser@$VpsHost", "echo OK")
    }
    
    $Result = & $SshCmd[0] $SshCmd[1..($SshCmd.Length-1)] 2>&1
    if ($Result -like "*OK*") {
        Write-Host "  ✅ SSH connection successful" -ForegroundColor Green
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Host "  ❌ SSH connection failed!" -ForegroundColor Red
    Write-Host "  Troubleshoot: ssh -v $VpsUser@$VpsHost" -ForegroundColor Yellow
    exit 1
}

# Step 3: Validate VPS has Docker
Write-Host "`n✓ Checking Docker on VPS..." -ForegroundColor Yellow
try {
    if (Test-Path $SshKey) {
        $DockerCheck = ssh -i $SshKey -p $VpsPort "$VpsUser@$VpsHost" "docker --version"
    } else {
        $DockerCheck = ssh -p $VpsPort "$VpsUser@$VpsHost" "docker --version"
    }
    Write-Host "  VPS Docker: $DockerCheck" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker not found on VPS!" -ForegroundColor Red
    Write-Host "  Install Docker on VPS first:" -ForegroundColor Yellow
    Write-Host "  ssh $VpsUser@$VpsHost" -ForegroundColor Cyan
    Write-Host "  curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh" -ForegroundColor Cyan
    exit 1
}

# Step 3: Login to GHCR
Write-Host "`n📋 GitHub Container Registry Login" -ForegroundColor Yellow

if ($GitHubUsername -eq "") {
    $GitHubUsername = Read-Host "  Enter GitHub username"
}

if ($GitHubToken -eq "") {
    Write-Host "  Need GitHub Personal Access Token (PAT):" -ForegroundColor Cyan
    Write-Host "  1. Go: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host "  2. Generate new token (classic)" -ForegroundColor Gray
    Write-Host "  3. Scopes: write:packages, read:packages, delete:packages" -ForegroundColor Gray
    Write-Host "  4. Copy token (starts with 'ghp_')" -ForegroundColor Gray
    $GitHubToken = Read-Host "  Enter token"
}

Write-Host "`n✓ Logging in to GitHub Container Registry..." -ForegroundColor Yellow
$GitHubToken | docker login ghcr.io -u $GitHubUsername --password-stdin
Write-Host "  ✅ GHCR login successful" -ForegroundColor Green
Write-Host "`n📦 Building Docker images..." -ForegroundColor Yellow

Write-Host "  Building API image..." -ForegroundColor Cyan
docker build -t "$Registry/$Repo-api:$Branch" -f apps/api/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ API build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ API image built" -ForegroundColor Green

Write-Host "  Building Web image..." -ForegroundColor Cyan
docker build -t "$Registry/$Repo-web:$Branch" -f apps/web/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Web build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Web image built" -ForegroundColor Green

# Step 4: Push to GHCR
Write-Host "`n📤 Pushing images to GitHub Container Registry..." -ForegroundColor Yellow

Write-Host "  Pushing API image..." -ForegroundColor Cyan
docker push "$Registry/$Repo-api:$Branch"
Write-Host "  ✅ API image pushed" -ForegroundColor Green

Write-Host "  Pushing Web image..." -ForegroundColor Cyan
docker push "$Registry/$Repo-web:$Branch"
Write-Host "  ✅ Web image pushed" -ForegroundColor Green

# Step 5: Deploy on VPS via SSH
Write-Host "`n🚢 Deploying to VPS ($VpsHost)..." -ForegroundColor Yellow

$DeployScript = @"
set -e
cd $VpsPath
export \$(grep -v '^#' .env.production | xargs)

echo '📥 Pulling latest Docker images...'
docker pull $Registry/$Repo-api:$Branch
docker pull $Registry/$Repo-web:$Branch

echo '🛑 Stopping containers...'
docker-compose -f docker-compose.prod.yml down --timeout=30 || true

echo '🔄 Starting new containers...'
docker-compose -f docker-compose.prod.yml up -d

echo '⏳ Waiting for services...'
sleep 5

echo '📊 Container status:'
docker-compose -f docker-compose.prod.yml ps

echo '✅ Deployment complete!'
"@

# Execute via SSH (Windows SSH client)
Write-Host "  Connecting via SSH..." -ForegroundColor Cyan

# Try native SSH (Windows 10+)
try {
    $DeployScript | ssh -p $VpsPort "$VpsUser@$VpsHost" "bash -s"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ SSH deployment successful" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Deployment script had issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ SSH failed. Do you have SSH key configured?" -ForegroundColor Red
    Write-Host "  Try: ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519" -ForegroundColor Yellow
    exit 1
}

# Step 6: Health Check
Write-Host "`n🏥 Health Check..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$HealthUrl = "https://bemreal.com"
Write-Host "  Checking: $HealthUrl" -ForegroundColor Cyan

try {
    $Response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing
    if ($Response.StatusCode -eq 200) {
        Write-Host "  ✅ Site is UP!" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️ Site not responding yet (may still be starting)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Access your app at: https://bemreal.com" -ForegroundColor Cyan
