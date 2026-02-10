#!/usr/bin/env python3
"""
Script de Migração Automática: Azure PostgreSQL → Supabase
Migra dados de projetos, lotes, pagamentos do banco Azure existente
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# Configurações de conexão
AZURE_DB_URL = os.getenv('AZURE_DATABASE_URL')  # URL do banco Azure existente
SUPABASE_DB_URL = f"postgresql://postgres.xntxtdximacsdnldouxa:{os.getenv('SUPABASE_SERVICE_ROLE_KEY')}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

def migrate_data():
    """Migra dados do Azure para Supabase"""
    
    if not AZURE_DB_URL:
        print("❌ AZURE_DATABASE_URL não configurada. Configure no .env")
        print("Exemplo: AZURE_DATABASE_URL=postgresql://user:pass@host:5432/dbname")
        return
    
    # Conectar aos bancos
    print("🔌 Conectando ao Azure PostgreSQL...")
    azure_conn = psycopg2.connect(AZURE_DB_URL, cursor_factory=RealDictCursor)
    azure_cur = azure_conn.cursor()
    
    print("🔌 Conectando ao Supabase PostgreSQL...")
    supabase_conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
    supabase_cur = supabase_conn.cursor()
    
    try:
        # 1. Migrar Projetos
        print("\n📦 Migrando projetos...")
        azure_cur.execute("""
            SELECT id, nome, descricao, tipo, status, criado_em, atualizado_em
            FROM projetos
            ORDER BY id
        """)
        projetos = azure_cur.fetchall()
        
        for proj in projetos:
            supabase_cur.execute("""
                INSERT INTO projetos (id, nome, descricao, tipo, status, criado_em, atualizado_em)
                VALUES (%(id)s, %(nome)s, %(descricao)s, %(tipo)s, %(status)s, %(criado_em)s, %(atualizado_em)s)
                ON CONFLICT (id) DO UPDATE SET
                    nome = EXCLUDED.nome,
                    descricao = EXCLUDED.descricao,
                    tipo = EXCLUDED.tipo,
                    status = EXCLUDED.status,
                    atualizado_em = EXCLUDED.atualizado_em
            """, proj)
        
        supabase_conn.commit()
        print(f"✅ {len(projetos)} projetos migrados")
        
        # 2. Migrar Lotes
        print("\n📐 Migrando lotes...")
        azure_cur.execute("""
            SELECT id, projeto_id, nome_cliente, email_cliente, telefone_cliente, 
                   cpf_cnpj_cliente, token_acesso, link_expira_em, matricula,
                   ST_AsText(geom) as geom_wkt, area_ha, perimetro_m, status,
                   metadata_validacao, contrato_url, criado_em, atualizado_em
            FROM lotes
            ORDER BY id
        """)
        lotes = azure_cur.fetchall()
        
        for lote in lotes:
            # Converter WKT para geometria
            geom_value = f"ST_GeomFromText('{lote['geom_wkt']}', 4674)" if lote['geom_wkt'] else "NULL"
            
            supabase_cur.execute(f"""
                INSERT INTO lotes (
                    id, projeto_id, nome_cliente, email_cliente, telefone_cliente,
                    cpf_cnpj_cliente, token_acesso, link_expira_em, matricula,
                    geom, area_ha, perimetro_m, status, metadata_validacao,
                    contrato_url, criado_em, atualizado_em
                )
                VALUES (
                    %(id)s, %(projeto_id)s, %(nome_cliente)s, %(email_cliente)s, %(telefone_cliente)s,
                    %(cpf_cnpj_cliente)s, %(token_acesso)s, %(link_expira_em)s, %(matricula)s,
                    {geom_value}, %(area_ha)s, %(perimetro_m)s, %(status)s, %(metadata_validacao)s,
                    %(contrato_url)s, %(criado_em)s, %(atualizado_em)s
                )
                ON CONFLICT (id) DO UPDATE SET
                    nome_cliente = EXCLUDED.nome_cliente,
                    email_cliente = EXCLUDED.email_cliente,
                    status = EXCLUDED.status,
                    atualizado_em = EXCLUDED.atualizado_em
            """, lote)
        
        supabase_conn.commit()
        print(f"✅ {len(lotes)} lotes migrados")
        
        # 3. Migrar Pagamentos
        print("\n💰 Migrando pagamentos...")
        azure_cur.execute("""
            SELECT id, lote_id, valor_total, valor_pago, status, gateway_id, data_pagamento
            FROM pagamentos
            ORDER BY id
        """)
        pagamentos = azure_cur.fetchall()
        
        for pag in pagamentos:
            supabase_cur.execute("""
                INSERT INTO pagamentos (id, lote_id, valor_total, valor_pago, status, gateway_id, data_pagamento)
                VALUES (%(id)s, %(lote_id)s, %(valor_total)s, %(valor_pago)s, %(status)s, %(gateway_id)s, %(data_pagamento)s)
                ON CONFLICT (id) DO UPDATE SET
                    valor_pago = EXCLUDED.valor_pago,
                    status = EXCLUDED.status,
                    data_pagamento = EXCLUDED.data_pagamento
            """, pag)
        
        supabase_conn.commit()
        print(f"✅ {len(pagamentos)} pagamentos migrados")
        
        # Atualizar sequences
        print("\n🔢 Atualizando sequences...")
        if projetos:
            max_id = max(p['id'] for p in projetos)
            supabase_cur.execute(f"SELECT setval('projetos_id_seq', {max_id}, true)")
        
        if lotes:
            max_id = max(l['id'] for l in lotes)
            supabase_cur.execute(f"SELECT setval('lotes_id_seq', {max_id}, true)")
        
        if pagamentos:
            max_id = max(p['id'] for p in pagamentos)
            supabase_cur.execute(f"SELECT setval('pagamentos_id_seq', {max_id}, true)")
        
        supabase_conn.commit()
        print("✅ Sequences atualizadas")
        
        print("\n🎉 Migração concluída com sucesso!")
        
    except Exception as e:
        print(f"\n❌ Erro durante migração: {e}")
        supabase_conn.rollback()
        raise
    
    finally:
        azure_cur.close()
        azure_conn.close()
        supabase_cur.close()
        supabase_conn.close()

if __name__ == "__main__":
    migrate_data()
