import { useMapStore } from '../store/mapStore';
import { splitLine } from './turfOperations';
import { createFeatureFromDraw } from './mapHelpers';
import type { Feature } from '../types';

interface DrawCreateEvent {
  features: Array<{
    id: string;
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }>;
}

export const handleDrawCreate = (e: DrawCreateEvent, draw: { deleteAll: () => void }): void => {
  const feature = e.features[0];
  const { activeTool, selectedFeatureId, layers, activeLayerId, addLayer, addFeatureToActiveLayer, removeFeatureFromActiveLayer, setActiveTool, setError } = useMapStore.getState();
  
  // Se não há camada ativa, cria uma nova camada automaticamente
  if (!activeLayerId || layers.length === 0) {
    const newFeature = createFeatureFromDraw(feature.geometry.coordinates);
    addLayer('Desenho', [newFeature]);
    setActiveTool(null);
    draw.deleteAll();
    return;
  }
  
  // Pega features da camada ativa
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const features = activeLayer?.features || [];

  if (activeTool === 'split' && selectedFeatureId) {
    handleSplitOperation(feature, selectedFeatureId, features, removeFeatureFromActiveLayer, addFeatureToActiveLayer, setError, setActiveTool);
  } else {
    handleDrawOperation(feature, addFeatureToActiveLayer, setActiveTool);
  }
  
  draw.deleteAll();
};

const handleSplitOperation = (
  feature: DrawCreateEvent['features'][0],
  selectedFeatureId: string,
  features: Feature[],
  removeFeature: (id: string) => void,
  addFeature: (feature: Feature) => void,
  setError: (msg: string | null) => void,
  setActiveTool: (tool: null) => void
): void => {
  const targetFeature = features.find((f) => f.id === selectedFeatureId);
  
  if (!targetFeature) {
    setError('Feature selecionada não encontrada na camada ativa.');
    return;
  }
  
  if (targetFeature && feature.geometry.type === 'LineString') {
    const drawnFeature = createFeatureFromDraw(feature.geometry.coordinates);
    const splitResults = splitLine(targetFeature, drawnFeature);

    if (splitResults.length > 1) {
      removeFeature(targetFeature.id);
      splitResults.forEach((splitFeature) => addFeature(splitFeature));
      setError(null);
      setActiveTool(null);
    } else {
      setError('As linhas não se intersectam. Desenhe uma linha que cruze a selecionada.');
    }
  }
};

const handleDrawOperation = (
  feature: DrawCreateEvent['features'][0],
  addFeature: (feature: Feature) => void,
  setActiveTool: (tool: null) => void
): void => {
  const newFeature = createFeatureFromDraw(feature.geometry.coordinates);
  addFeature(newFeature);
  setActiveTool(null);
};

interface DrawModeChangeEvent {
  mode: string;
}

export const handleDrawModeChange = (e: DrawModeChangeEvent): void => {
  if (e.mode === 'simple_select') {
    const { activeTool, setActiveTool } = useMapStore.getState();
    if (activeTool === 'draw' || activeTool === 'snap' || activeTool === 'split') {
      setActiveTool(null);
    }
  }
};


