# 🚀 Deploy Misto: Vercel (Front) + Hostinger (Back)

Essa é a configuração **ideal** em termos de custo-benefício profissional.

- **Frontend** na Vercel: CDN global, super rápido e grátis.
- **Backend** na Hostinger: VPS robusta, IP fixo, controle total e sem limitações de "dormir" do Render.

---

## 1. Deploy do Backend (Hostinger VPS)

Você precisa acessar sua VPS via SSH e rodar o script de deploy que já preparamos.

1. **Acesse a VPS**:

   ```bash
   ssh root@SEU_IP_HOSTINGER
   ```

2. **Execute o Script de Deploy**:

   ```bash
   # Baixar e instalar
   curl -sSL https://raw.githubusercontent.com/SEU_USUARIO/aqkin/main/scripts/deploy-hostinger.sh -o deploy.sh
   chmod +x deploy.sh
   bash deploy.sh
   ```

   *Durante a instalação, o script vai te dar o IP ou Domínio da API (ex: `http://123.456.78.90` ou `https://api.seudominio.com`).* **Anote isso!**

---

## 2. Deploy do Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com) e crie um **New Project**.
2. Importe o repositório `aqkin` do seu GitHub.
3. Configure a build para a pasta `apps/web`:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `npx nx build web`
   - **Output Directory**: `dist`
4. **Environment Variables (MUITO IMPORTANTE)**:
   Adicione as seguintes variáveis:

   | Nome | Valor |
   |------|-------|
   | `VITE_SUPABASE_URL` | *Sua URL do Supabase* |
   | `VITE_SUPABASE_ANON_KEY` | *Sua Anon Key do Supabase* |
   | `VITE_API_URL` | **A URL da Hostinger** (ex: `http://SEU_IP_HOSTINGER:8000` ou `https://api.seudominio.com`) |

5. Clique em **Deploy**.

---

## 3. Resumo da Arquitetura

- Quando o usuário acessa `seudominio.com` (Vercel), ele baixa o HTML/JS super rápido.
- O Frontend (React) faz chamadas para o Supabase (Auth/Dados).
- O Frontend faz chamadas para sua API Python na Hostinger (`VITE_API_URL`) para regras de negócio complexas.

### Vantagens dessa abordagem

- **Zero Custo na Vercel** (Hobby Tier).
- **Backend Rápido**: A VPS da Hostinger está sempre ligada, não tem "Cold Start".
- **Escalabilidade**: Se precisar de mais poder no backend, é só aumentar a VPS. O frontend escala infinitamente na Vercel.
