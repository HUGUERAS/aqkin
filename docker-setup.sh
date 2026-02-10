#!/bin/bash

# ============================================
# SCRIPT: Setup e Start Docker para AtivoReal
# ============================================

echo "🐳 Iniciando Docker..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Docker instalado
echo -e "${YELLOW}[1/3] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker encontrado: $(docker --version)${NC}"

# Verificar se daemon está rodando
echo -e "${YELLOW}[2/3] Verificando Docker daemon...${NC}"
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker daemon não está rodando${NC}"
    echo "Inicie com: service docker start"
    exit 1
fi
echo -e "${GREEN}✅ Docker daemon rodando${NC}"

# Build e Start
echo -e "${YELLOW}[3/3] Iniciando containers...${NC}"
cd /mnt/c/Users/User/aqkin/aqkin 2>/dev/null || cd ~/aqkin

if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ Encontrado docker-compose.yml${NC}"
    
    docker-compose build
    docker-compose up -d
    
    sleep 2
    docker ps
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Docker rodando!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:80"
    echo "   Backend:  http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
else
    echo -e "${RED}❌ docker-compose.yml não encontrado${NC}"
    exit 1
fi

