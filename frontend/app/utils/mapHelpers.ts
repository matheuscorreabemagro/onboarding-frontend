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
    const geom = feature.geometry;
    
    // Helper para adicionar coordenadas aos bounds (recursivo)
    const addCoords = (coords: unknown): void => {
      if (!Array.isArray(coords)) return;
      
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        // Coordenada única [lng, lat]
        bounds.extend(coords as [number, number]);
      } else if (Array.isArray(coords[0])) {
        // Array de coordenadas - processa recursivamente
        coords.forEach((coord) => addCoords(coord));
      }
    };
    
    // GeometryCollection não tem coordinates direto
    if (geom.type === 'GeometryCollection') {
      geom.geometries.forEach((g) => {
        if ('coordinates' in g) {
          addCoords(g.coordinates);
        }
      });
    } else if ('coordinates' in geom) {
      addCoords(geom.coordinates);
    }
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
