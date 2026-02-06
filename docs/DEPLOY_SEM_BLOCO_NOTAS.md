# 🚀 Deploy bemreal.com - SEM Bloco de Notas

## Problema

O `scp` no PowerShell está abrindo Bloco de Notas ao pedir senha.

---

## ✅ Solução 1: Preparar arquivos (mais fácil)

Rode no PowerShell:

```powershell
cd C:\Users\User\aqkin
.\scripts\PREPARAR_UPLOAD.ps1
```

Isso cria a pasta `UPLOAD_PARA_VPS` com tudo organizado. Depois é só arrastar no WinSCP.

---

## ✅ Solução 2: WinSCP (recomendado)

### 1. Baixar WinSCP

<https://winscp.net/eng/download.php>

### 2. Conectar

- **Servidor:** `76.13.113.9`
- **Usuário:** `root`
- **Senha:** (sua senha do VPS)
- **Protocolo:** SFTP

### 3. Upload

**Backend:**

- Arraste `aqkin.tar.gz` → `/var/www/`

**Frontend:**

- Abra a pasta `apps/web/dist/` no WinSCP (lado esquerdo)
- Selecione **todo o conteúdo** (Ctrl+A)
- Arraste para `/var/www/html/` (lado direito)
- ⚠️ **NÃO** arraste a pasta `dist`, só o conteúdo dentro dela

**Scripts:**

- Arraste para `/root/`:
  - `scripts/deploy-hostinger.sh`
  - `scripts/deploy-completo.sh`
  - `scripts/ENV_VARS_VPS.sh`

---

## 🖥️ No VPS (SSH)

Depois do upload:

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

**Pronto!** Tudo automático, sem Bloco de Notas. 🎉

---

## 📋 Resumo

| Item | Método |
|------|--------|
| **Upload** | WinSCP (interface gráfica) |
| **Deploy** | Script automático no VPS |
| **DNS** | Manual (Hostinger) |

**Total:** ~5 minutos (DNS + upload WinSCP + deploy automático)

---

## ✅ Solução 3: SSH Key (sem senha - opcional)

Se quiser nunca mais digitar senha:

```powershell
.\scripts\GERAR_SSH_KEY.ps1
```

Depois copie a chave pública para o VPS (veja instruções no script).

Assim o `scp` não pede senha e não abre Bloco de Notas.
