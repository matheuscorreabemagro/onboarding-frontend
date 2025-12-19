'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';

// Define o token de acesso do Mapbox (use variável de ambiente)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const features = useMapStore((state) => state.features);
  const isDrawing = useMapStore((state) => state.isDrawing);
  const drawingPoints = useMapStore((state) => state.drawingPoints);
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId);
  const hoveredFeatureId = useMapStore((state) => state.hoveredFeatureId);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hasFitBoundsRef = useRef(false);
  const mapLoadedRef = useRef(false);

  // Inicializa o mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.9292, -15.7801],
      zoom: 4,
    });

    map.on('load', () => {
      // Source e layer para linhas carregadas/finalizadas
      map.addSource('lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'lines-layer',
        type: 'line',
        source: 'lines',
        paint: {
          'line-color': '#3388ff',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      // Source e layer para preview da linha sendo desenhada
      map.addSource('drawing-preview', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'drawing-preview-layer',
        type: 'line',
        source: 'drawing-preview',
        paint: {
          'line-color': '#9333ea', // roxo
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2], // pontilhada
        },
      });

      mapLoadedRef.current = true;
      
      // Força o registro inicial dos handlers
      setTimeout(() => {
      }, 100);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  // Manipula cliques no mapa para adicionar pontos no modo desenho ou selecionar linhas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Aguarda o mapa carregar
    const setupHandlers = () => {
      if (!mapLoadedRef.current) return;

      const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
        // Sempre pega o valor atual do store, não o valor do closure
        const currentIsDrawing = useMapStore.getState().isDrawing;
        
        // Se estiver no modo desenho, adiciona ponto
        if (currentIsDrawing) {
          const { lng, lat } = e.lngLat;
          useMapStore.getState().addDrawingPoint([lng, lat]);
          return;
        }

        // Se não estiver desenhando, verifica se clicou em uma linha
        if (!map.getLayer('lines-layer')) return;
        
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['lines-layer'],
        });

        if (features.length > 0) {
          const featureId = features[0].properties?.id;
          useMapStore.getState().selectFeature(featureId);
        } else {
          // Clicou fora de qualquer linha, deseleciona
          useMapStore.getState().selectFeature(null);
        }
      };

      const handleMapDblClick = (e: mapboxgl.MapMouseEvent) => {
        const currentIsDrawing = useMapStore.getState().isDrawing;
        if (!currentIsDrawing) return;

        e.preventDefault();
        useMapStore.getState().finishDrawing();
      };

      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDblClick);
      map.on('click', handleMapClick);
      map.on('dblclick', handleMapDblClick);
    };

    if (mapLoadedRef.current) {
      setupHandlers();
    } else {
      map.once('load', setupHandlers);
    }

    return () => {
      // Cleanup será feito quando o componente desmontar
    };
  }, []);

  // Gerencia hover sobre linhas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupHoverHandlers = () => {
      if (!mapLoadedRef.current || !map.getLayer('lines-layer')) return;

      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['lines-layer'],
        });

        const currentIsDrawing = useMapStore.getState().isDrawing;

        if (features.length > 0) {
          const featureId = features[0].properties?.id;
          useMapStore.getState().setHoveredFeatureId(featureId);
          map.getCanvas().style.cursor = 'pointer';
        } else {
          useMapStore.getState().setHoveredFeatureId(null);
          map.getCanvas().style.cursor = currentIsDrawing ? 'crosshair' : '';
        }
      };

      const handleMouseLeave = () => {
        const currentIsDrawing = useMapStore.getState().isDrawing;
        useMapStore.getState().setHoveredFeatureId(null);
        map.getCanvas().style.cursor = currentIsDrawing ? 'crosshair' : '';
      };

      map.off('mousemove', handleMouseMove);
      map.off('mouseleave', 'lines-layer', handleMouseLeave);
      map.on('mousemove', handleMouseMove);
      map.on('mouseleave', 'lines-layer', handleMouseLeave);
    };

    if (mapLoadedRef.current) {
      setupHoverHandlers();
    } else {
      map.once('load', setupHoverHandlers);
    }

    return () => {
      // Cleanup será feito quando o componente desmontar
    };
  }, []); // Sem dependências pois agora usa getState()

  // Atualiza estilos dinâmicos do layer baseado em seleção e hover
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current || !map.getLayer('lines-layer')) return;

    map.setPaintProperty('lines-layer', 'line-color', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      '#ef4444', // vermelho para selecionada
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      '#fbbf24', // amarelo para hover
      ['==', ['get', 'source'], 'uploaded'],
      '#3388ff', // azul para GeoJSON
      '#22c55e', // verde para desenhadas
    ]);

    map.setPaintProperty('lines-layer', 'line-width', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      5, // selecionada
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      4, // hover
      3, // normal
    ]);

    map.setPaintProperty('lines-layer', 'line-opacity', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      1.0, // selecionada
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      1.0, // hover
      0.8, // normal
    ]);
  }, [selectedFeatureId, hoveredFeatureId]);

  // Listener de teclado para remover linha selecionada (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFeatureId && !isDrawing) {
        e.preventDefault();
        const removeFeature = useMapStore.getState().removeFeature;
        removeFeature(selectedFeatureId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFeatureId, isDrawing]);

  // Atualiza o preview da linha conforme pontos são adicionados
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const source = map.getSource('drawing-preview') as mapboxgl.GeoJSONSource;
    if (!source) return;

    if (drawingPoints.length >= 2) {
      const previewData = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: drawingPoints,
            },
            properties: {},
          },
        ],
      };
      source.setData(previewData);
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [drawingPoints]);

  // Atualiza o cursor conforme o modo de desenho
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const canvas = map.getCanvas();
    if (isDrawing) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = '';
    }
  }, [isDrawing]);

  // Atualiza as features no mapa sempre que mudarem
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    const source = map.getSource('lines') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: features.map((f) => ({
        type: 'Feature' as const,
        geometry: f.geometry,
        properties: { ...f.properties, id: f.id, source: f.type },
      })),
    };

    source.setData(geojsonData);

    // Faz fit bounds apenas na primeira vez que tiver features
    if (features.length > 0 && !hasFitBoundsRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach((feature) => {
        feature.geometry.coordinates.forEach((coord) => {
          bounds.extend(coord as [number, number]);
        });
      });
      map.fitBounds(bounds, { padding: 100, duration: 1500, maxZoom: 15 });
      hasFitBoundsRef.current = true;
    }
  }, [features]);

  // Renderiza a div que será o container do mapa
  return (
    <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} className="relative" />
  );
};

export default MapComponent;
