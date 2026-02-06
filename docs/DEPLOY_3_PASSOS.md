# 🚀 Deploy bemreal.com - 3 PASSOS

## ✅ Pré-requisito: DNS

Hostinger → **Domínios** → **bemreal.com** → **DNS**:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

---

## 📦 PASSO 1: No seu PC (PowerShell)

```powershell
cd C:\Users\User\aqkin
.\scripts\DEPLOY_TUDO.ps1
```

O script vai:

- Criar `aqkin.tar.gz` (se não existir)
- Buildar frontend (se não existir `dist`)
- Fazer upload de **tudo** pro VPS (backend, frontend, scripts)

**Você vai digitar a senha do VPS 3 vezes** (uma para cada upload).

---

## 🖥️ PASSO 2: No VPS (SSH)

```bash
ssh root@76.13.113.9
```

Depois, no servidor:

```bash
bash /root/deploy-completo.sh
```

**Modo automático** (variáveis já estão no arquivo ENV_VARS_VPS.sh):

- Não precisa digitar nada - SSL é configurado automaticamente!

**Modo interativo** (se rodar só `bash /root/deploy-completo.sh`):

- SUPABASE_SERVICE_KEY: **cole a chave**
- JWT_SECRET: **cole o JWT Secret**
- SSL API: **s** (sim)
- SSL Frontend: **s** (sim)

---

## ✅ PASSO 3: Testar

```bash
curl https://api.bemreal.com/
```

Deve retornar: `{"status":"online","service":"Ativo Real API"}`

Acesse: **<https://bemreal.com>**

---

## 🎯 URLs finais

| Serviço | URL |
|---------|-----|
| **API** | <https://api.bemreal.com> |
| **Site** | <https://bemreal.com> |

---

## ⚡ Modo não-interativo (opcional)

Se você já tem as chaves, pode passar como variáveis:

```bash
SUPABASE_SERVICE_KEY=sua_key JWT_SECRET=seu_secret bash /root/deploy-completo.sh
```

Assim não precisa digitar nada.
