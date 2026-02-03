# ⚠️ O que ainda precisa ser feito manualmente

## ✅ Já automatizado

- [x] **SUPABASE_SERVICE_KEY** - Já está em `scripts/ENV_VARS_VPS.sh`
- [x] **JWT_SECRET** - Já está em `scripts/ENV_VARS_VPS.sh`
- [x] **Deploy completo** - Script `deploy-completo.sh` usa essas variáveis automaticamente

---

## ❌ Ainda precisa fazer manualmente

### 1. DNS na Hostinger (1x só)

**Onde:** Hostinger → **Domínios** → **bemreal.com** → **DNS**

**O que criar:**

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

**Tempo:** ~2 minutos

**Por quê não automatizar:** Precisa acesso ao painel Hostinger (não dá via código).

---

### 2. Senha do VPS (no upload)

**Quando:** Ao fazer upload dos arquivos (WinSCP ou scp)

**Tempo:** ~30 segundos (digitar senha)

**Por quê não automatizar:** Segurança - senha não pode estar no código.

**Solução alternativa:** Use SSH Key (veja abaixo).

---

## 🔑 Solução: SSH Key (elimina senha)

Se quiser **nunca mais digitar senha**:

```powershell
.\scripts\GERAR_SSH_KEY.ps1
```

Depois copie a chave pública para o VPS (instruções no script).

**Resultado:** `scp` não pede senha e não abre Bloco de Notas.

---

## 📋 Resumo final

| Item | Status | Tempo |
|------|--------|-------|
| **DNS** | ❌ Manual | ~2 min |
| **Senha (upload)** | ❌ Manual | ~30 seg |
| **SUPABASE_SERVICE_KEY** | ✅ Automático | 0 |
| **JWT_SECRET** | ✅ Automático | 0 |
| **Deploy** | ✅ Automático | 0 |

**Total manual:** ~2-3 minutos (só DNS + senha no upload)

**Com SSH Key:** ~2 minutos (só DNS)

---

## 🎯 Deploy completo (modo automático)

1. **DNS:** Configure na Hostinger (2 min)
2. **Upload:** WinSCP ou `PREPARAR_UPLOAD.ps1` (3 min)
3. **Deploy:** `source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh` (automático)

**Pronto!** 🎉
