import { create } from 'zustand';
import type { Feature, MapMode } from '../types';
import type { Position } from 'geojson';

interface MapStore {
  // estado
  features: Feature[];
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
  isDrawing: boolean;
  drawingPoints: Position[];
  error: string | null;
  mode: MapMode;

  // ações
  addFeature: (feature: Feature) => void;
  setFeatures: (features: Feature[]) => void;
  updateFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  setHoveredFeatureId: (id: string | null) => void;
  setMode: (mode: MapMode) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  addDrawingPoint: (p: Position) => void;
  clearDrawingPoints: () => void;
  finishDrawing: (props?: Record<string, unknown>) => Feature | null;
  setError: (msg: string | null) => void;
  reset: () => void;
  getFeatureCount: () => number;
}

export const useMapStore = create<MapStore>((set, get) => ({
  // estado inicial
  features: [],
  selectedFeatureId: null,
  hoveredFeatureId: null,
  isDrawing: false,
  drawingPoints: [],
  error: null,
  mode: 'idle',

  // ações
  addFeature: (feature: Feature) => set((s: MapStore) => ({ features: [...s.features, feature] })),

  setFeatures: (features: Feature[]) => set(() => ({ features })),

  updateFeature: (feature: Feature) =>
    set((s: MapStore) => ({
      features: s.features.map((f) => (f.id === feature.id ? feature : f)),
    })),

  removeFeature: (id: string) =>
    set((s: MapStore) => ({
      features: s.features.filter((f) => f.id !== id),
      selectedFeatureId: s.selectedFeatureId === id ? null : s.selectedFeatureId,
    })),

  selectFeature: (id: string | null) => set(() => ({ selectedFeatureId: id })),

  setHoveredFeatureId: (id: string | null) => set(() => ({ hoveredFeatureId: id })),

  setMode: (mode: MapMode) =>
    set((s: MapStore) => ({
      mode,
      isDrawing: mode === 'drawing',
      // mantém pontos existentes ao sair do modo drawing; reseta ao entrar
      drawingPoints: mode === 'drawing' ? [] : s.drawingPoints,
    })),

  startDrawing: () => set(() => ({ mode: 'drawing', isDrawing: true, drawingPoints: [] })),

  stopDrawing: () => set(() => ({ mode: 'idle', isDrawing: false })),

  addDrawingPoint: (p: Position) =>
    set((s: MapStore) => ({ drawingPoints: [...s.drawingPoints, p] })),

  clearDrawingPoints: () => set(() => ({ drawingPoints: [] })),

  finishDrawing: (props: Record<string, unknown> = {}) => {
    const points = get().drawingPoints;
    if (!points || points.length < 2) {
      set({ error: 'Need at least 2 points to finish a line.' });
      return null;
    }
    const id = `f_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const feature: Feature = {
      id,
      type: 'drawn',
      geometry: { type: 'LineString', coordinates: points },
      properties: props,
    };
    set((s: MapStore) => ({
      features: [...s.features, feature],
      drawingPoints: [],
      isDrawing: false,
      mode: 'idle',
    }));
    return feature;
  },

  setError: (msg: string | null) => set(() => ({ error: msg })),

  reset: () =>
    set(() => ({
      features: [],
      selectedFeatureId: null,
      hoveredFeatureId: null,
      isDrawing: false,
      drawingPoints: [],
      error: null,
      mode: 'idle',
    })),

  getFeatureCount: () => get().features.length,
}));

export default useMapStore;
