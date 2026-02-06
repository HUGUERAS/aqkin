# 🚀 Deploy bemreal.com - COM SSH KEY (sem senha)

## ✅ Chave SSH criada

Sua chave: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAOk6KEfDT5VBfLwkkP7PjLhRXV1z9ttSZ+JUbIT7y92 user@hugo`

---

## 🔑 Passo 1: Configurar chave no VPS

### Opção A - Automático (recomendado)

```powershell
.\scripts\COPIAR_CHAVE_VPS.ps1
```

Vai pedir senha **UMA ÚLTIMA VEZ**, depois nunca mais!

### Opção B - Manual

```bash
ssh root@76.13.113.9
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAOk6KEfDT5VBfLwkkP7PjLhRXV1z9ttSZ+JUbIT7y92 user@hugo' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 🎯 Passo 2: Deploy completo (SEM SENHA!)

```powershell
.\scripts\DEPLOY_TUDO.ps1
```

**Agora funciona sem pedir senha e sem abrir Bloco de Notas!** 🎉

O script detecta a chave SSH e usa automaticamente.

---

## ✅ Testar

```powershell
ssh root@76.13.113.9
```

Se conectar **sem pedir senha**, está funcionando!

---

## 📋 Resumo

| Item | Status |
|------|--------|
| **Chave SSH** | ✅ Criada |
| **Configurar no VPS** | ⚠️ Precisa fazer 1x |
| **Upload** | ✅ Automático (sem senha) |
| **Deploy** | ✅ Automático |

**Depois de configurar a chave no VPS:** tudo automático, sem senha, sem Bloco de Notas!
