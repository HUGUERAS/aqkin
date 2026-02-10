# 🚀 Deploy bemreal.com - SIMPLES E FUNCIONA

## ❌ ESQUECE `scp` no PowerShell

Não funciona, abre Bloco de Notas. **Não use.**

---

## ✅ SOLUÇÃO: 3 PASSOS

### 1. Preparar arquivos

```powershell
cd C:\Users\User\aqkin
.\scripts\PREPARAR_TUDO.ps1
```

Cria a pasta `UPLOAD_PARA_VPS` com tudo organizado.

---

### 2. Upload via WinSCP

**Baixar WinSCP:** <https://winscp.net/eng/download.php>

**Conectar:**

- Servidor: `76.13.113.9`
- Usuário: `root`
- Senha: (sua senha)

**Arrastar:**

| De (lado esquerdo) | Para (lado direito) |
|-------------------|-------------------|
| `UPLOAD_PARA_VPS\backend\aqkin.tar.gz` | `/var/www/` |
| **Conteúdo** de `UPLOAD_PARA_VPS\frontend\` | `/var/www/html/` |
| **Arquivos** de `UPLOAD_PARA_VPS\scripts\` | `/root/` |

**Pronto!** Sem comandos, só arrastar.

---

### 3. Deploy no VPS

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

**Tudo automático!**

---

## 📋 Resumo

| Passo | O que fazer |
|-------|-------------|
| **1. Preparar** | `PREPARAR_TUDO.ps1` |
| **2. Upload** | WinSCP (arrastar) |
| **3. Deploy** | SSH + comando |

**Sem `scp`, sem problemas.**
