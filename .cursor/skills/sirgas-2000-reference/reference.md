# Referência Técnica: SIRGAS 2000

## Sistemas de Referência Geodésicos

### SIRGAS 2000 (SRID 4674)

**Sistema de Referência Geodésico para as Américas 2000**

- **Época de referência**: 2000.4
- **Datum**: ITRF2000
- **Tipo**: Geodésico (lat/lon)
- **Unidades**: Graus decimais
- **Aplicação**: Regularização fundiária no Brasil (obrigatório INCRA)

### Comparação com Outros Sistemas

| Sistema | SRID | Tipo | Uso no Projeto |
|---------|------|------|----------------|
| SIRGAS 2000 | 4674 | Geodésico | ✅ Padrão (banco de dados) |
| WGS84 | 4326 | Geodésico | ⚠️ Compatível (proxy para OpenLayers) |
| Web Mercator | 3857 | Projetado | ✅ Visualização (OpenLayers) |
| SAD69 | 4618 | Geodésico | ❌ Não usar |

## Conversões de Coordenadas

### Python (Backend)

```python
from pyproj import Transformer

# Converter de SIRGAS 2000 para Web Mercator (se necessário)
transformer = Transformer.from_crs("EPSG:4674", "EPSG:3857", always_xy=True)
x, y = transformer.transform(lon, lat)

# Converter de Web Mercator para SIRGAS 2000
transformer = Transformer.from_crs("EPSG:3857", "EPSG:4674", always_xy=True)
lon, lat = transformer.transform(x, y)
```

### TypeScript (Frontend)

```typescript
import { fromLonLat, toLonLat, transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

// Registrar EPSG:4674 (se necessário)
proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
register(proj4);

// Converter coordenadas
const webMercator = fromLonLat([lon, lat], 'EPSG:4674');
const [lonOut, latOut] = toLonLat(webMercator, 'EPSG:4674');
```

## Operações PostGIS Avançadas

### Análise de Confrontantes

```sql
-- Encontrar confrontantes (lotes adjacentes)
SELECT 
  l2.id,
  l2.nome_cliente,
  ST_Touches(l1.geom, l2.geom) AS adjacente,
  ST_Distance(l1.geom::geography, l2.geom::geography) AS distancia_m
FROM lotes l1, lotes l2
WHERE l1.id = :lote_id
  AND l2.projeto_id = l1.projeto_id
  AND l2.id != l1.id
  AND (
    ST_Touches(l1.geom, l2.geom) OR
    ST_Distance(l1.geom::geography, l2.geom::geography) < 1.0
  )
ORDER BY distancia_m;
```

### Cálculo de Confrontações por Lado

```sql
-- Determinar confrontações por direção cardeal
WITH lote_ref AS (
  SELECT geom, ST_Envelope(geom) AS bbox
  FROM lotes
  WHERE id = :lote_id
),
vizinhos AS (
  SELECT 
    l.id,
    l.nome_cliente,
    l.geom,
    ST_Centroid(l.geom) AS centro
  FROM lotes l, lote_ref ref
  WHERE l.projeto_id = (SELECT projeto_id FROM lotes WHERE id = :lote_id)
    AND l.id != :lote_id
    AND ST_Intersects(l.geom, ST_Buffer(ref.geom::geography, 10)::geometry)
)
SELECT 
  v.id,
  v.nome_cliente,
  CASE
    WHEN ST_Y(v.centro) > ST_Y(ST_Centroid((SELECT geom FROM lote_ref)))
      THEN 'NORTE'
    WHEN ST_Y(v.centro) < ST_Y(ST_Centroid((SELECT geom FROM lote_ref)))
      THEN 'SUL'
    WHEN ST_X(v.centro) > ST_X(ST_Centroid((SELECT geom FROM lote_ref)))
      THEN 'LESTE'
    ELSE 'OESTE'
  END AS lado,
  ST_Distance(
    (SELECT geom FROM lote_ref)::geography,
    v.geom::geography
  ) AS distancia_m
FROM vizinhos v;
```

### Validação de Área Mínima

```sql
-- Verificar se área atende requisitos mínimos
SELECT 
  id,
  nome_cliente,
  area_ha,
  CASE 
    WHEN area_ha < 0.01 THEN 'Área abaixo do mínimo (0.01 ha)'
    WHEN area_ha > 1000 THEN 'Área acima do máximo (1000 ha)'
    ELSE 'OK'
  END AS validacao_area
FROM lotes
WHERE id = :lote_id;
```

## Funções Helper TypeScript

### Validação de WKT

```typescript
export function validateWKT(wkt: string): {
  valid: boolean;
  error?: string;
} {
  // Verificar formato básico
  if (!wkt.startsWith('POLYGON')) {
    return { valid: false, error: 'Formato deve ser POLYGON' };
  }

  // Extrair coordenadas
  const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
  if (!match) {
    return { valid: false, error: 'Formato WKT inválido' };
  }

  const coords = match[1]
    .split(',')
    .map(p => p.trim().split(' ').map(Number));

  // Verificar fechamento
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return { valid: false, error: 'Polígono não está fechado' };
  }

  // Verificar número mínimo de pontos
  if (coords.length < 4) {
    return { valid: false, error: 'Polígono deve ter pelo menos 3 vértices' };
  }

  // Verificar coordenadas válidas
  for (const [lon, lat] of coords) {
    if (lon < -180 || lon > 180) {
      return { valid: false, error: `Longitude inválida: ${lon}` };
    }
    if (lat < -90 || lat > 90) {
      return { valid: false, error: `Latitude inválida: ${lat}` };
    }
  }

  return { valid: true };
}
```

### Conversão OpenLayers → WKT

```typescript
import { toLonLat } from 'ol/proj';
import { Polygon } from 'ol/geom';

export function geometryToWKT(geometry: Polygon): string {
  const coords = geometry.getCoordinates()[0];
  
  const lonLatCoords = coords.map(coord => {
    const [lon, lat] = toLonLat(coord);
    return `${lon} ${lat}`;
  });

  return `POLYGON((${lonLatCoords.join(', ')}))`;
}
```

### Conversão WKT → OpenLayers

```typescript
import { fromLonLat } from 'ol/proj';
import { Polygon } from 'ol/geom';
import { Feature } from 'ol';

export function wktToFeature(wkt: string): Feature | null {
  try {
    const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
    if (!match) return null;

    const coordsStr = match[1];
    const coords = coordsStr.split(',').map(pair => {
      const [lon, lat] = pair.trim().split(' ').map(Number);
      return fromLonLat([lon, lat]);
    });

    const polygon = new Polygon([coords]);
    return new Feature({ geometry: polygon });
  } catch (error) {
    console.error('Erro ao converter WKT:', error);
    return null;
  }
}
```

## Troubleshooting

### Problema: Coordenadas aparecem em local errado no mapa

**Causa**: Conversão incorreta entre sistemas de referência

**Solução**:

- Verificar se `fromLonLat` está sendo usado ao exibir
- Verificar se `toLonLat` está sendo usado ao salvar
- Confirmar que WKT está em graus decimais (não em Web Mercator)

### Problema: Área calculada está incorreta

**Causa**: Usando `geometry` ao invés de `geography`

**Solução**:

```sql
-- ❌ Errado (usa projeção plana)
ST_Area(geom)

-- ✅ Correto (usa cálculo geodésico)
ST_Area(geom::geography) / 10000.0
```

### Problema: Query de sobreposição muito lenta

**Causa**: Falta de índice espacial

**Solução**:

```sql
CREATE INDEX IF NOT EXISTS idx_lotes_geom 
ON lotes USING GIST(geom);
```

## Recursos Externos

- [PostGIS Documentation](https://postgis.net/documentation/)
- [OpenLayers Documentation](https://openlayers.org/)
- [EPSG Registry - SRID 4674](https://epsg.io/4674)
- [INCRA - Normas Técnicas](https://www.incra.gov.br/)
