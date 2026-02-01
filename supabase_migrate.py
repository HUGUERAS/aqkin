import os
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://xntxtdximacsdnldouxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudHh0ZHhpbWFjc2RubGRvdXhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk1OTkxOCwiZXhwIjoyMDg1NTM1OTE4fQ.aEGC44KAzlK6iECi5_0zukv1BX5gjFCl4UHjljopKRk"

# Read SQL file
sql_path = os.path.join("..", "novo-projeto", "database", "init", "01_schema.sql")
with open(sql_path, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Execute SQL via RPC (if available) or REST API
print("🚀 Executando migração no Supabase...")
print(f"📄 SQL: {sql_path}")

try:
    # Note: Supabase Python client doesn't have direct SQL execution
    # We'll need to use PostgREST API or direct PostgreSQL connection
    print("⚠️  Use Supabase Dashboard SQL Editor ou psql para executar:")
    print(f"\nConexão: postgresql://postgres.xntxtdximacsdnldouxa@aws-0-us-east-1.pooler.supabase.com:6543/postgres")
    print(f"\nSQL:\n{sql_content[:500]}...\n")
    
except Exception as e:
    print(f"❌ Erro: {e}")
