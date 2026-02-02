#!/bin/bash
# Variáveis de ambiente para deploy não-interativo
# Copie e cole no terminal do VPS ANTES de rodar deploy-completo.sh
# OU: source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh

export SUPABASE_URL="https://xntxtdximacsdnldouxa.supabase.co"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudHh0ZHhpbWFjc2RubGRvdXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1OTkxOCwiZXhwIjoyMDg1NTM1OTE4fQ.aEGC44KAzlK6iECi5_0zukv1BX5gjFCl4UHjljopKRk"
export JWT_SECRET="23MbafKQhdiOf7pa3MTtB56t80Yw0R8dDrDj56One1H8pGmc42EZYSCR1bfavgsi/SI14A+R1NseUGC4RcY4gg=="

echo "Variáveis configuradas. Rode: bash /root/deploy-completo.sh"
