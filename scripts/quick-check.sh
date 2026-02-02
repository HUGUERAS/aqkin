#!/bin/bash
# Script rápido para verificar se tudo está configurado

echo "🔍 Verificando configuração do Módulo Financeiro..."
echo ""

# Verificar se .env existe
if [ -f "apps/api/.env" ]; then
    echo "✅ apps/api/.env existe"
else
    echo "❌ apps/api/.env não encontrado"
    echo "   Copie apps/api/.env.example e configure as variáveis"
fi

# Verificar se .env do web existe
if [ -f "apps/web/.env" ]; then
    echo "✅ apps/web/.env existe"
else
    echo "❌ apps/web/.env não encontrado"
    echo "   Copie apps/web/.env.example e configure as variáveis"
fi

# Verificar se Python está instalado
if command -v python &> /dev/null; then
    echo "✅ Python instalado: $(python --version)"
else
    echo "❌ Python não encontrado"
fi

# Verificar se pip está instalado
if command -v pip &> /dev/null; then
    echo "✅ pip instalado"
else
    echo "❌ pip não encontrado"
fi

# Verificar se node está instalado
if command -v node &> /dev/null; then
    echo "✅ Node.js instalado: $(node --version)"
else
    echo "❌ Node.js não encontrado"
fi

# Verificar se nx está disponível
if command -v npx &> /dev/null; then
    echo "✅ npx disponível"
else
    echo "❌ npx não encontrado"
fi

echo ""
echo "📋 Próximos passos:"
echo "1. Execute as migrações SQL no Supabase Dashboard"
echo "2. Configure as variáveis de ambiente (.env)"
echo "3. Inicie a API: cd apps/api && uvicorn main:app --reload"
echo "4. Inicie o frontend: npx nx serve web"
echo ""
echo "Para mais detalhes, veja: TESTE_INTEGRAÇÃO.md"
