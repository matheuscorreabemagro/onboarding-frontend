import { useEffect, RefObject } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { type ToolMode } from '../store/mapStore';
import { DRAW_MODES } from '../constants/map';
import type { Feature } from '../types';
import { logger } from '../utils/logger';

interface UseMapToolsProps {
  drawRef: RefObject<MapboxDraw | null>;
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
  activeTool: ToolMode;
  features: Feature[];
  selectedFeatureId: string | null;
}

export const useMapTools = ({
  drawRef,
  mapRef,
  mapLoadedRef,
  activeTool,
  features,
  selectedFeatureId,
}: UseMapToolsProps) => {
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !mapLoadedRef.current) return;

    switch (activeTool) {
      case 'draw':
        draw.changeMode(DRAW_MODES.DRAW_LINE);
        break;

      case 'snap':
        draw.deleteAll();
        features.forEach((feature) => {
          const featureToAdd = {
            type: 'Feature' as const,
            geometry: feature.geometry,
            properties: { ...feature.properties, originalId: feature.id },
            id: feature.id,
          };
          draw.add(featureToAdd);
        });
        
        try {
          draw.changeMode(DRAW_MODES.SNAP_LINE);
        } catch (error) {
          logger.error('Erro ao ativar snap:', error);
          draw.changeMode(DRAW_MODES.DRAW_LINE);
        }
        break;

      case 'split':
        // Para split, comportamento depende se já tem feature selecionada
        if (selectedFeatureId) {
          // Reativa o Draw se foi removido
          const map = mapRef.current;
          if (map && !map.hasControl(draw)) {
            map.addControl(draw);
          }
          draw.deleteAll();
          draw.changeMode(DRAW_MODES.DRAW_LINE);
        } else {
          // Remove o Draw completamente do mapa para não bloquear cliques
          const map = mapRef.current;
          if (map && map.hasControl(draw)) {
            map.removeControl(draw);
          }
        }
        break;

      case null:
        // Garante que o Draw está no mapa
        const mapForNull = mapRef.current;
        if (mapForNull && !mapForNull.hasControl(draw)) {
          mapForNull.addControl(draw);
        }
        draw.deleteAll();
        draw.changeMode(DRAW_MODES.SIMPLE_SELECT);
        break;

      default:
        if (activeTool === undefined) {
          // Garante que o Draw está no mapa
          const mapForUndefined = mapRef.current;
          if (mapForUndefined && !mapForUndefined.hasControl(draw)) {
            mapForUndefined.addControl(draw);
          }
          draw.deleteAll();
          draw.changeMode(DRAW_MODES.SIMPLE_SELECT);
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, selectedFeatureId]);
};
