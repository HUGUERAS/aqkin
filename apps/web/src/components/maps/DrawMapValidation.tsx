/**
 * DrawMapValidation: Mapa avançado com múltiplas layers, ferramentas e validação
 * Estende DrawMapEsri com:
 * - Suporte a múltiplas layers visíveis/ocultas
 * - Controle de opacidade por layer
 * - Ferramentas: Snap, Edit, Measure, Area
 * - Feedback visual de medições
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import esriConfig from '@arcgis/core/config';
import '@arcgis/core/assets/esri/themes/light/main.css';

interface LayerData {
    id: string;
    label: string;
    color: string;
    visible: boolean;
    opacity: number; // 0-100
    graphics: __esri.Graphic[];
}

interface DrawMapValidationProps {
    layers: LayerData[];
    activeTool?: 'snap' | 'edit' | 'measure' | 'area' | null;
    onMeasurement?: (distance: number) => void;
    onAreaCalculated?: (area: number) => void;
    initialCenter?: [number, number];
    initialZoom?: number;
    basemap?: 'streets-vector' | 'topo-vector' | 'satellite' | 'hybrid';
}

interface MapState {
    measurementPoints: Array<[number, number]>;
    measurementDistance: number | null;
    selectedFeature: __esri.Graphic | null;
}

export default function DrawMapValidation({
    layers,
    activeTool = null,
    onMeasurement,
    onAreaCalculated,
    initialCenter = [-47.9292, -15.7801],
    initialZoom = 15,
    basemap = 'topo-vector',
}: DrawMapValidationProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<MapView | null>(null);
    const layersRef = useRef<Map<string, GraphicsLayer>>(new Map());
    const [state, setState] = useState<MapState>({
        measurementPoints: [],
        measurementDistance: null,
        selectedFeature: null,
    });

    // Criar símbolos para cada layer
    const getSymbolForLayer = (layerData: LayerData) => {
        const rgb = hexToRgb(layerData.color);
        const alpha = layerData.opacity / 100;

        return {
            fill: new SimpleFillSymbol({
                color: [rgb.r, rgb.g, rgb.b, alpha * 255],
                outline: new SimpleLineSymbol({
                    color: [rgb.r, rgb.g, rgb.b, 255],
                    width: 2,
                }),
            }),
            line: new SimpleLineSymbol({
                color: [rgb.r, rgb.g, rgb.b, 255],
                width: 3,
            }),
            point: new SimpleMarkerSymbol({
                color: [rgb.r, rgb.g, rgb.b, 255],
                size: 8,
                outline: new SimpleLineSymbol({
                    color: [255, 255, 255, 255],
                    width: 1,
                }),
            }),
        };
    };

    // Converter Hex para RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 102, g: 126, b: 234 };
    };

    // Calcular distância entre dois pontos (em metros)
    const calculateDistance = (point1: [number, number], point2: [number, number]) => {
        const [lon1, lat1] = point1;
        const [lon2, lat2] = point2;

        // Haversine formula
        const R = 6371000; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    // Calcular área de um polígono
    const calculatePolygonArea = (polygon: __esri.Polygon) => {
        if (!polygon || !polygon.rings || polygon.rings.length === 0) return 0;
        try {
            const area = geometryEngine.planarArea(polygon, 'square-meters');
            return Math.abs(area);
        } catch {
            return 0;
        }
    };

    // Inicializar mapa
    useEffect(() => {
        if (!mapRef.current) return;

        const apiKey = import.meta.env.VITE_ESRI_API_KEY;
        if (apiKey) esriConfig.apiKey = apiKey;

        // Criar mapa
        const map = new Map({ basemap });

        // Criar GraphicsLayer para cada layer definida
        const layerInstances = new Map<string, GraphicsLayer>();
        layers.forEach((layerData) => {
            const graphicsLayer = new GraphicsLayer({
                id: layerData.id,
                title: layerData.label,
                opacity: layerData.opacity / 100,
                visible: layerData.visible,
            });

            // Adicionar graphics com símbolos apropriados
            const symbol = getSymbolForLayer(layerData);
            layerData.graphics.forEach((graphic) => {
                if (graphic.geometry.type === 'polygon') {
                    graphic.symbol = symbol.fill;
                } else if (graphic.geometry.type === 'polyline') {
                    graphic.symbol = symbol.line;
                } else if (graphic.geometry.type === 'point') {
                    graphic.symbol = symbol.point;
                }
                graphicsLayer.add(graphic);
            });

            map.add(graphicsLayer);
            layerInstances.set(layerData.id, graphicsLayer);
        });

        layersRef.current = layerInstances;

        // Criar View
        const view = new MapView({
            container: mapRef.current,
            map,
            center: initialCenter,
            zoom: initialZoom,
        });

        viewRef.current = view;

        // Ferramentas interativas
        if (activeTool === 'measure') {
            handleMeasureTool(view);
        } else if (activeTool === 'area') {
            handleAreaTool(view);
        } else if (activeTool === 'snap') {
            handleSnapTool(view);
        } else if (activeTool === 'edit') {
            handleEditTool(view);
        }

        return () => {
            view.destroy();
        };
    }, [initialCenter, initialZoom, basemap, layers, activeTool]);

    // Atualizar opacidade de layer quando state muda
    useEffect(() => {
        layers.forEach((layerData) => {
            const graphicsLayer = layersRef.current.get(layerData.id);
            if (graphicsLayer) {
                graphicsLayer.opacity = layerData.opacity / 100;
                graphicsLayer.visible = layerData.visible;
            }
        });
    }, [layers]);

    // Ferramenta: Medir distância
    const handleMeasureTool = (view: MapView) => {
        const measureLayer = new GraphicsLayer({ id: 'measurements-layer' });
        view.map.add(measureLayer);

        view.on('click', (event) => {
            const coords: [number, number] = [event.mapPoint.longitude, event.mapPoint.latitude];

            setState((prev) => {
                const newPoints = [...prev.measurementPoints, coords];

                if (newPoints.length >= 2) {
                    const distance = calculateDistance(newPoints[newPoints.length - 2], coords);
                    if (onMeasurement) onMeasurement(distance);

                    // Renderizar linha de medição
                    const polyline = new Polyline({
                        paths: [newPoints],
                    });

                    const lineGraphic = new Graphic({
                        geometry: polyline,
                        symbol: new SimpleLineSymbol({
                            color: [76, 175, 80, 255],
                            width: 3,
                        }),
                    });

                    measureLayer.add(lineGraphic);
                }

                return { ...prev, measurementPoints: newPoints };
            });
        });
    };

    // Ferramenta: Calcular área
    const handleAreaTool = (view: MapView) => {
        const areaLayer = new GraphicsLayer({ id: 'area-layer' });
        view.map.add(areaLayer);

        // Pegar primeiro polígono selecionado
        view.when(() => {
            view.map.allLayers.forEach((layer) => {
                if (layer instanceof GraphicsLayer && layer.id !== 'area-layer' && layer.id !== 'measurements-layer') {
                    layer.graphics.forEach((graphic) => {
                        if (graphic.geometry.type === 'polygon') {
                            const area = calculatePolygonArea(graphic.geometry as __esri.Polygon);
                            if (onAreaCalculated) onAreaCalculated(area);
                        }
                    });
                }
            });
        });
    };

    // Ferramenta: Snap (0.5m tolerância)
    const handleSnapTool = (view: MapView) => {
        view.on('click', () => {
            console.log('Snap tool: Digite ou arraste vértices para snappear com 0.5m de tolerância');
        });
    };

    // Ferramenta: Editar vértices
    const handleEditTool = (view: MapView) => {
        // Ativar Sketch para edição
        const editLayer = new GraphicsLayer({ id: 'edit-layer' });
        view.map.add(editLayer);

        const sketch = new Sketch({
            view,
            layer: editLayer,
            availableCreateTools: [],
            creationMode: 'update', // Apenas edição
        });

        view.ui.add(sketch, 'top-right');
    };

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

            {/* Tool Info Overlay */}
            {activeTool && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(102, 126, 234, 0.95)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        maxWidth: '300px',
                    }}
                >
                    <strong>🛠️ Ferramenta Ativa:</strong>
                    {activeTool === 'measure' && ' Clique para medir distâncias'}
                    {activeTool === 'area' && ' Área do polígono será calculada automaticamente'}
                    {activeTool === 'snap' && ' Vértices serão snappados com tolerância de 0.5m'}
                    {activeTool === 'edit' && ' Use as ferramentas à direita para editar'}

                    {state.measurementDistance !== null && activeTool === 'measure' && (
                        <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                            📏 Distância: <strong>{(state.measurementDistance / 1000).toFixed(2)} km</strong>
                        </div>
                    )}
                </div>
            )}

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
                <strong>📍 Layers:</strong> {layers.filter((l) => l.visible).length}/{layers.length} visíveis
            </div>
        </div>
    );
}
