import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '../mapStore';
import type { Feature } from '../../types';

describe('mapStore', () => {
  beforeEach(() => {
    // Reset store antes de cada teste
    const { result } = renderHook(() => useMapStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Estado inicial', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useMapStore());

      expect(result.current.features).toEqual([]);
      expect(result.current.selectedFeatureId).toBeNull();
      expect(result.current.hoveredFeatureId).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.mode).toBe('idle');
      expect(result.current.activeTool).toBeNull();
    });
  });

  describe('addFeature', () => {
    it('deve adicionar uma feature ao array', () => {
      const { result } = renderHook(() => useMapStore());

      const newFeature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(newFeature);
      });

      expect(result.current.features).toHaveLength(1);
      expect(result.current.features[0]).toEqual(newFeature);
    });

    it('deve adicionar múltiplas features', () => {
      const { result } = renderHook(() => useMapStore());

      const feature1: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      const feature2: Feature = {
        id: 'line-2',
        type: 'uploaded',
        geometry: {
          type: 'LineString',
          coordinates: [[20, 20], [30, 30]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(feature1);
        result.current.addFeature(feature2);
      });

      expect(result.current.features).toHaveLength(2);
    });
  });

  describe('setFeatures', () => {
    it('deve substituir todas as features', () => {
      const { result } = renderHook(() => useMapStore());

      const features: Feature[] = [
        {
          id: 'line-1',
          type: 'drawn',
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [10, 10]],
          },
          properties: {},
        },
        {
          id: 'line-2',
          type: 'drawn',
          geometry: {
            type: 'LineString',
            coordinates: [[20, 20], [30, 30]],
          },
          properties: {},
        },
      ];

      act(() => {
        result.current.setFeatures(features);
      });

      expect(result.current.features).toEqual(features);
      expect(result.current.features).toHaveLength(2);
    });

    it('deve limpar features ao passar array vazio', () => {
      const { result } = renderHook(() => useMapStore());

      const feature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(feature);
        result.current.setFeatures([]);
      });

      expect(result.current.features).toEqual([]);
    });
  });

  describe('updateFeature', () => {
    it('deve atualizar feature existente', () => {
      const { result } = renderHook(() => useMapStore());

      const originalFeature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: { color: 'blue' },
      };

      act(() => {
        result.current.addFeature(originalFeature);
      });

      const updatedFeature: Feature = {
        ...originalFeature,
        properties: { color: 'red' },
      };

      act(() => {
        result.current.updateFeature(updatedFeature);
      });

      expect(result.current.features[0].properties.color).toBe('red');
    });

    it('não deve modificar outras features', () => {
      const { result } = renderHook(() => useMapStore());

      const feature1: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      const feature2: Feature = {
        id: 'line-2',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[20, 20], [30, 30]],
        },
        properties: {},
      };

      act(() => {
        result.current.setFeatures([feature1, feature2]);
      });

      const updatedFeature1: Feature = {
        ...feature1,
        properties: { updated: true },
      };

      act(() => {
        result.current.updateFeature(updatedFeature1);
      });

      expect(result.current.features[0].properties.updated).toBe(true);
      expect(result.current.features[1]).toEqual(feature2);
    });
  });

  describe('removeFeature', () => {
    it('deve remover feature pelo ID', () => {
      const { result } = renderHook(() => useMapStore());

      const feature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(feature);
        result.current.removeFeature('line-1');
      });

      expect(result.current.features).toHaveLength(0);
    });

    it('deve limpar selectedFeatureId se feature removida estava selecionada', () => {
      const { result } = renderHook(() => useMapStore());

      const feature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(feature);
        result.current.selectFeature('line-1');
        result.current.removeFeature('line-1');
      });

      expect(result.current.selectedFeatureId).toBeNull();
    });

    it('não deve limpar selectedFeatureId se outra feature foi removida', () => {
      const { result } = renderHook(() => useMapStore());

      const feature1: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      const feature2: Feature = {
        id: 'line-2',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[20, 20], [30, 30]],
        },
        properties: {},
      };

      act(() => {
        result.current.setFeatures([feature1, feature2]);
        result.current.selectFeature('line-1');
        result.current.removeFeature('line-2');
      });

      expect(result.current.selectedFeatureId).toBe('line-1');
    });
  });

  describe('selectFeature', () => {
    it('deve selecionar feature por ID', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.selectFeature('line-1');
      });

      expect(result.current.selectedFeatureId).toBe('line-1');
    });

    it('deve desselecionar ao passar null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.selectFeature('line-1');
        result.current.selectFeature(null);
      });

      expect(result.current.selectedFeatureId).toBeNull();
    });
  });

  describe('setHoveredFeatureId', () => {
    it('deve definir feature em hover', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHoveredFeatureId('line-1');
      });

      expect(result.current.hoveredFeatureId).toBe('line-1');
    });

    it('deve limpar hover ao passar null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setHoveredFeatureId('line-1');
        result.current.setHoveredFeatureId(null);
      });

      expect(result.current.hoveredFeatureId).toBeNull();
    });
  });

  describe('setActiveTool', () => {
    it('deve definir ferramenta ativa', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setActiveTool('snap');
      });

      expect(result.current.activeTool).toBe('snap');
    });

    it('deve desativar ferramenta ao passar null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setActiveTool('draw');
        result.current.setActiveTool(null);
      });

      expect(result.current.activeTool).toBeNull();
    });

    it('deve alternar entre ferramentas', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setActiveTool('draw');
      });
      expect(result.current.activeTool).toBe('draw');

      act(() => {
        result.current.setActiveTool('split');
      });
      expect(result.current.activeTool).toBe('split');

      act(() => {
        result.current.setActiveTool('offset');
      });
      expect(result.current.activeTool).toBe('offset');
    });
  });

  describe('setMode', () => {
    it('deve alterar modo do mapa', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setMode('drawing');
      });

      expect(result.current.mode).toBe('drawing');
    });
  });

  describe('setError', () => {
    it('deve definir mensagem de erro', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setError('Erro de teste');
      });

      expect(result.current.error).toBe('Erro de teste');
    });

    it('deve limpar erro ao passar null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setError('Erro');
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('getFeatureCount', () => {
    it('deve retornar número de features', () => {
      const { result } = renderHook(() => useMapStore());

      const features: Feature[] = [
        {
          id: 'line-1',
          type: 'drawn',
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [10, 10]],
          },
          properties: {},
        },
        {
          id: 'line-2',
          type: 'drawn',
          geometry: {
            type: 'LineString',
            coordinates: [[20, 20], [30, 30]],
          },
          properties: {},
        },
      ];

      act(() => {
        result.current.setFeatures(features);
      });

      expect(result.current.getFeatureCount()).toBe(2);
    });

    it('deve retornar 0 para store vazio', () => {
      const { result } = renderHook(() => useMapStore());

      expect(result.current.getFeatureCount()).toBe(0);
    });
  });

  describe('reset', () => {
    it('deve resetar todo o estado', () => {
      const { result } = renderHook(() => useMapStore());

      const feature: Feature = {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      act(() => {
        result.current.addFeature(feature);
        result.current.selectFeature('line-1');
        result.current.setHoveredFeatureId('line-1');
        result.current.setActiveTool('draw');
        result.current.setMode('drawing');
        result.current.setError('Erro de teste');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.features).toEqual([]);
      expect(result.current.selectedFeatureId).toBeNull();
      expect(result.current.hoveredFeatureId).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.mode).toBe('idle');
      expect(result.current.activeTool).toBeNull();
    });
  });
});
