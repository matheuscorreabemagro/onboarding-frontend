import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { LAYER_IDS } from '../constants/map';
import { updateMapSource, fitMapToFeatures } from '../utils/mapHelpers';
import type { Feature } from '../types';

interface UseFeaturesProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
  hasFitBoundsRef: RefObject<boolean>;
  features: Feature[];
}

export const useFeatures = ({
  mapRef,
  mapLoadedRef,
  hasFitBoundsRef,
  features,
}: UseFeaturesProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    updateMapSource(map, LAYER_IDS.LINES_SOURCE, features);

    if (features.length > 0 && !hasFitBoundsRef.current) {
      fitMapToFeatures(map, features);
      hasFitBoundsRef.current = true;
    }
  }, [features]);
};
