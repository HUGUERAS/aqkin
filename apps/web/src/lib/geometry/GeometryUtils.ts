/**
 * GeometryUtils: Funções utilitárias gerais de geometria
 * Helpers para encontrar geometrias selecionadas, renderizar resultados, etc.
 */

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';

/**
 * Find selected polygon in view
 * Looks through all graphics layers and returns first visible polygon
 */
export function findSelectedPolygon(view: __esri.MapView): __esri.Polygon | null {
  if (!view.map) return null;

  let foundPolygon: __esri.Polygon | null = null;

  view.map.allLayers.forEach((layer) => {
    if (layer instanceof GraphicsLayer && layer.visible && !isTemporaryLayer(layer.id)) {
      layer.graphics.forEach((graphic) => {
        if (!foundPolygon && graphic.geometry?.type === 'polygon') {
          foundPolygon = graphic.geometry as __esri.Polygon;
        }
      });
    }
  });

  return foundPolygon;
}

/**
 * Find selected geometry of any type
 */
export function findSelectedGeometry(view: __esri.MapView): __esri.Geometry | null {
  if (!view.map) return null;

  let foundGeometry: __esri.Geometry | null = null;

  view.map.allLayers.forEach((layer) => {
    if (layer instanceof GraphicsLayer && layer.visible && !isTemporaryLayer(layer.id)) {
      layer.graphics.forEach((graphic) => {
        if (!foundGeometry && graphic.geometry) {
          foundGeometry = graphic.geometry;
        }
      });
    }
  });

  return foundGeometry;
}

/**
 * Find all polygons in view
 */
export function findAllPolygons(view: __esri.MapView): __esri.Polygon[] {
  const polygons: __esri.Polygon[] = [];

  if (!view.map) return polygons;

  view.map.allLayers.forEach((layer) => {
    if (layer instanceof GraphicsLayer && layer.visible && !isTemporaryLayer(layer.id)) {
      layer.graphics.forEach((graphic) => {
        if (graphic.geometry?.type === 'polygon') {
          polygons.push(graphic.geometry as __esri.Polygon);
        }
      });
    }
  });

  return polygons;
}

/** Temporary layer IDs used by tools */
const TEMP_LAYER_IDS = [
  'split-layer',
  'merge-layer',
  'buffer-layer',
  'offset-layer',
  'intersection-layer',
  'union-layer',
  'difference-layer',
  'symmetric-diff-layer',
  'convex-hull-layer',
  'centroid-layer',
  'perimeter-layer',
  'measurements-layer',
  'area-layer',
  'edit-layer',
  'angle-layer',
  'azimuth-layer',
  'selection-layer',
  'annotation-layer',
  'coords-layer',
  'grid-layer',
  'tool-layer',
];

function isTemporaryLayer(layerId: string): boolean {
  return TEMP_LAYER_IDS.includes(layerId);
}

/**
 * Render split polygons with different colors
 */
export function renderSplitPolygons(
  layer: __esri.GraphicsLayer,
  poly1: __esri.Polygon,
  poly2: __esri.Polygon
): void {
  layer.removeAll();

  const symbol1 = new SimpleFillSymbol({
    color: [76, 175, 80, 128],
    outline: new SimpleLineSymbol({
      color: [76, 175, 80, 255],
      width: 2,
    }),
  });

  const symbol2 = new SimpleFillSymbol({
    color: [33, 150, 243, 128],
    outline: new SimpleLineSymbol({
      color: [33, 150, 243, 255],
      width: 2,
    }),
  });

  layer.add(new Graphic({ geometry: poly1, symbol: symbol1 }));
  layer.add(new Graphic({ geometry: poly2, symbol: symbol2 }));
}

/**
 * Render buffer result
 */
export function renderBuffer(
  layer: __esri.GraphicsLayer,
  buffer: __esri.Polygon
): void {
  layer.removeAll();

  const symbol = new SimpleFillSymbol({
    color: [255, 152, 0, 102],
    outline: new SimpleLineSymbol({
      color: [255, 152, 0, 255],
      width: 2,
      style: 'dash',
    }),
  });

  layer.add(new Graphic({ geometry: buffer, symbol }));
}

/**
 * Render geometry result (generic)
 */
export function renderGeometryResult(
  layer: __esri.GraphicsLayer,
  geometry: __esri.Geometry,
  color: [number, number, number] = [156, 39, 176]
): void {
  layer.removeAll();

  if (geometry.type === 'polygon') {
    const symbol = new SimpleFillSymbol({
      color: [color[0], color[1], color[2], 128],
      outline: new SimpleLineSymbol({
        color: [color[0], color[1], color[2], 255],
        width: 2,
      }),
    });
    layer.add(new Graphic({ geometry, symbol }));
  } else if (geometry.type === 'polyline') {
    const symbol = new SimpleLineSymbol({
      color: [color[0], color[1], color[2], 255],
      width: 3,
    });
    layer.add(new Graphic({ geometry, symbol }));
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  p1: [number, number],
  p2: [number, number]
): number {
  const [lon1, lat1] = p1;
  const [lon2, lat2] = p2;

  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Clear all temporary tool layers
 */
export function clearTemporaryLayers(view: __esri.MapView): void {
  if (!view.map) return;

  const layersToRemove: __esri.Layer[] = [];

  view.map.allLayers.forEach((layer) => {
    if (TEMP_LAYER_IDS.includes(layer.id)) {
      layersToRemove.push(layer);
    }
  });

  layersToRemove.forEach((layer) => {
    view.map!.remove(layer);
  });
}

/**
 * Create or get a temporary GraphicsLayer for a tool
 */
export function getOrCreateToolLayer(
  view: __esri.MapView,
  layerId: string
): GraphicsLayer {
  if (view.map) {
    const existing = view.map.findLayerById(layerId);
    if (existing && existing instanceof GraphicsLayer) {
      existing.removeAll();
      return existing;
    }
  }

  const layer = new GraphicsLayer({ id: layerId });
  if (view.map) view.map.add(layer);
  return layer;
}
