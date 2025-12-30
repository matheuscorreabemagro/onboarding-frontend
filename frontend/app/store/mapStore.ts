import { create } from 'zustand';
import type { Feature, MapMode } from '../types';

export type ToolMode = 'draw' | 'snap' | 'split' | 'offset' | 'simplify' | null;

interface MapStore {
  // estado
  features: Feature[];
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
  error: string | null;
  mode: MapMode;
  activeTool: ToolMode;
  offsetDistance: number;
  simplifyTolerance: number;

  // ações
  addFeature: (feature: Feature) => void;
  setFeatures: (features: Feature[]) => void;
  updateFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  setHoveredFeatureId: (id: string | null) => void;
  setMode: (mode: MapMode) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
  getFeatureCount: () => number;
  setActiveTool: (tool: ToolMode) => void;
  setOffsetDistance: (distance: number) => void;
  setSimplifyTolerance: (tolerance: number) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  // estado inicial
  features: [],
  selectedFeatureId: null,
  hoveredFeatureId: null,
  error: null,
  mode: 'idle',
  activeTool: null,
  offsetDistance: 10,
  simplifyTolerance: 0.01,

  // ações
  addFeature: (feature: Feature) => set((s: MapStore) => ({ features: [...s.features, feature] })),

  setFeatures: (features: Feature[]) => set(() => ({ features })),

  updateFeature: (feature: Feature) =>
    set((s: MapStore) => ({
      features: s.features.map((f) => (f.id === feature.id ? feature : f)),
    })),

  removeFeature: (id: string) =>
    set((s: MapStore) => {
      const newFeatures = s.features.filter((f) => f.id !== id);
      return {
        features: newFeatures,
        selectedFeatureId: s.selectedFeatureId === id ? null : s.selectedFeatureId,
      };
    }),

  selectFeature: (id: string | null) => set(() => ({ selectedFeatureId: id })),

  setHoveredFeatureId: (id: string | null) => set(() => ({ hoveredFeatureId: id })),

  setMode: (mode: MapMode) => set(() => ({ mode })),

  setError: (msg: string | null) => set(() => ({ error: msg })),

  reset: () =>
    set(() => ({
      features: [],
      selectedFeatureId: null,
      hoveredFeatureId: null,
      error: null,
      mode: 'idle',
      activeTool: null,
    })),

  getFeatureCount: () => get().features.length,

  setActiveTool: (tool: ToolMode) => set(() => ({ activeTool: tool })),

  setOffsetDistance: (distance: number) => set(() => ({ offsetDistance: distance })),

  setSimplifyTolerance: (tolerance: number) => set(() => ({ simplifyTolerance: tolerance })),
}));

export default useMapStore;
