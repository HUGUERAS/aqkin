import { useCallback, useMemo, useState } from 'react';
import LayerControl, { Layer } from '../../components/LayerControl';
import DrawMapValidation from '../../components/maps/DrawMapValidation';
import { CADToolbar, type CADToolType } from '../../components/cad';
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

// Map CAD tool types to legacy tool types used by DrawMapValidation
const CAD_TO_LEGACY_TOOL: Partial<Record<CADToolType, ToolId>> = {
  'snap': 'snap',
  'edit-vertex': 'edit',
  'measure-distance': 'measure',
  'measure-area': 'area',
};

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

  // CAD Toolbar state
  const [activeCADTool, setActiveCADTool] = useState<CADToolType | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [measurements, setMeasurements] = useState<{
    distance?: number | null;
    area?: number | null;
    angle?: number | null;
  }>({});

  // Map CAD tool to legacy tool for DrawMapValidation
  const activeTool: ToolId | null = useMemo(() => {
    if (!activeCADTool) return null;
    return CAD_TO_LEGACY_TOOL[activeCADTool] || null;
  }, [activeCADTool]);

  const handleCADToolSelect = useCallback((tool: CADToolType) => {
    setActiveCADTool(prev => prev === tool ? null : tool);
  }, []);

  const handleSnapToggle = useCallback(() => {
    setSnapEnabled(prev => !prev);
    if (!snapEnabled) {
      setActiveCADTool('snap');
    }
  }, [snapEnabled]);

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
    <div className="validar-desenhos-container professional">
      {/* Professional Header */}
      <header className="validar-header">
        <div className="validar-header-content">
          <div className="validar-header-title">
            <span className="validar-header-icon">🗺️</span>
            <div>
              <h1>Validação de Geometria</h1>
              <p>Analise e aprove os limites da propriedade com ferramentas CAD profissionais</p>
            </div>
          </div>
          <div className="validar-header-status">
            <span className={`status-badge ${allChecksComplete ? 'complete' : 'pending'}`}>
              {allChecksComplete ? '✓ Pronto para Aprovar' : `${completedCount}/${VALIDATION_ITEMS.length} Verificações`}
            </span>
          </div>
        </div>
      </header>

      {/* Professional Layout: CAD Tools + Layers + Map + Validation */}
      <div className="validar-professional-layout">
        {/* 1. CAD Toolbar (Left) - Professional CAD Tools */}
        <aside className="cad-panel">
          <CADToolbar
            activeTool={activeCADTool}
            onToolSelect={handleCADToolSelect}
            snapEnabled={snapEnabled}
            onSnapToggle={handleSnapToggle}
            orientation="vertical"
            measurements={measurements}
          />
        </aside>

        {/* 2. Layer Control Panel */}
        <aside className="layer-panel professional">
          <div className="panel-header">
            <span className="panel-icon">📑</span>
            <span className="panel-title">Camadas</span>
          </div>
          <LayerControl layers={layerControlDefs} onLayerChange={handleLayerChange} />
        </aside>

        {/* 3. Map Viewport (Center) - Full Professional Map */}
        <main className="map-viewport-container">
          <div className="map-chrome">
            {/* Map Toolbar (Compact Info Bar) */}
            <div className="map-info-bar">
              <div className="map-info-item">
                <span className="info-label">CRS:</span>
                <span className="info-value">SIRGAS 2000</span>
              </div>
              <div className="map-info-item">
                <span className="info-label">Escala:</span>
                <span className="info-value">1:500</span>
              </div>
              <div className="map-info-item">
                <span className="info-label">Layers:</span>
                <span className="info-value">{layers.filter(l => l.visible).length} ativos</span>
              </div>
              {activeCADTool && (
                <div className="map-info-item tool-active">
                  <span className="info-label">Ferramenta:</span>
                  <span className="info-value">{activeCADTool.replace(/-/g, ' ')}</span>
                </div>
              )}
            </div>

            {/* Main Map */}
            <div className="map-container-pro">
              <DrawMapValidation
                layers={layers}
                activeTool={activeTool}
                onMeasurement={(distance) => setMeasurements((prev) => ({ ...prev, distance }))}
                onAreaCalculated={(area) => setMeasurements((prev) => ({ ...prev, area }))}
                initialCenter={[-47.9292, -15.7801]}
                initialZoom={17}
                basemap="satellite"
              />
            </div>
          </div>
        </main>

        {/* 4. Validation Panel (Right) - Checklist */}
        <aside className="validation-panel professional">
          <div className="panel-header validation-header">
            <span className="panel-icon">✓</span>
            <span className="panel-title">Validação</span>
          </div>

          <div className="validation-content">
            <div className="checklist professional">
              {VALIDATION_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className={`check-item-pro ${validationChecks[item.key] ? 'checked' : ''} ${item.warning ? 'warning' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={validationChecks[item.key]}
                    onChange={() => toggleValidationCheck(item.key)}
                  />
                  <span className="check-icon">{validationChecks[item.key] ? '✓' : '○'}</span>
                  <span className="check-label">{item.label.replace(/^[✓○] /, '')}</span>
                </label>
              ))}
            </div>

            {/* Validation Progress */}
            <div className="validation-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(completedCount / VALIDATION_ITEMS.length) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {Math.round((completedCount / VALIDATION_ITEMS.length) * 100)}% concluído
              </span>
            </div>

            {/* Actions */}
            <div className="validation-actions">
              <button
                className={`approve-button-pro ${allChecksComplete ? 'enabled' : 'disabled'}`}
                disabled={!allChecksComplete}
                title={allChecksComplete ? 'Aprovar geometria e prosseguir' : 'Complete todas as verificações'}
              >
                <span className="btn-icon">✅</span>
                <span className="btn-text">Aprovar Geometria</span>
              </button>
              
              <button className="secondary-button">
                <span className="btn-icon">💾</span>
                <span className="btn-text">Salvar Rascunho</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
