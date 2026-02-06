import { useCallback, useMemo, useState } from 'react';
import LayerControl, { Layer } from '../../components/LayerControl';
import DrawMapValidation from '../../components/maps/DrawMapValidation';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import './ValidarDesenhos.css';

type ValidationKey = 'geometria' | 'snap' | 'sobreposicoes' | 'area' | 'crs' | 'confrontantes';
type ToolId = 'snap' | 'edit' | 'measure' | 'area';

interface LayerState {
  [layerId: string]: {
    visible: boolean;
    opacity: number;
  };
}

const TOOL_DEFINITIONS: Array<{
  id: ToolId;
  label: string;
  icon: string;
  title: string;
  description: string;
}> = [
    {
      id: 'snap',
      label: 'Snap (0.5m)',
      icon: '🧲',
      title: 'Snap Tool: Ajustar vértices com tolerância de 0.5m',
      description: 'Ajuste os vértices com 0.5m de tolerância',
    },
    {
      id: 'edit',
      label: 'Editar Vértices',
      icon: '✏️',
      title: 'Editar Vértices: Mover, adicionar ou remover pontos',
      description: 'Clique e arraste vértices para editá-los',
    },
    {
      id: 'measure',
      label: 'Medir',
      icon: '📏',
      title: 'Medir Distância: Medição entre pontos',
      description: 'Clique para medir distâncias',
    },
    {
      id: 'area',
      label: 'Calcular Área',
      icon: '📐',
      title: 'Calcular Área: Área do polígono em m²',
      description: 'Área calculada automaticamente ao editar',
    },
  ];

const VALIDATION_ITEMS: Array<{
  key: ValidationKey;
  label: string;
  warning?: boolean;
}> = [
    { key: 'geometria', label: '✓ Geometria válida (sem auto-interseções)' },
    { key: 'snap', label: '✓ Snap aplicado nos vértices' },
    { key: 'sobreposicoes', label: '✓ Sem sobreposições com vizinhos', warning: true },
    { key: 'area', label: '✓ Área calculada corretamente' },
    { key: 'crs', label: '✓ CRS SIRGAS 2000 (EPSG:4674)' },
    { key: 'confrontantes', label: '✓ Confrontantes identificados', warning: true },
  ];

const createExamplePolygons = () => {
  const brasiliaLon = -47.9292;
  const brasiliaLat = -15.7801;

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

  const [validationChecks, setValidationChecks] = useState<Record<ValidationKey, boolean>>({
    geometria: true,
    snap: true,
    sobreposicoes: false,
    area: true,
    crs: true,
    confrontantes: false,
  });

  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [measurements, setMeasurements] = useState<Partial<Record<'distance' | 'area', number>>>({});

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
      color: '#667eea',
      visible: layerStates.oficial.visible,
      opacity: layerStates.oficial.opacity,
      graphics: examplePolygons.oficial,
    },
    {
      id: 'sobreposi',
      label: 'Sobreposições',
      color: '#f44336',
      visible: layerStates.sobreposi.visible,
      opacity: layerStates.sobreposi.opacity,
      graphics: examplePolygons.sobreposi,
    },
    {
      id: 'limites',
      label: 'Limites Compartilhados',
      color: '#4caf50',
      visible: layerStates.limites.visible,
      opacity: layerStates.limites.opacity,
      graphics: examplePolygons.limites,
    },
  ], [layerStates, examplePolygons]);

  const layerControlDefs = useMemo<Layer[]>(() => layers.map((layer) => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    initialVisible: layer.visible,
    initialOpacity: layer.opacity,
    description: 'Visualizar no mapa',
  })), [layers]);

  const handleLayerChange = useCallback((layerId: string, visible: boolean, opacity: number) => {
    setLayerStates((prev) => ({
      ...prev,
      [layerId]: { visible, opacity },
    }));
  }, []);

  const toggleValidationCheck = useCallback((key: ValidationKey) => {
    setValidationChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const completedCount = useMemo(
    () => Object.values(validationChecks).filter(Boolean).length,
    [validationChecks]
  );

  const allChecksComplete = completedCount === VALIDATION_ITEMS.length;

  return (
    <div className="validar-desenhos-container">
      {/* Header */}
      <div className="page-header">
        <h1>✅ Validar Desenhos</h1>
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
            {TOOL_DEFINITIONS.map((tool) => (
              <button
                key={tool.id}
                className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                title={tool.title}
              >
                <span>{tool.icon}</span> {tool.label}
              </button>
            ))}

            {activeTool && (
              <div className="active-tool-info">
                <strong>Ferramenta ativa:</strong>
                {` ${TOOL_DEFINITIONS.find((tool) => tool.id === activeTool)?.description || ''}`}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="map-container">
            <DrawMapValidation
              layers={layers}
              activeTool={activeTool}
              onMeasurement={(distance) => setMeasurements((prev) => ({ ...prev, distance }))}
              onAreaCalculated={(area) => setMeasurements((prev) => ({ ...prev, area }))}
              initialCenter={[-47.9292, -15.7801]}
              initialZoom={17}
              basemap="topo-vector"
            />
          </div>

          {/* Measurement Results */}
          {(measurements.distance || measurements.area) && (
            <div className="measurement-results">
              {measurements.distance && (
                <div className="measurement-item">
                  <span className="measurement-label">📏 Distância Medida:</span>
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
                  <span className="measurement-label">📐 Área Calculada:</span>
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
          <h3>📋 Checklist de Validação</h3>

          <div className="checklist">
            {VALIDATION_ITEMS.map((item) => (
              <label
                key={item.key}
                className={`check-item ${item.warning ? 'warning' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={validationChecks[item.key]}
                  onChange={() => toggleValidationCheck(item.key)}
                />
                <span className={validationChecks[item.key] ? 'completed' : ''}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Status */}
          <div className={`validation-status ${allChecksComplete ? 'complete' : 'incomplete'}`}>
            {allChecksComplete ? (
              <>
                <p className="status-icon">✅</p>
                <p className="status-text">Tudo validado!</p>
              </>
            ) : (
              <>
                <p className="status-icon">⏳</p>
                <p className="status-text">
                  {completedCount}/{VALIDATION_ITEMS.length}
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
            ✅ Aprovar Geometria
          </button>
        </aside>
      </div>
    </div>
  );
}
