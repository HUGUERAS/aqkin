#!/bin/bash

# Script para verificar e gerenciar inscrições do GitHub
# Requer o GitHub CLI (gh) instalado: https://cli.github.com/

set -e

echo "========================================"
echo "Verificador de Notificações do GitHub"
echo "========================================"
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo ""
    echo "Para instalar:"
    echo "  - macOS: brew install gh"
    echo "  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  - Windows: https://github.com/cli/cli/releases"
    echo ""
    echo "Ou visite: https://cli.github.com/"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ Você não está autenticado no GitHub CLI."
    echo ""
    echo "Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI está configurado corretamente"
echo ""

# Função para listar repositórios que você está assistindo
list_watching() {
    echo "📋 Repositórios que você está assistindo:"
    echo "=========================================="
    gh api user/subscriptions --paginate | grep -o '"full_name": "[^"]*"' | cut -d'"' -f4 | sort
    echo ""
}

# Função para cancelar inscrição de um repositório
unsubscribe_repo() {
    local repo=$1
    echo "Cancelando inscrição de: $repo"
    gh api -X DELETE "repos/$repo/subscription" && echo "✅ Sucesso!" || echo "❌ Erro ao cancelar inscrição"
}

# Menu principal
echo "Escolha uma opção:"
echo "1. Listar todos os repositórios que você está assistindo"
echo "2. Cancelar inscrição do repositório cli/cli"
echo "3. Cancelar inscrição de outro repositório"
echo "4. Ver suas notificações não lidas"
echo ""
read -p "Digite o número da opção (1-4): " option

case $option in
    1)
        list_watching
        ;;
    2)
        unsubscribe_repo "cli/cli"
        echo ""
        echo "✅ Você não receberá mais notificações do repositório cli/cli"
        echo ""
        echo "Se ainda estiver recebendo emails, pode levar alguns minutos para parar."
        echo "Também verifique suas configurações em: https://github.com/settings/notifications"
        ;;
    3)
        read -p "Digite o nome do repositório (formato: owner/repo): " repo_name
        unsubscribe_repo "$repo_name"
        ;;
    4)
        echo "📬 Notificações não lidas:"
        echo "========================="
        gh api notifications | grep -o '"repository": {"full_name": "[^"]*"' | cut -d'"' -f5 | sort | uniq -c | sort -rn
        echo ""
        echo "Para mais detalhes, visite: https://github.com/notifications"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "Recursos adicionais:"
echo "- Configurações de notificação: https://github.com/settings/notifications"
echo "- Repositórios assistidos: https://github.com/watching"
echo "- Documentação completa: .github/NOTIFICATION_MANAGEMENT.md"
