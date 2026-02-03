-- Script de Verificação das Migrações do Módulo Financeiro
-- Execute no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
    'Tabelas' as tipo,
    table_name as nome,
    CASE 
        WHEN table_name IN ('orcamentos', 'despesas') THEN '✅ Existe'
        ELSE '❌ Não encontrada'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('orcamentos', 'despesas')
ORDER BY table_name;

-- 2. Verificar se o ENUM existe
SELECT 
    'ENUM' as tipo,
    t.typname as nome,
    CASE 
        WHEN t.typname = 'status_orcamento' THEN '✅ Existe'
        ELSE '❌ Não encontrado'
    END as status,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as valores
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'status_orcamento'
GROUP BY t.typname;

-- 3. Verificar colunas das tabelas
SELECT 
    'Colunas' as tipo,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo_dado,
    is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name IN ('orcamentos', 'despesas')
ORDER BY table_name, ordinal_position;

-- 4. Verificar índices
SELECT 
    'Índices' as tipo,
    tablename as tabela,
    indexname as indice,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Criado'
        ELSE '⚠️ Verificar'
    END as status
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename IN ('orcamentos', 'despesas')
ORDER BY tablename, indexname;

-- 5. Verificar se RLS está habilitado
SELECT 
    'RLS' as tipo,
    tablename as tabela,
    CASE 
        WHEN rowsecurity = true THEN '✅ Habilitado'
        ELSE '❌ Desabilitado'
    END as status
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('orcamentos', 'despesas');

-- 6. Verificar políticas RLS
SELECT 
    'Políticas RLS' as tipo,
    schemaname as schema,
    tablename as tabela,
    policyname as politica,
    CASE 
        WHEN policyname LIKE '%_topografo_%' OR policyname LIKE '%_proprietario_%' THEN '✅ Criada'
        ELSE '⚠️ Verificar'
    END as status
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename IN ('orcamentos', 'despesas')
ORDER BY tablename, policyname;

-- 7. Verificar triggers
SELECT 
    'Triggers' as tipo,
    event_object_table as tabela,
    trigger_name as trigger,
    event_manipulation as evento,
    CASE 
        WHEN trigger_name LIKE 'trigger_update_%' THEN '✅ Criado'
        ELSE '⚠️ Verificar'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
    AND event_object_table IN ('orcamentos', 'despesas')
ORDER BY event_object_table, trigger_name;

-- 8. Resumo final
SELECT 
    'RESUMO' as tipo,
    COUNT(DISTINCT table_name) FILTER (WHERE table_name IN ('orcamentos', 'despesas')) as tabelas_criadas,
    COUNT(DISTINCT indexname) FILTER (WHERE tablename IN ('orcamentos', 'despesas')) as indices_criados,
    COUNT(DISTINCT policyname) FILTER (WHERE tablename IN ('orcamentos', 'despesas')) as politicas_rls,
    COUNT(DISTINCT trigger_name) FILTER (WHERE event_object_table IN ('orcamentos', 'despesas')) as triggers
FROM information_schema.tables t
LEFT JOIN pg_indexes i ON i.tablename = t.table_name
LEFT JOIN pg_policies p ON p.tablename = t.table_name
LEFT JOIN information_schema.triggers tr ON tr.event_object_table = t.table_name
WHERE t.table_schema = 'public';
