# 🚀 Deploy bemreal.com - Configuração SSH

## ✅ Configurar SSH (resolve Bloco de Notas)

Rode no PowerShell:

```powershell
.\scripts\CONFIGURAR_SSH.ps1
```

Isso cria/atualiza `~/.ssh/config` com alias `bemreal` para o VPS.

---

## 🎯 Deploy com SSH configurado

### 1. Preparar arquivos

```powershell
.\scripts\PREPARAR_UPLOAD.ps1
```

### 2. Upload (agora usa alias 'bemreal')

```powershell
.\scripts\DEPLOY_TUDO.ps1
```

**OU** use WinSCP normalmente.

---

## 📋 Comandos com alias SSH

Depois de configurar, você pode usar:

```powershell
# Conectar
ssh bemreal

# Upload
scp arquivo bemreal:/destino
scp -r pasta bemreal:/destino

# Sem precisar digitar root@76.13.113.9 toda vez
```

---

## 🔑 Opcional: SSH Key (sem senha)

Se quiser nunca mais digitar senha:

```powershell
.\scripts\GERAR_SSH_KEY.ps1
```

Depois copie a chave pública para o VPS (instruções no script).

Assim o `scp` não pede senha e não abre Bloco de Notas.

---

**Veja `DEPLOY_SEM_BLOCO_NOTAS.md` para mais opções.**
