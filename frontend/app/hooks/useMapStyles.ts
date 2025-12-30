import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { LAYER_IDS, COLORS, LINE_WIDTHS, OPACITY } from '../constants/map';

interface UseMapStylesProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
}

export const useMapStyles = ({
  mapRef,
  mapLoadedRef,
  selectedFeatureId,
  hoveredFeatureId,
}: UseMapStylesProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current || !map.getLayer(LAYER_IDS.LINES)) return;

    map.setPaintProperty(LAYER_IDS.LINES, 'line-color', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      COLORS.SELECTED,
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      COLORS.HOVERED,
      ['==', ['get', 'source'], 'uploaded'],
      COLORS.UPLOADED,
      COLORS.DRAWN,
    ]);

    map.setPaintProperty(LAYER_IDS.LINES, 'line-width', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      LINE_WIDTHS.SELECTED,
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      LINE_WIDTHS.HOVERED,
      LINE_WIDTHS.DEFAULT,
    ]);

    map.setPaintProperty(LAYER_IDS.LINES, 'line-opacity', [
      'case',
      ['==', ['get', 'id'], selectedFeatureId || ''],
      OPACITY.SELECTED,
      ['==', ['get', 'id'], hoveredFeatureId || ''],
      OPACITY.HOVERED,
      OPACITY.DEFAULT,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeatureId, hoveredFeatureId]);
};
