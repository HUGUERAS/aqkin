/**
 * ViewMapEsri: Visualização de geometrias usando ArcGIS Maps SDK for JavaScript.
 * Substitui OpenLayers com Vector Tiles e renderização nativa da Esri.
 */
import { useEffect, useRef } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import esriConfig from '@arcgis/core/config';
import '@arcgis/core/assets/esri/themes/light/main.css';

interface ViewMapEsriProps {
  geometries?: Array<{
    id: string;
    wkt?: string;
    geojson?: { type: string; coordinates: number[][][] };
    type: 'rascunho' | 'oficial' | 'sobreposicao';
    label?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  basemap?: 'streets-vector' | 'topo-vector' | 'satellite' | 'hybrid';
}

export default function ViewMapEsri({
  geometries = [],
  center = [-47.9292, -15.7801],
  zoom = 13,
  basemap = 'topo-vector',
}: ViewMapEsriProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = import.meta.env.VITE_ESRI_API_KEY;
    if (apiKey) esriConfig.apiKey = apiKey;

    const graphicsLayer = new GraphicsLayer({ title: 'Lotes' });

    const map = new Map({
      basemap: basemap,
      layers: [graphicsLayer],
    });

    const view = new MapView({
      container: mapRef.current,
      map: map,
      center: center,
      zoom: zoom,
    });

    viewRef.current = view;

    // Adicionar geometrias (GeoJSON ou WKT)
    geometries.forEach((geom) => {
      const polygon = geom.geojson ? geojsonToPolygon(geom.geojson) : wktToPolygon(geom.wkt);
      if (!polygon) return;

      const symbol = getSymbolForType(geom.type);
      const graphic = new Graphic({
        geometry: polygon,
        symbol: symbol,
        attributes: { id: geom.id, label: geom.label },
      });

      graphicsLayer.add(graphic);
    });

    // Ajustar view para mostrar todas geometrias
    if (geometries.length > 0) {
      view.when(() => {
        const extent = graphicsLayer.fullExtent;
        if (extent) view.goTo(extent.expand(1.2));
      });
    }

    return () => {
      view.destroy();
    };
  }, [geometries, center, zoom, basemap]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />

      {/* Legenda */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.95)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Legenda:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '20px', height: '12px', background: 'rgba(255, 193, 7, 0.3)', border: '2px dashed #ffc107' }} />
          <span>Rascunho Cliente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '20px', height: '12px', background: 'rgba(76, 175, 80, 0.3)', border: '2px solid #4caf50' }} />
          <span>Geometria Oficial</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '12px', background: 'rgba(244, 67, 54, 0.5)', border: '2px solid #f44336' }} />
          <span>Sobreposição</span>
        </div>
      </div>
    </div>
  );
}

function getSymbolForType(type: 'rascunho' | 'oficial' | 'sobreposicao'): SimpleFillSymbol {
  const styles = {
    rascunho: {
      color: [255, 193, 7, 0.3],
      outline: { color: [255, 193, 7], width: 2, style: 'dash' },
    },
    oficial: {
      color: [76, 175, 80, 0.3],
      outline: { color: [76, 175, 80], width: 3, style: 'solid' },
    },
    sobreposicao: {
      color: [244, 67, 54, 0.5],
      outline: { color: [244, 67, 54], width: 3, style: 'solid' },
    },
  };
  const s = styles[type];
  return new SimpleFillSymbol({
    color: s.color as any,
    outline: new SimpleLineSymbol({
      color: s.outline.color as any,
      width: s.outline.width,
      style: s.outline.style as any,
    }),
  });
}

/**
 * Converte GeoJSON Polygon para Esri Polygon (EPSG:4326).
 */
function geojsonToPolygon(geojson: { type: string; coordinates: number[][][] }): Polygon | null {
  try {
    if (geojson.type !== 'Polygon' || !geojson.coordinates?.[0]) return null;
    const ring = geojson.coordinates[0];
    return new Polygon({
      rings: [ring],
      spatialReference: { wkid: 4326 },
    });
  } catch (error) {
    console.error('Erro ao converter GeoJSON para Polygon Esri:', error);
    return null;
  }
}

/**
 * Converte WKT POLYGON para Esri Polygon (EPSG:4326).
 */
function wktToPolygon(wkt?: string): Polygon | null {
  if (!wkt) return null;
  try {
    const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
    if (!match) return null;
    const coordsStr = match[1];
    const coords = coordsStr.split(',').map((pair) => {
      const [lon, lat] = pair.trim().split(' ').map(Number);
      return [lon, lat];
    });
    return new Polygon({
      rings: [coords],
      spatialReference: { wkid: 4326 },
    });
  } catch (error) {
    console.error('Erro ao converter WKT para Polygon Esri:', error);
    return null;
  }
}
