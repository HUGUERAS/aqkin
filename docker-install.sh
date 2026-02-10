#!/bin/bash

# ============================================
# SCRIPT: Instalar Docker no WSL Ubuntu
# ============================================

echo "🐳 Instalando Docker no WSL..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update do sistema
echo -e "${YELLOW}[1/4] Atualizando pacotes...${NC}"
apt-get update -qq

# Instalar dependências
echo -e "${YELLOW}[2/4] Instalando dependências...${NC}"
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# Adicionar GPG key do Docker
echo -e "${YELLOW}[3/4] Adicionando repositório Docker...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg 2>/dev/null

# Adicionar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar novamente
apt-get update -qq

# Instalar Docker
echo -e "${YELLOW}[4/4] Instalando Docker...${NC}"
apt-get install -y -qq docker.io docker-compose

# Verificar instalação
echo ""
if command -v docker &> /dev/null; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Docker instalado com sucesso!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Versão: $(docker --version)"
    echo ""
    echo "📝 Próximas etapas:"
    echo "   1. Inicie o Docker daemon:"
    echo "      service docker start"
    echo ""
    echo "   2. Execute o setup:"
    echo "      cd /mnt/c/Users/User/aqkin/aqkin"
    echo "      bash docker-setup.sh"
    echo ""
else
    echo -e "${RED}❌ Falha na instalação${NC}"
    exit 1
fi
