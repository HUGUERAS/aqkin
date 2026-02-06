# 🗺️ **Camadas (Layers) do Mapa - Conferência Completa**

## 📍 **Resumo Executivo**

O sistema AtivoReal possui **2 configurações de mapa** com diferentes layers:

| Página | Biblioteca | Status | Layers |
|--------|------------|--------|--------|
| **DesenharArea** (Cliente) | ArcGIS Core SDK | ✅ Ativa | 1 basemap + 1 graphics (desenhos) |
| **ValidarDesenhos** (Topografo) | (Mock) | ❌ Não implementado | 4 layers no design |

---

## 🎨 **MAPA 1: DesenharArea.tsx (Cliente) - ATIVO**

### Biblioteca: ArcGIS Maps SDK for JavaScript

**Arquivo**: `apps/web/src/components/maps/DrawMapEsri.tsx`

### Layers Configuradas

#### 1️⃣ **Basemap** (Fundo)

- **Tipo**: Esri Basemap Vector Tiles
- **Opções disponíveis**:
  - ✅ `topo-vector` (Padrão) - Topográfico com relevo
  - `streets-vector` - Ruas e navegação
  - `satellite` - Imagem satélite
  - `hybrid` - Satélite + rótulos

```typescript
// Código:
const map = new Map({
  basemap: 'topo-vector',  // ← ATIVA AGORA
  layers: [graphicsLayer],
});
```

**Fonte**: ArcGIS Online (Esri)  
**Projeção**: Web Mercator (EPSG:3857)  
**Zoom**: Padrão 15 (Brasília)

#### 2️⃣ **Graphics Layer** (Desenhos do Usuário)

- **Título**: "Desenhos"
- **Tipo**: GraphicsLayer (vetor)
- **Conteúdo**: Polígonos desenhados pelo cliente
- **Interações**:
  - ✏️ **Sketch Widget**: Ferramenta nativa Esri
  - 📦 **Ferramentas**: Apenas `polygon` (desenho único)
  - 🖱️ **Modo**: Click para criar vértices

```typescript
const graphicsLayer = new GraphicsLayer({ title: 'Desenhos' });

const sketch = new Sketch({
  view: view,
  layer: graphicsLayer,
  creationMode: 'single',      // Apenas 1 polígono
  availableCreateTools: ['polygon'],  // Apenas polígono
  defaultCreateOptions: { mode: 'click' },
});
```

**Saída**: WKT (Well-Known Text) em EPSG:4326

---

## 🎨 **MAPA 2: ValidarDesenhos.tsx (Topografo) - DESIGN (NÃO IMPLEMENTADO)**

### Biblioteca: (Será implementado)

**Arquivo**: `apps/web/src/pages/topografo/ValidarDesenhos.tsx`

### Layers Propostas (no Design)

| Layer | Cor | Status | Descrição |
|-------|-----|--------|-----------|
| **Desenho Cliente** | Cinza (50% opacidade) | ▢ Desativado em padrão | Rascunho do cliente - dados brutos |
| **Geometria Oficial** | 🔵 Azul (`#667eea`) | ✅ Ativada | Desenho ajustado pelo topografo (snap, ajustes) |
| **Sobreposições** | 🔴 Vermelho (`#f44336`) | ⚠️ Condicional | Áreas que conflitam com vizinhos (PostGIS) |
| **Limites Compartilhados** | 🟢 Verde (`#4caf50`) | ⚠️ Condicional | Arestas comuns com lotes vizinhos |
| **Basemap** | (Topográfico) | ✅ Sempre | Fundo: OpenStreetMap ou Esri Topo |

### Ferramentas de Validação (no Design)

```
🧲 Snap Tool (0.5m)           - Ajustar vértices com tolerância
✏️ Editar Vértices             - Mover/adicionar pontos
📏 Medir Distância             - Ferramentas de mensuração
📐 Calcular Área               - Área do polígono em m²
```

### Checklist de Validação

```
✅ Geometria válida (sem auto-interseções)
✅ Snap aplicado nos vértices
❌ Sem sobreposições com vizinhos
✅ Área calculada correta
✅ CRS SIRGAS 2000 (EPSG:4674)
❌ Confrontantes identificados
```

---

## 📊 **Comparação: OpenLayers vs ArcGIS Core**

### Legacy (OpenLayers) - DrawMap.tsx

**Status**: Criado mas não está sendo usado (foi substituído por ArcGIS)

#### Basemaps Disponíveis

```typescript
export type BasemapId = 'osm' | 'esri-street' | 'esri-topo' | 'esri-satellite';

const BASEMAP_OPTIONS = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'esri-street', label: 'Esri Rua' },
  { id: 'esri-topo', label: 'Esri Topográfico' },
  { id: 'esri-satellite', label: 'Esri Satélite' },
];
```

#### Layers (OpenLayers)

1. **Basemap** (TileLayer - OSM ou Esri)
2. **Vector Layer** (desenhos do usuário com Polygon)
3. **Interações**: Draw, Modify, Snap (0.5m tolerância)

**Conversão de coordenadas**: LonLat ↔ Web Mercator

---

## 🔄 **Fluxo de Camadas - Topografia**

```
┌─────────────────────────────────────────────────┐
│ 1. CLIENTE - DesenharArea.tsx                   │
├─────────────────────────────────────────────────┤
│ Layer 1: Basemap (Esri Topo-Vector)             │
│ Layer 2: Graphics (polígono do cliente)         │
│                                                 │
│ Saída: WKT (EPSG:4326)                          │
│        Para: Backend → Validação PostGIS        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. TOPOGRAFO - ValidarDesenhos.tsx              │
├─────────────────────────────────────────────────┤
│ Layer 1: Basemap (Esri Topo ou OSM)             │
│ Layer 2: Desenho Cliente (cinza, 50% opaco)     │
│ Layer 3: Geometria Oficial (azul) ← ATIVA       │
│ Layer 4: Sobreposições (vermelho, se houver)    │
│ Layer 5: Limites Compartilhados (verde)         │
│                                                 │
│ Ferramentas: Snap, Edit, Measure, Calculate     │
│ Checklist: 6 itens para validation               │
│                                                 │
│ Saída: Aprovada/Rejeitada                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. DATABASE - PostGIS                           │
├─────────────────────────────────────────────────┤
│ Tabela: lotes                                   │
│ Campo: geom (Polygon, SRID=4674/4326)           │
│ Status: DESENHO → VALIDACAO_SIGEF → PENDENTE    │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ **Configuração Atual**

### DrawMapEsri.tsx (ArcGIS - ATIVA)

```typescript
// Basemap atual
const map = new Map({
  basemap: 'topo-vector',  // ← PADRÃO
  layers: [graphicsLayer],
});

// Props aceitas
interface DrawMapEsriProps {
  onGeometryChange?: (wkt: string) => void;
  initialCenter?: [number, number];      // [-47.9292, -15.7801] (Brasília)
  initialZoom?: number;                   // 15
  basemap?: 'streets-vector' | 'topo-vector' | 'satellite' | 'hybrid';
}
```

### DrawMap.tsx (OpenLayers - LEGACY)

```typescript
// Basemap atual
function getBasemapLayer(basemapId: 'osm' | 'esri-street' | 'esri-topo' | 'esri-satellite') {
  if (basemapId === 'osm') {
    return new TileLayer({ source: new OSM() });
  }
  return new TileLayer({ source: createEsriSource(urlTemplate) });
}

// Props aceitas
interface DrawMapProps {
  onGeometryChange?: (wkt: string) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  basemap?: 'osm' | 'esri-street' | 'esri-topo' | 'esri-satellite';
}
```

---

## ✅ **Checklist de Layers - Status**

### DesenharArea (ArcGIS)

- [x] Basemap Esri Topo-Vector
- [x] Graphics Layer para desenhos
- [x] Sketch Widget (draw tool)
- [x] WKT output (EPSG:4326)
- [x] Conversão Web Mercator → Geographic
- [ ] Validação em tempo real (PostGIS)
- [ ] Snap magnético (0.5m)
- [ ] Edit vértices

### ValidarDesenhos (Design)

- [ ] Basemap implementado
- [ ] Desenho Cliente layer
- [ ] Geometria Oficial layer
- [ ] Sobreposições layer (PostGIS)
- [ ] Limites Compartilhados layer (PostGIS)
- [ ] Snap Tool (0.5m)
- [ ] Edit Vértices tool
- [ ] Measure Distance tool
- [ ] Calculate Area tool
- [ ] Checklist UI

---

## 🔐 **Projeções & Transformações**

| Contexto | Projeção | EPSG | Descrição |
|----------|----------|------|-----------|
| **Armazenamento** | Geographic | EPSG:4326 (WGS 84) | Padrão global, coordenadas em graus |
| **Armazenamento (Brasil)** | Geographic | EPSG:4674 (SIRGAS 2000) | Oficial no Brasil para topografia |
| **Mapa (Esri/OL)** | Web Mercator | EPSG:3857 | Padrão web, preserva forma |
| **Desenho do Cliente** | Web Mercator | EPSG:3857 | Renderizado no mapa |
| **Saída WKT** | Geographic | EPSG:4326 | Enviado ao backend |

**Conversão automática**:

- DrawMapEsri: Esri Polygon (3857) → webMercatorToGeographic → WKT (4326)
- DrawMap: fromLonLat (4326→3857) ↔ geometryToWKT (→4326)

---

## 📚 **Arquivos Relacionados**

```
✅ Ativa:
  /apps/web/src/components/maps/DrawMapEsri.tsx        (156 linhas)
  /apps/web/src/pages/cliente/DesenharArea.tsx         (158 linhas)

❌ Legacy (não usado):
  /apps/web/src/components/maps/DrawMap.tsx             (297 linhas - OpenLayers)
  /apps/web/src/lib/basemaps.ts                         (70 linhas)

⏳ Design (não implementado):
  /apps/web/src/pages/topografo/ValidarDesenhos.tsx    (156 linhas - mock)
```

---

## 🚀 **Próximas Ações**

### Implementar ValidarDesenhos com layers

1. [ ] Integrar PostGIS para detectar sobreposições
2. [ ] Implementar layer de desenho cliente
3. [ ] Implementar layer de geometria oficial (editável)
4. [ ] Ferramentas Snap (0.5m), Edit, Measure, Calculate
5. [ ] Validação checklist
6. [ ] Botão "Aprovar Geometria Oficial"

### Melhorias em DesenharArea

1. [ ] Snap magnético (não apenas desenho)
2. [ ] Validação em tempo real (PostGIS)
3. [ ] Preview de erros topológicos
4. [ ] Undo/Redo

---

## 📊 **Resumo Técnico**

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| **DesenharArea** | ✅ Completo | ArcGIS, 2 layers, basemap topo |
| **ValidarDesenhos** | ❌ Design only | Mock UI, 5 layers propostas |
| **Projeções** | ✅ Implementado | 4326 (saída), 3857 (renderização) |
| **Snap Tool** | ❌ Não tem | Proposto 0.5m em ValidarDesenhos |
| **Edit Vértices** | ⏳ Parcial | Sketch widget permite, não customizado |
| **Validação PostGIS** | ❌ Não tem | Backend pronto, frontend não integrado |

---

**Data**: 2025-02-05  
**Revisão**: Completa - Todas as layers conferidas  
**Próxima**: Implementar ValidarDesenhos com layers PostGIS
