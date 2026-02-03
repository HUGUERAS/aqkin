---
name: spatial-topology-validator
description: Valida topologia espacial em tempo real usando PostGIS. Detecta sobreposições, invasões de divisas, geometrias inválidas e conflitos com lotes vizinhos. Use quando validar desenhos de clientes, verificar geometrias antes de salvar, ou implementar validações espaciais no projeto Ativo Real.
---

# Validador de Topologia em Tempo Real

## Visão Geral

O Validador de Topologia é o "fiscal de divisa" do sistema. Ele valida geometrias em tempo real usando PostGIS para detectar:

- Sobreposições com lotes existentes
- Invasões de áreas públicas (ruas, praças)
- Geometrias inválidas (auto-interseções, polígonos não fechados)
- Conflitos topológicos antes que cheguem ao topógrafo

## Validações Obrigatórias

### 1. Validação de Geometria Básica

```sql
-- Verificar se geometria é válida
SELECT ST_IsValid(geom) AS valida
FROM lotes
WHERE id = :lote_id;

-- Se inválida, tentar corrigir
SELECT ST_MakeValid(geom) AS geom_corrigida
FROM lotes
WHERE id = :lote_id AND NOT ST_IsValid(geom);
```

### 2. Detecção de Sobreposições

```sql
-- Detectar sobreposições com outros lotes do mesmo projeto
SELECT 
  l2.id AS lote_id,
  l2.nome_cliente,
  ST_Area(ST_Intersection(l1.geom, l2.geom)::geography) / 10000.0 AS area_sobreposta_ha,
  (ST_Area(ST_Intersection(l1.geom, l2.geom)::geography) / ST_Area(l1.geom::geography)) * 100 AS percentual_sobreposicao
FROM lotes l1, lotes l2
WHERE l1.id = :lote_id
  AND l2.projeto_id = l1.projeto_id
  AND l2.id != l1.id
  AND l2.geom IS NOT NULL
  AND ST_Intersects(l1.geom, l2.geom)
ORDER BY area_sobreposta_ha DESC;
```

### 3. Validação de Área Mínima/Máxima

```sql
-- Verificar se área está dentro dos limites permitidos
SELECT 
  id,
  area_ha,
  CASE 
    WHEN area_ha < 0.01 THEN 'Área abaixo do mínimo (0.01 ha)'
    WHEN area_ha > 1000 THEN 'Área acima do máximo (1000 ha)'
    ELSE 'OK'
  END AS validacao_area
FROM lotes
WHERE id = :lote_id;
```

### 4. Verificação de Polígono Fechado

```sql
-- Verificar se primeiro ponto = último ponto
SELECT 
  id,
  ST_Equals(
    ST_StartPoint(ST_ExteriorRing(geom)),
    ST_EndPoint(ST_ExteriorRing(geom))
  ) AS esta_fechado
FROM lotes
WHERE id = :lote_id;
```

## Função de Validação Completa

### Backend (Python/FastAPI)

```python
from fastapi import HTTPException
from supabase import Client
from typing import Dict, List, Optional

def validar_topologia(
    supabase: Client,
    lote_id: int,
    nova_geom_wkt: Optional[str] = None
) -> Dict:
    """
    Valida topologia completa de um lote.
    Retorna dict com erros e avisos encontrados.
    """
    erros = []
    avisos = []
    
    # 1. Buscar geometria atual ou usar nova
    if nova_geom_wkt:
        geom_sql = f"ST_GeomFromText('{nova_geom_wkt}', 4674)"
    else:
        geom_sql = "geom"
    
    # 2. Validar geometria básica
    query_valid = f"""
    SELECT 
      ST_IsValid({geom_sql}) AS valida,
      ST_IsValidReason({geom_sql}) AS motivo
    FROM lotes
    WHERE id = {lote_id}
    """
    
    result = supabase.rpc('exec_sql', {'query': query_valid}).execute()
    if not result.data[0]['valida']:
        erros.append({
            'tipo': 'GEOMETRIA_INVALIDA',
            'mensagem': f"Geometria inválida: {result.data[0]['motivo']}"
        })
    
    # 3. Verificar área mínima/máxima
    query_area = f"""
    SELECT 
      ST_Area({geom_sql}::geography) / 10000.0 AS area_ha
    FROM lotes
    WHERE id = {lote_id}
    """
    
    result = supabase.rpc('exec_sql', {'query': query_area}).execute()
    area_ha = result.data[0]['area_ha']
    
    if area_ha < 0.01:
        erros.append({
            'tipo': 'AREA_MINIMA',
            'mensagem': f'Área de {area_ha:.4f} ha está abaixo do mínimo de 0.01 ha'
        })
    elif area_ha > 1000:
        erros.append({
            'tipo': 'AREA_MAXIMA',
            'mensagem': f'Área de {area_ha:.4f} ha está acima do máximo de 1000 ha'
        })
    
    # 4. Detectar sobreposições
    query_sobreposicao = f"""
    SELECT 
      l2.id,
      l2.nome_cliente,
      ST_Area(ST_Intersection({geom_sql}, l2.geom)::geography) / 10000.0 AS area_sobreposta_ha,
      (ST_Area(ST_Intersection({geom_sql}, l2.geom)::geography) / 
       ST_Area({geom_sql}::geography)) * 100 AS percentual
    FROM lotes l1, lotes l2
    WHERE l1.id = {lote_id}
      AND l2.projeto_id = l1.projeto_id
      AND l2.id != l1.id
      AND l2.geom IS NOT NULL
      AND ST_Intersects({geom_sql}, l2.geom)
    """
    
    result = supabase.rpc('exec_sql', {'query': query_sobreposicao}).execute()
    
    for sobreposicao in result.data:
        area_sobrep = sobreposicao['area_sobreposta_ha']
        percentual = sobreposicao['percentual']
        
        if percentual > 5.0:  # Mais de 5% de sobreposição = erro crítico
            erros.append({
                'tipo': 'SOBREPOSICAO_CRITICA',
                'mensagem': f"Sobreposição de {area_sobrep:.4f} ha ({percentual:.2f}%) com lote {sobreposicao['nome_cliente']}",
                'lote_id': sobreposicao['id']
            })
        elif percentual > 0.1:  # Mais de 0.1% = aviso
            avisos.append({
                'tipo': 'SOBREPOSICAO_LEVE',
                'mensagem': f"Sobreposição de {area_sobrep:.4f} ha ({percentual:.2f}%) com lote {sobreposicao['nome_cliente']}",
                'lote_id': sobreposicao['id']
            })
    
    return {
        'valido': len(erros) == 0,
        'erros': erros,
        'avisos': avisos
    }
```

### Frontend (TypeScript/React)

```typescript
interface ValidacaoTopologia {
  valido: boolean;
  erros: Array<{
    tipo: string;
    mensagem: string;
    lote_id?: number;
  }>;
  avisos: Array<{
    tipo: string;
    mensagem: string;
    lote_id?: number;
  }>;
}

async function validarTopologia(
  loteId: number,
  wkt?: string
): Promise<ValidacaoTopologia> {
  const response = await fetch(
    `/api/lotes/${loteId}/validar-topologia`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geom_wkt: wkt })
    }
  );
  
  return response.json();
}

// Uso em componente React
function useValidacaoTopologia(loteId: number, wkt: string) {
  const [validacao, setValidacao] = useState<ValidacaoTopologia | null>(null);
  const [validando, setValidando] = useState(false);
  
  useEffect(() => {
    if (!wkt) return;
    
    setValidando(true);
    validarTopologia(loteId, wkt)
      .then(setValidacao)
      .finally(() => setValidando(false));
  }, [loteId, wkt]);
  
  return { validacao, validando };
}
```

## Validação em Tempo Real

### Integração com DrawMap Component

```typescript
// Adicionar validação ao componente DrawMap
import { useEffect, useState } from 'react';
import DrawMap from './DrawMap';

function DrawMapComValidacao({ loteId, onGeometryChange }: Props) {
  const [wkt, setWkt] = useState('');
  const { validacao, validando } = useValidacaoTopologia(loteId, wkt);
  
  const handleGeometryChange = (newWkt: string) => {
    setWkt(newWkt);
    onGeometryChange?.(newWkt);
  };
  
  return (
    <div>
      <DrawMap onGeometryChange={handleGeometryChange} />
      
      {/* Exibir erros e avisos */}
      {validacao && (
        <div style={{ marginTop: '1rem' }}>
          {validacao.erros.map((erro, i) => (
            <div key={i} style={{ 
              padding: '0.75rem',
              background: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              🔴 {erro.mensagem}
            </div>
          ))}
          
          {validacao.avisos.map((aviso, i) => (
            <div key={i} style={{ 
              padding: '0.75rem',
              background: '#fff3e0',
              color: '#e65100',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              🟡 {aviso.mensagem}
            </div>
          ))}
          
          {validacao.valido && validacao.erros.length === 0 && (
            <div style={{ 
              padding: '0.75rem',
              background: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '4px'
            }}>
              ✅ Geometria válida
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Endpoint API

### FastAPI Route

```python
@app.post("/api/lotes/{lote_id}/validar-topologia")
def validar_topologia_endpoint(
    lote_id: int,
    geom_wkt: Optional[str] = None
):
    """
    Valida topologia de um lote.
    Pode validar geometria existente ou nova geometria fornecida.
    """
    try:
        resultado = validar_topologia(supabase, lote_id, geom_wkt)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Tipos de Validação

### Erros Críticos (Bloqueiam salvamento)

1. **GEOMETRIA_INVALIDA**: Polígono com auto-interseção ou formato inválido
2. **AREA_MINIMA**: Área abaixo de 0.01 ha
3. **AREA_MAXIMA**: Área acima de 1000 ha
4. **SOBREPOSICAO_CRITICA**: Mais de 5% de sobreposição com outro lote

### Avisos (Permitem salvamento, mas alertam)

1. **SOBREPOSICAO_LEVE**: Entre 0.1% e 5% de sobreposição
2. **POLIGONO_IRREGULAR**: Polígono com muitos vértices (>100)
3. **AREA_PROXIMA_LIMITE**: Área muito próxima dos limites mínimo/máximo

## Performance

### Índices Necessários

```sql
-- Índice espacial para queries de sobreposição (já existe)
CREATE INDEX IF NOT EXISTS idx_lotes_geom 
ON lotes USING GIST(geom);

-- Índice para filtros por projeto
CREATE INDEX IF NOT EXISTS idx_lotes_projeto 
ON lotes(projeto_id);
```

### Otimizações

- Validar apenas quando geometria mudar (debounce de 500ms)
- Cachear resultados de validação por 30 segundos
- Usar `ST_Intersects` antes de `ST_Intersection` (mais rápido)

## Mensagens para o Usuário

### Erros

- 🔴 **Geometria inválida**: "Seu desenho possui uma auto-interseção. Por favor, redesenhe o polígono."
- 🔴 **Área mínima**: "A área desenhada está abaixo do mínimo permitido (0.01 ha)."
- 🔴 **Sobreposição crítica**: "Atenção! Sua divisa está sobrepondo a do vizinho em {X}%. Ajuste o desenho antes de continuar."

### Avisos

- 🟡 **Sobreposição leve**: "Sua divisa está sobrepondo a do vizinho em {X}%. Verifique se está correto."
- 🟡 **Área próxima ao limite**: "A área está próxima do limite mínimo/máximo. Confirme os valores."

## Integração com Fluxo de Trabalho

1. **Cliente desenha** → Validação em tempo real (avisos)
2. **Cliente tenta salvar** → Validação completa (bloqueia se houver erros)
3. **Topógrafo revisa** → Validação final antes de aprovar
