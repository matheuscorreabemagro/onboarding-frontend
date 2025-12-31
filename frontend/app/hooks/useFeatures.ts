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
  uploadCounter: number;
}

export const useFeatures = ({
  mapRef,
  mapLoadedRef,
  hasFitBoundsRef,
  features,
  uploadCounter,
}: UseFeaturesProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;

    updateMapSource(map, LAYER_IDS.LINES_SOURCE, features);

    // Sempre ajusta o zoom quando há features, independente do estado anterior
    if (features.length > 0) {
      fitMapToFeatures(map, features);
      hasFitBoundsRef.current = true;
    }
  }, [features, uploadCounter]);
};
