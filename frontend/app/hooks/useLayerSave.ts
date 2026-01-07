import { useCallback } from 'react';
import { api } from '../services/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { useAsyncState } from './useAsyncState';
import { useNotification } from './useNotification';
import type { Layer } from '../types/layer';

interface UseLayerSaveReturn {
  saving: boolean;
  saveError: string | null;
  successMessage: string | null;
  saveLayer: (layer: Layer) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Hook para gerenciar salvamento de layers no backend
 * Extrai toda a lógica de salvamento do LayerItem (Single Responsibility)
 */
export function useLayerSave(): UseLayerSaveReturn {
  const { error: saveError, success: successMessage, showError, showSuccess, clearAll } = useNotification();
  
  // Memoizar a função async para não recriá-la a cada render
  const asyncSaveFunction = useCallback(async (layer: Layer) => {
    if (layer.features.length === 0) {
      throw new Error(ERROR_MESSAGES.LAYER_NO_GEOMETRIES);
    }

    // Uma geometria
    if (layer.features.length === 1) {
      const feature = layer.features[0];
      const backendId = feature.properties?.backendId as number | undefined;
      
      if (backendId) {
        await api.updateLayer(backendId, {
          name: layer.name,
          geometry: feature.geometry,
          properties: feature.properties,
          style: { color: layer.color },
        });
      } else {
        const result = await api.createLayer({
          name: layer.name,
          geometry: feature.geometry,
          properties: feature.properties,
          style: { color: layer.color },
        });
        
        layer.features[0].properties = {
          ...layer.features[0].properties,
          backendId: result.id,
        };
      }
      
      return SUCCESS_MESSAGES.LAYER_SAVED;
    }

    // Múltiplas geometrias - salvar como FeatureCollection
    const firstFeature = layer.features[0];
    const backendId = firstFeature.properties?.backendId as number | undefined;
    
    const layerData = {
      name: layer.name,
      geometry: firstFeature.geometry,
      properties: {
        features: layer.features.map(f => ({
          type: 'Feature',
          geometry: f.geometry,
          properties: f.properties,
        }))
      },
      style: { color: layer.color },
    };

    if (backendId) {
      await api.updateLayer(backendId, layerData);
    } else {
      const result = await api.createLayer(layerData);
      layer.features[0].properties = {
        ...layer.features[0].properties,
        backendId: result.id,
      };
    }
    
    return SUCCESS_MESSAGES.LAYER_SAVED_MULTIPLE(layer.features.length);
  }, []);
  
  const { loading: saving, execute } = useAsyncState(asyncSaveFunction);

  const saveLayer = useCallback(async (layer: Layer) => {
    try {
      const message = await execute(layer);
      if (message) showSuccess(message);
    } catch (err) {
      showError(err instanceof Error ? err.message : ERROR_MESSAGES.LAYER_SAVE_ERROR);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    saving,
    saveError,
    successMessage,
    saveLayer,
    clearMessages: clearAll,
  };
}
