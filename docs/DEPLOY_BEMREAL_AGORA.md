# Deploy bemreal.com — checklist rápido

> **🎯 NOVO: Use `DEPLOY_3_PASSOS.md` para método simplificado!**

## Já feito

- [x] `aqkin.tar.gz` criado (apps + database)
- [x] Frontend buildado (`apps/web/dist`) com `VITE_API_URL=https://api.bemreal.com`
- [x] `.env` do frontend com API URL
- [x] Script de deploy com `api.bemreal.com` como padrão
- [x] **Script master `DEPLOY_TUDO.ps1`** (faz upload de tudo)
- [x] **Script master `deploy-completo.sh`** (deploy API + Frontend)

---

## 1. DNS na Hostinger

Hostinger → **Domínios** → **bemreal.com** → **DNS**:

| Tipo | Nome | Valor |
|------|------|-------|
| A | api | 76.13.113.9 |
| A | @ | 76.13.113.9 |
| A | www | 76.13.113.9 |

---

## 2. No seu PC (PowerShell)

```powershell
cd C:\Users\User\aqkin
scp aqkin.tar.gz root@76.13.113.9:/var/www/
```

(Digite a senha do VPS quando pedir.)

---

## 3. No VPS (SSH)

```bash
ssh root@76.13.113.9
```

Depois, no servidor:

```bash
mkdir -p /var/www/aqkin
cd /var/www && tar -xzf aqkin.tar.gz -C aqkin
bash /root/deploy-hostinger.sh
```

- Subdomínio da API: **Enter** (usa api.bemreal.com)
- SUPABASE_URL: **Enter** (usa padrão)
- SUPABASE_SERVICE_KEY: colar a chave
- JWT_SECRET: colar o JWT Secret do Supabase
- SSL: **s** (para HTTPS em api.bemreal.com)

---

## 4. Subir o frontend para o VPS

No **PC** (depois do deploy da API):

```powershell
cd C:\Users\User\aqkin
scp -r apps\web\dist\* root@76.13.113.9:/var/www/html/
scp scripts\deploy-frontend-vps.sh root@76.13.113.9:/root/
```

No **VPS**:

```bash
bash /root/deploy-frontend-vps.sh
```

(O script configura Nginx + SSL para bemreal.com e <www.bemreal.com>.)

---

## URLs finais

| Serviço | URL |
|---------|-----|
| **API** | <https://api.bemreal.com> |
| **Site** | <https://bemreal.com> ou <https://www.bemreal.com> |

---

## Testar

```bash
curl https://api.bemreal.com/
```

Deve retornar algo como `{"status":"online",...}`.
