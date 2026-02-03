# Ativo Real - Estrutura inicial

Este projeto contem a base de um SaaS multitenant para regularizacao fundiaria.

Back-end (Django + DRF + PostGIS):
- Multitenant por tenant_id em todas as tabelas
- RBAC basico por perfil (topografo vs proprietario)
- Modulos: geografico, gestao, financeiro, pecas tecnicas
- JWT pronto para uso (/api/auth/token)
- Middleware de tenant: X-Tenant-ID ou X-Tenant-Slug (somente superuser)
- Dashboard agregado: /api/dashboard (opcional: ?project=<id>)

Proximos passos sugeridos:
- Subir o PostGIS com docker-compose
- Criar ambiente virtual e instalar requirements
- Configurar variaveis de ambiente a partir de backend/.env.example (porta 5433 no host)
- Rodar migracoes e criar superusuario
- Usar /api/documents/{id}/submit, /approve e /reset para workflow simples
- Filtrar recursos por status e projeto com querystring (ex.: /api/projects?status=done)
