/**
 * Suporte a KML (Keyhole Markup Language) para OpenLayers.
 * KML é usado no Google Earth e em muitas ferramentas de topografia/GIS.
 * SIRGAS 2000 / WGS84 (EPSG:4326) para interoperabilidade.
 */
import KML from 'ol/format/KML';
import type Feature from 'ol/Feature';
import type Geometry from 'ol/geom/Geometry';
import { transform } from 'ol/proj';

const EPSG4326 = 'EPSG:4326';
const EPSG3857 = 'EPSG:3857';

const kmlFormat = new KML({
  extractStyles: false,
  showPointNames: false,
});

/**
 * Lê uma string KML e retorna features no sistema do mapa (EPSG:3857).
 */
export function readKML(kmlString: string): Feature<Geometry>[] {
  const features = kmlFormat.readFeatures(kmlString, {
    dataProjection: EPSG4326,
    featureProjection: EPSG3857,
  });
  return features as Feature<Geometry>[];
}

/**
 * Escreve features (em EPSG:3857) como string KML (WGS84).
 */
export function writeKML(features: Feature<Geometry>[]): string {
  if (features.length === 0) return '';
  return kmlFormat.writeFeatures(features, {
    dataProjection: EPSG4326,
    featureProjection: EPSG3857,
  });
}

/**
 * Extrai o primeiro polígono de um KML como WKT (SRID 4326 / SIRGAS 2000).
 * Útil para enviar ao backend PostGIS.
 */
export function kmlFirstPolygonToWKT(kmlString: string): string | null {
  const features = readKML(kmlString);
  for (const f of features) {
    const geom = f.getGeometry();
    if (!geom) continue;
    const type = geom.getType();
    if (type === 'Polygon') {
      return polygonToWKT(geom);
    }
    if (type === 'MultiPolygon') {
      const coords = (geom as import('ol/geom/MultiPolygon').default).getCoordinates();
      if (coords.length > 0 && coords[0].length > 0) {
        return multiPolygonFirstToWKT(coords);
      }
    }
  }
  return null;
}

function polygonToWKT(geom: Geometry): string {
  const coords = (geom as import('ol/geom/Polygon').default).getCoordinates()[0];
  const lonLat = coords.map((c: number[]) => transform(c, EPSG3857, EPSG4326));
  const pair = (lonLat as number[][]).map(([lon, lat]) => `${lon} ${lat}`).join(', ');
  return `POLYGON((${pair}))`;
}

function multiPolygonFirstToWKT(rings: number[][][][]): string {
  const firstRing = rings[0][0];
  const lonLat = firstRing.map((c: number[]) => transform(c, EPSG3857, EPSG4326));
  const pair = (lonLat as number[][]).map(([lon, lat]) => `${lon} ${lat}`).join(', ');
  return `POLYGON((${pair}))`;
}

/**
 * Dispara download de um arquivo .kml com o conteúdo informado.
 */
export function downloadKML(content: string, filename = 'lote.kml'): void {
  const blob = new Blob([content], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.kml') ? filename : `${filename}.kml`;
  a.click();
  URL.revokeObjectURL(url);
}
