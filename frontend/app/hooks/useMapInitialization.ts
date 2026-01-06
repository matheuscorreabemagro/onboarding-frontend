import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MAP_CONFIG } from '../constants/map';

interface UseMapInitializationProps {
  containerRef: RefObject<HTMLDivElement | null>;
  mapRef: RefObject<mapboxgl.Map | null>;
  drawRef: RefObject<MapboxDraw | null>;
  mapLoadedRef: RefObject<boolean>;
  createDrawInstance: () => MapboxDraw;
  onDrawCreate: (e: mapboxgl.MapboxEvent) => void;
  onDrawModeChange: (e: mapboxgl.MapboxEvent) => void;
}

export const useMapInitialization = ({
  containerRef,
  mapRef,
  drawRef,
  mapLoadedRef,
  createDrawInstance,
  onDrawCreate,
  onDrawModeChange,
}: UseMapInitializationProps) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.STYLE,
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
    });

    const draw = createDrawInstance();
    map.addControl(draw);
    drawRef.current = draw;

    map.on('draw.create', onDrawCreate);
    map.on('draw.modechange', onDrawModeChange);

    map.on('load', () => {
      mapLoadedRef.current = true;
    });

    mapRef.current = map;

    return () => {
      if (drawRef.current) {
        map.removeControl(drawRef.current);
      }
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
