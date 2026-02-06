# 🚀 Guia de Deploy (Vercel + Render)

Vercel é excelente para o Frontend e Render é ótimo para o Backend Python (FastAPI). Ambas têm planos gratuitos generosos.

## 1. Deploy do Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe o repositório do seu GitHub.
4. **Configurações do Projeto**:
   - **Framework Preset**: Vite
   - **Root Directory**: Clique em "Edit" e selecione `apps/web`.
   - **Build Settings**:
     - Build Command: `npx nx build web`
     - Output Directory: `dist`
   - **Environment Variables**:
     - Adicione `VITE_SUPABASE_URL`
     - Adicione `VITE_SUPABASE_ANON_KEY`
     - Adicione `VITE_API_URL` com o valor da URL do Backend (você pegará no passo 2, algo como `https://ativo-real-api.onrender.com`).
5. Clique em **Deploy**.

> **Nota**: Criei o arquivo `apps/web/vercel.json` para garantir que as rotas da aplicação funcionem e não dê erro 404 ao atualizar a página.

---

## 2. Deploy do Backend (Render)

1. Acesse [dashboard.render.com](https://dashboard.render.com).
2. Clique em **"New +"** -> **"Web Service"**.
3. Conecte seu repositório GitHub.
4. **Configurações**:
   - **Name**: `ativo-real-api`
   - **Root Directory**: `apps/api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. **Environment Variables** (Avançado):
   - Adicione todas as variáveis do seu arquivo `apps/api/.env` (como chaves do Supabase, DB URL, etc).
6. Clique em **Create Web Service**.

> **Dica**: O arquivo `render.yaml` na raiz do projeto serve como "Blueprint". Se você for em "Blueprints" no Render e conectar o repo, ele preenche tudo sozinho.

---

## 3. Conectando os dois

1. Depois que o Backend estiver online no Render, copie a URL (ex: `https://ativo-real-api.onrender.com`).
2. Volte na Vercel -> Settings -> Environment Variables.
3. Edite/Adicione a variável `VITE_API_URL` com esse valor.
4. Vá em "Deployments" na Vercel e clique em "Redeploy" para atualizar o Frontend com o novo endereço da API.
