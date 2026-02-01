import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

interface DrawMapProps {
  onGeometryChange?: (wkt: string) => void;
  initialCenter?: [number, number]; // [lon, lat]
  initialZoom?: number;
}

export default function DrawMap({
  onGeometryChange,
  initialCenter = [-47.9292, -15.7801], // Brasília como padrão
  initialZoom = 15
}: DrawMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Vector source para desenhos do usuário
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(102, 126, 234, 0.3)'
        }),
        stroke: new Stroke({
          color: '#667eea',
          width: 3
        })
      })
    });

    // Criar mapa
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat(initialCenter),
        zoom: initialZoom
      })
    });

    mapInstanceRef.current = map;

    // Interação Draw (desenhar polígono)
    const draw = new Draw({
      source: vectorSource,
      type: 'Polygon'
    });

    // Interação Modify (editar)
    const modify = new Modify({
      source: vectorSource
    });

    // Interação Snap (snap magnético - 0.5m tolerância)
    const snap = new Snap({
      source: vectorSource
    });

    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(snap);

    // Listener para quando desenho é completado
    draw.on('drawend', (event) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();

      if (geometry && onGeometryChange) {
        // Converter para WKT (Well-Known Text)
        const wkt = geometryToWKT(geometry);
        onGeometryChange(wkt);
      }
    });

    // Cleanup
    return () => {
      map.setTarget(undefined);
    };
  }, [initialCenter, initialZoom, onGeometryChange]);

  const handleClear = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      if (onGeometryChange) {
        onGeometryChange('');
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />

      {/* Controles */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Instruções */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <strong>📍 Como usar:</strong> Clique para adicionar pontos • Clique no primeiro ponto para fechar o polígono
      </div>
    </div>
  );
}

// Helper: Converter geometria OpenLayers para WKT
function geometryToWKT(geometry: any): string {
  const type = geometry.getType();

  if (type === 'Polygon') {
    const coordinates = geometry.getCoordinates()[0]; // Anel exterior
    const coords = coordinates.map((coord: number[]) => {
      // Converter de Web Mercator para longlat
      const [lon, lat] = coord;
      return `${lon} ${lat}`;
    }).join(', ');

    return `POLYGON((${coords}))`;
  }

  return '';
}
