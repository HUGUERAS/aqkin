/**
 * DrawMapValidation: Mapa avancado com multiplas layers, ferramentas e validacao
 * Suporta 43 ferramentas CAD/GIS organizadas em 9 categorias
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import ArcGISMap from '@arcgis/core/Map';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import esriConfig from '@arcgis/core/config';
import '@arcgis/core/assets/esri/themes/light/main.css';

import type { ToolId } from '../tools/ToolbarTabs';
import { calculateAngle, calculateAzimuth } from '../../lib/geometry/AngleCalculation';
import { geographicToSIRGASUTM, isValidBrazilCoordinate, toDMS } from '../../lib/geometry/CoordinateConversion';
import { validatePolygonTopology, detectSlivers } from '../../lib/geometry/TopologyValidation';
import {
  findSelectedPolygon,
  findAllPolygons,
  renderSplitPolygons,
  renderBuffer,
  renderGeometryResult,
  getOrCreateToolLayer,
} from '../../lib/geometry/GeometryUtils';
import { importKML, importShapefile, importGPX, exportDXF, validateSIGEF, generateMemorial, getVerticesSIRGAS } from '../../lib/api/toolsApi';

interface LayerData {
  id: string;
  label: string;
  color: string;
  visible: boolean;
  opacity: number;
  graphics: __esri.Graphic[];
}

interface DrawMapValidationProps {
  layers: LayerData[];
  activeTool?: ToolId | 'snap' | 'edit' | 'measure' | 'area' | null;

  // Existing callbacks
  onMeasurement?: (distance: number) => void;
  onAreaCalculated?: (area: number) => void;

  // Drawing callbacks (7)
  onPolygonSplit?: (polygons: [__esri.Polygon, __esri.Polygon]) => void;
  onPolygonsMerged?: (polygon: __esri.Polygon) => void;
  onBufferCreated?: (buffer: __esri.Polygon) => void;
  onLineOffset?: (line: __esri.Polyline) => void;
  onLineExtended?: (line: __esri.Polyline) => void;
  onLineTrimmed?: (line: __esri.Polyline) => void;
  onCornerFilleted?: (polygon: __esri.Polygon) => void;

  // Analysis callbacks (7)
  onIntersectionFound?: (geometry: __esri.Geometry) => void;
  onGeometriesUnited?: (polygon: __esri.Polygon) => void;
  onDifferenceCalculated?: (geometry: __esri.Geometry) => void;
  onSymmetricDiff?: (geometry: __esri.Geometry) => void;
  onConvexHullCreated?: (polygon: __esri.Polygon) => void;
  onCentroidCalculated?: (point: __esri.Point) => void;
  onPerimeterCalculated?: (perimeter: number) => void;

  // Measurement callbacks (5)
  onAngleMeasured?: (angle: number) => void;
  onAzimuthCalculated?: (azimuth: number) => void;
  onCoordsDisplayed?: (coords: { lon: number; lat: number }) => void;
  onElevationProfile?: (profile: unknown) => void;
  onSlopeCalculated?: (slope: number) => void;

  // Topology callbacks (5)
  onTopologyValidated?: (result: { valid: boolean; errors: Array<{ type: string; message: string; severity: string }> }) => void;
  onGapsClosed?: (polygons: __esri.Polygon[]) => void;
  onSliversRemoved?: (polygons: __esri.Polygon[]) => void;
  onGeometrySimplified?: (geometry: __esri.Geometry) => void;
  onGeometryDensified?: (geometry: __esri.Geometry) => void;

  // Annotation callbacks (4)
  onLabelAdded?: (label: __esri.Graphic) => void;
  onDimensionAdded?: (dimension: __esri.Graphic) => void;
  onNorthArrowAdded?: () => void;
  onScaleBarAdded?: () => void;

  // Selection callbacks (4)
  onFeaturesSelected?: (features: __esri.Graphic[]) => void;

  // Import/Export callbacks (5)
  onKMLImported?: (features: __esri.Graphic[]) => void;
  onShapefileImported?: (features: __esri.Graphic[]) => void;
  onGPXImported?: (features: __esri.Graphic[]) => void;
  onDXFExported?: (success: boolean) => void;
  onGeoJSONExported?: (geojson: string) => void;

  // Coordinates callbacks (3)
  onCoordsConverted?: (result: { from: string; to: string; coords: number[] }) => void;
  onPointAdded?: (point: __esri.Point) => void;
  onGridToggled?: (visible: boolean) => void;

  // SIGEF callbacks (3)
  onSIGEFValidated?: (result: unknown) => void;
  onMemorialGenerated?: (memorial: string) => void;
  onVerticesExported?: (vertices: unknown[]) => void;

  initialCenter?: [number, number];
  initialZoom?: number;
  basemap?: 'streets-vector' | 'topo-vector' | 'satellite' | 'hybrid';
}

interface MapState {
  measurementPoints: Array<[number, number]>;
  measurementDistance: number | null;
  selectedFeature: __esri.Graphic | null;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 59, g: 130, b: 246 };
};

const calculateDistanceHaversine = (point1: [number, number], point2: [number, number]) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculatePolygonArea = (polygon: __esri.Polygon) => {
  if (!polygon || !polygon.rings || polygon.rings.length === 0) return 0;
  try {
    const area = geometryEngine.planarArea(polygon, 'square-meters');
    return Math.abs(area);
  } catch {
    return 0;
  }
};

/** Tool descriptions for overlay */
const TOOL_DESCRIPTIONS: Record<string, string> = {
  snap: 'Vertices serao snappados com tolerancia de 0.5m',
  edit: 'Use as ferramentas a direita para editar',
  measure: 'Clique para medir distancias',
  area: 'Area do poligono sera calculada automaticamente',
  split: 'Clique 2 pontos para criar linha de corte',
  merge: 'Clique em 2+ poligonos para uni-los',
  buffer: 'Clique na geometria para criar buffer (50m)',
  offset: 'Clique na linha para criar offset',
  extend: 'Clique na linha para estender',
  trim: 'Clique 2 pontos para cortar',
  fillet: 'Clique no canto para arredondar',
  intersect: 'Clique em 2 geometrias para calcular interseccao',
  union: 'Clique em 2+ geometrias para unir',
  difference: 'Clique em 2 geometrias para calcular diferenca',
  'symmetric-diff': 'Clique em 2 geometrias para diferenca simetrica',
  'convex-hull': 'Clique na geometria para calcular envoltoria convexa',
  centroid: 'Clique na geometria para calcular centroide',
  perimeter: 'Clique no poligono para medir perimetro',
  angle: 'Clique em 3 pontos para medir angulo',
  azimuth: 'Clique em 2 pontos para calcular azimute',
  'coords-display': 'Mova o mouse para ver coordenadas',
  elevation: 'Clique para obter perfil de elevacao (requer backend)',
  slope: 'Clique para calcular declividade (requer backend)',
  'validate-topology': 'Clique no poligono para validar topologia',
  'close-gaps': 'Detecta e fecha gaps entre poligonos',
  'remove-slivers': 'Remove poligonos muito finos (slivers)',
  simplify: 'Clique na geometria para simplificar',
  densify: 'Clique na geometria para densificar vertices',
  label: 'Clique no mapa para adicionar rotulo',
  dimension: 'Clique em 2 pontos para adicionar cota',
  'north-arrow': 'Adiciona seta de norte ao mapa',
  'scale-bar': 'Adiciona barra de escala ao mapa',
  'select-rect': 'Arraste para selecionar por retangulo',
  'select-polygon': 'Desenhe poligono para selecionar',
  'select-distance': 'Clique e defina raio de selecao',
  'select-attribute': 'Selecione por atributo',
  'import-kml': 'Importar arquivo KML (requer backend)',
  'import-shp': 'Importar Shapefile (requer backend)',
  'import-gpx': 'Importar arquivo GPX (requer backend)',
  'export-dxf': 'Exportar para DXF (requer backend)',
  'export-geojson': 'Exportar geometrias como GeoJSON',
  'coord-converter': 'Converter coordenadas entre sistemas',
  'add-point': 'Clique para adicionar ponto com coordenadas',
  'coord-grid': 'Alternar grade de coordenadas',
  'sigef-validator': 'Validar geometria conforme regras SIGEF (requer backend)',
  memorial: 'Gerar memorial descritivo (requer backend)',
  'vertices-sirgas': 'Exportar vertices em SIRGAS 2000 (requer backend)',
};

export default function DrawMapValidation({
  layers,
  activeTool = null,
  onMeasurement,
  onAreaCalculated,
  onPolygonSplit,
  onPolygonsMerged,
  onBufferCreated,
  onLineOffset,
  onLineExtended,
  onLineTrimmed,
  onCornerFilleted,
  onIntersectionFound,
  onGeometriesUnited,
  onDifferenceCalculated,
  onSymmetricDiff,
  onConvexHullCreated,
  onCentroidCalculated,
  onPerimeterCalculated,
  onAngleMeasured,
  onAzimuthCalculated,
  onCoordsDisplayed,
  onElevationProfile,
  onSlopeCalculated,
  onTopologyValidated,
  onGapsClosed,
  onSliversRemoved,
  onGeometrySimplified,
  onGeometryDensified,
  onLabelAdded,
  onDimensionAdded,
  onNorthArrowAdded,
  onScaleBarAdded,
  onFeaturesSelected,
  onKMLImported,
  onShapefileImported,
  onGPXImported,
  onDXFExported,
  onGeoJSONExported,
  onCoordsConverted,
  onPointAdded,
  onGridToggled,
  onSIGEFValidated,
  onMemorialGenerated,
  onVerticesExported,
  initialCenter = [-47.9292, -15.7801],
  initialZoom = 15,
  basemap = 'topo-vector',
}: DrawMapValidationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const layersRef = useRef<Map<string, GraphicsLayer>>(new Map());
  const handlersRef = useRef<__esri.Handle[]>([]);
  const [state, setState] = useState<MapState>({
    measurementPoints: [],
    measurementDistance: null,
    selectedFeature: null,
  });

  const cleanupHandlers = useCallback(() => {
    handlersRef.current.forEach(h => h.remove());
    handlersRef.current = [];
  }, []);

  // Create symbols for each layer
  const getSymbolForLayer = useCallback((layerData: LayerData) => {
    const rgb = hexToRgb(layerData.color);
    const alpha = layerData.opacity / 100;
    return {
      fill: new SimpleFillSymbol({
        color: [rgb.r, rgb.g, rgb.b, alpha * 255],
        outline: new SimpleLineSymbol({ color: [rgb.r, rgb.g, rgb.b, 255], width: 2 }),
      }),
      line: new SimpleLineSymbol({ color: [rgb.r, rgb.g, rgb.b, 255], width: 3 }),
      point: new SimpleMarkerSymbol({
        color: [rgb.r, rgb.g, rgb.b, 255],
        size: 8,
        outline: new SimpleLineSymbol({ color: [255, 255, 255, 255], width: 1 }),
      }),
    };
  }, []);

  // ==================== EXISTING TOOL HANDLERS ====================

  const handleMeasureTool = useCallback((view: MapView) => {
    const measureLayer = getOrCreateToolLayer(view, 'measurements-layer');
    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      setState((prev) => {
        const newPoints = [...prev.measurementPoints, coords];
        if (newPoints.length >= 2) {
          const distance = calculateDistanceHaversine(newPoints[newPoints.length - 2], coords);
          if (onMeasurement) onMeasurement(distance);
          const polyline = new Polyline({ paths: [newPoints] });
          measureLayer.add(new Graphic({
            geometry: polyline,
            symbol: new SimpleLineSymbol({ color: [76, 175, 80, 255], width: 3 }),
          }));
        }
        return { ...prev, measurementPoints: newPoints };
      });
    });
    handlersRef.current.push(handler);
  }, [onMeasurement]);

  const handleAreaTool = useCallback((view: MapView) => {
    view.when(() => {
      if (view.map) {
        view.map.allLayers.forEach((layer) => {
          if (layer instanceof GraphicsLayer && layer.id !== 'area-layer' && layer.id !== 'measurements-layer') {
            layer.graphics.forEach((graphic) => {
              if (graphic.geometry?.type === 'polygon') {
                const area = calculatePolygonArea(graphic.geometry as __esri.Polygon);
                if (onAreaCalculated) onAreaCalculated(area);
              }
            });
          }
        });
      }
    });
  }, [onAreaCalculated]);

  const handleSnapTool = useCallback((_view: MapView) => {
    console.log('Snap tool: Vertices serao snappados com 0.5m de tolerancia');
  }, []);

  const handleEditTool = useCallback((view: MapView) => {
    const editLayer = getOrCreateToolLayer(view, 'edit-layer');
    const sketch = new Sketch({
      view,
      layer: editLayer,
      availableCreateTools: [],
      creationMode: 'update',
    });
    view.ui.add(sketch, 'top-right');
  }, []);

  const handleDrawLineTool = useCallback((view: MapView) => {
    const drawLayer = getOrCreateToolLayer(view, 'draw-line-layer');
    const sketch = new Sketch({
      view,
      layer: drawLayer,
      availableCreateTools: ['polyline'],
      creationMode: 'create',
    });
    view.ui.add(sketch, 'top-right');
  }, []);

  const handleDrawPolylineTool = useCallback((view: MapView) => {
    const drawLayer = getOrCreateToolLayer(view, 'draw-polyline-layer');
    const sketch = new Sketch({
      view,
      layer: drawLayer,
      availableCreateTools: ['polyline'],
      creationMode: 'create',
    });
    view.ui.add(sketch, 'top-right');
  }, []);

  // ==================== DRAWING TOOL HANDLERS (7) ====================

  const handleSplitTool = useCallback((view: MapView) => {
    const splitLayer = getOrCreateToolLayer(view, 'split-layer');
    const clickPoints: [number, number][] = [];

    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      clickPoints.push(coords);

      splitLayer.add(new Graphic({
        geometry: new Point({ longitude: coords[0], latitude: coords[1] }),
        symbol: new SimpleMarkerSymbol({ color: [255, 0, 0], size: 8 }),
      }));

      if (clickPoints.length === 2) {
        const splitLine = new Polyline({
          paths: [clickPoints],
          spatialReference: { wkid: 4326 },
        });
        const targetPolygon = findSelectedPolygon(view);

        if (targetPolygon) {
          try {
            const splitResult = geometryEngine.cut(targetPolygon, splitLine);
            if (splitResult && splitResult.length === 2) {
              const [poly1, poly2] = splitResult as [__esri.Polygon, __esri.Polygon];
              renderSplitPolygons(splitLayer, poly1, poly2);
              if (onPolygonSplit) onPolygonSplit([poly1, poly2]);
            } else {
              console.warn('Split: Linha nao intersecta poligono adequadamente');
            }
          } catch (error) {
            console.error('Split failed:', error);
          }
        } else {
          console.warn('Nenhum poligono selecionado para dividir');
        }
        clickPoints.length = 0;
      }
    });
    handlersRef.current.push(handler);
  }, [onPolygonSplit]);

  const handleMergeTool = useCallback((view: MapView) => {
    const mergeLayer = getOrCreateToolLayer(view, 'merge-layer');
    const selectedPolygons: __esri.Polygon[] = [];

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result) {
            const graphic = result.graphic;
            if (graphic.geometry?.type === 'polygon') {
              selectedPolygons.push(graphic.geometry as __esri.Polygon);

              mergeLayer.add(new Graphic({
                geometry: graphic.geometry,
                symbol: new SimpleFillSymbol({
                  color: [255, 255, 0, 128],
                  outline: new SimpleLineSymbol({ color: [255, 215, 0], width: 3 }),
                }),
              }));

              if (selectedPolygons.length >= 2) {
                const merged = geometryEngine.union(selectedPolygons) as __esri.Polygon;
                if (merged) {
                  mergeLayer.removeAll();
                  mergeLayer.add(new Graphic({
                    geometry: merged,
                    symbol: new SimpleFillSymbol({
                      color: [76, 175, 80, 128],
                      outline: new SimpleLineSymbol({ color: [76, 175, 80], width: 2 }),
                    }),
                  }));
                  if (onPolygonsMerged) onPolygonsMerged(merged);
                }
                selectedPolygons.length = 0;
              }
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onPolygonsMerged]);

  const handleBufferTool = useCallback((view: MapView) => {
    const bufferLayer = getOrCreateToolLayer(view, 'buffer-layer');
    const bufferDistance = 50;

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            const buffer = geometryEngine.buffer(
              result.graphic.geometry,
              bufferDistance,
              'meters'
            );
            if (buffer) {
              renderBuffer(bufferLayer, buffer as __esri.Polygon);
              if (onBufferCreated) onBufferCreated(buffer as __esri.Polygon);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onBufferCreated]);

  const handleOffsetTool = useCallback((view: MapView) => {
    const offsetLayer = getOrCreateToolLayer(view, 'offset-layer');
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry?.type === 'polyline') {
            const offset = geometryEngine.offset(
              result.graphic.geometry as __esri.Polyline,
              10,
              'meters',
              'round'
            );
            if (offset) {
              renderGeometryResult(offsetLayer, offset, [255, 152, 0]);
              if (onLineOffset) onLineOffset(offset as __esri.Polyline);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onLineOffset]);

  const handleExtendTool = useCallback((view: MapView) => {
    const extendLayer = getOrCreateToolLayer(view, 'extend-layer');

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if (!('graphic' in result) || !result.graphic.geometry) return;
          const graphic = result.graphic;

          if (graphic.geometry.type === 'polygon') {
            const polygon = graphic.geometry as __esri.Polygon;
            const ring = polygon.rings[0];

            if (ring && ring.length >= 2) {
              // Get last two points of the ring (last index is the closing point)
              const lastIdx = ring.length - 2;
              const p1 = ring[lastIdx - 1];
              const p2 = ring[lastIdx];

              // Calculate direction vector
              const dx = p2[0] - p1[0];
              const dy = p2[1] - p1[1];
              const len = Math.sqrt(dx * dx + dy * dy);

              if (len > 0) {
                const extensionFactor = 0.001; // ~111m in degrees
                const newX = p2[0] + (dx / len) * extensionFactor;
                const newY = p2[1] + (dy / len) * extensionFactor;

                // Create extended line for visualization
                const extendedLine = new Polyline({
                  paths: [[[p2[0], p2[1]], [newX, newY]]],
                  spatialReference: { wkid: 4326 },
                });

                extendLayer.add(new Graphic({
                  geometry: extendedLine,
                  symbol: new SimpleLineSymbol({
                    color: [255, 152, 0],
                    width: 3,
                    style: 'dash',
                  }),
                }));

                if (onLineExtended) onLineExtended(extendedLine);
              }
            }
          } else if (graphic.geometry.type === 'polyline') {
            const polyline = graphic.geometry as __esri.Polyline;
            const path = polyline.paths[0];

            if (path && path.length >= 2) {
              const p1 = path[path.length - 2];
              const p2 = path[path.length - 1];

              const dx = p2[0] - p1[0];
              const dy = p2[1] - p1[1];
              const len = Math.sqrt(dx * dx + dy * dy);

              if (len > 0) {
                const extensionFactor = 0.001; // ~111m in degrees
                const newX = p2[0] + (dx / len) * extensionFactor;
                const newY = p2[1] + (dy / len) * extensionFactor;

                // Build new path with the extended endpoint
                const newPath = [...path, [newX, newY]];
                const extendedPolyline = new Polyline({
                  paths: [newPath],
                  spatialReference: polyline.spatialReference,
                });

                extendLayer.add(new Graphic({
                  geometry: extendedPolyline,
                  symbol: new SimpleLineSymbol({
                    color: [255, 152, 0],
                    width: 3,
                    style: 'dash',
                  }),
                }));

                if (onLineExtended) onLineExtended(extendedPolyline);
              }
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onLineExtended]);

  const handleTrimTool = useCallback((view: MapView) => {
    const trimLayer = getOrCreateToolLayer(view, 'trim-layer');
    const clickPoints: [number, number][] = [];

    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      clickPoints.push(coords);

      // Show click points as visual feedback
      trimLayer.add(new Graphic({
        geometry: new Point({ longitude: coords[0], latitude: coords[1] }),
        symbol: new SimpleMarkerSymbol({ color: [244, 67, 54], size: 8 }),
      }));

      if (clickPoints.length === 2) {
        const cutLine = new Polyline({
          paths: [clickPoints],
          spatialReference: { wkid: 4326 },
        });
        const targetPolygon = findSelectedPolygon(view);

        if (targetPolygon) {
          try {
            const cutResult = geometryEngine.cut(targetPolygon, cutLine);
            if (cutResult && cutResult.length > 0) {
              // Keep only the side closest to the first click point
              const clickPoint = new Point({
                longitude: clickPoints[0][0],
                latitude: clickPoints[0][1],
                spatialReference: { wkid: 4326 },
              });

              let closestPart = cutResult[0];
              let minDist = Infinity;

              for (const part of cutResult) {
                const nearest = geometryEngine.nearestCoordinate(part, clickPoint);
                if (nearest && nearest.distance < minDist) {
                  minDist = nearest.distance;
                  closestPart = part;
                }
              }

              trimLayer.removeAll();
              renderGeometryResult(trimLayer, closestPart, [244, 67, 54]);
              if (onLineTrimmed) onLineTrimmed(closestPart as unknown as __esri.Polyline);
            } else {
              console.warn('Trim: Linha nao intersecta poligono adequadamente');
            }
          } catch (error) {
            console.error('Trim failed:', error);
          }
        } else {
          console.warn('Nenhum poligono selecionado para cortar');
        }
        clickPoints.length = 0;
      }
    });
    handlersRef.current.push(handler);
  }, [onLineTrimmed]);

  const handleFilletTool = useCallback((view: MapView) => {
    const filletLayer = getOrCreateToolLayer(view, 'fillet-layer');

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if (!('graphic' in result) || !result.graphic.geometry) return;
          const graphic = result.graphic;

          if (graphic.geometry.type === 'polygon') {
            const polygon = graphic.geometry as __esri.Polygon;

            // Use negative geodesicBuffer to shrink, then positive to expand back
            // This rounds (fillets) the corners of the polygon
            const buffer = geometryEngine.geodesicBuffer(polygon, -2, 'meters');

            if (buffer) {
              // Expand back to approximate original size with rounded corners
              const rounded = geometryEngine.geodesicBuffer(buffer, 2, 'meters');

              if (rounded) {
                filletLayer.add(new Graphic({
                  geometry: rounded as __esri.Polygon,
                  symbol: new SimpleFillSymbol({
                    color: [156, 39, 176, 128],
                    outline: new SimpleLineSymbol({
                      color: [156, 39, 176, 255],
                      width: 2,
                    }),
                  }),
                }));

                if (onCornerFilleted) onCornerFilleted(rounded as __esri.Polygon);
              }
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onCornerFilleted]);

  // ==================== ANALYSIS TOOL HANDLERS (7) ====================

  const handleIntersectTool = useCallback((view: MapView) => {
    const intersectionLayer = getOrCreateToolLayer(view, 'intersection-layer');
    const selectedGeometries: __esri.Geometry[] = [];

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            selectedGeometries.push(result.graphic.geometry);

            if (selectedGeometries.length === 2) {
              const intersection = geometryEngine.intersect(selectedGeometries[0], selectedGeometries[1]);
              if (intersection) {
                renderGeometryResult(intersectionLayer, intersection, [156, 39, 176]);
                if (onIntersectionFound) onIntersectionFound(intersection);
              }
              selectedGeometries.length = 0;
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onIntersectionFound]);

  const handleUnionTool = useCallback((view: MapView) => {
    const unionLayer = getOrCreateToolLayer(view, 'union-layer');
    const selectedGeometries: __esri.Geometry[] = [];

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            selectedGeometries.push(result.graphic.geometry);
            if (selectedGeometries.length >= 2) {
              const united = geometryEngine.union(selectedGeometries) as __esri.Polygon;
              if (united) {
                renderGeometryResult(unionLayer, united, [0, 150, 136]);
                if (onGeometriesUnited) onGeometriesUnited(united);
              }
              selectedGeometries.length = 0;
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onGeometriesUnited]);

  const handleDifferenceTool = useCallback((view: MapView) => {
    const diffLayer = getOrCreateToolLayer(view, 'difference-layer');
    const selectedGeometries: __esri.Geometry[] = [];

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            selectedGeometries.push(result.graphic.geometry);
            if (selectedGeometries.length === 2) {
              const diff = geometryEngine.difference(selectedGeometries[0], selectedGeometries[1]);
              if (diff) {
                renderGeometryResult(diffLayer, diff, [255, 87, 34]);
                if (onDifferenceCalculated) onDifferenceCalculated(diff);
              }
              selectedGeometries.length = 0;
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onDifferenceCalculated]);

  const handleSymmetricDiffTool = useCallback((view: MapView) => {
    const symDiffLayer = getOrCreateToolLayer(view, 'symmetric-diff-layer');
    const selectedGeometries: __esri.Geometry[] = [];

    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            selectedGeometries.push(result.graphic.geometry);
            if (selectedGeometries.length === 2) {
              const symDiff = geometryEngine.symmetricDifference(selectedGeometries[0], selectedGeometries[1]);
              if (symDiff) {
                renderGeometryResult(symDiffLayer, symDiff, [121, 85, 72]);
                if (onSymmetricDiff) onSymmetricDiff(symDiff);
              }
              selectedGeometries.length = 0;
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onSymmetricDiff]);

  const handleConvexHullTool = useCallback((view: MapView) => {
    const hullLayer = getOrCreateToolLayer(view, 'convex-hull-layer');
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            const hull = geometryEngine.convexHull(result.graphic.geometry);
            if (hull) {
              renderGeometryResult(hullLayer, hull, [63, 81, 181]);
              if (onConvexHullCreated) onConvexHullCreated(hull as __esri.Polygon);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onConvexHullCreated]);

  const handleCentroidTool = useCallback((view: MapView) => {
    const centroidLayer = getOrCreateToolLayer(view, 'centroid-layer');
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            const centroid = (result.graphic.geometry as __esri.Polygon).centroid;
            if (centroid) {
              centroidLayer.add(new Graphic({
                geometry: centroid,
                symbol: new SimpleMarkerSymbol({
                  color: [255, 0, 0],
                  size: 12,
                  style: 'cross',
                }),
              }));
              if (onCentroidCalculated) onCentroidCalculated(centroid);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onCentroidCalculated]);

  const handlePerimeterTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry?.type === 'polygon') {
            const perimeter = geometryEngine.planarLength(result.graphic.geometry, 'meters');
            if (onPerimeterCalculated) onPerimeterCalculated(perimeter);
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onPerimeterCalculated]);

  // ==================== MEASUREMENT TOOL HANDLERS (5) ====================

  const handleAngleTool = useCallback((view: MapView) => {
    const angleLayer = getOrCreateToolLayer(view, 'angle-layer');
    const clickPoints: [number, number][] = [];

    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      clickPoints.push(coords);

      angleLayer.add(new Graphic({
        geometry: new Point({ longitude: coords[0], latitude: coords[1] }),
        symbol: new SimpleMarkerSymbol({ color: [33, 150, 243], size: 8 }),
      }));

      if (clickPoints.length === 3) {
        const angle = calculateAngle(clickPoints[0], clickPoints[1], clickPoints[2]);
        if (onAngleMeasured) onAngleMeasured(angle);
        clickPoints.length = 0;
        angleLayer.removeAll();
      }
    });
    handlersRef.current.push(handler);
  }, [onAngleMeasured]);

  const handleAzimuthTool = useCallback((view: MapView) => {
    const azimuthLayer = getOrCreateToolLayer(view, 'azimuth-layer');
    const clickPoints: [number, number][] = [];

    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      clickPoints.push(coords);

      azimuthLayer.add(new Graphic({
        geometry: new Point({ longitude: coords[0], latitude: coords[1] }),
        symbol: new SimpleMarkerSymbol({ color: [0, 150, 136], size: 8 }),
      }));

      if (clickPoints.length === 2) {
        const azimuth = calculateAzimuth(clickPoints[0], clickPoints[1]);

        // Draw azimuth line
        azimuthLayer.add(new Graphic({
          geometry: new Polyline({ paths: [clickPoints] }),
          symbol: new SimpleLineSymbol({ color: [0, 150, 136, 255], width: 2 }),
        }));

        if (onAzimuthCalculated) onAzimuthCalculated(azimuth);
        clickPoints.length = 0;
      }
    });
    handlersRef.current.push(handler);
  }, [onAzimuthCalculated]);

  const handleCoordsDisplayTool = useCallback((view: MapView) => {
    const handler = view.on('pointer-move', (event) => {
      const point = view.toMap(event);
      if (point && onCoordsDisplayed) {
        onCoordsDisplayed({ lon: point.longitude, lat: point.latitude });
      }
    });
    handlersRef.current.push(handler);
  }, [onCoordsDisplayed]);

  const handleElevationTool = useCallback((_view: MapView) => {
    console.log('Elevation tool: Requer backend com dados DEM');
    if (onElevationProfile) console.log('Callback registrado');
  }, [onElevationProfile]);

  const handleSlopeTool = useCallback((_view: MapView) => {
    console.log('Slope tool: Requer backend com dados DEM');
    if (onSlopeCalculated) console.log('Callback registrado');
  }, [onSlopeCalculated]);

  // ==================== TOPOLOGY TOOL HANDLERS (5) ====================

  const handleValidateTopologyTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry?.type === 'polygon') {
            const validationResult = validatePolygonTopology(result.graphic.geometry as __esri.Polygon);
            if (onTopologyValidated) onTopologyValidated(validationResult);
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onTopologyValidated]);

  const handleCloseGapsTool = useCallback((view: MapView) => {
    const polygons = findAllPolygons(view);
    if (polygons.length >= 2) {
      // Simple gap closure: union all nearby polygons
      const union = geometryEngine.union(polygons) as __esri.Polygon;
      if (union && onGapsClosed) {
        onGapsClosed([union]);
      }
    }
  }, [onGapsClosed]);

  const handleRemoveSliversTool = useCallback((view: MapView) => {
    const cleanedPolygons: __esri.Polygon[] = [];

    if (view.map) {
      view.map.allLayers.forEach((layer) => {
        if (layer instanceof GraphicsLayer) {
          layer.graphics.forEach((graphic) => {
            if (graphic.geometry?.type === 'polygon') {
              const polygon = graphic.geometry as __esri.Polygon;
              if (!detectSlivers(polygon)) {
                cleanedPolygons.push(polygon);
              }
            }
          });
        }
      });
    }

    if (onSliversRemoved) onSliversRemoved(cleanedPolygons);
  }, [onSliversRemoved]);

  const handleSimplifyTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            const simplified = geometryEngine.simplify(result.graphic.geometry);
            if (simplified && onGeometrySimplified) {
              onGeometrySimplified(simplified);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onGeometrySimplified]);

  const handleDensifyTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const result = response.results[0];
          if ('graphic' in result && result.graphic.geometry) {
            const densified = geometryEngine.densify(result.graphic.geometry, 10, 'meters');
            if (densified && onGeometryDensified) {
              onGeometryDensified(densified);
            }
          }
        }
      });
    });
    handlersRef.current.push(handler);
  }, [onGeometryDensified]);

  // ==================== ANNOTATION TOOL HANDLERS (4) ====================

  const handleLabelTool = useCallback((view: MapView) => {
    const labelLayer = getOrCreateToolLayer(view, 'annotation-layer');
    const handler = view.on('click', (event) => {
      const point = event.mapPoint;
      const labelText = prompt('Digite o texto do rotulo:');
      if (labelText) {
        const graphic = new Graphic({
          geometry: point,
          symbol: new TextSymbol({
            text: labelText,
            color: [0, 0, 0],
            font: { size: 12, weight: 'bold' },
            haloColor: [255, 255, 255],
            haloSize: 1,
          }),
        });
        labelLayer.add(graphic);
        if (onLabelAdded) onLabelAdded(graphic);
      }
    });
    handlersRef.current.push(handler);
  }, [onLabelAdded]);

  const handleDimensionTool = useCallback((view: MapView) => {
    const dimLayer = getOrCreateToolLayer(view, 'annotation-layer');
    const clickPoints: [number, number][] = [];

    const handler = view.on('click', (event) => {
      const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];
      clickPoints.push(coords);

      if (clickPoints.length === 2) {
        const distance = calculateDistanceHaversine(clickPoints[0], clickPoints[1]);
        const midLon = (clickPoints[0][0] + clickPoints[1][0]) / 2;
        const midLat = (clickPoints[0][1] + clickPoints[1][1]) / 2;

        // Draw dimension line
        dimLayer.add(new Graphic({
          geometry: new Polyline({ paths: [clickPoints] }),
          symbol: new SimpleLineSymbol({ color: [0, 0, 0], width: 1, style: 'dash' }),
        }));

        // Add dimension text
        const dimGraphic = new Graphic({
          geometry: new Point({ longitude: midLon, latitude: midLat }),
          symbol: new TextSymbol({
            text: `${distance.toFixed(2)} m`,
            color: [0, 0, 0],
            font: { size: 10 },
            haloColor: [255, 255, 255],
            haloSize: 1,
          }),
        });
        dimLayer.add(dimGraphic);
        if (onDimensionAdded) onDimensionAdded(dimGraphic);
        clickPoints.length = 0;
      }
    });
    handlersRef.current.push(handler);
  }, [onDimensionAdded]);

  const handleNorthArrowTool = useCallback((_view: MapView) => {
    console.log('North Arrow tool: Adicionando simbolo de norte');
    if (onNorthArrowAdded) onNorthArrowAdded();
  }, [onNorthArrowAdded]);

  const handleScaleBarTool = useCallback((_view: MapView) => {
    console.log('Scale Bar tool: Adicionando barra de escala');
    if (onScaleBarAdded) onScaleBarAdded();
  }, [onScaleBarAdded]);

  // ==================== SELECTION TOOL HANDLERS (4) ====================

  const handleSelectRectTool = useCallback((view: MapView) => {
    const selLayer = getOrCreateToolLayer(view, 'selection-layer');
    const handler = view.on('click', (event) => {
      view.hitTest(event).then((response) => {
        const selected: __esri.Graphic[] = [];
        response.results.forEach((r) => {
          if ('graphic' in r) {
            selected.push(r.graphic);
            if (r.graphic.geometry) {
              selLayer.add(new Graphic({
                geometry: r.graphic.geometry,
                symbol: new SimpleFillSymbol({
                  color: [0, 200, 255, 64],
                  outline: new SimpleLineSymbol({ color: [0, 200, 255], width: 3 }),
                }),
              }));
            }
          }
        });
        if (selected.length > 0 && onFeaturesSelected) onFeaturesSelected(selected);
      });
    });
    handlersRef.current.push(handler);
  }, [onFeaturesSelected]);

  const handleSelectPolygonTool = useCallback((view: MapView) => {
    // Reuse rectangle selection for now
    handleSelectRectTool(view);
  }, [handleSelectRectTool]);

  const handleSelectDistanceTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      const buffer = geometryEngine.buffer(event.mapPoint, 100, 'meters');
      if (buffer) {
        const selected: __esri.Graphic[] = [];
        view.map?.allLayers.forEach((layer) => {
          if (layer instanceof GraphicsLayer) {
            layer.graphics.forEach((graphic) => {
              if (graphic.geometry && geometryEngine.contains(buffer as __esri.Polygon, graphic.geometry)) {
                selected.push(graphic);
              }
            });
          }
        });
        if (selected.length > 0 && onFeaturesSelected) onFeaturesSelected(selected);
      }
    });
    handlersRef.current.push(handler);
  }, [onFeaturesSelected]);

  const handleSelectAttributeTool = useCallback((_view: MapView) => {
    console.log('Select by Attribute: Implementacao pendente - requer UI de filtro');
  }, []);

  // ==================== IMPORT/EXPORT TOOL HANDLERS (5) ====================

  const handleImportKMLTool = useCallback((view: MapView) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.kml,.kmz';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const geojson = await importKML(file);
        const importLayer = getOrCreateToolLayer(view, 'import-layer');
        const addedGraphics: __esri.Graphic[] = [];
        for (const feature of geojson.features) {
          const geom = feature.geometry;
          let arcGeometry: __esri.Geometry | null = null;
          if (geom.type === 'Point') {
            const coords = geom.coordinates as number[];
            arcGeometry = new Point({ longitude: coords[0], latitude: coords[1], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'LineString') {
            const coords = geom.coordinates as number[][];
            arcGeometry = new Polyline({ paths: [coords], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'Polygon') {
            const coords = geom.coordinates as number[][][];
            arcGeometry = new Polygon({ rings: coords, spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'MultiPolygon') {
            const multiCoords = geom.coordinates as number[][][][];
            for (const polyCoords of multiCoords) {
              const poly = new Polygon({ rings: polyCoords, spatialReference: { wkid: 4326 } });
              const g = new Graphic({
                geometry: poly,
                symbol: new SimpleFillSymbol({
                  color: [59, 130, 246, 100],
                  outline: new SimpleLineSymbol({ color: [59, 130, 246, 255], width: 2 }),
                }),
                attributes: feature.properties,
              });
              importLayer.add(g);
              addedGraphics.push(g);
            }
            continue;
          }
          if (arcGeometry) {
            const graphic = new Graphic({
              geometry: arcGeometry,
              symbol: arcGeometry.type === 'point'
                ? new SimpleMarkerSymbol({ color: [59, 130, 246], size: 8 })
                : arcGeometry.type === 'polyline'
                  ? new SimpleLineSymbol({ color: [59, 130, 246, 255], width: 2 })
                  : new SimpleFillSymbol({
                      color: [59, 130, 246, 100],
                      outline: new SimpleLineSymbol({ color: [59, 130, 246, 255], width: 2 }),
                    }),
              attributes: feature.properties,
            });
            importLayer.add(graphic);
            addedGraphics.push(graphic);
          }
        }
        console.log('KML imported:', addedGraphics.length, 'features');
        if (onKMLImported) onKMLImported(addedGraphics);
      } catch (error) {
        console.error('KML import failed:', error);
      }
    };
    input.click();
  }, [onKMLImported]);

  const handleImportShpTool = useCallback((view: MapView) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const geojson = await importShapefile(file);
        const importLayer = getOrCreateToolLayer(view, 'import-layer');
        const addedGraphics: __esri.Graphic[] = [];
        for (const feature of geojson.features) {
          const geom = feature.geometry;
          let arcGeometry: __esri.Geometry | null = null;
          if (geom.type === 'Point') {
            const coords = geom.coordinates as number[];
            arcGeometry = new Point({ longitude: coords[0], latitude: coords[1], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'LineString') {
            const coords = geom.coordinates as number[][];
            arcGeometry = new Polyline({ paths: [coords], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'Polygon') {
            const coords = geom.coordinates as number[][][];
            arcGeometry = new Polygon({ rings: coords, spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'MultiPolygon') {
            const multiCoords = geom.coordinates as number[][][][];
            for (const polyCoords of multiCoords) {
              const poly = new Polygon({ rings: polyCoords, spatialReference: { wkid: 4326 } });
              const g = new Graphic({
                geometry: poly,
                symbol: new SimpleFillSymbol({
                  color: [76, 175, 80, 100],
                  outline: new SimpleLineSymbol({ color: [76, 175, 80, 255], width: 2 }),
                }),
                attributes: feature.properties,
              });
              importLayer.add(g);
              addedGraphics.push(g);
            }
            continue;
          }
          if (arcGeometry) {
            const graphic = new Graphic({
              geometry: arcGeometry,
              symbol: arcGeometry.type === 'point'
                ? new SimpleMarkerSymbol({ color: [76, 175, 80], size: 8 })
                : arcGeometry.type === 'polyline'
                  ? new SimpleLineSymbol({ color: [76, 175, 80, 255], width: 2 })
                  : new SimpleFillSymbol({
                      color: [76, 175, 80, 100],
                      outline: new SimpleLineSymbol({ color: [76, 175, 80, 255], width: 2 }),
                    }),
              attributes: feature.properties,
            });
            importLayer.add(graphic);
            addedGraphics.push(graphic);
          }
        }
        console.log('Shapefile imported:', addedGraphics.length, 'features');
        if (onShapefileImported) onShapefileImported(addedGraphics);
      } catch (error) {
        console.error('Shapefile import failed:', error);
      }
    };
    input.click();
  }, [onShapefileImported]);

  const handleImportGPXTool = useCallback((view: MapView) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gpx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const geojson = await importGPX(file);
        const importLayer = getOrCreateToolLayer(view, 'import-layer');
        const addedGraphics: __esri.Graphic[] = [];
        for (const feature of geojson.features) {
          const geom = feature.geometry;
          let arcGeometry: __esri.Geometry | null = null;
          if (geom.type === 'Point') {
            const coords = geom.coordinates as number[];
            arcGeometry = new Point({ longitude: coords[0], latitude: coords[1], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'LineString') {
            const coords = geom.coordinates as number[][];
            arcGeometry = new Polyline({ paths: [coords], spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'Polygon') {
            const coords = geom.coordinates as number[][][];
            arcGeometry = new Polygon({ rings: coords, spatialReference: { wkid: 4326 } });
          } else if (geom.type === 'MultiPolygon') {
            const multiCoords = geom.coordinates as number[][][][];
            for (const polyCoords of multiCoords) {
              const poly = new Polygon({ rings: polyCoords, spatialReference: { wkid: 4326 } });
              const g = new Graphic({
                geometry: poly,
                symbol: new SimpleFillSymbol({
                  color: [255, 152, 0, 100],
                  outline: new SimpleLineSymbol({ color: [255, 152, 0, 255], width: 2 }),
                }),
                attributes: feature.properties,
              });
              importLayer.add(g);
              addedGraphics.push(g);
            }
            continue;
          }
          if (arcGeometry) {
            const graphic = new Graphic({
              geometry: arcGeometry,
              symbol: arcGeometry.type === 'point'
                ? new SimpleMarkerSymbol({ color: [255, 152, 0], size: 8 })
                : arcGeometry.type === 'polyline'
                  ? new SimpleLineSymbol({ color: [255, 152, 0, 255], width: 2 })
                  : new SimpleFillSymbol({
                      color: [255, 152, 0, 100],
                      outline: new SimpleLineSymbol({ color: [255, 152, 0, 255], width: 2 }),
                    }),
              attributes: feature.properties,
            });
            importLayer.add(graphic);
            addedGraphics.push(graphic);
          }
        }
        console.log('GPX imported:', addedGraphics.length, 'features');
        if (onGPXImported) onGPXImported(addedGraphics);
      } catch (error) {
        console.error('GPX import failed:', error);
      }
    };
    input.click();
  }, [onGPXImported]);

  const handleExportDXFTool = useCallback((view: MapView) => {
    const geometries: object[] = [];
    view.map?.allLayers.forEach((layer) => {
      if (layer instanceof GraphicsLayer && layer.visible) {
        layer.graphics.forEach((graphic) => {
          if (graphic.geometry) {
            geometries.push(graphic.geometry.toJSON());
          }
        });
      }
    });

    if (geometries.length === 0) {
      console.warn('Export DXF: Nenhuma geometria visivel para exportar');
      return;
    }

    exportDXF(geometries)
      .then(() => {
        console.log('DXF exported successfully');
        if (onDXFExported) onDXFExported(true);
      })
      .catch((error) => {
        console.error('DXF export failed:', error);
        if (onDXFExported) onDXFExported(false);
      });
  }, [onDXFExported]);

  const handleExportGeoJSONTool = useCallback((view: MapView) => {
    const allGeometries: unknown[] = [];
    view.map?.allLayers.forEach((layer) => {
      if (layer instanceof GraphicsLayer) {
        layer.graphics.forEach((graphic) => {
          if (graphic.geometry) {
            allGeometries.push(graphic.geometry.toJSON());
          }
        });
      }
    });

    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: allGeometries.map((geom, i) => ({
        type: 'Feature',
        id: i,
        geometry: geom,
        properties: {},
      })),
    }, null, 2);

    if (onGeoJSONExported) onGeoJSONExported(geojson);
  }, [onGeoJSONExported]);

  // ==================== COORDINATES TOOL HANDLERS (3) ====================

  const handleCoordConverterTool = useCallback((view: MapView) => {
    const handler = view.on('click', (event) => {
      const lon = event.mapPoint.longitude;
      const lat = event.mapPoint.latitude;

      if (isValidBrazilCoordinate(lon, lat)) {
        const [easting, northing] = geographicToSIRGASUTM(lon, lat);
        const dmsLon = toDMS(lon, false);
        const dmsLat = toDMS(lat, true);

        console.log(`Geographic: ${lon.toFixed(8)}, ${lat.toFixed(8)}`);
        console.log(`DMS: ${dmsLon}, ${dmsLat}`);
        console.log(`UTM SIRGAS: E=${easting.toFixed(3)}, N=${northing.toFixed(3)}`);

        if (onCoordsConverted) {
          onCoordsConverted({
            from: 'EPSG:4326',
            to: 'SIRGAS 2000 UTM',
            coords: [easting, northing],
          });
        }
      }
    });
    handlersRef.current.push(handler);
  }, [onCoordsConverted]);

  const handleAddPointTool = useCallback((view: MapView) => {
    const coordsLayer = getOrCreateToolLayer(view, 'coords-layer');
    const handler = view.on('click', (event) => {
      const point = event.mapPoint;
      coordsLayer.add(new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          color: [255, 0, 0],
          size: 10,
          outline: new SimpleLineSymbol({ color: [255, 255, 255], width: 2 }),
        }),
      }));
      if (onPointAdded) onPointAdded(point);
    });
    handlersRef.current.push(handler);
  }, [onPointAdded]);

  const handleCoordGridTool = useCallback((_view: MapView) => {
    console.log('Coordinate Grid: Alternando grade de coordenadas');
    if (onGridToggled) onGridToggled(true);
  }, [onGridToggled]);

  // ==================== SIGEF TOOL HANDLERS (3) ====================

  const handleSIGEFValidatorTool = useCallback((view: MapView) => {
    const polygon = findSelectedPolygon(view);
    if (!polygon) {
      console.warn('SIGEF Validator: Nenhum poligono encontrado no mapa');
      return;
    }

    // Convert polygon to WKT
    const ring = polygon.rings[0];
    const wktCoords = ring.map((pt: number[]) => `${pt[0]} ${pt[1]}`).join(', ');
    const geomWkt = `POLYGON((${wktCoords}))`;

    // Calculate area in hectares
    const areaM2 = Math.abs(geometryEngine.planarArea(polygon, 'square-meters'));
    const areaHectares = areaM2 / 10000;

    // Convert vertices to SIRGAS UTM
    const verticesSirgas = ring.map((pt: number[]) => {
      const [easting, northing] = geographicToSIRGASUTM(pt[0], pt[1]);
      return [easting, northing];
    });

    validateSIGEF(geomWkt, areaHectares, verticesSirgas)
      .then((result) => {
        console.log('SIGEF validation result:', result);
        if (onSIGEFValidated) onSIGEFValidated(result);
      })
      .catch((error) => {
        console.error('SIGEF validation failed:', error);
      });
  }, [onSIGEFValidated]);

  const handleMemorialTool = useCallback((view: MapView) => {
    const polygon = findSelectedPolygon(view);
    if (!polygon) {
      console.warn('Memorial: Nenhum poligono encontrado no mapa');
      return;
    }

    const ring = polygon.rings[0];
    const vertices = ring.map((pt: number[]) => [pt[0], pt[1]]);
    const areaM2 = Math.abs(geometryEngine.planarArea(polygon, 'square-meters'));

    generateMemorial(vertices, areaM2)
      .then((result) => {
        console.log('Memorial generated successfully');
        if (onMemorialGenerated) onMemorialGenerated(result.memorial);
      })
      .catch((error) => {
        console.error('Memorial generation failed:', error);
      });
  }, [onMemorialGenerated]);

  const handleVerticesSIRGASTool = useCallback((view: MapView) => {
    const polygon = findSelectedPolygon(view);
    if (!polygon) {
      console.warn('Vertices SIRGAS: Nenhum poligono encontrado no mapa');
      return;
    }

    const ring = polygon.rings[0];
    const vertices = ring.map((pt: number[]) => [pt[0], pt[1]]);

    getVerticesSIRGAS(vertices)
      .then((result) => {
        console.log('Vertices SIRGAS export result:', result);
        if (onVerticesExported) onVerticesExported(vertices);
      })
      .catch((error) => {
        console.error('Vertices SIRGAS export failed:', error);
      });
  }, [onVerticesExported]);

  // ==================== MAP INITIALIZATION (runs once) ====================

  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = import.meta.env.VITE_ESRI_API_KEY;
    if (apiKey) esriConfig.apiKey = apiKey;

    const map = new ArcGISMap({ basemap });

    const layerInstances = new Map<string, GraphicsLayer>();
    layers.forEach((layerData) => {
      const graphicsLayer = new GraphicsLayer({
        id: layerData.id,
        title: layerData.label,
        opacity: layerData.opacity / 100,
        visible: layerData.visible,
      });

      const symbol = getSymbolForLayer(layerData);
      layerData.graphics.forEach((graphic) => {
        // Clone graphics to avoid reuse issues across map lifecycles
        const cloned = graphic.clone();
        if (cloned.geometry?.type === 'polygon') {
          cloned.symbol = symbol.fill;
        } else if (cloned.geometry?.type === 'polyline') {
          cloned.symbol = symbol.line;
        } else if (cloned.geometry?.type === 'point') {
          cloned.symbol = symbol.point;
        }
        graphicsLayer.add(cloned);
      });

      map.add(graphicsLayer);
      layerInstances.set(layerData.id, graphicsLayer);
    });

    layersRef.current = layerInstances;

    const view = new MapView({
      container: mapRef.current,
      map,
      center: initialCenter,
      zoom: initialZoom,
    });

    viewRef.current = view;

    return () => {
      cleanupHandlers();
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  // ==================== TOOL ACTIVATION (runs when activeTool changes) ====================

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Cleanup previous tool handlers
    cleanupHandlers();

    // Wait for the view to be ready before activating tools
    view.when(() => {
      switch (activeTool) {
        // Existing (4)
        case 'measure': handleMeasureTool(view); break;
        case 'area': handleAreaTool(view); break;
        case 'snap': handleSnapTool(view); break;
        case 'edit': handleEditTool(view); break;

        // Simple Drawing (2)
        case 'draw-line': handleDrawLineTool(view); break;
        case 'draw-polyline': handleDrawPolylineTool(view); break;

        // Drawing (7)
        case 'split': handleSplitTool(view); break;
        case 'merge': handleMergeTool(view); break;
        case 'buffer': handleBufferTool(view); break;
        case 'offset': handleOffsetTool(view); break;
        case 'extend': handleExtendTool(view); break;
        case 'trim': handleTrimTool(view); break;
        case 'fillet': handleFilletTool(view); break;

        // Analysis (7)
        case 'intersect': handleIntersectTool(view); break;
        case 'union': handleUnionTool(view); break;
        case 'difference': handleDifferenceTool(view); break;
        case 'symmetric-diff': handleSymmetricDiffTool(view); break;
        case 'convex-hull': handleConvexHullTool(view); break;
        case 'centroid': handleCentroidTool(view); break;
        case 'perimeter': handlePerimeterTool(view); break;

        // Measurement (5)
        case 'angle': handleAngleTool(view); break;
        case 'azimuth': handleAzimuthTool(view); break;
        case 'coords-display': handleCoordsDisplayTool(view); break;
        case 'elevation': handleElevationTool(view); break;
        case 'slope': handleSlopeTool(view); break;

        // Topology (5)
        case 'validate-topology': handleValidateTopologyTool(view); break;
        case 'close-gaps': handleCloseGapsTool(view); break;
        case 'remove-slivers': handleRemoveSliversTool(view); break;
        case 'simplify': handleSimplifyTool(view); break;
        case 'densify': handleDensifyTool(view); break;

        // Annotation (4)
        case 'label': handleLabelTool(view); break;
        case 'dimension': handleDimensionTool(view); break;
        case 'north-arrow': handleNorthArrowTool(view); break;
        case 'scale-bar': handleScaleBarTool(view); break;

        // Selection (4)
        case 'select-rect': handleSelectRectTool(view); break;
        case 'select-polygon': handleSelectPolygonTool(view); break;
        case 'select-distance': handleSelectDistanceTool(view); break;
        case 'select-attribute': handleSelectAttributeTool(view); break;

        // Import/Export (5)
        case 'import-kml': handleImportKMLTool(view); break;
        case 'import-shp': handleImportShpTool(view); break;
        case 'import-gpx': handleImportGPXTool(view); break;
        case 'export-dxf': handleExportDXFTool(view); break;
        case 'export-geojson': handleExportGeoJSONTool(view); break;

        // Coordinates (3)
        case 'coord-converter': handleCoordConverterTool(view); break;
        case 'add-point': handleAddPointTool(view); break;
        case 'coord-grid': handleCoordGridTool(view); break;

        // SIGEF (3)
        case 'sigef-validator': handleSIGEFValidatorTool(view); break;
        case 'memorial': handleMemorialTool(view); break;
        case 'vertices-sirgas': handleVerticesSIRGASTool(view); break;

        default: break;
      }
    });

    return () => {
      cleanupHandlers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  // Update layer opacity/visibility when state changes (without recreating map)
  useEffect(() => {
    layers.forEach((layerData) => {
      const graphicsLayer = layersRef.current.get(layerData.id);
      if (graphicsLayer) {
        graphicsLayer.opacity = layerData.opacity / 100;
        graphicsLayer.visible = layerData.visible;
      }
    });
  }, [layers]);

  const toolDescription = activeTool ? TOOL_DESCRIPTIONS[activeTool] || 'Ferramenta ativa' : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />

      {/* Tool Info Overlay - REMOVED */}

      {/* Help Text */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <strong>Layers:</strong> {layers.filter((l) => l.visible).length}/{layers.length} visiveis
      </div>
    </div>
  );
}
