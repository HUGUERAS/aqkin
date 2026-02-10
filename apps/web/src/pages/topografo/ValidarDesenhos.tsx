import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayerControl, { Layer } from '../../components/LayerControl';
import DrawMapValidation from '../../components/maps/DrawMapValidation';
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
  const navigate = useNavigate();
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
  const [activeTool, setActiveTool] = useState<ToolId | 'snap' | 'edit' | 'draw-line' | 'draw-polyline' | 'measure' | 'area' | null>(null);
  const [measurements, setMeasurements] = useState<Partial<Record<'distance' | 'area' | 'angle' | 'azimuth' | 'perimeter', number>>>({});

  // Sidebar responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [activeSection, setActiveSection] = useState<'draw' | 'tools' | 'layers' | 'validation' | 'measurements'>('draw');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 768;
      setIsDesktop(desktop);
      if (desktop) {
        setSidebarOpen(false); // Desktop sempre mostra sidebar
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: isDesktop ? 'row' : 'column-reverse',
      overflow: 'hidden',
    }}>
      {/* Fullscreen Map */}
      <div style={{ flex: 1, position: 'relative' }}>
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
            document.title = `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`;
          }}
          initialCenter={[-47.9292, -15.7801]}
          initialZoom={17}
          basemap="streets-vector"
        />
      </div>

      {/* Responsive Sidebar / Drawer */}
      <div style={{
        width: isDesktop ? '400px' : '100%',
        height: isDesktop ? '100%' : (sidebarOpen ? '70vh' : '0'),
        background: 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(12px)',
        borderLeft: isDesktop ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
        borderTop: !isDesktop ? '1px solid rgba(148, 163, 184, 0.2)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'height 0.3s ease',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Mobile Header */}
        {!isDesktop && sidebarOpen && (
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#e5e7eb', margin: 0 }}>Ferramentas CAD</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
              aria-label="Fechar sidebar"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sidebar Content (Scrollable) */}
        {(isDesktop || sidebarOpen) && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1rem',
          }}>
            {/* Back Button */}
            <button
              onClick={() => navigate('/topografo/dashboard')}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '0.5rem',
                color: '#94a3b8',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)';
                e.currentTarget.style.color = '#bfdbfe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <span>←</span>
              <span>Voltar ao Dashboard</span>
            </button>

            {/* Section Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { key: 'draw' as const, icon: '✏️', label: 'Desenho' },
                { key: 'tools' as const, icon: '🛠️', label: 'Ferramentas' },
                { key: 'layers' as const, icon: '📁', label: 'Layers' },
                { key: 'validation' as const, icon: '✅', label: 'Validação' },
                { key: 'measurements' as const, icon: '📏', label: 'Medições' },
              ].map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: activeSection === section.key ? 'rgba(147, 197, 253, 0.25)' : 'transparent',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                    color: activeSection === section.key ? '#bfdbfe' : '#94a3b8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  aria-label={section.label}
                >
                  <span role="img" aria-label={section.label}>{section.icon}</span>
                  <span style={{ fontSize: '0.75rem' }}>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Desenho Section */}
            {activeSection === 'draw' && (
              <div>
                <h3 style={{ fontSize: '1rem', color: '#e5e7eb', marginBottom: '1.5rem' }}>Ferramentas de Desenho</h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}>
                  {[
                    { key: 'draw-line' as const, icon: '📏', label: 'Linha' },
                    { key: 'draw-polyline' as const, icon: '↗️', label: 'Polilinha' },
                  ].map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => setActiveTool(activeTool === tool.key ? null : tool.key)}
                      style={{
                        padding: '1.5rem 1rem',
                        background: activeTool === tool.key
                          ? 'rgba(147, 197, 253, 0.25)'
                          : 'rgba(148, 163, 184, 0.05)',
                        border: '2px solid ' + (activeTool === tool.key ? 'rgba(147, 197, 253, 0.5)' : 'rgba(148, 163, 184, 0.2)'),
                        borderRadius: '0.75rem',
                        color: activeTool === tool.key ? '#bfdbfe' : '#e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontWeight: '600',
                      }}
                      aria-label={tool.label}
                    >
                      <span role="img" aria-label={tool.label} style={{ fontSize: '2rem' }}>{tool.icon}</span>
                      <span style={{ fontSize: '1rem' }}>{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ferramentas Section */}
            {activeSection === 'tools' && (
              <div>
                <h3 style={{ fontSize: '1rem', color: '#e5e7eb', marginBottom: '1rem' }}>Ferramentas CAD</h3>
                
                {/* Quick Draw Tools */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}>
                  {[
                    { key: 'draw-line' as const, icon: '📏', label: 'Linha' },
                    { key: 'draw-polyline' as const, icon: '↗️', label: 'Polilinha' },
                  ].map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => setActiveTool(activeTool === tool.key ? null : tool.key)}
                      style={{
                        padding: '0.75rem',
                        background: activeTool === tool.key
                          ? 'rgba(147, 197, 253, 0.25)'
                          : 'rgba(148, 163, 184, 0.05)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        color: activeTool === tool.key ? '#bfdbfe' : '#e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                      }}
                      aria-label={tool.label}
                    >
                      <span role="img" aria-label={tool.label} style={{ fontSize: '1.25rem' }}>{tool.icon}</span>
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>

                <h3 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase' }}>Ferramentas Avançadas</h3>
                
                {/* Tool Categories */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  {[
                    { key: 'drawing' as const, icon: '✏️', label: 'Desenho' },
                    { key: 'analysis' as const, icon: '🔍', label: 'Análise' },
                    { key: 'measurement' as const, icon: '📏', label: 'Medição' },
                    { key: 'topology' as const, icon: '🔗', label: 'Topologia' },
                    { key: 'annotation' as const, icon: '📝', label: 'Anotação' },
                    { key: 'selection' as const, icon: '🎯', label: 'Seleção' },
                    { key: 'import-export' as const, icon: '📤', label: 'Import/Export' },
                    { key: 'coordinates' as const, icon: '📍', label: 'Coordenadas' },
                    { key: 'sigef' as const, icon: '🗺️', label: 'SIGEF' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        background: activeCategory === cat.key
                          ? 'rgba(147, 197, 253, 0.25)'
                          : 'transparent',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        color: activeCategory === cat.key ? '#bfdbfe' : '#94a3b8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      aria-label={cat.label}
                    >
                      <span role="img" aria-label={cat.label}>{cat.icon}</span>
                      <span style={{ fontSize: '0.625rem' }}>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Active Category Tools */}
                <div style={{
                  background: 'rgba(148, 163, 184, 0.05)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                }}>
                  {renderCategoryTools()}
                </div>
              </div>
            )}

            {/* Layers Section */}
            {activeSection === 'layers' && (
              <div>
                <h3 style={{ fontSize: '1rem', color: '#e5e7eb', marginBottom: '1rem' }}>Controle de Camadas</h3>
                <LayerControl layers={layerControlDefs} onLayerChange={handleLayerChange} />
              </div>
            )}

            {/* Validation Section */}
            {activeSection === 'validation' && (
              <div>
                <h3 style={{ fontSize: '1rem', color: '#e5e7eb', marginBottom: '1rem' }}>Checklist de Validação</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { key: 'geometria' as const, label: 'Geometria válida (sem auto-interseções)' },
                    { key: 'snap' as const, label: 'Snap aplicado nos vértices' },
                    { key: 'sobreposicoes' as const, label: 'Sem sobreposições com vizinhos', warning: true },
                    { key: 'area' as const, label: 'Área calculada corretamente' },
                    { key: 'crs' as const, label: 'CRS SIRGAS 2000 (EPSG:4674)' },
                    { key: 'confrontantes' as const, label: 'Confrontantes identificados', warning: true },
                  ].map((item) => (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: validationChecks[item.key]
                          ? 'rgba(134, 239, 172, 0.15)'
                          : (item.warning ? 'rgba(253, 186, 116, 0.1)' : 'transparent'),
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={validationChecks[item.key]}
                        onChange={() => toggleValidationCheck(item.key)}
                        style={{ marginTop: '0.125rem', cursor: 'pointer' }}
                      />
                      <span style={{
                        flex: 1,
                        color: validationChecks[item.key] ? '#bbf7d0' : '#e5e7eb',
                        fontSize: '0.875rem',
                        textDecoration: validationChecks[item.key] ? 'line-through' : 'none',
                      }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Validation Status */}
                <div style={{
                  padding: '1rem',
                  background: allChecksComplete
                    ? 'rgba(134, 239, 172, 0.25)'
                    : 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {allChecksComplete ? '✅' : '⏳'}
                  </div>
                  <p style={{
                    color: allChecksComplete ? '#bbf7d0' : '#94a3b8',
                    fontSize: '0.875rem',
                    margin: 0,
                  }}>
                    {allChecksComplete ? 'Tudo validado!' : `${Object.values(validationChecks).filter((v) => v).length}/${Object.keys(validationChecks).length} concluído`}
                  </p>
                </div>

                {/* Approve Button */}
                <button
                  disabled={!allChecksComplete}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: allChecksComplete
                      ? 'linear-gradient(135deg, rgba(134, 239, 172, 0.4) 0%, rgba(134, 239, 172, 0.2) 100%)'
                      : 'rgba(71, 85, 105, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                    color: allChecksComplete ? '#bbf7d0' : '#64748b',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: allChecksComplete ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                  title={allChecksComplete ? 'Aprovar geometria' : 'Complete todos os itens da validação'}
                >
                  Aprovar Geometria
                </button>
              </div>
            )}

            {/* Measurements Section */}
            {activeSection === 'measurements' && (
              <div>
                <h3 style={{ fontSize: '1rem', color: '#e5e7eb', marginBottom: '1rem' }}>Medições Ativas</h3>
                
                {(measurements.distance || measurements.area || measurements.angle || measurements.azimuth || measurements.perimeter) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {measurements.distance && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(147, 197, 253, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Distância</div>
                        <div style={{ color: '#bfdbfe', fontSize: '1.25rem', fontWeight: '600' }}>
                          {measurements.distance >= 1000
                            ? `${(measurements.distance / 1000).toFixed(2)} km`
                            : `${measurements.distance.toFixed(2)} m`}
                        </div>
                      </div>
                    )}
                    
                    {measurements.area && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(134, 239, 172, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Área</div>
                        <div style={{ color: '#bbf7d0', fontSize: '1.25rem', fontWeight: '600' }}>
                          {(measurements.area / 10000).toFixed(2)} ha
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          ({measurements.area.toFixed(0)} m²)
                        </div>
                      </div>
                    )}
                    
                    {measurements.angle && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(253, 186, 116, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Ângulo</div>
                        <div style={{ color: '#fed7aa', fontSize: '1.25rem', fontWeight: '600' }}>
                          {measurements.angle.toFixed(2)}°
                        </div>
                      </div>
                    )}
                    
                    {measurements.azimuth && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(253, 186, 116, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Azimute</div>
                        <div style={{ color: '#fed7aa', fontSize: '1.25rem', fontWeight: '600' }}>
                          {measurements.azimuth.toFixed(2)}°
                        </div>
                      </div>
                    )}
                    
                    {measurements.perimeter && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(147, 197, 253, 0.15)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Perímetro</div>
                        <div style={{ color: '#bfdbfe', fontSize: '1.25rem', fontWeight: '600' }}>
                          {measurements.perimeter.toFixed(2)} m
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📏</div>
                    <p>Nenhuma medição ativa.</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      Use as ferramentas de medição para ver os resultados aqui.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB Hamburger (Mobile Only) */}
      {!isDesktop && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.4) 0%, rgba(147, 197, 253, 0.2) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#bfdbfe',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s',
            zIndex: 20,
          }}
          aria-label={sidebarOpen ? 'Fechar ferramentas' : 'Abrir ferramentas'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}
    </div>
  );
}
