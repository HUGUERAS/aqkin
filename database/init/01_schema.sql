-- 👴 Agente 1: Script de Inicialização do Banco de Dados - V2 (Produção Bem Real)
-- Garante a integridade matemática, espacial e o fluxo de negócios

-- Habilitar extensão PostGIS (Geometria e Geografia)
CREATE EXTENSION
IF NOT EXISTS postgis;

-- ENUMS para controle de estado robusto
DO $$ 
BEGIN
    CREATE TYPE tipo_projeto AS ENUM
    ('INDIVIDUAL', 'DESMEMBRAMENTO', 'LOTEAMENTO', 'RETIFICACAO');
    CREATE TYPE status_projeto AS ENUM
    ('RASCUNHO', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO');
    CREATE TYPE status_lote AS ENUM
    ('PENDENTE', 'DESENHO', 'VALIDACAO_SIGEF', 'CONTRATO_PENDENTE', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'FINALIZADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de Projetos (O "Dossiê")
CREATE TABLE
IF NOT EXISTS projetos
(
    id SERIAL PRIMARY KEY,
    nome VARCHAR
(100) NOT NULL,
    descricao TEXT,
    tipo tipo_projeto NOT NULL DEFAULT 'INDIVIDUAL',
    status status_projeto NOT NULL DEFAULT 'RASCUNHO',
    
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes/Lotes (O "Serviço Unitário")
-- SRID 4674 = SIRGAS 2000 (Obrigatório INCRA)
CREATE TABLE
IF NOT EXISTS lotes
(
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER REFERENCES projetos
(id) ON
DELETE CASCADE,
    
    -- Dados do Cliente
    nome_cliente VARCHAR(150),
    email_cliente VARCHAR
(150),
    telefone_cliente VARCHAR
(20),
    cpf_cnpj_cliente VARCHAR
(20),
    
    -- Segurança e Acesso
    token_acesso UUID DEFAULT gen_random_uuid
(), -- O "Magic Link" usa isso
    link_expira_em TIMESTAMP,
    
    -- Dados Técnicos
    matricula VARCHAR
(50),
    geom GEOMETRY
(POLYGON, 4674), -- O desenho do cliente
    area_ha NUMERIC
(10, 4),
    perimetro_m NUMERIC
(10, 2),
    
    -- Controle de Fluxo
    status status_lote NOT NULL DEFAULT 'PENDENTE',
    
    -- Metadados de Auditoria
    metadata_validacao JSONB, -- Guarda logs da validação automática (ex: % sobreposição)
    contrato_url TEXT,
    
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Financeira (Simplificada para MVP)
CREATE TABLE
IF NOT EXISTS pagamentos
(
    id SERIAL PRIMARY KEY,
    lote_id INTEGER REFERENCES lotes
(id),
    valor_total NUMERIC
(10, 2) NOT NULL,
    valor_pago NUMERIC
(10, 2) DEFAULT 0,
    status VARCHAR
(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, FALHA
    gateway_id VARCHAR
(100), -- ID da transação na InfinitePay/Stripe
    data_pagamento TIMESTAMP
);

-- Index Espacial (Essencial para performance crítica)
-- REMOVIDO: Index da Gleba Mãe (Simplicidade Primeiro)
CREATE INDEX
IF NOT EXISTS idx_lotes_geom ON lotes USING GIST
(geom);
CREATE INDEX
IF NOT EXISTS idx_lotes_token ON lotes
(token_acesso);

-- CONSTRAINTS DE INTEGRIDADE GEOMÉTRICA --

-- 1. Garante que o polígono é válido (fechado, sem auto-interseção)
ALTER TABLE lotes DROP CONSTRAINT IF EXISTS check_geom_valid;
ALTER TABLE lotes ADD CONSTRAINT check_geom_valid CHECK (geom IS NULL OR ST_IsValid(geom));

-- 2. Trigger para atualizar `atualizado_em`
CREATE OR REPLACE FUNCTION update_updated_at
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_projetos
ON projetos;
CREATE TRIGGER trigger_update_projetos BEFORE
UPDATE ON projetos FOR EACH ROW
EXECUTE PROCEDURE update_updated_at
();

DROP TRIGGER IF EXISTS trigger_update_lotes
ON lotes;
CREATE TRIGGER trigger_update_lotes BEFORE
UPDATE ON lotes FOR EACH ROW
EXECUTE PROCEDURE update_updated_at
();

-- Função para calcular área automaticamente
CREATE OR REPLACE FUNCTION calc_area_ha
()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.geom IS NOT NULL THEN
        -- Calcula área em hectares usando geografia geodésica
        NEW.area_ha = ST_Area
    (NEW.geom::geography) / 10000.0;
NEW.perimetro_m = ST_Perimeter
(NEW.geom::geography);
END
IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calc_area
ON lotes;
CREATE TRIGGER trigger_calc_area
BEFORE
INSERT OR
UPDATE ON lotes
FOR EACH ROW
EXECUTE FUNCTION calc_area_ha
();
