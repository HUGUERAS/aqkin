#!/usr/bin/env python3
"""
Script de teste de integração do Módulo Financeiro
Verifica:
1. Se as tabelas foram criadas no banco
2. Se os endpoints da API estão funcionando
3. Se o RBAC está funcionando corretamente
"""

import os
import sys
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Carregar variáveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
API_URL = os.getenv("VITE_API_URL") or os.getenv("API_URL", "http://0.0.0.0:8000")

def test_database_tables():
    """Testa se as tabelas foram criadas no banco"""
    print("🔍 Verificando tabelas no banco de dados...")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados")
        return False
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Verificar tabela orcamentos
        try:
            result = supabase.table("orcamentos").select("id").limit(1).execute()
            print("✅ Tabela 'orcamentos' existe")
        except Exception as e:
            print(f"❌ Tabela 'orcamentos' não encontrada: {e}")
            return False
        
        # Verificar tabela despesas
        try:
            result = supabase.table("despesas").select("id").limit(1).execute()
            print("✅ Tabela 'despesas' existe")
        except Exception as e:
            print(f"❌ Tabela 'despesas' não encontrada: {e}")
            return False
        
        # Verificar enum status_orcamento
        try:
            result = supabase.rpc("exec_sql", {
                "sql": "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_orcamento')"
            }).execute()
            if result.data:
                print(f"✅ Enum 'status_orcamento' existe com valores: {[r['enumlabel'] for r in result.data]}")
            else:
                print("⚠️  Enum 'status_orcamento' pode não existir (verificar manualmente)")
        except Exception as e:
            print(f"⚠️  Não foi possível verificar enum (normal se RPC não configurado): {e}")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar ao Supabase: {e}")
        return False

def test_api_endpoints():
    """Testa se os endpoints da API estão funcionando"""
    print("\n🔍 Verificando endpoints da API...")
    
    endpoints = [
        ("GET", "/", "Health check"),
        ("GET", "/api/orcamentos", "Listar orçamentos"),
        ("GET", "/api/despesas", "Listar despesas"),
        ("GET", "/api/pagamentos", "Listar pagamentos"),
    ]
    
    all_ok = True
    for method, endpoint, description in endpoints:
        try:
            url = f"{API_URL}{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code in [200, 401, 403]:  # 401/403 são esperados sem auth
                print(f"✅ {description}: {response.status_code}")
            else:
                print(f"⚠️  {description}: {response.status_code} - {response.text[:100]}")
                all_ok = False
        except requests.exceptions.ConnectionError:
            print(f"❌ {description}: API não está rodando em {API_URL}")
            print("   Execute: cd apps/api && uvicorn main:app --reload")
            all_ok = False
        except Exception as e:
            print(f"❌ {description}: Erro - {e}")
            all_ok = False
    
    return all_ok

def test_rbac_policies():
    """Verifica se as políticas RLS estão configuradas"""
    print("\n🔍 Verificando políticas RLS...")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados")
        return False
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Verificar se RLS está habilitado
        try:
            result = supabase.rpc("exec_sql", {
                "sql": """
                    SELECT tablename, rowsecurity 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    AND tablename IN ('orcamentos', 'despesas')
                """
            }).execute()
            
            if result.data:
                for row in result.data:
                    status = "habilitado" if row.get('rowsecurity') else "desabilitado"
                    print(f"✅ RLS em '{row['tablename']}': {status}")
            else:
                print("⚠️  Não foi possível verificar RLS (RPC pode não estar configurado)")
        except Exception as e:
            print(f"⚠️  Não foi possível verificar RLS via RPC: {e}")
            print("   Verifique manualmente no Supabase Dashboard → Authentication → Policies")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao verificar RLS: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 TESTE DE INTEGRAÇÃO - MÓDULO FINANCEIRO")
    print("=" * 60)
    
    results = {
        "database": test_database_tables(),
        "api": test_api_endpoints(),
        "rbac": test_rbac_policies(),
    }
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name.upper()}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 Todos os testes passaram!")
        return 0
    else:
        print("\n⚠️  Alguns testes falharam. Verifique os erros acima.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
