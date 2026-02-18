# Gerenciamento de Notificações do GitHub

## Problema: Enxurrada de Emails do Repositório cli/cli

Se você está recebendo uma enxurrada de emails com o assunto "cli/cli", isso significa que você está inscrito nas notificações do repositório **github.com/cli/cli** (GitHub CLI).

### Solução Imediata: Cancelar Inscrição

#### Opção 1: Através do Email
1. Abra qualquer email de notificação do cli/cli
2. Role até o final do email
3. Clique no link "unsubscribe" ou "cancelar inscrição"

#### Opção 2: Através do GitHub (Recomendado)
1. Acesse https://github.com/cli/cli
2. No canto superior direito, clique no botão **"Unwatch"** ou **"Deixar de assistir"**
3. Selecione **"Ignore"** ou **"Ignorar"** para parar completamente as notificações

#### Opção 3: Configurações de Notificação do GitHub
1. Vá para https://github.com/settings/notifications
2. Na seção "Subscriptions", procure por "cli/cli"
3. Clique em "Unwatch" ao lado do repositório

### Gerenciar Todas as Notificações

Para revisar e gerenciar todas as suas notificações do GitHub:

1. **Ver repositórios que você está assistindo:**
   - Acesse https://github.com/watching
   - Revise a lista e cancele a inscrição dos repositórios desnecessários

2. **Ajustar configurações globais:**
   - Acesse https://github.com/settings/notifications
   - Configure suas preferências de notificação por email
   - Desative notificações automáticas se preferir

3. **Usar filtros de email:**
   - Configure filtros em seu cliente de email (Gmail, Outlook, etc.)
   - Crie regras para arquivar ou excluir emails de notificação específicos

### Prevenção

Para evitar este problema no futuro:

- **Não clique em "Watch" ou "Star"** em repositórios que você não deseja seguir ativamente
- **Use "Participating and @mentions"** ao invés de "All Activity" para repositórios que você quer acompanhar
- **Configure filtros de email** para organizar notificações do GitHub

### Notificações por Email vs Web

O GitHub oferece dois canais de notificação:

- **Email**: Você recebe emails para cada atividade
- **Web**: Notificações aparecem apenas no GitHub.com

Para reduzir emails:
1. Vá para https://github.com/settings/notifications
2. Em "Email notification preferences"
3. Desmarque as opções que não são essenciais

### Comandos Úteis do GitHub CLI

Se você instalou o GitHub CLI (`gh`), pode gerenciar notificações pela linha de comando:

```bash
# Listar notificações não lidas
gh api notifications

# Ver repositórios que você está assistindo
gh api user/subscriptions

# Cancelar inscrição de um repositório específico
gh api -X DELETE repos/cli/cli/subscription
```

## Suporte Adicional

Se o problema persistir:
- Verifique se não há regras de email redirecionando mensagens
- Entre em contato com o suporte do GitHub: https://support.github.com
- Verifique sua conta em múltiplos dispositivos para garantir que as mudanças foram aplicadas
