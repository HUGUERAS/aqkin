import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import { getBasemapLayer, BASEMAP_OPTIONS, type BasemapId } from '../../lib/basemaps';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { Style, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import type { Feature } from 'ol/Feature';
import type { Geometry } from 'ol/geom';
import { readKML, writeKML, kmlFirstPolygonToWKT, downloadKML } from '../../lib/kml';
import 'ol/ol.css';

interface DrawMapProps {
  onGeometryChange?: (wkt: string) => void;
  initialCenter?: [number, number]; // [lon, lat]
  initialZoom?: number;
  /** Basemap: OSM (padrão) ou Esri (street, topo, satellite) */
  basemap?: BasemapId;
}

export default function DrawMap({
  onGeometryChange,
  initialCenter = [-47.9292, -15.7801], // Brasília como padrão
  initialZoom = 15,
  basemap = 'osm',
}: DrawMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapId>(basemap);

  useEffect(() => {
    if (!mapRef.current) return;

    const basemapLayer = getBasemapLayer(currentBasemap);

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
        basemapLayer,
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
  }, [initialCenter, initialZoom, onGeometryChange, currentBasemap]);

  const handleClear = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      if (onGeometryChange) {
        onGeometryChange('');
      }
    }
  };

  const handleImportKML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vectorSourceRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        const features = readKML(text) as Feature<Geometry>[];
        if (features.length === 0) {
          alert('Nenhum polígono encontrado no arquivo KML.');
          return;
        }
        vectorSourceRef.current!.clear();
        features.forEach((f) => vectorSourceRef.current!.addFeature(f));
        const wkt = kmlFirstPolygonToWKT(text);
        if (wkt && onGeometryChange) onGeometryChange(wkt);
      } catch (err) {
        console.error(err);
        alert('Erro ao ler o arquivo KML. Verifique o formato.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleExportKML = () => {
    if (!vectorSourceRef.current) return;
    const features = vectorSourceRef.current.getFeatures() as Feature<Geometry>[];
    if (features.length === 0) {
      alert('Desenhe um polígono antes de exportar.');
      return;
    }
    const kml = writeKML(features);
    if (kml) downloadKML(kml, 'lote.kml');
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

      {/* Seletor de basemap */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1,
      }}>
        <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Mapa base:</label>
        <select
          value={currentBasemap}
          onChange={(e) => setCurrentBasemap(e.target.value as BasemapId)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
        >
          {BASEMAP_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".kml,.xml"
        style={{ display: 'none' }}
        onChange={handleImportKML}
      />

      {/* Controles */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1,
      }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <span role="img" aria-label="Importar KML">📂</span> Importar KML
        </button>
        <button
          type="button"
          onClick={handleExportKML}
          style={{
            padding: '8px 16px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <span role="img" aria-label="Exportar KML">📥</span> Exportar KML
        </button>
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
          <span role="img" aria-label="Limpar desenho">🗑️</span> Limpar
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
