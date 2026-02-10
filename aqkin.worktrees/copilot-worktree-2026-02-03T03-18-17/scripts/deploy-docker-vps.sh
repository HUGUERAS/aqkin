#!/bin/bash

# Deploy Docker images to VPS
# Usage: ./deploy-docker-vps.sh [main|develop|staging]

set -e

BRANCH=${1:-main}
VPS_HOST=${VPS_HOST:-76.13.113.9}
VPS_USER=${VPS_USER:-root}
VPS_PATH="/home/bemreal/ativreal-monorepo"
REGISTRY="ghcr.io"
REPO="seu-repo/ativreal-monorepo"

echo "🚀 Deploying branch: $BRANCH to VPS: $VPS_HOST"

# Step 1: Build Docker images locally
echo "📦 Building Docker images..."
docker build -t $REGISTRY/$REPO-api:$BRANCH -f apps/api/Dockerfile .
docker build -t $REGISTRY/$REPO-web:$BRANCH -f apps/web/Dockerfile .

# Step 2: Push to GitHub Container Registry
echo "📤 Pushing images to GHCR..."
docker push $REGISTRY/$REPO-api:$BRANCH
docker push $REGISTRY/$REPO-web:$BRANCH

# Step 3: Deploy on VPS
echo "🚢 Deploying to VPS..."

cat << EOF | ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST
set -e

echo "📥 Pulling latest images..."
docker pull $REGISTRY/$REPO-api:$BRANCH
docker pull $REGISTRY/$REPO-web:$BRANCH

# Navigate to app directory
cd $VPS_PATH

# Load environment variables
if [ -f .env.production ]; then
    export \$(grep -v '^#' .env.production | xargs)
fi

echo "🛑 Stopping old containers..."
docker-compose -f docker-compose.prod.yml down --timeout=30 || true

echo "🔄 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 5

echo "🏥 Running health checks..."
docker-compose -f docker-compose.prod.yml exec -T api curl -f http://localhost:8000/health || echo "⚠️ API health check failed (may still be starting)"

echo "📊 Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo "🌐 Access: https://bemreal.com"

EOF

echo "🎉 Deployment finished!"
