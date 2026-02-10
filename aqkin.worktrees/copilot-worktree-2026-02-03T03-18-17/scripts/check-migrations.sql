-- Script SQL para verificar se as migrações do Módulo Financeiro foram aplicadas
-- Execute no Supabase Dashboard → SQL Editor

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('orcamentos', 'despesas') THEN '✅ Existe'
        ELSE '❌ Não encontrada'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orcamentos', 'despesas');

-- 2. Verificar estrutura da tabela orcamentos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orcamentos'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela despesas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'despesas'
ORDER BY ordinal_position;

-- 4. Verificar se o enum status_orcamento existe
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'status_orcamento'
ORDER BY e.enumsortorder;

-- 5. Verificar índices
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('orcamentos', 'despesas')
ORDER BY tablename, indexname;

-- 6. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('orcamentos', 'despesas');

-- 7. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('orcamentos', 'despesas')
ORDER BY tablename, policyname;

-- 8. Verificar triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('orcamentos', 'despesas')
ORDER BY event_object_table, trigger_name;

-- 9. Contar registros (deve ser 0 se migração foi aplicada recentemente)
SELECT 
    'orcamentos' as tabela,
    COUNT(*) as total_registros
FROM orcamentos
UNION ALL
SELECT 
    'despesas' as tabela,
    COUNT(*) as total_registros
FROM despesas;
