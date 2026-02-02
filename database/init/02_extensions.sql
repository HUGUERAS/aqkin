-- Extensões para MVP: vizinhos, topografo_id, perfis, funções PostGIS

-- 1. Tabela Vizinhos (Confrontantes)
CREATE TABLE IF NOT EXISTS vizinhos (
  id SERIAL PRIMARY KEY,
  lote_id INTEGER NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
  nome_vizinho VARCHAR(150) NOT NULL,
  lado VARCHAR(10) NOT NULL CHECK (lado IN ('NORTE', 'SUL', 'LESTE', 'OESTE')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vizinhos_lote ON vizinhos(lote_id);

-- 2. Topógrafo em Projetos (Multitenancy)
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS topografo_id UUID;

-- 3. Perfis (RBAC: topografo | proprietario)
CREATE TABLE IF NOT EXISTS perfis (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'proprietario' CHECK (role IN ('topografo', 'proprietario')),
  nome_completo VARCHAR(150),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perfis_user ON perfis(user_id);

-- 4. Função: Detectar sobreposições (substitui exec_sql)
CREATE OR REPLACE FUNCTION detectar_sobreposicoes(p_lote_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  nome_cliente VARCHAR,
  area_sobreposta_ha NUMERIC,
  percentual NUMERIC
) AS $$
  SELECT 
    l2.id::INTEGER,
    l2.nome_cliente,
    (ST_Area(ST_Intersection(l1.geom, l2.geom)::geography) / 10000.0)::NUMERIC,
    ((ST_Area(ST_Intersection(l1.geom, l2.geom)::geography) / NULLIF(ST_Area(l1.geom::geography), 0)) * 100)::NUMERIC
  FROM lotes l1, lotes l2
  WHERE l1.id = p_lote_id
    AND l2.projeto_id = l1.projeto_id
    AND l2.id != l1.id
    AND l2.geom IS NOT NULL
    AND l1.geom IS NOT NULL
    AND ST_Intersects(l1.geom, l2.geom)
  ORDER BY area_sobreposta_ha DESC;
$$ LANGUAGE sql STABLE;

-- 4b. Sobreposições por projeto (para Dashboard)
CREATE OR REPLACE FUNCTION detectar_sobreposicoes_projeto(p_projeto_id INTEGER)
RETURNS TABLE (
  lote1_id INTEGER,
  lote2_id INTEGER,
  nome_cliente1 VARCHAR,
  nome_cliente2 VARCHAR,
  area_sobreposta_ha NUMERIC
) AS $$
  SELECT 
    l1.id::INTEGER,
    l2.id::INTEGER,
    l1.nome_cliente,
    l2.nome_cliente,
    (ST_Area(ST_Intersection(l1.geom, l2.geom)::geography) / 10000.0)::NUMERIC
  FROM lotes l1, lotes l2
  WHERE l1.projeto_id = p_projeto_id
    AND l2.projeto_id = p_projeto_id
    AND l1.id < l2.id
    AND l1.geom IS NOT NULL
    AND l2.geom IS NOT NULL
    AND ST_Intersects(l1.geom, l2.geom);
$$ LANGUAGE sql STABLE;

-- 5. Função: Validar topologia (retorna JSON)
CREATE OR REPLACE FUNCTION validar_topologia_sql(
  p_lote_id INTEGER,
  p_geom_wkt TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_geom GEOMETRY;
  v_projeto_id INTEGER;
  v_area_ha NUMERIC;
  v_valida BOOLEAN;
  v_motivo TEXT;
  v_erros JSONB := '[]'::JSONB;
  v_avisos JSONB := '[]'::JSONB;
  r RECORD;
BEGIN
  -- Obter geometria: nova ou existente
  IF p_geom_wkt IS NOT NULL AND LENGTH(TRIM(p_geom_wkt)) > 0 THEN
    v_geom := ST_GeomFromText(p_geom_wkt, 4674);
    SELECT projeto_id INTO v_projeto_id FROM lotes WHERE id = p_lote_id;
  ELSE
    SELECT geom, projeto_id INTO v_geom, v_projeto_id FROM lotes WHERE id = p_lote_id;
    IF v_geom IS NULL THEN
      RETURN jsonb_build_object('valido', false, 'erros', jsonb_build_array(jsonb_build_object('tipo', 'GEOMETRIA_VAZIA', 'mensagem', 'Lote sem geometria')), 'avisos', v_avisos);
    END IF;
  END IF;

  -- Área
  v_area_ha := ST_Area(v_geom::geography) / 10000.0;

  -- 1. Geometria válida
  v_valida := ST_IsValid(v_geom);
  IF NOT v_valida THEN
    v_motivo := ST_IsValidReason(v_geom);
    v_erros := v_erros || jsonb_build_object('tipo', 'GEOMETRIA_INVALIDA', 'mensagem', 'Geometria inválida: ' || v_motivo);
  END IF;

  -- 2. Área mínima/máxima
  IF v_area_ha < 0.01 THEN
    v_erros := v_erros || jsonb_build_object('tipo', 'AREA_MINIMA', 'mensagem', 'Área abaixo do mínimo (0.01 ha)');
  ELSIF v_area_ha > 1000 THEN
    v_erros := v_erros || jsonb_build_object('tipo', 'AREA_MAXIMA', 'mensagem', 'Área acima do máximo (1000 ha)');
  END IF;

  -- 3. Sobreposições
  FOR r IN
    SELECT l2.id, l2.nome_cliente,
      (ST_Area(ST_Intersection(v_geom, l2.geom)::geography) / 10000.0) AS area_sobrep,
      ((ST_Area(ST_Intersection(v_geom, l2.geom)::geography) / NULLIF(ST_Area(v_geom::geography), 0)) * 100) AS perc
    FROM lotes l2
    WHERE l2.projeto_id = v_projeto_id
      AND l2.id != p_lote_id
      AND l2.geom IS NOT NULL
      AND ST_Intersects(v_geom, l2.geom)
  LOOP
    IF r.perc > 5.0 THEN
      v_erros := v_erros || jsonb_build_object('tipo', 'SOBREPOSICAO_CRITICA', 'mensagem', 'Sobreposição de ' || ROUND(r.area_sobrep::numeric, 4) || ' ha (' || ROUND(r.perc::numeric, 2) || '%) com ' || COALESCE(r.nome_cliente, 'lote ' || r.id), 'lote_id', r.id);
    ELSIF r.perc > 0.1 THEN
      v_avisos := v_avisos || jsonb_build_object('tipo', 'SOBREPOSICAO_LEVE', 'mensagem', 'Sobreposição de ' || ROUND(r.area_sobrep::numeric, 4) || ' ha com ' || COALESCE(r.nome_cliente, 'lote ' || r.id), 'lote_id', r.id);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'valido', (jsonb_array_length(v_erros) = 0),
    'erros', v_erros,
    'avisos', v_avisos
  );
END;
$$ LANGUAGE plpgsql;
