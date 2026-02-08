import { useState, useMemo } from 'react';
import LayerControl, { Layer } from '../../components/LayerControl';
import DrawMapValidation from '../../components/maps/DrawMapValidation';
import { BreadcrumbNav } from '../../components/Navigation';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import './ValidarDesenhos.css';

interface LayerState {
  [layerId: string]: {
    visible: boolean;
    opacity: number;
  };
}

// Dados de exemplo para as layers (em coordenadas Brasília)
const createExamplePolygons = () => {
  // Coordenadas em Web Mercator (para as layers)
  const brasiliaLon = -47.9292;
  const brasiliaLat = -15.7801;

  // Layer 1: Desenho Cliente (polígono inicial)
  const clientPolygon = new Polygon({
    rings: [
      [
        [brasiliaLon - 0.001, brasiliaLat],
        [brasiliaLon - 0.001, brasiliaLat - 0.001],
        [brasiliaLon, brasiliaLat - 0.001],
        [brasiliaLon, brasiliaLat],
        [brasiliaLon - 0.001, brasiliaLat],
      ],
    ],
  });

  // Layer 2: Geometria Oficial (ajustada, com snap)
  const oficialPolygon = new Polygon({
    rings: [
      [
        [brasiliaLon - 0.0009, brasiliaLat + 0.0001],
        [brasiliaLon - 0.00095, brasiliaLat - 0.00095],
        [brasiliaLon + 0.0001, brasiliaLat - 0.0009],
        [brasiliaLon + 0.0001, brasiliaLat + 0.0001],
        [brasiliaLon - 0.0009, brasiliaLat + 0.0001],
      ],
    ],
  });

  // Layer 3: Sobreposições (pequeno polígono de conflito)
  const overlapPolygon = new Polygon({
    rings: [
      [
        [brasiliaLon - 0.0005, brasiliaLat - 0.0003],
        [brasiliaLon - 0.0003, brasiliaLat - 0.0003],
        [brasiliaLon - 0.0003, brasiliaLat - 0.0005],
        [brasiliaLon - 0.0005, brasiliaLat - 0.0005],
        [brasiliaLon - 0.0005, brasiliaLat - 0.0003],
      ],
    ],
  });

  // Layer 4: Limites Compartilhados (linha)
  const limitsLine = new Polygon({
    rings: [
      [
        [brasiliaLon + 0.0001, brasiliaLat],
        [brasiliaLon + 0.0001, brasiliaLat - 0.0005],
        [brasiliaLon + 0.00015, brasiliaLat - 0.0005],
        [brasiliaLon + 0.00015, brasiliaLat],
        [brasiliaLon + 0.0001, brasiliaLat],
      ],
    ],
  });

  return {
    cliente: [new Graphic({ geometry: clientPolygon })],
    oficial: [new Graphic({ geometry: oficialPolygon })],
    sobreposi: [new Graphic({ geometry: overlapPolygon })],
    limites: [new Graphic({ geometry: limitsLine })],
  };
};

export default function ValidarDesenhos() {
  const [layerStates, setLayerStates] = useState<LayerState>({
    cliente: { visible: true, opacity: 50 },
    oficial: { visible: true, opacity: 100 },
    sobreposi: { visible: false, opacity: 70 },
    limites: { visible: false, opacity: 80 },
  });

  const examplePolygons = useMemo(() => createExamplePolygons(), []);

  const [validationChecks, setValidationChecks] = useState({
    geometria: true,
    snap: true,
    sobreposicoes: false,
    area: true,
    crs: true,
    confrontantes: false,
  });

  const [activeTool, setActiveTool] = useState<'snap' | 'edit' | 'measure' | 'area' | null>(null);
  const [measurements, setMeasurements] = useState<Partial<Record<'distance' | 'area', number>>>({});

  // Layers para o mapa
  const layers = useMemo(() => [
    {
      id: 'cliente',
      label: 'Desenho Cliente (rascunho)',
      color: '#999999',
      visible: layerStates.cliente.visible,
      opacity: layerStates.cliente.opacity,
      graphics: examplePolygons.cliente,
    },
    {
      id: 'oficial',
      label: 'Geometria Oficial (ajustada)',
      color: '#CD7F32', // Bronze-600 (design-tokens.css)
      visible: layerStates.oficial.visible,
      opacity: layerStates.oficial.opacity,
      graphics: examplePolygons.oficial,
    },
    {
      id: 'sobreposi',
      label: 'Sobreposições',
      color: '#E53935', // Error color (design-tokens.css)
      visible: layerStates.sobreposi.visible,
      opacity: layerStates.sobreposi.opacity,
      graphics: examplePolygons.sobreposi,
    },
    {
      id: 'limites',
      label: 'Limites Compartilhados',
      color: '#5FB063', // Success color (design-tokens.css)
      visible: layerStates.limites.visible,
      opacity: layerStates.limites.opacity,
      graphics: examplePolygons.limites,
    },
  ], [layerStates, examplePolygons]);

  const handleLayerChange = (layerId: string, visible: boolean, opacity: number) => {
    setLayerStates((prev) => ({
      ...prev,
      [layerId]: { visible, opacity },
    }));
  };

  const toggleValidationCheck = (key: keyof typeof validationChecks) => {
    setValidationChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allChecksComplete = Object.values(validationChecks).every((v) => v);

  // Layer control definitions para o LayerControl component
  const layerControlDefs: Layer[] = layers.map(layer => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    initialVisible: layer.visible,
    initialOpacity: layer.opacity,
    description: 'Visualizar no mapa',
  }));

  return (
    <div className="validar-desenhos-container">
      {/* Breadcrumb Navigation */}
      <div style={{ padding: '1rem 2rem 0' }}>
        <BreadcrumbNav
          items={[
            { label: 'Dashboard', path: '/topografo/dashboard' },
            { label: 'Validar Desenhos' },
          ]}
        />
      </div>

      {/* Header */}
      <div className="page-header">
        <h1><span role="img" aria-label="Aprovado">✅</span> Validar Desenhos</h1>
        <p>Revise e aprove a geometria da propriedade antes de gerar o contrato</p>
      </div>

      {/* Layout: LayerControl + Map + Validation */}
      <div className="validar-layout">
        {/* 1. Layer Control Panel (Left Sidebar) */}
        <aside className="layer-panel">
          <LayerControl layers={layerControlDefs} onLayerChange={handleLayerChange} />
        </aside>

        {/* 2. Map + Tools (Center) */}
        <main className="map-section">
          {/* Tools Toolbar */}
          <div className="tools-toolbar">
            <button
              className={`tool-btn ${activeTool === 'snap' ? 'active' : ''}`}
              onClick={() => setActiveTool(activeTool === 'snap' ? null : 'snap')}
              title="Snap Tool: Ajustar vértices com tolerância de 0.5m"
            >
              <span role="img" aria-label="Imã">🧲</span> Snap (0.5m)
            </button>

            <button
              className={`tool-btn ${activeTool === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTool(activeTool === 'edit' ? null : 'edit')}
              title="Editar Vértices: Mover, adicionar ou remover pontos"
            >
              <span role="img" aria-label="Lapis">✏️</span> Editar Vértices
            </button>

            <button
              className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`}
              onClick={() => setActiveTool(activeTool === 'measure' ? null : 'measure')}
              title="Medir Distância: Medição entre pontos"
            >
              <span role="img" aria-label="Regua">📏</span> Medir
            </button>

            <button
              className={`tool-btn ${activeTool === 'area' ? 'active' : ''}`}
              onClick={() => setActiveTool(activeTool === 'area' ? null : 'area')}
              title="Calcular Área: Área do polígono em m²"
            >
              <span role="img" aria-label="Esquadro">📐</span> Calcular Área
            </button>

            {activeTool && (
              <div className="active-tool-info">
                <strong>Ferramenta ativa:</strong>
                {activeTool === 'snap' && ' Ajuste os vértices com 0.5m de tolerância'}
                {activeTool === 'edit' && ' Clique e arraste vértices para editá-los'}
                {activeTool === 'measure' && ' Clique para medir distâncias'}
                {activeTool === 'area' && ' Área calculada automaticamente ao editar'}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="map-container">
            <DrawMapValidation
              layers={layers}
              activeTool={activeTool}
              onMeasurement={(distance) => {
                setMeasurements((prev) => ({ ...prev, distance }));
              }}
              onAreaCalculated={(area) => {
                setMeasurements((prev) => ({ ...prev, area }));
              }}
              initialCenter={[-47.9292, -15.7801]}
              initialZoom={17}
              basemap="streets-vector"
            />
          </div>

          {/* Measurement Results */}
          {(measurements.distance || measurements.area) && (
            <div className="measurement-results">
              {measurements.distance && (
                <div className="measurement-item">
                  <span className="measurement-label">
                    <span role="img" aria-label="Regua">📏</span> Distância Medida:
                  </span>
                  <span className="measurement-value">
                    {measurements.distance >= 1000
                      ? (measurements.distance / 1000).toFixed(2)
                      : measurements.distance.toFixed(2)}{' '}
                    {measurements.distance >= 1000 ? 'km' : 'm'}
                  </span>
                </div>
              )}
              {measurements.area && (
                <div className="measurement-item">
                  <span className="measurement-label">
                    <span role="img" aria-label="Esquadro">📐</span> Área Calculada:
                  </span>
                  <span className="measurement-value">
                    {(measurements.area / 10000).toFixed(2)} hectares ({measurements.area.toFixed(0)} m²)
                  </span>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 3. Validation Panel (Right Sidebar) */}
        <aside className="validation-panel">
          <h3><span role="img" aria-label="Checklist">📋</span> Checklist de Validação</h3>

          <div className="checklist">
            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.geometria}
                onChange={() => toggleValidationCheck('geometria')}
              />
              <span className={validationChecks.geometria ? 'completed' : ''}>
                ✓ Geometria válida (sem auto-interseções)
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.snap}
                onChange={() => toggleValidationCheck('snap')}
              />
              <span className={validationChecks.snap ? 'completed' : ''}>
                ✓ Snap aplicado nos vértices
              </span>
            </label>

            <label className="check-item warning">
              <input
                type="checkbox"
                checked={validationChecks.sobreposicoes}
                onChange={() => toggleValidationCheck('sobreposicoes')}
              />
              <span className={validationChecks.sobreposicoes ? 'completed' : ''}>
                ✓ Sem sobreposições com vizinhos
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.area}
                onChange={() => toggleValidationCheck('area')}
              />
              <span className={validationChecks.area ? 'completed' : ''}>
                ✓ Área calculada corretamente
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.crs}
                onChange={() => toggleValidationCheck('crs')}
              />
              <span className={validationChecks.crs ? 'completed' : ''}>
                ✓ CRS SIRGAS 2000 (EPSG:4674)
              </span>
            </label>

            <label className="check-item warning">
              <input
                type="checkbox"
                checked={validationChecks.confrontantes}
                onChange={() => toggleValidationCheck('confrontantes')}
              />
              <span className={validationChecks.confrontantes ? 'completed' : ''}>
                ✓ Confrontantes identificados
              </span>
            </label>
          </div>

          {/* Status */}
          <div className={`validation-status ${allChecksComplete ? 'complete' : 'incomplete'}`}>
            {allChecksComplete ? (
              <>
                <p className="status-icon"><span role="img" aria-label="Sucesso">✅</span></p>
                <p className="status-text">Tudo validado!</p>
              </>
            ) : (
              <>
                <p className="status-icon"><span role="img" aria-label="Carregando">⏳</span></p>
                <p className="status-text">
                  {Object.values(validationChecks).filter((v) => v).length}/{Object.keys(validationChecks).length}
                </p>
              </>
            )}
          </div>

          {/* Action Button */}
          <button
            className={`approve-button ${allChecksComplete ? 'enabled' : 'disabled'}`}
            disabled={!allChecksComplete}
            title={allChecksComplete ? 'Aprovar geometria' : 'Complete todos os itens da validação'}
          >
            <span role="img" aria-label="Aprovar">✅</span> Aprovar Geometria
          </button>
        </aside>
      </div>
    </div>
  );
}
