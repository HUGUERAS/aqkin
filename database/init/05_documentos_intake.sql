-- Extensao 5: Tabela de documentos e colunas de intake para o fluxo mobile do proprietario

-- 1. Colunas adicionais no lotes para dados pessoais (intake)
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS rg_cliente VARCHAR
(30);
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS endereco_cliente TEXT;
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS estado_civil VARCHAR
(30);
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS nacionalidade VARCHAR
(50) DEFAULT 'Brasileira';
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS profissao VARCHAR
(80);
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS intake_data JSONB;
ALTER TABLE lotes ADD COLUMN
IF NOT EXISTS intake_completed_at TIMESTAMP;

-- 2. Tabela de documentos
CREATE TABLE
IF NOT EXISTS documentos
(
  id SERIAL PRIMARY KEY,
  lote_id INTEGER NOT NULL REFERENCES lotes
(id) ON
DELETE CASCADE,
  tipo VARCHAR(50)
NOT NULL, -- rg, cpf, comprovante_residencia, escritura, etc.
  nome_arquivo VARCHAR
(255) NOT NULL,
  url TEXT NOT NULL,
  tamanho_bytes BIGINT,
  mime_type VARCHAR
(100),
  hash_sha256 VARCHAR
(64),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX
IF NOT EXISTS idx_documentos_lote ON documentos
(lote_id);
CREATE INDEX
IF NOT EXISTS idx_documentos_tipo ON documentos
(lote_id, tipo);

-- 3. RLS para documentos (segue padrao das outras tabelas)
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Topografo: acesso total aos documentos dos lotes do seu tenant
CREATE POLICY documentos_topografo ON documentos
  FOR ALL
  USING
(
    EXISTS
(
      SELECT 1
FROM lotes l
  JOIN projetos p ON p.id = l.projeto_id
  JOIN perfis pf ON pf.user_id = auth.uid()
WHERE l.id = documentos.lote_id
  AND pf.role = 'topografo'
  AND p.tenant_id = pf.tenant_id
    )
);

-- Proprietario: acesso aos documentos dos seus lotes (por email)
CREATE POLICY documentos_proprietario ON documentos
  FOR ALL
  USING
(
    EXISTS
(
      SELECT 1
FROM lotes l
  JOIN perfis pf ON pf.user_id = auth.uid()
WHERE l.id = documentos.lote_id
  AND pf.role = 'proprietario'
  AND l.email_cliente = (SELECT email
  FROM auth.users
  WHERE id = auth.uid())
    )
);

-- 4. Bucket de Storage (executar manualmente no Supabase Dashboard):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);
--
-- Politica de upload (Storage > Policies):
-- CREATE POLICY "upload_documentos" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documentos');
--
-- Politica de leitura:
-- CREATE POLICY "read_documentos" ON storage.objects FOR SELECT
--   USING (bucket_id = 'documentos');
--
-- Politica de delete:
-- CREATE POLICY "delete_documentos" ON storage.objects FOR DELETE
--   USING (bucket_id = 'documentos');
