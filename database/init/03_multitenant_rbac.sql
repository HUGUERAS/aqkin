-- Bloco 1: Multitenant + RBAC
-- Isolamento por tenant (topógrafo) e RBAC (Topógrafo=CRUD, Proprietário=leitura)

-- 1. Garantir coluna tenant (topografo_id já existe em 02_extensions)
-- Padronizar: tenant_id = topografo que possui o projeto
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS tenant_id UUID;
-- Migração: usar topografo_id como tenant_id se existir
UPDATE projetos SET tenant_id = topografo_id WHERE tenant_id IS NULL AND topografo_id IS NOT NULL;
-- Índice para filtros por tenant
CREATE INDEX IF NOT EXISTS idx_projetos_tenant ON projetos(tenant_id);

-- 2. Perfis: vincular user_id a auth.users (Supabase)
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_user_id_fkey;
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_user_id_auth_fkey;
ALTER TABLE perfis ADD CONSTRAINT perfis_user_id_auth_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Habilitar RLS nas tabelas sensíveis
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- 4. Função auxiliar: obter role do usuário atual
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.perfis WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Políticas RLS - PERFIS (cada um vê só o próprio)
DROP POLICY IF EXISTS perfis_select_own ON perfis;
CREATE POLICY perfis_select_own ON perfis FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS perfis_insert_own ON perfis;
CREATE POLICY perfis_insert_own ON perfis FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS perfis_update_own ON perfis;
CREATE POLICY perfis_update_own ON perfis FOR UPDATE
  USING (user_id = auth.uid());

-- 6. Políticas RLS - PROJETOS
-- Topógrafo: CRUD nos projetos do seu tenant
DROP POLICY IF EXISTS projetos_topografo_all ON projetos;
CREATE POLICY projetos_topografo_all ON projetos
  FOR ALL USING (
    auth.user_role() = 'topografo' AND tenant_id = auth.uid()
  );

-- Proprietário: sem acesso direto a projetos (acessa via lotes)
-- Anônimo/service: não acessa (API usa service_role)

-- 7. Políticas RLS - LOTES
-- Topógrafo: CRUD em lotes de projetos do seu tenant
DROP POLICY IF EXISTS lotes_topografo_all ON lotes;
CREATE POLICY lotes_topografo_all ON lotes
  FOR ALL USING (
    auth.user_role() = 'topografo' AND EXISTS (
      SELECT 1 FROM projetos p WHERE p.id = lotes.projeto_id AND p.tenant_id = auth.uid()
    )
  );

-- Proprietário: SELECT em lotes onde email_cliente = seu email
DROP POLICY IF EXISTS lotes_proprietario_select ON lotes;
CREATE POLICY lotes_proprietario_select ON lotes
  FOR SELECT USING (
    auth.user_role() = 'proprietario' AND email_cliente = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 8. Políticas RLS - PAGAMENTOS
-- Topógrafo: CRUD em pagamentos de lotes do seu tenant
DROP POLICY IF EXISTS pagamentos_topografo_all ON pagamentos;
CREATE POLICY pagamentos_topografo_all ON pagamentos
  FOR ALL USING (
    auth.user_role() = 'topografo' AND EXISTS (
      SELECT 1 FROM lotes l JOIN projetos p ON p.id = l.projeto_id
      WHERE l.id = pagamentos.lote_id AND p.tenant_id = auth.uid()
    )
  );

-- Proprietário: SELECT em pagamentos dos seus lotes
DROP POLICY IF EXISTS pagamentos_proprietario_select ON pagamentos;
CREATE POLICY pagamentos_proprietario_select ON pagamentos
  FOR SELECT USING (
    auth.user_role() = 'proprietario' AND EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = pagamentos.lote_id 
        AND l.email_cliente = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- 9. Trigger: criar perfil ao inserir em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (user_id, role)
  VALUES (NEW.id, 'proprietario')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Permissões para authenticated e anon
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON perfis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projetos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pagamentos TO authenticated;
