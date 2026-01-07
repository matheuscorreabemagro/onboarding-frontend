import { useEffect, RefObject, useRef } from 'react';
import { useMapStore } from '../store/mapStore';
import type { FeatureCollection } from 'geojson';

interface UseLayerRenderingProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
}

export const useLayerRendering = ({ mapRef, mapLoadedRef }: UseLayerRenderingProps) => {
  const layers = useMapStore((state) => state.layers);
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId);
  const hoveredFeatureId = useMapStore((state) => state.hoveredFeatureId);
  
  // Guardar estado anterior das layers para detectar remoções e mudanças de visibilidade
  const prevLayersRef = useRef<Map<string, { isVisible: boolean }>>(new Map());
  
  // Criar um hash das features para detectar mudanças
  const featuresHash = layers.map(l => `${l.id}:${l.features.length}:${l.isVisible}`).join('|');

  // Efeito 1: Criar/remover layers (só quando layers array mudar)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    // IDs das layers atuais
    const currentLayerIds = new Set(layers.map(l => l.id));
    const prevLayerIds = new Set(prevLayersRef.current.keys());
    
    // Encontrar layers que foram removidas
    const removedLayerIds = Array.from(prevLayerIds).filter(
      id => !currentLayerIds.has(id)
    );
    
    // Encontrar layers que ficaram invisíveis
    const invisibleLayerIds = layers
      .filter(layer => !layer.isVisible)
      .map(layer => layer.id);
    
    // Combinar: remover layers deletadas + layers invisíveis + layers visíveis (para recriar com novos dados)
    const visibleLayerIds = layers
      .filter(layer => layer.isVisible)
      .map(layer => layer.id);
    
    const layersToRemove = [...new Set([...removedLayerIds, ...invisibleLayerIds, ...visibleLayerIds])];
    
    
    // Remover layers (todas as layers existentes)
    layersToRemove.forEach((layerId) => {
      const sourceId = `source-${layerId}`;
      const layerPrefix = `layer-${layerId}`;
      
      // Lista de todas as possíveis layers
      const possibleLayers = [
        // Base layers
        `${layerPrefix}-fill`,
        `${layerPrefix}-outline`,
        `${layerPrefix}-line`,
        `${layerPrefix}-point`,
        // Hover layers
        `${layerPrefix}-hover-fill`,
        `${layerPrefix}-hover-outline`,
        `${layerPrefix}-hover-line`,
        `${layerPrefix}-hover-point`,
        // Selected layers
        `${layerPrefix}-selected-fill`,
        `${layerPrefix}-selected-outline`,
        `${layerPrefix}-selected-line`,
        `${layerPrefix}-selected-point`,
        // Legacy layers
        `${layerPrefix}-selected`,
        `${layerPrefix}-hover`,
        layerPrefix,
      ];
      
      // Remove todas as layers
      possibleLayers.forEach(lyrId => {
        if (map.getLayer(lyrId)) {
          map.removeLayer(lyrId);
        }
      });
      
      // Remove a source
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
    
    // Atualizar o Map com o estado atual das layers
    const newLayersState = new Map(
      layers.map(layer => [layer.id, { isVisible: layer.isVisible }])
    );
    prevLayersRef.current = newLayersState;

    // Adiciona camadas na ordem correta (por zIndex)
    const sortedLayers = [...layers]
      .filter(layer => layer.isVisible)
      .sort((a, b) => a.zIndex - b.zIndex); // Inativas embaixo, ativa no topo

    sortedLayers.forEach((layer) => {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: layer.features.map(f => ({
          type: 'Feature',
          id: f.id,
          geometry: f.geometry,
          properties: { ...f.properties, layerId: layer.id, originalId: f.id },
        })),
      };

      const sourceId = `source-${layer.id}`;
      const layerId = `layer-${layer.id}`;

      // Adiciona source (verifica se já existe)
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        });
      }

      // Determina o tipo predominante de geometria na camada
      const geometryTypes = new Set(layer.features.map(f => f.geometry.type));
      const hasPoint = geometryTypes.has('Point') || geometryTypes.has('MultiPoint');
      const hasLine = geometryTypes.has('LineString') || geometryTypes.has('MultiLineString');
      const hasPolygon = geometryTypes.has('Polygon') || geometryTypes.has('MultiPolygon');

      // Adiciona layers baseado nos tipos de geometria
      // POLYGONS - Fill e Outline
      if (hasPolygon) {
        if (!map.getLayer(`${layerId}-fill`)) {
          map.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: sourceId,
            filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
            paint: {
              'fill-color': layer.isActive ? '#3B82F6' : layer.color,
              'fill-opacity': layer.isActive ? 0.3 : 0.2,
            },
          });
        }
        
        if (!map.getLayer(`${layerId}-outline`)) {
          map.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: sourceId,
            filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
            paint: {
              'line-color': layer.isActive ? '#3B82F6' : layer.color,
              'line-width': layer.isActive ? 2 : 1.5,
              'line-opacity': layer.opacity,
            },
          });
        }
      }

      // LINES
      if (hasLine) {
        if (!map.getLayer(`${layerId}-line`)) {
          map.addLayer({
            id: `${layerId}-line`,
            type: 'line',
            source: sourceId,
            filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            paint: {
              'line-color': layer.isActive ? '#3B82F6' : layer.color,
              'line-width': layer.isActive ? 3 : 2,
              'line-opacity': layer.opacity,
            },
          });
        }
      }

      // POINTS
      if (hasPoint) {
        if (!map.getLayer(`${layerId}-point`)) {
          map.addLayer({
            id: `${layerId}-point`,
            type: 'circle',
            source: sourceId,
            filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
            paint: {
              'circle-color': layer.isActive ? '#3B82F6' : layer.color,
              'circle-radius': layer.isActive ? 6 : 5,
              'circle-opacity': layer.opacity,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
            },
          });
        }
      }

      // Layer de hover/seleção (apenas para camada ativa)
      if (layer.isActive) {
        // Hover para Polygon
        if (hasPolygon) {
          if (!map.getLayer(`${layerId}-hover-fill`)) {
            map.addLayer({
              id: `${layerId}-hover-fill`,
              type: 'fill',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              paint: {
                'fill-color': '#fbbf24',
                'fill-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
          
          if (!map.getLayer(`${layerId}-hover-outline`)) {
            map.addLayer({
              id: `${layerId}-hover-outline`,
              type: 'line',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              paint: {
                'line-color': '#fbbf24',
                'line-width': 3,
                'line-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
        }
        
        // Hover para Line
        if (hasLine) {
          if (!map.getLayer(`${layerId}-hover-line`)) {
            map.addLayer({
              id: `${layerId}-hover-line`,
              type: 'line',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
              paint: {
                'line-color': '#fbbf24',
                'line-width': 4,
                'line-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
        }
        
        // Hover para Point
        if (hasPoint) {
          if (!map.getLayer(`${layerId}-hover-point`)) {
            map.addLayer({
              id: `${layerId}-hover-point`,
              type: 'circle',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
              paint: {
                'circle-color': '#fbbf24',
                'circle-radius': 8,
                'circle-opacity': 0, // Será atualizado pelo segundo useEffect
                'circle-stroke-color': '#fbbf24',
                'circle-stroke-width': 2,
              },
            });
          }
        }

        // Selected para Polygon
        if (hasPolygon) {
          if (!map.getLayer(`${layerId}-selected-fill`)) {
            map.addLayer({
              id: `${layerId}-selected-fill`,
              type: 'fill',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              paint: {
                'fill-color': '#ef4444',
                'fill-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
          
          if (!map.getLayer(`${layerId}-selected-outline`)) {
            map.addLayer({
              id: `${layerId}-selected-outline`,
              type: 'line',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
              paint: {
                'line-color': '#ef4444',
                'line-width': 4,
                'line-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
        }
        
        // Selected para Line
        if (hasLine) {
          if (!map.getLayer(`${layerId}-selected-line`)) {
            map.addLayer({
              id: `${layerId}-selected-line`,
              type: 'line',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
              paint: {
                'line-color': '#ef4444',
                'line-width': 5,
                'line-opacity': 0, // Será atualizado pelo segundo useEffect
              },
            });
          }
        }
        
        // Selected para Point
        if (hasPoint) {
          if (!map.getLayer(`${layerId}-selected-point`)) {
            map.addLayer({
              id: `${layerId}-selected-point`,
              type: 'circle',
              source: sourceId,
              filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
              paint: {
                'circle-color': '#ef4444',
                'circle-radius': 9,
                'circle-opacity': 0, // Será atualizado pelo segundo useEffect
                'circle-stroke-color': '#ef4444',
                'circle-stroke-width': 3,
              },
            });
          }
        }
      }
    });
  }, [layers, mapRef, mapLoadedRef, featuresHash]);

  // Efeito 2: Atualizar apenas hover/selected states (não recria layers)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    layers.forEach((layer) => {
      if (!layer.isVisible) return; // Apenas pula se a layer estiver invisível

      const layerId = `layer-${layer.id}`;
      
      // Determina os tipos de geometria
      const geometryTypes = new Set(layer.features.map(f => f.geometry.type));
      const hasPoint = geometryTypes.has('Point') || geometryTypes.has('MultiPoint');
      const hasLine = geometryTypes.has('LineString') || geometryTypes.has('MultiLineString');
      const hasPolygon = geometryTypes.has('Polygon') || geometryTypes.has('MultiPolygon');
      
      // Atualiza hover para Polygon
      if (hasPolygon) {
        const hoverFillId = `${layerId}-hover-fill`;
        const hoverOutlineId = `${layerId}-hover-outline`;
        
        if (map.getLayer(hoverFillId)) {
          map.setPaintProperty(hoverFillId, 'fill-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', hoveredFeatureId || '']],
            0.4,
            0,
          ]);
        }
        
        if (map.getLayer(hoverOutlineId)) {
          map.setPaintProperty(hoverOutlineId, 'line-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', hoveredFeatureId || '']],
            1,
            0,
          ]);
        }
      }
      
      // Atualiza hover para Line
      if (hasLine) {
        const hoverLineId = `${layerId}-hover-line`;
        if (map.getLayer(hoverLineId)) {
          map.setPaintProperty(hoverLineId, 'line-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', hoveredFeatureId || '']],
            1,
            0,
          ]);
        }
      }
      
      // Atualiza hover para Point
      if (hasPoint) {
        const hoverPointId = `${layerId}-hover-point`;
        if (map.getLayer(hoverPointId)) {
          map.setPaintProperty(hoverPointId, 'circle-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', hoveredFeatureId || '']],
            0.8,
            0,
          ]);
        }
      }

      // Atualiza selected para Polygon
      if (hasPolygon) {
        const selectedFillId = `${layerId}-selected-fill`;
        const selectedOutlineId = `${layerId}-selected-outline`;
        
        if (map.getLayer(selectedFillId)) {
          map.setPaintProperty(selectedFillId, 'fill-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', selectedFeatureId || '']],
            0.3,
            0,
          ]);
        }
        
        if (map.getLayer(selectedOutlineId)) {
          map.setPaintProperty(selectedOutlineId, 'line-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', selectedFeatureId || '']],
            1,
            0,
          ]);
        }
      }
      
      // Atualiza selected para Line
      if (hasLine) {
        const selectedLineId = `${layerId}-selected-line`;
        if (map.getLayer(selectedLineId)) {
          map.setPaintProperty(selectedLineId, 'line-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', selectedFeatureId || '']],
            1,
            0,
          ]);
        }
      }
      
      // Atualiza selected para Point
      if (hasPoint) {
        const selectedPointId = `${layerId}-selected-point`;
        if (map.getLayer(selectedPointId)) {
          map.setPaintProperty(selectedPointId, 'circle-opacity', [
            'case',
            ['==', ['get', 'originalId'], ['literal', selectedFeatureId || '']],
            0.9,
            0,
          ]);
        }
      }
    });
  }, [selectedFeatureId, hoveredFeatureId, layers, mapRef, mapLoadedRef]);
};
