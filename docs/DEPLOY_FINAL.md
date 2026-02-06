# 🚀 Deploy bemreal.com - MODO AUTOMÁTICO

## ✅ O que já está pronto

- [x] Variáveis de ambiente (`ENV_VARS_VPS.sh`) com SUPABASE_SERVICE_KEY e JWT_SECRET
- [x] Scripts de deploy automatizados
- [x] Frontend buildado com `VITE_API_URL=https://api.bemreal.com`

---

## ⚠️ O que ainda precisa fazer manualmente

### 1. DNS na Hostinger (1x só)

Hostinger → **Domínios** → **bemreal.com** → **DNS**:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

**Tempo:** 2 minutos

---

### 2. Upload dos arquivos

**Opção A - PowerShell (pode abrir Bloco de Notas):**

- Rode `.\scripts\DEPLOY_TUDO.ps1` e digite senha 3x

**Opção B - WinSCP (recomendado - sem Bloco de Notas):**

- Use WinSCP para fazer upload via interface gráfica
- Veja `scripts/UPLOAD_WINSCP.md` para instruções

**Opção C - SSH Key (sem senha):**

- Rode `.\scripts\GERAR_SSH_KEY.ps1` uma vez
- Depois nunca mais precisa digitar senha

**Tempo:** 2-5 minutos (depende da conexão)

---

## 🎯 Deploy completo (2 comandos)

### No PC (PowerShell)

```powershell
cd C:\Users\User\aqkin
.\scripts\DEPLOY_TUDO.ps1
```

(Digite a senha do VPS 3 vezes quando pedir)

---

### No VPS (SSH)

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

**Não precisa digitar NADA** - tudo automático! 🎉

---

## ✅ Testar

```bash
curl https://api.bemreal.com/
```

Deve retornar: `{"status":"online","service":"Ativo Real API"}`

Acesse: **<https://bemreal.com>**

---

## 📋 Resumo do que é automático vs manual

| Item | Status |
|------|--------|
| **Criar tar.gz** | ✅ Automático |
| **Build frontend** | ✅ Automático |
| **Upload arquivos** | ⚠️ Precisa senha (3x) |
| **Extrair backend** | ✅ Automático |
| **Instalar Python deps** | ✅ Automático |
| **Criar .env** | ✅ Automático (usa ENV_VARS_VPS.sh) |
| **Configurar systemd** | ✅ Automático |
| **Configurar Nginx** | ✅ Automático |
| **Configurar SSL** | ✅ Automático (se usar source ENV_VARS_VPS.sh) |
| **DNS** | ❌ Manual (Hostinger) |

---

**Total de trabalho manual:**

- **DNS:** ~2 minutos (Hostinger)
- **Upload:** ~3 minutos (WinSCP) ou ~30 segundos (se usar SSH Key)
- **SUPABASE_SERVICE_KEY e JWT_SECRET:** ✅ **JÁ AUTOMATIZADO** (estão em `ENV_VARS_VPS.sh`)

**Total:** ~5 minutos (primeira vez) ou ~2 minutos (se usar SSH Key)
