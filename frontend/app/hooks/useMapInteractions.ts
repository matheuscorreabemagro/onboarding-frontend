import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';
import { LAYER_IDS, CURSORS } from '../constants/map';

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
      if (!mapLoadedRef.current || !map.getLayer(LAYER_IDS.LINES)) return;

      const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [LAYER_IDS.LINES],
        });

        const currentActiveTool = useMapStore.getState().activeTool;

        if (features.length > 0) {
          const featureId = features[0].properties?.id;
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
      map.off('mouseleave', LAYER_IDS.LINES, handleMouseLeave);
      map.on('mousemove', handleMouseMove);
      map.on('mouseleave', LAYER_IDS.LINES, handleMouseLeave);
    };

    if (mapLoadedRef.current) {
      setupHoverHandlers();
    } else {
      map.once('load', setupHoverHandlers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
