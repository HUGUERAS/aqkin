-- Bloco 3: Módulo Financeiro
-- Tabelas de orçamentos e despesas com RBAC/Multitenant

-- ENUM para status de orçamento
DO $$ 
BEGIN
    CREATE TYPE status_orcamento AS ENUM
    ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
    lote_id INTEGER REFERENCES lotes(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    status status_orcamento NOT NULL DEFAULT 'RASCUNHO',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_projeto ON orcamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_lote ON orcamentos(lote_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);

-- 2. Tabela de Despesas
CREATE TABLE IF NOT EXISTS despesas (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria VARCHAR(50), -- Ex: MATERIAL, SERVICO, TRANSPORTE, OUTROS
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_despesas_projeto ON despesas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);

-- 3. Trigger para atualizar atualizado_em em orcamentos
DROP TRIGGER IF EXISTS trigger_update_orcamentos ON orcamentos;
CREATE TRIGGER trigger_update_orcamentos BEFORE UPDATE ON orcamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Trigger para atualizar atualizado_em em despesas
DROP TRIGGER IF EXISTS trigger_update_despesas ON despesas;
CREATE TRIGGER trigger_update_despesas BEFORE UPDATE ON despesas
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Habilitar RLS nas tabelas financeiras
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS - ORÇAMENTOS
-- Topógrafo: CRUD em orçamentos de projetos do seu tenant
DROP POLICY IF EXISTS orcamentos_topografo_all ON orcamentos;
CREATE POLICY orcamentos_topografo_all ON orcamentos
  FOR ALL USING (
    auth.user_role() = 'topografo' AND (
      (orcamentos.projeto_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projetos p WHERE p.id = orcamentos.projeto_id AND p.tenant_id = auth.uid()
      )) OR
      (orcamentos.lote_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM lotes l JOIN projetos p ON p.id = l.projeto_id
        WHERE l.id = orcamentos.lote_id AND p.tenant_id = auth.uid()
      ))
    )
  );

-- Proprietário: SELECT em orçamentos dos seus lotes
DROP POLICY IF EXISTS orcamentos_proprietario_select ON orcamentos;
CREATE POLICY orcamentos_proprietario_select ON orcamentos
  FOR SELECT USING (
    auth.user_role() = 'proprietario' AND EXISTS (
      SELECT 1 FROM lotes l WHERE l.id = orcamentos.lote_id 
        AND l.email_cliente = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- 7. Políticas RLS - DESPESAS
-- Topógrafo: CRUD em despesas de projetos do seu tenant
DROP POLICY IF EXISTS despesas_topografo_all ON despesas;
CREATE POLICY despesas_topografo_all ON despesas
  FOR ALL USING (
    auth.user_role() = 'topografo' AND EXISTS (
      SELECT 1 FROM projetos p WHERE p.id = despesas.projeto_id AND p.tenant_id = auth.uid()
    )
  );

-- Proprietário: sem acesso a despesas (apenas topógrafo)

-- 8. Permissões para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON orcamentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON despesas TO authenticated;
GRANT USAGE ON SEQUENCE orcamentos_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE despesas_id_seq TO authenticated;
