/**
 * Basemaps para OpenLayers: OSM (grátis) + Esri (qualidade profissional).
 * Esri usa serviços clássicos ArcGIS Online (não exige API key para uso básico).
 */
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import type TileSource from 'ol/source/Tile';

export type BasemapId = 'osm' | 'esri-street' | 'esri-topo' | 'esri-satellite';

const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012';

/** URLs dos tiles Esri (clássicos, sem API key obrigatória) */
const ESRI_TILE_URLS: Record<Exclude<BasemapId, 'osm'>, string> = {
  'esri-street':
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  'esri-topo':
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  'esri-satellite':
    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

/**
 * Esri usa ordem Z/Y/X; OpenLayers tileCoord é [z, x, y].
 */
function esriTileUrl(template: string, z: number, x: number, y: number): string {
  return template
    .replace('{z}', String(z))
    .replace('{y}', String(y))
    .replace('{x}', String(x));
}

function createEsriSource(urlTemplate: string): TileSource {
  return new XYZ({
    attributions: ESRI_ATTRIBUTION,
    tileUrlFunction: (tileCoord) => {
      if (!tileCoord) return '';
      const z = tileCoord[0];
      const x = tileCoord[1];
      const y = tileCoord[2];
      return esriTileUrl(urlTemplate, z, x, y);
    },
  });
}

/**
 * Retorna a layer de basemap (TileLayer) para o id informado.
 * Padrão: OSM. Esri: street, topo ou satellite.
 */
export function getBasemapLayer(basemapId: BasemapId = 'osm'): TileLayer<TileSource> {
  if (basemapId === 'osm') {
    return new TileLayer({ source: new OSM() });
  }

  const urlTemplate = ESRI_TILE_URLS[basemapId];
  return new TileLayer({
    source: createEsriSource(urlTemplate),
  });
}

/** Opções de basemap para seletor na UI */
export const BASEMAP_OPTIONS: { id: BasemapId; label: string }[] = [
  { id: 'osm', label: 'OpenStreetMap' },
  { id: 'esri-street', label: 'Esri Rua' },
  { id: 'esri-topo', label: 'Esri Topográfico' },
  { id: 'esri-satellite', label: 'Esri Satélite' },
];
