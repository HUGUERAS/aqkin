# Upload via WinSCP (sem Bloco de Notas)

Se o `scp` no PowerShell está abrindo Bloco de Notas, use **WinSCP** (interface gráfica).

---

## 1. Baixar WinSCP

<https://winscp.net/eng/download.php>

---

## 2. Conectar no VPS

- **Servidor:** `76.13.113.9`
- **Usuário:** `root`
- **Senha:** (sua senha do VPS)
- **Protocolo:** SFTP

---

## 3. Upload dos arquivos

### Backend

1. Arraste `aqkin.tar.gz` para `/var/www/`

### Frontend

1. Arraste **todo o conteúdo** de `apps/web/dist/` para `/var/www/html/`
   (não arraste a pasta `dist`, só o conteúdo dentro dela)

### Scripts

1. Arraste estes arquivos para `/root/`:
   - `scripts/deploy-hostinger.sh`
   - `scripts/deploy-completo.sh`
   - `scripts/ENV_VARS_VPS.sh`

---

## 4. No VPS (SSH)

Depois do upload, conecte via SSH e rode:

```bash
ssh root@76.13.113.9
source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh
```

---

**Pronto!** Sem Bloco de Notas, sem problemas. 🎉
