# 🚀 Deploy Automático - UM COMANDO SÓ

## ✅ Rode isso

```powershell
cd C:\Users\User\aqkin
.\scripts\DEPLOY_AUTOMATICO.ps1
```

**Pronto!** O script faz TUDO:

1. ✅ Verifica se a chave SSH está configurada no VPS (se não, configura automaticamente)
2. ✅ Cria `aqkin.tar.gz` (backend)
3. ✅ Build do frontend (`npx nx build web`)
4. ✅ Upload backend via SSH
5. ✅ Upload frontend via SSH
6. ✅ Upload scripts via SSH
7. ✅ Executa deploy no VPS automaticamente

**Se a chave SSH não estiver configurada no VPS, vai pedir senha UMA VEZ só para configurá-la. Depois nunca mais pede senha.**

---

## 📋 O que acontece

- **Prepara** → cria tar.gz e build do frontend
- **Upload** → usa `scp -i` com sua chave SSH (sem senha!)
- **Deploy** → executa `deploy-completo.sh` no VPS via SSH

**Tudo automático, sem Bloco de Notas, sem WinSCP, sem nada manual.**

---

## 🎯 Resultado

- **Frontend:** <https://bemreal.com>
- **API:** <https://api.bemreal.com>

**Rode o script e pronto!**
