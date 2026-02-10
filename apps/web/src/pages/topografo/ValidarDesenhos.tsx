import { useState, useMemo } from 'react';
import LayerControl, { Layer } from '../../components/LayerControl';
import DrawMapValidation from '../../components/maps/DrawMapValidation';
import { BreadcrumbNav } from '../../components/Navigation';
import ToolbarTabs from '../../components/tools/ToolbarTabs';
import type { ToolCategory, ToolId } from '../../components/tools/ToolbarTabs';
import {
  DrawingTools,
  AnalysisTools,
  MeasurementTools,
  TopologyTools,
  AnnotationTools,
  SelectionTools,
  ImportExportTools,
  CoordinateTools,
  SIGEFTools,
} from '../../components/tools/categories';
import useToolShortcuts from '../../hooks/useToolShortcuts';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import './ValidarDesenhos.css';

interface LayerState {
  [layerId: string]: {
    visible: boolean;
    opacity: number;
  };
}

// Dados de exemplo para as layers (em coordenadas Brasilia)
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

  const [validationChecks, setValidationChecks] = useState({
    geometria: true,
    snap: true,
    sobreposicoes: false,
    area: true,
    crs: true,
    confrontantes: false,
  });

  // Tool system state
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('drawing');
  const [activeTool, setActiveTool] = useState<ToolId | 'snap' | 'edit' | 'measure' | 'area' | null>(null);
  const [measurements, setMeasurements] = useState<Partial<Record<'distance' | 'area' | 'angle' | 'azimuth' | 'perimeter', number>>>({});

  // Keyboard shortcuts
  useToolShortcuts({
    activeCategory,
    activeTool,
    onCategoryChange: setActiveCategory,
    onToolActivate: (tool) => setActiveTool(tool),
  });

  // Layers for map
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
      color: '#CD7F32',
      visible: layerStates.oficial.visible,
      opacity: layerStates.oficial.opacity,
      graphics: examplePolygons.oficial,
    },
    {
      id: 'sobreposi',
      label: 'Sobreposicoes',
      color: '#E53935',
      visible: layerStates.sobreposi.visible,
      opacity: layerStates.sobreposi.opacity,
      graphics: examplePolygons.sobreposi,
    },
    {
      id: 'limites',
      label: 'Limites Compartilhados',
      color: '#5FB063',
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

  const layerControlDefs: Layer[] = layers.map(layer => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    initialVisible: layer.visible,
    initialOpacity: layer.opacity,
    description: 'Visualizar no mapa',
  }));

  // Render category tools based on active category
  const renderCategoryTools = () => {
    const props = {
      activeTool: activeTool as ToolId | null,
      onToolActivate: (tool: ToolId | null) => setActiveTool(tool),
    };

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
        <h1>Validar Desenhos</h1>
        <p>Revise e aprove a geometria da propriedade antes de gerar o contrato</p>
      </div>

      {/* Toolbar Tabs */}
      <ToolbarTabs
        activeCategory={activeCategory}
        activeTool={activeTool as ToolId | null}
        onCategoryChange={setActiveCategory}
        onToolActivate={(tool) => setActiveTool(tool)}
      >
        {renderCategoryTools()}
      </ToolbarTabs>

      {/* Layout: LayerControl + Map + Validation */}
      <div className="validar-layout">
        {/* 1. Layer Control Panel (Left Sidebar) */}
        <aside className="layer-panel">
          <LayerControl layers={layerControlDefs} onLayerChange={handleLayerChange} />
        </aside>

        {/* 2. Map + Tools (Center) */}
        <main className="map-section">
          {/* Map Container */}
          <div className="map-container">
            <DrawMapValidation
              layers={layers}
              activeTool={activeTool}
              onMeasurement={(distance) => setMeasurements((prev) => ({ ...prev, distance }))}
              onAreaCalculated={(area) => setMeasurements((prev) => ({ ...prev, area }))}
              onAngleMeasured={(angle) => setMeasurements((prev) => ({ ...prev, angle }))}
              onAzimuthCalculated={(azimuth) => setMeasurements((prev) => ({ ...prev, azimuth }))}
              onPerimeterCalculated={(perimeter) => setMeasurements((prev) => ({ ...prev, perimeter }))}
              onPolygonSplit={(polygons) => console.log('Poligonos divididos:', polygons)}
              onPolygonsMerged={(polygon) => console.log('Poligonos unidos:', polygon)}
              onBufferCreated={(buffer) => console.log('Buffer criado:', buffer)}
              onIntersectionFound={(geom) => console.log('Interseccao:', geom)}
              onGeometriesUnited={(polygon) => console.log('Uniao:', polygon)}
              onDifferenceCalculated={(geom) => console.log('Diferenca:', geom)}
              onSymmetricDiff={(geom) => console.log('Diferenca simetrica:', geom)}
              onConvexHullCreated={(polygon) => console.log('Envoltoria convexa:', polygon)}
              onCentroidCalculated={(point) => console.log('Centroide:', point)}
              onTopologyValidated={(result) => console.log('Topologia:', result)}
              onGeometrySimplified={(geom) => console.log('Simplificado:', geom)}
              onGeometryDensified={(geom) => console.log('Densificado:', geom)}
              onFeaturesSelected={(features) => console.log('Selecionados:', features.length)}
              onGeoJSONExported={(geojson) => console.log('GeoJSON exportado:', geojson.length, 'chars')}
              onCoordsConverted={(result) => console.log('Coordenadas:', result)}
              onPointAdded={(point) => console.log('Ponto adicionado:', point)}
              onCoordsDisplayed={(coords) => {
                // Update coords display without flooding state
                document.title = `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`;
              }}
              initialCenter={[-47.9292, -15.7801]}
              initialZoom={17}
              basemap="streets-vector"
            />
          </div>

          {/* Measurement Results */}
          {(measurements.distance || measurements.area || measurements.angle || measurements.azimuth || measurements.perimeter) && (
            <div className="measurement-results">
              {measurements.distance && (
                <div className="measurement-item">
                  <span className="measurement-label">Distancia Medida:</span>
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
                  <span className="measurement-label">Area Calculada:</span>
                  <span className="measurement-value">
                    {(measurements.area / 10000).toFixed(2)} hectares ({measurements.area.toFixed(0)} m2)
                  </span>
                </div>
              )}
              {measurements.angle && (
                <div className="measurement-item">
                  <span className="measurement-label">Angulo:</span>
                  <span className="measurement-value">{measurements.angle.toFixed(2)}deg</span>
                </div>
              )}
              {measurements.azimuth && (
                <div className="measurement-item">
                  <span className="measurement-label">Azimute:</span>
                  <span className="measurement-value">{measurements.azimuth.toFixed(2)}deg</span>
                </div>
              )}
              {measurements.perimeter && (
                <div className="measurement-item">
                  <span className="measurement-label">Perimetro:</span>
                  <span className="measurement-value">{measurements.perimeter.toFixed(2)} m</span>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 3. Validation Panel (Right Sidebar) */}
        <aside className="validation-panel">
          <h3>Checklist de Validacao</h3>

          <div className="checklist">
            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.geometria}
                onChange={() => toggleValidationCheck('geometria')}
              />
              <span className={validationChecks.geometria ? 'completed' : ''}>
                Geometria valida (sem auto-interseccoes)
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.snap}
                onChange={() => toggleValidationCheck('snap')}
              />
              <span className={validationChecks.snap ? 'completed' : ''}>
                Snap aplicado nos vertices
              </span>
            </label>

            <label className="check-item warning">
              <input
                type="checkbox"
                checked={validationChecks.sobreposicoes}
                onChange={() => toggleValidationCheck('sobreposicoes')}
              />
              <span className={validationChecks.sobreposicoes ? 'completed' : ''}>
                Sem sobreposicoes com vizinhos
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.area}
                onChange={() => toggleValidationCheck('area')}
              />
              <span className={validationChecks.area ? 'completed' : ''}>
                Area calculada corretamente
              </span>
            </label>

            <label className="check-item">
              <input
                type="checkbox"
                checked={validationChecks.crs}
                onChange={() => toggleValidationCheck('crs')}
              />
              <span className={validationChecks.crs ? 'completed' : ''}>
                CRS SIRGAS 2000 (EPSG:4674)
              </span>
            </label>

            <label className="check-item warning">
              <input
                type="checkbox"
                checked={validationChecks.confrontantes}
                onChange={() => toggleValidationCheck('confrontantes')}
              />
              <span className={validationChecks.confrontantes ? 'completed' : ''}>
                Confrontantes identificados
              </span>
            </label>
          </div>

          {/* Status */}
          <div className={`validation-status ${allChecksComplete ? 'complete' : 'incomplete'}`}>
            {allChecksComplete ? (
              <>
                <p className="status-icon">OK</p>
                <p className="status-text">Tudo validado!</p>
              </>
            ) : (
              <>
                <p className="status-icon">...</p>
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
            title={allChecksComplete ? 'Aprovar geometria' : 'Complete todos os itens da validacao'}
          >
            Aprovar Geometria
          </button>
        </aside>
      </div>
    </div>
  );
}
