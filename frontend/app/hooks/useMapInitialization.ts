import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MAP_CONFIG, LAYER_IDS } from '../constants/map';

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
      map.addSource(LAYER_IDS.LINES_SOURCE, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: LAYER_IDS.LINES,
        type: 'line',
        source: LAYER_IDS.LINES_SOURCE,
        paint: {
          'line-color': '#3388ff',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

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
