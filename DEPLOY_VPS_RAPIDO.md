# 🚀 DEPLOY VIA DOCKER - GUIA RÁPIDO

## ✅ PRÉ-REQUISITOS

- [ ] Docker instalado (Windows 10+)
  ```powershell
  docker --version
  ```

- [ ] SSH funcionando
  ```powershell
  ssh root@76.13.113.9 "echo OK"
  ```
  
  **Se falhar, gerar SSH key:**
  ```powershell
  ssh-keygen -t ed25519 -f $HOME\.ssh\id_ed25519 -N ""
  type $HOME\.ssh\id_ed25519.pub | ssh root@76.13.113.9 "cat >> ~/.ssh/authorized_keys"
  ```

- [ ] GitHub Personal Token criado
  - Ir a: https://github.com/settings/tokens
  - Clicar: "Generate new token (classic)"
  - Scopes: `write:packages, read:packages, delete:packages`
  - Copiar token (começa com `ghp_`)

---

## 🎬 EXECUTAR DEPLOY

### Step 1️⃣ - Abrir PowerShell e ir para projeto

```powershell
cd C:\Users\User\aqkin\aqkin.worktrees\copilot-worktree-2026-02-03T03-18-17
```

### Step 2️⃣ - Editar script com seus dados

```powershell
# Abrir script
code scripts\DEPLOY-VPS.ps1

# Alterar estas linhas (no topo):
$GitHubUsername = "SEU-USERNAME-AQUI"
$GitHubRepo = "SEU-REPO-AQUI/ativreal-monorepo"

# Salvar (Ctrl+S)
```

**Exemplo:**
```powershell
$GitHubUsername = "joaosilva"
$GitHubRepo = "joaosilva/ativreal-monorepo"
```

### Step 3️⃣ - Executar script

```powershell
.\scripts\DEPLOY-VPS.ps1
```

**O script fará automaticamente:**
1. ✅ Verificar Docker
2. ✅ Pedir GitHub Token (digite no prompt)
3. ✅ Login no GitHub Container Registry
4. ✅ Build docker images (API + Web)
5. ✅ Push para GHCR
6. ✅ SSH na VPS + docker-compose pull + up
7. ✅ Health check

### Step 4️⃣ - Acessar

```
🌐 https://bemreal.com
```

---

## 📊 TEMPO ESTIMADO

| Etapa | Tempo |
|-------|-------|
| Build API | 5-7 min |
| Build Web | 3-5 min |
| Push para GHCR | 2-3 min |
| Deploy na VPS | 1-2 min |
| **Total** | **15-20 min** |

---

## 🚨 SE DER ERRO

### Err: "SSH connection refused"
```powershell
# SSH não configurado. Gerar key:
ssh-keygen -t ed25519 -f $HOME\.ssh\id_ed25519 -N ""
type $HOME\.ssh\id_ed25519.pub | ssh root@76.13.113.9 "cat >> ~/.ssh/authorized_keys"

# Tentar de novo
ssh root@76.13.113.9 "echo OK"
```

### Err: "Docker not found"
```powershell
# Instalar Docker:
# https://www.docker.com/products/docker-desktop

# Depois reiniciar PowerShell
```

### Err: "GHCR login failed"
```powershell
# Verificar token
# Ir a: https://github.com/settings/tokens

# Se token expirou: gerar novo
# Tentar de novo
.\scripts\DEPLOY-VPS.ps1
```

### Err: "API returns 502 Bad Gateway"
```powershell
# Normal! Containers ainda estão iniciando
# Aguardar 30 segundos
# Ver logs:
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose logs -f api"
```

---

## 📋 CHECKLIST FINAL

- [ ] Editei `scripts\DEPLOY-VPS.ps1` com GitHub username/repo
- [ ] Rodar: `.\scripts\DEPLOY-VPS.ps1`
- [ ] Cole GitHub Token quando pedido
- [ ] Aguardar 15-20 min
- [ ] Acessar https://bemreal.com
- [ ] ✅ Pronto!

---

## 🆘 AJUDA

```powershell
# Ver status containers
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose ps"

# Ver logs
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose logs -f"

# Restart
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose restart"

# Stop all
ssh root@76.13.113.9 "cd /home/bemreal/ativreal-monorepo && docker-compose down"
```
