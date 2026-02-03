# Glossário de Geoprocessamento

Referência de termos técnicos para o projeto Ativo Real.

---

## Sistemas de Referência

| Termo | SRID | Uso |
|-------|------|-----|
| **SIRGAS 2000** | 4674 | Sistema geodésico oficial do Brasil. Usar para armazenamento de geometrias. |
| **SIRGAS 2000 UTM** | 31982-31985 | Sistema projetado para cálculos de área/distância. Zona varia por estado. |
| **WGS 84** | 4326 | GPS e web mapping. Converter para 4674 ao persistir. |

### Conversão de SRID

```sql
-- GPS (4326) para SIRGAS 2000 (4674)
ST_Transform(geom, 4674)

-- SIRGAS 2000 para UTM (cálculos)
ST_Transform(geom, 31983)  -- Zona 23S (SP, MG, GO)
```

---

## Funções PostGIS - Validação Topológica

| Linguagem Natural | Função PostGIS | Descrição |
|-------------------|----------------|-----------|
| Lote sobrepõe vizinho | `ST_Overlaps(a, b)` | True se geometrias se sobrepõem parcialmente |
| Lote dentro do perímetro | `ST_Within(lote, perimetro)` | True se lote está completamente dentro |
| Perímetro contém lote | `ST_Contains(perimetro, lote)` | Inverso de ST_Within |
| Lotes se tocam na divisa | `ST_Touches(a, b)` | True se tocam apenas na borda |
| Lote cruza outro | `ST_Crosses(a, b)` | True se linhas se cruzam |
| Geometria é válida | `ST_IsValid(geom)` | Verifica se geometria é válida |
| Corrigir geometria | `ST_MakeValid(geom)` | Tenta corrigir geometria inválida |
| Lotes são iguais | `ST_Equals(a, b)` | True se geometrias são espacialmente iguais |
| Geometrias intersectam | `ST_Intersects(a, b)` | True se há qualquer interseção |
| Geometrias são disjuntas | `ST_Disjoint(a, b)` | True se não há interseção |

### Exemplo: Validar Novo Lote

```sql
-- Verificar se novo lote não sobrepõe existentes
SELECT COUNT(*) = 0 AS is_valid
FROM lotes existing
WHERE existing.id != NEW.id
  AND ST_Overlaps(existing.geometry, NEW.geometry);
```

---

## Funções PostGIS - Cálculos

| Linguagem Natural | Função PostGIS | Observação |
|-------------------|----------------|------------|
| Calcular área | `ST_Area(geom)` | Usar SRID projetado (UTM) para metros² |
| Medir distância | `ST_Distance(a, b)` | Usar SRID projetado para metros |
| Distância em esfera | `ST_DistanceSphere(a, b)` | Para SRID geográfico (4674) |
| Perímetro | `ST_Perimeter(geom)` | Usar SRID projetado |
| Centróide | `ST_Centroid(geom)` | Ponto central da geometria |
| Bounding box | `ST_Envelope(geom)` | Retângulo envolvente |
| Buffer | `ST_Buffer(geom, dist)` | Expandir geometria por distância |

### Exemplo: Área em Hectares

```sql
SELECT 
  id,
  ST_Area(ST_Transform(geometry, 31983)) / 10000 AS area_hectares
FROM lotes;
```

---

## Funções PostGIS - Conversão e Output

| Linguagem Natural | Função PostGIS | Uso |
|-------------------|----------------|-----|
| Converter para texto | `ST_AsText(geom)` | Formato WKT |
| Converter para JSON | `ST_AsGeoJSON(geom)` | Para frontend/API |
| Criar de texto | `ST_GeomFromText(wkt, srid)` | Parse WKT |
| Criar de JSON | `ST_GeomFromGeoJSON(json)` | Parse GeoJSON |
| Simplificar | `ST_Simplify(geom, tol)` | Reduzir pontos |
| Snap to grid | `ST_SnapToGrid(geom, size)` | Arredondar coordenadas |

---

## Tipos de Geometria

| Tipo | Uso no Projeto | Exemplo |
|------|----------------|---------|
| `POINT` | Marcos, vértices, POIs | Marco geodésico |
| `LINESTRING` | Divisas, ruas, rios | Linha de divisa |
| `POLYGON` | Lotes, glebas, áreas | Lote urbano |
| `MULTIPOLYGON` | Propriedades com múltiplas partes | Fazenda com áreas separadas |
| `GEOMETRYCOLLECTION` | Conjunto misto | Planta com vários elementos |

### Definição de Coluna

```sql
-- Padrão para lotes
geometry GEOMETRY(Polygon, 4674) NOT NULL

-- Com constraint de validação
CONSTRAINT valid_geometry CHECK (ST_IsValid(geometry))
```

---

## OpenLayers - Frontend

| Linguagem Natural | Classe/Método OpenLayers |
|-------------------|--------------------------|
| Mostrar mapa | `new Map({ target, layers, view })` |
| Adicionar camada | `map.addLayer(layer)` |
| Desenhar polígono | `new Draw({ type: 'Polygon' })` |
| Editar geometria | `new Modify({ features })` |
| Selecionar feature | `new Select()` |
| Carregar GeoJSON | `new GeoJSON().readFeatures(data)` |
| Centralizar no lote | `view.fit(extent, { padding })` |
| Projeção | `'EPSG:4674'` ou `'EPSG:3857'` (web) |

### Exemplo: Layer de Lotes

```typescript
const lotesSource = new VectorSource({
  url: '/api/lotes/geojson',
  format: new GeoJSON()
});

const lotesLayer = new VectorLayer({
  source: lotesSource,
  style: new Style({
    stroke: new Stroke({ color: '#3388ff', width: 2 }),
    fill: new Fill({ color: 'rgba(51, 136, 255, 0.2)' })
  })
});
```

---

## Termos de Regularização Fundiária

| Termo | Significado Técnico |
|-------|---------------------|
| **REURB** | Regularização Fundiária Urbana (Lei 13.465/2017) |
| **REURB-S** | REURB de Interesse Social |
| **REURB-E** | REURB de Interesse Específico |
| **CRF** | Certidão de Regularização Fundiária |
| **Núcleo Urbano** | Área urbana consolidada com ocupações |
| **Legitimação Fundiária** | Aquisição originária de propriedade |
| **Memorial Descritivo** | Documento técnico com descrição do imóvel |
| **ART** | Anotação de Responsabilidade Técnica (CREA) |
| **RRT** | Registro de Responsabilidade Técnica (CAU) |
| **Matrícula** | Registro do imóvel no Cartório |
| **Confrontantes** | Vizinhos que fazem divisa |
| **Azimute** | Ângulo em relação ao norte |
| **Rumo** | Direção com quadrante (NE, SE, SW, NW) |

---

## Mapeamento Rápido

### Usuário → Implementação

```
"não deixar invadir"     → ST_Overlaps + trigger de validação
"dentro do loteamento"   → ST_Within(lote, perimetro)
"calcular a área"        → ST_Area(ST_Transform(geom, UTM))
"mostrar no mapa"        → OpenLayers VectorLayer + GeoJSON
"desenhar o lote"        → OpenLayers Draw interaction
"salvar as coordenadas"  → INSERT INTO ... geometry
"pegar do GPS"           → ST_Transform(geom_4326, 4674)
"exportar para CAD"      → ST_AsText (WKT) ou shapefile
"verificar se é válido"  → ST_IsValid + ST_MakeValid
"juntar os lotes"        → ST_Union(geom1, geom2)
"dividir o lote"         → ST_Split ou ST_Difference
```
