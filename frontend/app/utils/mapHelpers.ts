import mapboxgl from 'mapbox-gl';
import { MAP_CONFIG } from '../constants/map';
import type { Feature } from '../types';

export const createFeatureFromDraw = (coordinates: number[][]): Feature => ({
  id: `line-${Date.now()}`,
  type: 'drawn' as const,
  geometry: {
    type: 'LineString' as const,
    coordinates,
  },
  properties: {},
});

export const fitMapToFeatures = (
  map: mapboxgl.Map,
  features: Feature[]
): void => {
  if (features.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();
  features.forEach((feature) => {
    feature.geometry.coordinates.forEach((coord) => {
      bounds.extend(coord as [number, number]);
    });
  });

  map.fitBounds(bounds, {
    padding: MAP_CONFIG.FIT_BOUNDS_PADDING,
    duration: MAP_CONFIG.FIT_BOUNDS_DURATION,
    maxZoom: MAP_CONFIG.FIT_BOUNDS_MAX_ZOOM,
  });
};

export const updateMapSource = (
  map: mapboxgl.Map,
  sourceId: string,
  features: Feature[]
): void => {
  const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
  if (!source) return;

  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: features.map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: { ...f.properties, id: f.id, source: f.type },
    })),
  };

  source.setData(geojsonData);
};
