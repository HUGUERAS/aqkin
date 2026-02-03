# 🚀 Deploy bemreal.com - SOLUÇÃO QUE FUNCIONA

## ❌ NÃO USE `scp` no PowerShell

O `scp` no Windows está com problema (abre Bloco de Notas). **Esquece isso.**

---

## ✅ SOLUÇÃO: WinSCP (arrastar e soltar)

### 1. Baixar WinSCP

<https://winscp.net/eng/download.php>

### 2. Conectar

- **Servidor:** `76.13.113.9`
- **Usuário:** `root`
- **Senha:** (sua senha do VPS)
- **Protocolo:** SFTP

### 3. Preparar arquivos (no PowerShell)

```powershell
cd C:\Users\User\aqkin
.\scripts\PREPARAR_UPLOAD.ps1
```

Isso cria a pasta `UPLOAD_PARA_VPS` com tudo organizado.

### 4. Arrastar no WinSCP

**No WinSCP:**

- **Lado esquerdo:** Abra `C:\Users\User\aqkin\UPLOAD_PARA_VPS`
- **Lado direito:** VPS conectado

**Arraste:**

1. `backend\aqkin.tar.gz` → `/var/www/`
2. **Todo conteúdo** de `frontend\` → `/var/www/html/`
3. **Todos os arquivos** de `scripts\` → `/root/`

**Pronto!** Sem comandos, sem Bloco de Notas, só arrastar.

---

## 🖥️ No VPS (SSH)

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

**Tudo automático!**

---

## 📋 Resumo

| Passo | Ferramenta |
|-------|------------|
| **Preparar** | PowerShell (`PREPARAR_UPLOAD.ps1`) |
| **Upload** | WinSCP (arrastar e soltar) |
| **Deploy** | SSH + script automático |

**Sem `scp`, sem Bloco de Notas, sem problemas.**
