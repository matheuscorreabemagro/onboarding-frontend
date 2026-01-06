import { useEffect, RefObject } from 'react';
import { useMapStore } from '../store/mapStore';
import { CURSORS } from '../constants/map';

interface UseMapInteractionsProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
}

export const useMapInteractions = ({
  mapRef,
  mapLoadedRef,
}: UseMapInteractionsProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupHoverHandlers = () => {
      if (!mapLoadedRef.current) return;

      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        const { activeLayerId } = useMapStore.getState();
        
        // Se não há camada ativa, não faz nada
        if (!activeLayerId) return;
        
        const activeLayerPrefix = `layer-${activeLayerId}`;
        
        // Lista todas as possíveis layers da camada ativa (fill, line, point, etc)
        const possibleLayers = [
          `${activeLayerPrefix}-fill`,
          `${activeLayerPrefix}-line`,
          `${activeLayerPrefix}-point`,
          `${activeLayerPrefix}-outline`,
        ].filter(layerId => map.getLayer(layerId));
        
        if (possibleLayers.length === 0) return;
        
        const features = map.queryRenderedFeatures(e.point, {
          layers: possibleLayers,
        });

        const currentActiveTool = useMapStore.getState().activeTool;

        if (features.length > 0) {
          const featureId = features[0].properties?.originalId;
          useMapStore.getState().setHoveredFeatureId(featureId);
          map.getCanvas().style.cursor = CURSORS.POINTER;
        } else {
          useMapStore.getState().setHoveredFeatureId(null);
          map.getCanvas().style.cursor = currentActiveTool ? CURSORS.CROSSHAIR : CURSORS.DEFAULT;
        }
      };

      const handleMouseLeave = () => {
        const currentActiveTool = useMapStore.getState().activeTool;
        useMapStore.getState().setHoveredFeatureId(null);
        map.getCanvas().style.cursor = currentActiveTool ? CURSORS.CROSSHAIR : CURSORS.DEFAULT;
      };

      map.off('mousemove', handleMouseMove);
      map.off('mouseleave', handleMouseLeave);
      map.on('mousemove', handleMouseMove);
      map.on('mouseleave', handleMouseLeave);
    };

    if (mapLoadedRef.current) {
      setupHoverHandlers();
    } else {
      map.once('load', setupHoverHandlers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
