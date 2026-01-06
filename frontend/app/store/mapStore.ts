import { create } from 'zustand';
import type { Feature, MapMode, PopupPosition } from '../types';
import type { Layer } from '../types/layer';

export type ToolMode = 'draw' | 'snap' | 'split' | 'offset' | 'simplify' | null;

// Cores pré-definidas para camadas
const LAYER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

let colorIndex = 0;
const getNextColor = () => {
  const color = LAYER_COLORS[colorIndex % LAYER_COLORS.length];
  colorIndex++;
  return color;
};

interface MapStore {
  // Estado
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
  error: string | null;
  mode: MapMode;
  activeTool: ToolMode;
  popupPosition: PopupPosition | null;
  uploadCounter: number;
  
  // Camadas
  layers: Layer[];
  activeLayerId: string | null;

  // Ações
  selectFeature: (id: string | null) => void;
  setHoveredFeatureId: (id: string | null) => void;
  setMode: (mode: MapMode) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
  setActiveTool: (tool: ToolMode) => void;
  setPopupPosition: (position: PopupPosition | null) => void;
  
  // Ações de camadas
  addLayer: (name: string, features: Feature[]) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  removeLayer: (id: string) => void;
  updateLayerName: (id: string, name: string) => void;
  addFeatureToActiveLayer: (feature: Feature) => void;
  removeFeatureFromActiveLayer: (featureId: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  // Estado inicial
  selectedFeatureId: null,
  hoveredFeatureId: null,
  error: null,
  mode: 'idle',
  activeTool: null,
  popupPosition: null,
  uploadCounter: 0,
  
  // Estado de camadas
  layers: [],
  activeLayerId: null,

  // Ações
  selectFeature: (id: string | null) => set(() => ({ selectedFeatureId: id })),

  setHoveredFeatureId: (id: string | null) => set(() => ({ hoveredFeatureId: id })),

  setMode: (mode: MapMode) => set(() => ({ mode })),

  setError: (msg: string | null) => set(() => ({ error: msg })),

  reset: () =>
    set(() => ({
      selectedFeatureId: null,
      hoveredFeatureId: null,
      error: null,
      mode: 'idle',
      activeTool: null,
      popupPosition: null,
      uploadCounter: 0,
      layers: [],
      activeLayerId: null,
    })),

  setActiveTool: (tool: ToolMode) => set(() => ({ activeTool: tool })),

  setPopupPosition: (position: PopupPosition | null) => set(() => ({ popupPosition: position })),
  
  // Ações de camadas
  addLayer: (name: string, features: Feature[]) => set((state) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      features,
      isActive: state.layers.length === 0, // Primeira camada = ativa
      isVisible: true,
      color: getNextColor(),
      opacity: state.layers.length === 0 ? 1 : 0.5,
      zIndex: state.layers.length,
      createdAt: new Date(),
    };
    
    return {
      layers: [...state.layers, newLayer],
      activeLayerId: newLayer.isActive ? newLayer.id : state.activeLayerId,
      uploadCounter: state.uploadCounter + 1,
    };
  }),
  
  setActiveLayer: (id: string) => set((state) => ({
    layers: state.layers.map(layer => ({
      ...layer,
      isActive: layer.id === id,
      opacity: layer.id === id ? 1 : 0.5,
      zIndex: layer.id === id ? 999 : layer.zIndex, // Camada ativa sempre no topo
    })),
    activeLayerId: id,
    selectedFeatureId: null, // Limpa seleção ao trocar de camada
    popupPosition: null, // Limpa popup também
  })),
  
  toggleLayerVisibility: (id: string) => set((state) => {
    const layer = state.layers.find(l => l.id === id);
    const isHiding = layer?.isVisible === true;
    
    // Se está ocultando a camada ativa com feature selecionada, limpa seleção
    const shouldClearSelection = isHiding && id === state.activeLayerId && state.selectedFeatureId;
    
    return {
      layers: state.layers.map(layer =>
        layer.id === id ? { ...layer, isVisible: !layer.isVisible } : layer
      ),
      selectedFeatureId: shouldClearSelection ? null : state.selectedFeatureId,
      popupPosition: shouldClearSelection ? null : state.popupPosition,
    };
  }),
  
  removeLayer: (id: string) => set((state) => {
    const filtered = state.layers.filter(l => l.id !== id);
    const wasActive = state.activeLayerId === id;
    
    // Se remover a camada ativa, ativa a primeira disponível
    const newActiveId = wasActive && filtered.length > 0 ? filtered[0].id : state.activeLayerId;
    
    return {
      layers: wasActive && filtered.length > 0 
        ? filtered.map((layer, index) => ({
            ...layer,
            isActive: layer.id === newActiveId,
            opacity: layer.id === newActiveId ? 1 : 0.5,
            zIndex: layer.id === newActiveId ? 999 : index,
          }))
        : filtered,
      activeLayerId: filtered.length > 0 ? newActiveId : null,
      selectedFeatureId: null,
    };
  }),
  
  updateLayerName: (id: string, name: string) => set((state) => ({
    layers: state.layers.map(layer =>
      layer.id === id ? { ...layer, name } : layer
    ),
  })),
  
  addFeatureToActiveLayer: (feature: Feature) => set((state) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return state;
    
    return {
      layers: state.layers.map(layer =>
        layer.id === state.activeLayerId
          ? { ...layer, features: [...layer.features, feature] }
          : layer
      ),
    };
  }),
  
  removeFeatureFromActiveLayer: (featureId: string) => set((state) => {
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) return state;
    
    return {
      layers: state.layers.map(layer =>
        layer.id === state.activeLayerId
          ? { ...layer, features: layer.features.filter(f => f.id !== featureId) }
          : layer
      ),
      selectedFeatureId: state.selectedFeatureId === featureId ? null : state.selectedFeatureId,
    };
  }),
}));

export default useMapStore;
