# ✅ Checklist Final - Deploy bemreal.com

## O que está AUTOMATIZADO ✅

- [x] **SUPABASE_SERVICE_KEY** - Já está em `scripts/ENV_VARS_VPS.sh`
- [x] **JWT_SECRET** - Já está em `scripts/ENV_VARS_VPS.sh`
- [x] **Criar tar.gz** - Automático nos scripts
- [x] **Build frontend** - Automático nos scripts
- [x] **Deploy completo** - Script `deploy-completo.sh` usa variáveis automaticamente
- [x] **SSL** - Automático se usar `source ENV_VARS_VPS.sh`

---

## O que ainda precisa fazer MANUALMENTE ❌

### 1. DNS na Hostinger (1x só - ~2 min)

Hostinger → **Domínios** → **bemreal.com** → **DNS**:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

**Por quê:** Precisa acesso ao painel Hostinger (não dá pra automatizar).

---

### 2. Upload dos arquivos (~3 min)

**Opção A - WinSCP (recomendado):**

1. Baixe WinSCP: <https://winscp.net/eng/download.php>
2. Conecte em `76.13.113.9` (usuário: `root`)
3. Arraste:
   - `aqkin.tar.gz` → `/var/www/`
   - Conteúdo de `apps/web/dist/` → `/var/www/html/`
   - Scripts (`deploy-*.sh`, `ENV_VARS_VPS.sh`) → `/root/`

**Opção B - Preparar e arrastar:**

```powershell
.\scripts\PREPARAR_UPLOAD.ps1
```

Depois arraste a pasta `UPLOAD_PARA_VPS` no WinSCP.

**Por quê:** Senha do VPS não pode estar no código (segurança).

**Solução:** Use SSH Key (veja abaixo) para nunca mais digitar senha.

---

## 🔑 Eliminar senha (opcional)

Se quiser **nunca mais digitar senha**:

```powershell
.\scripts\GERAR_SSH_KEY.ps1
```

Depois copie a chave pública para o VPS (instruções no script).

**Resultado:** Upload sem senha, sem Bloco de Notas.

---

## 🎯 Deploy completo (passo a passo)

### 1. DNS (Hostinger)

- Configure os 3 registros A (api, @, www → 76.13.113.9)

### 2. Upload (WinSCP ou PowerShell)

- **WinSCP:** Arraste arquivos conforme acima
- **OU:** `.\scripts\PREPARAR_UPLOAD.ps1` e arraste `UPLOAD_PARA_VPS`

### 3. Deploy (VPS)

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

**Não precisa digitar SUPABASE_SERVICE_KEY nem JWT_SECRET** - já estão no arquivo! 🎉

---

## 📊 Resumo

| Item | Status | Tempo |
|------|--------|-------|
| **DNS** | ❌ Manual | ~2 min |
| **Upload** | ⚠️ Manual (senha) | ~3 min |
| **SUPABASE_SERVICE_KEY** | ✅ **AUTOMÁTICO** | 0 |
| **JWT_SECRET** | ✅ **AUTOMÁTICO** | 0 |
| **Deploy** | ✅ Automático | 0 |

**Total manual:** ~5 minutos (DNS + upload)

**Com SSH Key:** ~2 minutos (só DNS)

---

**Veja `DEPLOY_SEM_BLOCO_NOTAS.md` para soluções do Bloco de Notas.**
