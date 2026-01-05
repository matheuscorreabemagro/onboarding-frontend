import type { LineString, Position } from 'geojson';

export type FeatureType = 'uploaded' | 'drawn' | 'field' | 'plantingLine';

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
