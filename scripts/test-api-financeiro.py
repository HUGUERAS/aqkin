#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de teste dos endpoints do Módulo Financeiro
Testa se a API está respondendo corretamente aos endpoints de orçamentos, despesas e pagamentos
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Carregar variáveis de ambiente
load_dotenv()

API_URL = os.getenv("VITE_API_URL") or os.getenv("API_URL") or "http://0.0.0.0:8000"

def test_health_check():
    """Testa o health check da API"""
    print("🔍 Testando Health Check...")
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check OK: {data}")
            return True
        else:
            print(f"❌ Health Check falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao conectar na API: {e}")
        print(f"   URL tentada: {API_URL}")
        return False

def test_endpoints_sem_auth():
    """Testa se os endpoints requerem autenticação"""
    print("\n🔍 Testando proteção de endpoints (sem autenticação)...")
    
    endpoints = [
        "/api/orcamentos",
        "/api/despesas",
        "/api/pagamentos",
    ]
    
    todos_protegidos = True
    for endpoint in endpoints:
        try:
            response = requests.get(f"{API_URL}{endpoint}")
            if response.status_code == 401:
                print(f"✅ {endpoint} - Protegido (401)")
            elif response.status_code == 403:
                print(f"✅ {endpoint} - Protegido (403)")
            else:
                print(f"⚠️  {endpoint} - Status: {response.status_code}")
                todos_protegidos = False
        except Exception as e:
            print(f"❌ Erro ao testar {endpoint}: {e}")
            todos_protegidos = False
    
    return todos_protegidos

def test_swagger_docs():
    """Verifica se a documentação Swagger está disponível"""
    print("\n🔍 Verificando documentação Swagger...")
    try:
        response = requests.get(f"{API_URL}/docs")
        if response.status_code == 200:
            print("✅ Swagger disponível em /docs")
            print(f"   Acesse: {API_URL}/docs")
            return True
        else:
            print(f"⚠️  Swagger não disponível: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao verificar Swagger: {e}")
        return False

def test_openapi_schema():
    """Verifica se o schema OpenAPI está disponível"""
    print("\n🔍 Verificando schema OpenAPI...")
    try:
        response = requests.get(f"{API_URL}/openapi.json")
        if response.status_code == 200:
            schema = response.json()
            paths = schema.get("paths", {})
            
            # Verificar se os endpoints financeiros estão no schema
            financeiro_endpoints = [
                "/api/orcamentos",
                "/api/orcamentos/{orcamento_id}",
                "/api/despesas",
                "/api/despesas/{despesa_id}",
                "/api/pagamentos",
            ]
            
            encontrados = []
            faltando = []
            
            for endpoint in financeiro_endpoints:
                # Normalizar para comparação
                normalized = endpoint.replace("{", "").replace("}", "")
                if any(normalized in path for path in paths.keys()):
                    encontrados.append(endpoint)
                else:
                    faltando.append(endpoint)
            
            print(f"✅ Endpoints encontrados no schema: {len(encontrados)}/{len(financeiro_endpoints)}")
            if encontrados:
                for e in encontrados:
                    print(f"   ✅ {e}")
            if faltando:
                print(f"⚠️  Endpoints faltando:")
                for e in faltando:
                    print(f"   ❌ {e}")
            
            return len(faltando) == 0
        else:
            print(f"⚠️  Schema OpenAPI não disponível: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao verificar schema OpenAPI: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 Teste de Integração - Módulo Financeiro API")
    print("=" * 60)
    print(f"API URL: {API_URL}\n")
    
    resultados = []
    
    # Testes básicos
    resultados.append(("Health Check", test_health_check()))
    resultados.append(("Proteção de Endpoints", test_endpoints_sem_auth()))
    resultados.append(("Swagger Docs", test_swagger_docs()))
    resultados.append(("OpenAPI Schema", test_openapi_schema()))
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 Resumo dos Testes")
    print("=" * 60)
    
    for nome, resultado in resultados:
        status = "✅ PASSOU" if resultado else "❌ FALHOU"
        print(f"{nome}: {status}")
    
    total = len(resultados)
    passou = sum(1 for _, r in resultados if r)
    
    print(f"\nTotal: {passou}/{total} testes passaram")
    
    if passou == total:
        print("\n🎉 Todos os testes passaram!")
        return 0
    else:
        print(f"\n⚠️  {total - passou} teste(s) falharam")
        print("\n💡 Dicas:")
        print("   - Verifique se a API está rodando")
        print("   - Verifique se VITE_API_URL está configurado corretamente")
        print("   - Execute: cd apps/api && uvicorn main:app --reload --port 8000")
        return 1

if __name__ == "__main__":
    sys.exit(main())
