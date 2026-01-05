import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';
import { LAYER_IDS } from '../constants/map';

interface UseMapClickProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
}

export const useMapClick = ({ mapRef, mapLoadedRef }: UseMapClickProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupClickHandler = () => {
      if (!mapLoadedRef.current || !map.getLayer(LAYER_IDS.LINES)) return;

      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const mapFeatures = map.queryRenderedFeatures(e.point, {
          layers: [LAYER_IDS.LINES],
        });

        const { activeTool, selectFeature, setPopupPosition } = useMapStore.getState();

        // Se há ferramenta offset ou simplify ativa, armazena posição do clique
        if ((activeTool === 'offset' || activeTool === 'simplify') && mapFeatures.length > 0) {
          const featureId = mapFeatures[0].properties?.id;
          selectFeature(featureId);
          setPopupPosition({ x: e.point.x, y: e.point.y });
        } else if (!activeTool && mapFeatures.length > 0) {
          const featureId = mapFeatures[0].properties?.id;
          selectFeature(featureId);
        } else if (!activeTool) {
          selectFeature(null);
        }
      };

      map.off('click', handleClick);
      map.on('click', handleClick);
    };

    if (mapLoadedRef.current) {
      setupClickHandler();
    } else {
      map.once('load', setupClickHandler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
