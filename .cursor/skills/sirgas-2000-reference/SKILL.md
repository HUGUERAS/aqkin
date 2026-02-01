---
name: sirgas-2000-reference
description: Trabalha com sistemas de referência geodésicos SIRGAS 2000 (SRID 4674) para regularização fundiária. Use quando trabalhar com coordenadas, geometrias PostGIS, conversões de sistemas de referência, mapas OpenLayers, ou operações geográficas no projeto Ativo Real.
---

# SIRGAS 2000 e Sistemas de Referência Geodésicos

## Sistema de Referência Padrão

**SRID 4674 (SIRGAS 2000)** é obrigatório para todas as geometrias no projeto Ativo Real.

- **SRID**: 4674
- **Sistema**: SIRGAS 2000 (Sistema de Referência Geodésico para as Américas)
- **Tipo**: Geodésico (lat/lon em graus decimais)
- **Requisito**: INCRA exige SIRGAS 2000 para regularização fundiária

## Padrões do Projeto

### Banco de Dados (PostGIS)

```sql
-- Sempre especificar SRID 4674 ao criar geometrias
geom GEOMETRY(POLYGON, 4674)

-- Ao inserir geometrias via WKT
geom = f"SRID=4674;{wkt_string}"

-- Ao converter para geografia (cálculos de área/perímetro)
ST_Area(geom::geography) / 10000.0  -- Converte m² para hectares
ST_Perimeter(geom::geography)        -- Perímetro em metros
```

### Frontend (OpenLayers)

OpenLayers usa **EPSG:3857 (Web Mercator)** por padrão. Sempre converter:

```typescript
import { fromLonLat, toLonLat } from 'ol/proj';

// SIRGAS 2000 (EPSG:4674) → Web Mercator (EPSG:3857) para exibição
const webMercatorCoords = fromLonLat([lon, lat]);

// Web Mercator → SIRGAS 2000 ao salvar
const [lon, lat] = toLonLat(webMercatorCoords);
```

**Importante**: OpenLayers não suporta EPSG:4674 diretamente. Use EPSG:4326 (WGS84) como proxy - são idênticos para fins práticos neste projeto.

### Backend (Python/FastAPI)

```python
# Ao receber WKT do frontend (já em SIRGAS 2000)
geom_wkt = "POLYGON((lon1 lat1, lon2 lat2, ...))"
data["geom"] = f"SRID=4674;{geom_wkt}"

# Ao retornar geometrias para o frontend
# PostGIS retorna em SRID 4674, frontend converte para Web Mercator
```

## Conversões de Coordenadas

### WKT Format

Formato padrão usado no projeto:

```
POLYGON((lon1 lat1, lon2 lat2, lon3 lat3, lon1 lat1))
```

**Regras**:

- Coordenadas em graus decimais (SIRGAS 2000)
- Primeiro ponto = último ponto (polígono fechado)
- Ordem: longitude, latitude (X, Y)

### Conversão OpenLayers ↔ PostGIS

**Frontend → Backend**:

```typescript
// 1. OpenLayers retorna coordenadas em Web Mercator
const coords = geometry.getCoordinates()[0];

// 2. Converter para lon/lat (SIRGAS 2000)
const lonLatCoords = coords.map(coord => {
  const [lon, lat] = toLonLat(coord);
  return `${lon} ${lat}`;
});

// 3. Gerar WKT
const wkt = `POLYGON((${lonLatCoords.join(', ')}))`;
```

**Backend → Frontend**:

```typescript
// 1. Receber WKT do backend (SRID 4674)
const wkt = "POLYGON((lon1 lat1, lon2 lat2, ...))";

// 2. Parse e converter para Web Mercator
const coords = wkt.match(/POLYGON\(\((.*?)\)\)/)[1]
  .split(',')
  .map(pair => {
    const [lon, lat] = pair.trim().split(' ').map(Number);
    return fromLonLat([lon, lat]); // Converte para Web Mercator
  });

// 3. Criar geometria OpenLayers
const polygon = new Polygon([coords]);
```

## Operações PostGIS Comuns

### Validação de Geometria

```sql
-- Verificar se geometria é válida
ST_IsValid(geom)

-- Corrigir geometria inválida (se necessário)
ST_MakeValid(geom)
```

### Cálculos de Área e Perímetro

```sql
-- Área em hectares (usar geography para cálculo geodésico preciso)
ST_Area(geom::geography) / 10000.0 AS area_ha

-- Perímetro em metros
ST_Perimeter(geom::geography) AS perimetro_m
```

### Detecção de Sobreposições

```sql
-- Verificar interseção
ST_Intersects(geom1, geom2)

-- Calcular área sobreposta
ST_Area(ST_Intersection(geom1, geom2)::geography) / 10000.0 AS area_sobreposta_ha

-- Buscar lotes sobrepostos
SELECT l2.id, l2.nome_cliente
FROM lotes l1, lotes l2
WHERE l1.id = :lote_id
  AND l2.projeto_id = l1.projeto_id
  AND l2.id != l1.id
  AND ST_Intersects(l1.geom, l2.geom)
```

### Operações Espaciais

```sql
-- Buffer (em metros, usando geography)
ST_Buffer(geom::geography, 10)::geometry AS buffer_10m

-- Distância entre geometrias (em metros)
ST_Distance(geom1::geography, geom2::geography) AS distancia_m

-- Centroide
ST_Centroid(geom) AS centroide
```

## Validações Obrigatórias

1. **SRID sempre 4674**: Nunca usar outros sistemas de referência
2. **Polígono fechado**: Primeiro ponto = último ponto
3. **Geometria válida**: Sem auto-interseções, sem buracos inválidos
4. **Área mínima**: Validar área mínima conforme regulamentação (geralmente > 0.01 ha)
5. **Coordenadas válidas**: Longitude entre -180 e 180, Latitude entre -90 e 90

## Exemplos de Uso

### Criar geometria no banco

```python
# Backend Python
wkt = "POLYGON((-47.9292 -15.7801, -47.9280 -15.7801, -47.9280 -15.7790, -47.9292 -15.7790, -47.9292 -15.7801))"
data = {"geom": f"SRID=4674;{wkt}"}
```

### Converter geometria OpenLayers para WKT

```typescript
// Frontend TypeScript
function geometryToWKT(geometry: any): string {
  const type = geometry.getType();
  if (type === 'Polygon') {
    const coordinates = geometry.getCoordinates()[0];
    const coords = coordinates.map((coord: number[]) => {
      const [lon, lat] = toLonLat(coord);
      return `${lon} ${lat}`;
    }).join(', ');
    return `POLYGON((${coords}))`;
  }
  return '';
}
```

### Validar geometria antes de salvar

```typescript
// Frontend: Validar polígono antes de enviar
function validatePolygon(wkt: string): boolean {
  const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
  if (!match) return false;
  
  const coords = match[1].split(',').map(p => p.trim().split(' ').map(Number));
  const first = coords[0];
  const last = coords[coords.length - 1];
  
  // Verificar se está fechado
  if (first[0] !== last[0] || first[1] !== last[1]) return false;
  
  // Verificar se tem pelo menos 4 pontos (incluindo fechamento)
  if (coords.length < 4) return false;
  
  return true;
}
```

## Referências Técnicas

- **SRID 4674**: SIRGAS 2000 (Geodésico)
- **EPSG:3857**: Web Mercator (usado pelo OpenLayers)
- **EPSG:4326**: WGS84 (compatível com SIRGAS 2000 para este projeto)
- **PostGIS**: Extensão PostgreSQL para dados espaciais
- **OpenLayers**: Biblioteca JavaScript para mapas web

## Recursos Adicionais

Para detalhes técnicos avançados, exemplos de código completos, funções helper e troubleshooting, consulte [reference.md](reference.md).

## Notas Importantes

1. **Não misturar sistemas**: Sempre manter SRID 4674 no banco, converter apenas para visualização
2. **Precisão**: Usar `geography` para cálculos de área/perímetro (mais preciso que `geometry`)
3. **Performance**: Índices espaciais GIST são essenciais para queries de sobreposição
4. **Validação**: Sempre validar geometrias antes de salvar no banco
