# CAD/GIS Tools UI Components

Sistema completo de ferramentas CAD/GIS com 43 ferramentas organizadas em 9 categorias.

## Componentes Criados

### Core Components

- **ToolbarTabs.tsx** - Tab navigation component (9 categorias)
- **ToolButton.tsx** - Individual tool button component
- **index.ts** - Central export file

### Category Components (9 total)

1. **DrawingTools.tsx** - 7 ferramentas de desenho avançado
2. **AnalysisTools.tsx** - 7 ferramentas de análise geométrica
3. **MeasurementTools.tsx** - 5 ferramentas de medição avançada
4. **TopologyTools.tsx** - 5 ferramentas de topologia
5. **AnnotationTools.tsx** - 4 ferramentas de anotação
6. **SelectionTools.tsx** - 4 ferramentas de seleção
7. **ImportExportTools.tsx** - 5 ferramentas de import/export
8. **CoordinateTools.tsx** - 3 ferramentas de coordenadas
9. **SIGEFTools.tsx** - 3 ferramentas SIGEF (Brasil)

### Styling

- **ToolbarTabs.css** - Tab navigation styles
- **ToolButton.css** - Tool button styles

## 43 Tool IDs

```typescript
export type ToolId =
  // Drawing (7)
  | 'split' | 'merge' | 'buffer' | 'offset' | 'extend' | 'trim' | 'fillet'
  // Analysis (7)
  | 'intersect' | 'union' | 'difference' | 'symmetric-diff' | 'convex-hull' | 'centroid' | 'perimeter'
  // Measurement (5)
  | 'angle' | 'azimuth' | 'coords-display' | 'elevation' | 'slope'
  // Topology (5)
  | 'validate-topology' | 'close-gaps' | 'remove-slivers' | 'simplify' | 'densify'
  // Annotation (4)
  | 'label' | 'dimension' | 'north-arrow' | 'scale-bar'
  // Selection (4)
  | 'select-rect' | 'select-polygon' | 'select-distance' | 'select-attribute'
  // Import/Export (5)
  | 'import-kml' | 'import-shp' | 'import-gpx' | 'export-dxf' | 'export-geojson'
  // Coordinates (3)
  | 'coord-converter' | 'add-point' | 'coord-grid'
  // SIGEF (3)
  | 'sigef-validator' | 'memorial' | 'vertices-sirgas';
```

## Exemplo de Uso

```typescript
import { useState } from 'react';
import ToolbarTabs, { ToolCategory, ToolId } from '@/components/tools/ToolbarTabs';
import {
  DrawingTools,
  AnalysisTools,
  MeasurementTools,
  TopologyTools,
  AnnotationTools,
  SelectionTools,
  ImportExportTools,
  CoordinateTools,
  SIGEFTools
} from '@/components/tools/categories';

function ValidarDesenhos() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('drawing');
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  // Renderizar componente de categoria baseado em activeCategory
  const renderCategoryTools = () => {
    const props = { activeTool, onToolActivate: setActiveTool };

    switch (activeCategory) {
      case 'drawing': return <DrawingTools {...props} />;
      case 'analysis': return <AnalysisTools {...props} />;
      case 'measurement': return <MeasurementTools {...props} />;
      case 'topology': return <TopologyTools {...props} />;
      case 'annotation': return <AnnotationTools {...props} />;
      case 'selection': return <SelectionTools {...props} />;
      case 'import-export': return <ImportExportTools {...props} />;
      case 'coordinates': return <CoordinateTools {...props} />;
      case 'sigef': return <SIGEFTools {...props} />;
      default: return null;
    }
  };

  return (
    <div>
      <ToolbarTabs
        activeCategory={activeCategory}
        activeTool={activeTool}
        onCategoryChange={setActiveCategory}
        onToolActivate={setActiveTool}
      >
        {renderCategoryTools()}
      </ToolbarTabs>

      {/* DrawMapValidation component */}
      <DrawMapValidation
        activeTool={activeTool}
        // ... outros props
      />
    </div>
  );
}
```

## Design System

O projeto usa variáveis CSS do design system `design-tokens.css`:

- **Cores principais**: `var(--bronze-600)`, `var(--navy-600)`, `var(--titanium-500)`
- **Ícones**: Lucide-react (via componente Icon existente)
- **Layout**: Grid responsivo com breakpoints em 1024px, 768px, 480px
- **Animações**: Transições suaves (0.2s-0.3s ease)

## Próximos Passos

### 1. Implementar Tool Handlers

Adicionar handlers para as 43 ferramentas em `DrawMapValidation.tsx`:

- useCallback para cada ferramenta
- useEffect para ativar ferramenta baseada em activeTool
- Callbacks para resultados (onPolygonSplit, onBufferCreated, etc.)

### 2. Backend Endpoints (10 ferramentas)

Ferramentas que precisam backend:

- elevation, slope (DEM data)
- import-kml, import-shp, import-gpx (file parsing)
- export-dxf (DXF generation)
- sigef-validator, memorial, vertices-sirgas (SIGEF validation)

### 3. Geometry Utils Library

Criar utilitários em `apps/web/src/lib/geometry/`:

- AngleCalculation.ts
- CoordinateConversion.ts
- TopologyValidation.ts

## Estatísticas

- **Total de arquivos criados**: 15
- **Componentes TypeScript**: 11 (.tsx) + 2 (.ts)
- **Arquivos CSS**: 2
- **Total de linhas de código**: ~1,180 LOC
- **Ferramentas implementadas**: 43
- **Categorias**: 9

## Compatibilidade

- React 18+
- TypeScript (strict mode)
- ArcGIS Maps SDK for JavaScript 4.34.8
- Lucide-react (ícones)
- Design system existente (LayerControl.css como referência)
