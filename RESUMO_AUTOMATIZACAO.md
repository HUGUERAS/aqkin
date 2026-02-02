# ✅ O que foi automatizado

## 📦 Scripts criados

| Script | O que faz | Onde rodar |
|--------|-----------|------------|
| **DEPLOY_TUDO.ps1** | Upload completo (backend + frontend + scripts) | PC (PowerShell) |
| **deploy-completo.sh** | Deploy completo (API + Frontend + Nginx + SSL) | VPS (SSH) |
| **deploy-hostinger.sh** | Deploy só da API | VPS (SSH) |
| **deploy-frontend-vps.sh** | Deploy só do frontend | VPS (SSH) |

---

## 🎯 Método simplificado (3 passos)

**Veja `DEPLOY_3_PASSOS.md`** - é o mais simples.

1. **PC:** `.\scripts\DEPLOY_TUDO.ps1` (faz upload de tudo)
2. **VPS:** `bash /root/deploy-completo.sh` (deploy completo)
3. **Testar:** `curl https://api.bemreal.com/`

---

## 🔧 O que ainda precisa ser feito manualmente

| Item | Por quê |
|------|---------|
| **DNS** | Precisa acesso ao painel Hostinger |
| **Senha do VPS** | Segurança - só você tem |
| **SUPABASE_SERVICE_KEY** | Segurança - não pode estar no código |
| **JWT_SECRET** | Segurança - não pode estar no código |

---

## 💡 Dica: Modo não-interativo

Se você já tem as chaves, pode passar como variáveis:

```bash
# No VPS, antes de rodar deploy-completo.sh:
export SUPABASE_SERVICE_KEY="sua_key_aqui"
export JWT_SECRET="seu_secret_aqui"
bash /root/deploy-completo.sh
```

Assim o script não pergunta nada - só roda!

---

## 📋 Arquivos importantes

- **DEPLOY_3_PASSOS.md** - Guia simplificado (3 passos)
- **DEPLOY_BEMREAL_AGORA.md** - Checklist detalhado
- **scripts/VARIAVEIS_DEPLOY.txt** - Template para variáveis de ambiente
