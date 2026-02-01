import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Polygon, Point } from 'ol/geom';
import 'ol/ol.css';

interface ViewMapProps {
  geometries?: Array<{
    id: string;
    wkt: string;
    type: 'rascunho' | 'oficial' | 'sobreposicao';
    label?: string;
  }>;
  center?: [number, number];
  zoom?: number;
}

export default function ViewMap({
  geometries = [],
  center = [-47.9292, -15.7801],
  zoom = 13
}: ViewMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Layers para diferentes tipos
    const rascunhoSource = new VectorSource();
    const oficialSource = new VectorSource();
    const sobreposicaoSource = new VectorSource();

    // Layer rascunhos (desenhos clientes)
    const rascunhoLayer = new VectorLayer({
      source: rascunhoSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 193, 7, 0.3)'
        }),
        stroke: new Stroke({
          color: '#ffc107',
          width: 2,
          lineDash: [5, 5]
        })
      })
    });

    // Layer oficial (validado pelo topógrafo)
    const oficialLayer = new VectorLayer({
      source: oficialSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(76, 175, 80, 0.3)'
        }),
        stroke: new Stroke({
          color: '#4caf50',
          width: 3
        })
      })
    });

    // Layer sobreposições (problemas)
    const sobreposicaoLayer = new VectorLayer({
      source: sobreposicaoSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(244, 67, 54, 0.5)'
        }),
        stroke: new Stroke({
          color: '#f44336',
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
        rascunhoLayer,
        sobreposicaoLayer,
        oficialLayer
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom
      })
    });

    mapInstanceRef.current = map;

    // Adicionar geometrias
    geometries.forEach(geom => {
      const feature = wktToFeature(geom.wkt);

      if (feature) {
        if (geom.type === 'rascunho') {
          rascunhoSource.addFeature(feature);
        } else if (geom.type === 'oficial') {
          oficialSource.addFeature(feature);
        } else if (geom.type === 'sobreposicao') {
          sobreposicaoSource.addFeature(feature);
        }
      }
    });

    // Ajustar view para mostrar todas geometrias
    if (geometries.length > 0) {
      const extent = oficialSource.getExtent();
      if (extent && extent[0] !== Infinity) {
        map.getView().fit(extent, { padding: [50, 50, 50, 50] });
      }
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [geometries, center, zoom]);

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

      {/* Legenda */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
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

// Helper: Converter WKT para Feature OpenLayers
function wktToFeature(wkt: string): Feature | null {
  try {
    // Parse simples de WKT POLYGON
    const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
    if (!match) return null;

    const coordsStr = match[1];
    const coords = coordsStr.split(',').map(pair => {
      const [lon, lat] = pair.trim().split(' ').map(Number);
      return fromLonLat([lon, lat]);
    });

    const polygon = new Polygon([coords]);
    return new Feature({ geometry: polygon });
  } catch (error) {
    console.error('Erro ao converter WKT:', error);
    return null;
  }
}
