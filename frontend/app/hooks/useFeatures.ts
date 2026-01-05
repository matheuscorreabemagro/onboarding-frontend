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

    // Só ajusta o zoom no upload inicial ou quando o uploadCounter muda
    // Não ajusta quando adiciona features manualmente (offset, draw, etc)
    if (features.length > 0 && !hasFitBoundsRef.current) {
      fitMapToFeatures(map, features);
      hasFitBoundsRef.current = true;
    }
  }, [features, hasFitBoundsRef, mapLoadedRef, mapRef]);

  // Efeito separado para detectar uploads (quando uploadCounter muda)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current || uploadCounter === 0) return;

    if (features.length > 0) {
      fitMapToFeatures(map, features);
      hasFitBoundsRef.current = true;
    }
  }, [uploadCounter, features, hasFitBoundsRef, mapLoadedRef, mapRef]);
};
