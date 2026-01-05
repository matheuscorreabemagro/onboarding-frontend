import type { LineString, Position } from 'geojson';

export type FeatureType = 'uploaded' | 'drawn' | 'field' | 'plantingLine';

/**
 * Representa uma feature GeoJSON antes da conversão para o formato interno
 */
export interface GeoJSONFeature {
  id?: string | number;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties?: Record<string, unknown>;
}

export interface Feature {
  id: string;
  type: FeatureType;
  geometry: LineString;
  properties: Record<string, unknown>;
}

export type MapMode = 'idle' | 'drawing' | 'removing';

export interface MapState {
  features: Feature[];
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
  isDrawing: boolean;
  drawingPoints: Position[];
  error: string | null;
  mode: MapMode;
}

export interface PopupPosition {
  x: number;
  y: number;
}
