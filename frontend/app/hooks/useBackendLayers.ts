import { useState, useCallback, useEffect } from 'react';
import { api, type LayerResponse } from '../services/api';
import { ERROR_MESSAGES } from '../constants/messages';
import { LIMITS } from '../constants/config';

interface UseBackendLayersReturn {
  layers: LayerResponse[];
  loading: boolean;
  error: string | null;
  selectedLayers: Set<number>;
  loadLayers: () => Promise<void>;
  toggleSelection: (layerId: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => Promise<void>;
}

/**
 * Hook para gerenciar layers do backend
 * Extrai lógica de BackendLayersModal (Single Responsibility)
 */
export function useBackendLayers(isOpen: boolean): UseBackendLayersReturn {
  const [layers, setLayers] = useState<LayerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<Set<number>>(new Set());

  const loadLayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getLayers(0, LIMITS.MAX_LAYERS_PER_PAGE);
      setLayers(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.LAYER_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSelection = useCallback((layerId: number) => {
    setSelectedLayers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(layerId)) {
        newSelection.delete(layerId);
      } else {
        newSelection.add(layerId);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedLayers.size === layers.length) {
      setSelectedLayers(new Set());
    } else {
      setSelectedLayers(new Set(layers.map(l => l.id)));
    }
  }, [layers, selectedLayers.size]);

  const clearSelection = useCallback(() => {
    setSelectedLayers(new Set());
  }, []);

  const deleteSelected = useCallback(async () => {
    if (selectedLayers.size === 0) return;

    setLoading(true);
    setError(null);

    try {
      const layerIds = Array.from(selectedLayers);
      const result = await api.deleteLayers(layerIds);
      
      if (result.failed_ids.length > 0) {
        setError(`${result.deleted_count} camadas excluídas. Falha ao excluir ${result.failed_ids.length} camada(s).`);
      }
      
      setSelectedLayers(new Set());
      await loadLayers();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.LAYER_DELETE_ERROR);
    } finally {
      setLoading(false);
    }
  }, [selectedLayers, loadLayers]);

  useEffect(() => {
    if (isOpen) {
      loadLayers();
    }
  }, [isOpen, loadLayers]);

  return {
    layers,
    loading,
    error,
    selectedLayers,
    loadLayers,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteSelected,
  };
}
