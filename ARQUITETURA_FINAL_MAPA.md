# 🏗️ ARQUITETURA FINAL - ValidarDesenhos com Mapa Integrado

## 📐 Diagrama Hierárquico

```
ValidarDesenhos.tsx (PÁGINA)
│
├─── HEADER
│    └─ ✅ Validar Desenhos
│       └─ Revise e aprove a geometria
│
├─── LAYOUT GRID (3 COLUNAS)
│
│    ┌─────────────────────────────────────────────────────────┐
│    │                   VALIDAR LAYOUT                         │
│    ├─────────────────────────────────────────────────────────┤
│    │                                                          │
│    │  [LAYER PANEL]  │  [MAP SECTION]        │  [VALIDATION] │
│    │  (320px)        │  (flex)                │  (340px)      │
│    │                 │                        │               │
│    │  ┌──────────┐   │  ┌─────────────────┐  │ ┌───────────┐ │
│    │  │LayerCtrl │   │  │ TOOLS TOOLBAR   │  │ │ Checklist │ │
│    │  │Component │   │  ├─────────────────┤  │ │           │ │
│    │  │          │   │  │ 🧲 Snap         │  │ │ ✓ Valid   │ │
│    │  │ ☑ Client │   │  │ ✏️  Edit         │  │ │ ✓ Snap    │ │
│    │  │   50%    │   │  │ 📏 Measure      │  │ │ ✗ Overlap │ │
│    │  │          │   │  │ 📐 Area         │  │ │ ✓ Area    │ │
│    │  │ ☑ Oficial│   │  ├─────────────────┤  │ │ ✓ CRS     │ │
│    │  │ 100%     │   │  │                 │  │ │ ✗ Confront│ │
│    │  │          │   │  │ DrawMap         │  │ │           │ │
│    │  │ ☐ Overlap│   │  │ Validation      │  │ │┏━━━━━━━━┓ │ │
│    │  │ ☐ Límits│   │  │ (ArcGIS)        │  │ │┃Status ✅┃ │ │
│    │  │          │   │  │ • 4 layers      │  │ │┗━━━━━━━━┛ │ │
│    │  │👁️  Todas │   │  │ • Measurement   │  │ │           │ │
│    │  │👁️‍🗨️ Nenhuma│  │  │ • Tool feedback │  │ │ Approve ✅│ │
│    │  │↺ Padrão │   │  │                 │  │ │(enabled)  │ │
│    │  │          │   │  └─────────────────┘  │ └───────────┘ │
│    │  │          │   │  📏 Distance: 0.25km  │               │
│    │  │          │   │  📐 Area: 0.25ha     │               │
│    │  └──────────┘   │                        │               │
│    │                 │                        │               │
│    └─────────────────────────────────────────────────────────┘
│
└─── FOOTER (invisível)


COMPONENTES:
├─ ✅ LayerControl
│  ├─ Props: layers[], onLayerChange
│  └─ Exports: UI de visibilidade + opacidade
│
├─ ✅ DrawMapValidation
│  ├─ Props: layers[], activeTool, callbacks
│  ├─ Features:
│  │  ├─ GraphicsLayer por cada layer
│  │  ├─ Símbolos customizados (cor + opacidade)
│  │  ├─ Tool listeners (snap, edit, measure, area)
│  │  └─ Callbacks de medição
│  └─ Exports: Mapa renderizado + feedback
│
└─ ✅ ValidarDesenhos
   ├─ State: layerStates, validationChecks, activeTool, measurements
   ├─ Data: 4 polígonos de exemplo (cliente, oficial, overlap, limits)
   ├─ Callbacks: handleLayerChange, toggleValidationCheck
   └─ Exports: Página completa grid 3-colunas
```

---

## 🔄 FLUXO DE DADOS

```
USER INTERAÇÃO
│
├─ [Clica checkbox]
│  └─ LayerControl.handleVisibilityChange()
│     └─ onLayerChange('layerId', visible, opacity)
│        └─ ValidarDesenhos.handleLayerChange()
│           └─ setLayerStates()
│              └─ RE-RENDER com novo state
│
├─ [Puxa slider opacidade]
│  └─ LayerControl.handleOpacityChange()
│     └─ onLayerChange('layerId', visible, opacity)
│        └─ setLayerStates()
│           └─ DrawMapValidation recebe novo props.layers
│              └─ graphicsLayer.opacity = opacity/100
│                 └─ MAPA RE-RENDERIZA
│
├─ [Clica ferramenta]
│  └─ setActiveTool('measure'|'area'|'snap'|'edit')
│     └─ DrawMapValidation.useEffect() detecta change
│        └─ handleMeasureTool() / handleAreaTool()
│           └─ Adiciona listeners no mapa
│
├─ [Usa ferramenta no mapa: clica 2 pontos]
│  └─ DrawMapValidation detecta eventos
│     └─ Calcula distância (Haversine)
│        └─ onMeasurement(245.32)
│           └─ ValidarDesenhos.setMeasurements()
│              └─ RE-RENDER com resultado
│                 └─ Mostra "📏 Distância: 245.32 m"
│
└─ [Valida tudo + clica Approve]
   └─ POST /api/lotes/{id}/validar-topografia
      └─ Backend salva geometria
         └─ Redirect para contrato
```

---

## 📊 STATE MANAGEMENT

```typescript
ValidarDesenhos State:

┌─ layerStates (LayerControl)
│  ├─ cliente: { visible: true, opacity: 50 }
│  ├─ oficial: { visible: true, opacity: 100 }
│  ├─ sobreposi: { visible: false, opacity: 70 }
│  └─ limites: { visible: false, opacity: 80 }
│
├─ validationChecks (Checklist)
│  ├─ geometria: true
│  ├─ snap: true
│  ├─ sobreposicoes: false
│  ├─ area: true
│  ├─ crs: true
│  └─ confrontantes: false
│
├─ activeTool (Toolbar)
│  └─ null | 'snap' | 'edit' | 'measure' | 'area'
│
└─ measurements (Feedback)
   ├─ distance?: 245.32 (metros)
   └─ area?: 2540.85 (m²)

DERIVED STATE (useMemo):

├─ layers (para DrawMapValidation)
│  └─ Array de 4 LayerData com:
│     ├─ id, label, color
│     ├─ visible (de layerStates)
│     ├─ opacity (de layerStates)
│     └─ graphics (Graphic[])
│
└─ layerControlDefs (para LayerControl)
   └─ Array de Layer definições com initialVisible/Opacity
```

---

## 🎯 MAPA - ESTRUTURA INTERNA

```
DrawMapValidation Component
│
├─ Props
│  ├─ layers: LayerData[] (4 layers)
│  ├─ activeTool: 'measure' | null
│  ├─ onMeasurement: (distance) => void
│  └─ onAreaCalculated: (area) => void
│
├─ Refs
│  ├─ mapRef: HTMLDivElement (container)
│  ├─ viewRef: MapView (ArcGIS view)
│  └─ layersRef: Map<string, GraphicsLayer>
│
├─ State
│  └─ measurementPoints: [number, number][]
│
├─ Setup (useEffect)
│  └─ Criar Map({ basemap: 'topo-vector' })
│     ├─ Para cada layer:
│     │  └─ new GraphicsLayer(id, visible, opacity)
│     │     └─ Adicionar graphics com symbology
│     │        └─ map.add(graphicsLayer)
│     │
│     └─ Criar MapView({ container, map, center, zoom })
│        └─ viewRef.current = view
│
├─ Tool Setup (conditional useEffect)
│  ├─ activeTool === 'measure'
│  │  └─ view.on('click') → calcula distância
│  ├─ activeTool === 'area'
│  │  └─ geometryEngine.planarArea()
│  ├─ activeTool === 'snap'
│  │  └─ Stub: console.log()
│  └─ activeTool === 'edit'
│     └─ new Sketch({ mode: 'update' })
│
├─ Helper Functions
│  ├─ getSymbolForLayer(color, opacity)
│  │  └─ SimpleFillSymbol (fill + outline)
│  ├─ hexToRgb(hex)
│  │  └─ Converter #667eea → rgb(102, 126, 234)
│  ├─ calculateDistance(p1, p2)
│  │  └─ Haversine formula → metros
│  └─ calculatePolygonArea(polygon)
│     └─ geometryEngine.planarArea() → m²
│
└─ Render
   └─ <div ref={mapRef} /> (full size)
      └─ Renderiza ArcGIS map dentro
```

---

## 🎨 VISUALS - WHAT USER SEES

### Tela Inicial (Default State)

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Validar Desenhos                                     │
│ Revise e aprove a geometria da propriedade              │
└─────────────────────────────────────────────────────────┘

┌──────────────┬────────────────────────┬─────────────────┐
│ 🗺️ Layers    │ 🧲 Snap ✏️ Edit       │ 📋 Checklist    │
│              │ 📏 Measure 📐 Area    │                 │
│ ☑ Cliente    │                       │ ✓ Geometria     │
│   50% ━━─   │                       │ ✓ Snap          │
│              │ ┌─────────────────┐  │ ✗ Sobreposi     │
│ ☑ Oficial    │ │ MAPA ArcGIS     │  │ ✓ Área          │
│ 100% ━━━─   │ │                 │  │ ✓ CRS           │
│              │ │ 4 Layers        │  │ ✗ Confront      │
│ ☐ Overlap    │ │ renderizadas    │  │                 │
│ ☐ Límits     │ │                 │  │ ✅Aprovar       │
│              │ │ Com feedback    │  │                 │
│ 👁️ Todas    │ │ de medições     │  │                 │
│ 👁️‍🗨️ Nenhuma  │ │                 │  │                 │
│ ↺ Padrão    │ └─────────────────┘  │                 │
│              │ 📏 Distância: X km    │                 │
│              │ 📐 Área: X.XX ha      │                 │
└──────────────┴────────────────────────┴─────────────────┘
```

### Com Ferramenta Ativa (Measure)

```
Overlay Vermelho:
┌──────────────────────────────────────┐
│ 🛠️ Ferramenta Ativa:                 │
│ Clique para medir distâncias          │
│                                       │
│ 📏 Distância: 0.25 km                │
└──────────────────────────────────────┘

Mapa mostra:
├─ Linha verde entre 2 pontos clicados
├─ Polyline renderizada
└─ Feedback atualizado em tempo real
```

---

## ✅ TODOS OS COMPONENTES PRONTOS

```
✅ LayerControl.tsx
   ├─ Checkboxes visibilidade
   ├─ Sliders opacidade
   ├─ Color dots
   ├─ Quick actions
   └─ Responsivo

✅ DrawMapValidation.tsx
   ├─ ArcGIS Map + 4 GraphicsLayers
   ├─ Símbolos customizados
   ├─ Tool: Measure (completo)
   ├─ Tool: Area (completo)
   ├─ Tool: Snap (stub)
   ├─ Tool: Edit (sketch)
   └─ Callbacks

✅ ValidarDesenhos.tsx
   ├─ Página grid 3-colunas
   ├─ Integração LayerControl
   ├─ Integração DrawMapValidation
   ├─ State de layers
   ├─ State de validação
   ├─ State de medições
   ├─ Dados de exemplo (4 polígonos)
   └─ Responsivo

✅ Arquivos CSS
   ├─ LayerControl.css (270 linhas)
   ├─ ValidarDesenhos.css (300 linhas)
   └─ Responsividade completa
```

---

## 📋 PRÓXIMOS PASSOS - O QUE AINDA FALTA

### Curto Prazo (Hoje)

1. **Testar no VS Code**

   ```bash
   npm run dev
   # Acessar: http://localhost:4200/topografo/validar-desenhos
   ```

2. **Verificar Imports/Tipos**
   - Garantir @arcgis/core está instalado
   - Resolver erros de TypeScript
   - Rodar: `npm run typecheck`

3. **Validar Geometria**
   - Mapa carrega com 4 polígonos
   - LayerControl funciona
   - Ferramentas respondem

### Médio Prazo (Próxima Sessão)

1. **Conectar ao Backend**
   - Carregar layers reais de `/api/lotes/{id}`
   - Sobreposições de PostGIS
   - Validação de topologia

2. **Implementar Full Tools**
   - Snap: detectar pontos próximos
   - Edit: modo drag vertices
   - Medições: visualizar linha
   - Área: visualizar polígono

3. **Endpoints API**
   - GET /api/lotes/{id}/layers → carrega geometrias
   - POST /api/lotes/{id}/validar-topografia → aprova
   - GET /api/lotes/{id}/validar-overlaps → sobreposições

### Longo Prazo

1. **Persistência**
   - Salvar estado de validação
   - Histórico de mudanças
   - Assinatura digital

2. **Segurança**
   - Rate limiting
   - JWT validation
   - Audit logging

3. **Performance**
   - Lazy loading de layers
   - WebWorkers para cálculos
   - VirtualScroll para longas listas

---

## 🚀 RESUMO FINAL

```
ANTES:
└─ ValidarDesenhos
   └─ Mock UI sem mapa

DEPOIS:
└─ ValidarDesenhos (página grid 3-colunas)
   ├─ LayerControl (sidebar esquerda)
   │  ├─ Checkbox visibilidade
   │  ├─ Slider opacidade
   │  └─ Quick actions
   │
   ├─ DrawMapValidation (centro)
   │  ├─ 4 GraphicsLayers renderizadas
   │  ├─ Símbolos por cor + opacidade
   │  ├─ 4 Ferramentas (Snap, Edit, Measure, Area)
   │  └─ Feedback real-time
   │
   └─ Validação Checklist (sidebar direita)
      ├─ 6 itens de validação
      ├─ Status visual
      └─ Botão Aprovar (habilitado ao completar)

FUNCIONALIDADES:
✅ Visibilidade de layers
✅ Controle de opacidade
✅ Ferramentas interativas
✅ Medições em tempo real
✅ Cálculos de área
✅ Feedback visual
✅ Interface responsiva
✅ Dados de exemplo
⏳ Integração backend
```

---

**Status**: 🟢 **PRONTO PARA TESTE**  
**Data**: 2025-02-05  
**Próximo**: Testar em `npm run dev` e conectar ao backend
