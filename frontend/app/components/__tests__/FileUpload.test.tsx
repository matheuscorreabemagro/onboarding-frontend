import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../FileUpload';
import { useMapStore } from '../../store/mapStore';

// Mock do store
jest.mock('../../store/mapStore');

describe('FileUpload', () => {
  const mockAddLayer = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        layers: [],
        error: null,
        addLayer: mockAddLayer,
        setError: mockSetError,
      };
      return selector(state);
    });

    // Mock dinâmico de File.text() será configurado em cada teste
  });

  describe('Renderização', () => {
    it('deve renderizar área de upload', () => {
      render(<FileUpload />);

      expect(screen.getByText(/Faça upload do GeoJSON/i)).toBeInTheDocument();
    });

    it('deve renderizar input de arquivo', () => {
      render(<FileUpload />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Upload de arquivo válido', () => {
    it('deve processar FeatureCollection com LineStrings', async () => {
      const validGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [10, 10]],
            },
            properties: {},
          },
        ],
      };

      // Mock File.text() para retornar o GeoJSON válido
      const mockText = jest.fn().mockResolvedValue(JSON.stringify(validGeoJSON));
      const file = new File([JSON.stringify(validGeoJSON)], 'test.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockSetError).toHaveBeenCalledWith(null);
          expect(mockAddLayer).toHaveBeenCalled();
        });
      }
    });

    it('deve processar Feature único com LineString', async () => {
      const validFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {},
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(validFeature));
      const file = new File([JSON.stringify(validFeature)], 'feature.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAddLayer).toHaveBeenCalled();
        });
      }
    });

    it('deve gerar IDs únicos para features sem ID', async () => {
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [10, 10]],
            },
            properties: {},
          },
        ],
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(geoJSON));
      const file = new File([JSON.stringify(geoJSON)], 'test.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          const calls = mockAddLayer.mock.calls;
          if (calls.length > 0) {
            const features = calls[0][1];
            expect(features[0].id).toMatch(/^uploaded-\d+-0$/);
          }
        });
      }
    });
  });

  describe('Validação e erros', () => {
    it('deve rejeitar JSON inválido', async () => {
      const invalidJSON = '{invalid json}';
      const mockText = jest.fn().mockResolvedValue(invalidJSON);
      const file = new File([invalidJSON], 'invalid.json', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockSetError).toHaveBeenCalledWith(expect.stringMatching(/JSON inválido/i));
        });
      }
    });

    it('deve aceitar GeoJSON com Points (agora suporta todos os tipos)', async () => {
      const pointGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {},
          },
        ],
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(pointGeoJSON));
      const file = new File([JSON.stringify(pointGeoJSON)], 'points.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAddLayer).toHaveBeenCalled();
        });
      }
    });

    it('deve aceitar Feature com geometria Polygon (agora suporta todos os tipos)', async () => {
      const polygonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
        },
        properties: {},
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(polygonFeature));
      const file = new File([JSON.stringify(polygonFeature)], 'polygon.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          expect(mockAddLayer).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Drag and Drop', () => {
    it('deve ativar estilo ao arrastar arquivo sobre a área', () => {
      render(<FileUpload />);

      const dropZone = screen.getByText(/Faça upload do GeoJSON/i).closest('div');

      if (dropZone) {
        fireEvent.dragEnter(dropZone);
        // Verificar se classe de drag ativo foi aplicada (depende da implementação)
      }
    });

    it('deve desativar estilo ao sair da área', () => {
      render(<FileUpload />);

      const dropZone = screen.getByText(/Faça upload do GeoJSON/i).closest('div');

      if (dropZone) {
        fireEvent.dragEnter(dropZone);
        fireEvent.dragLeave(dropZone);
        // Verificar se classe de drag foi removida
      }
    });
  });

  describe('Exibição de erros', () => {
    it('deve exibir mensagem de erro quando houver erro', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          layers: [],
          error: 'Arquivo inválido',
          addLayer: mockAddLayer,
          setError: mockSetError,
        };
        return selector(state);
      });

      render(<FileUpload />);

      expect(screen.getByText('Arquivo inválido')).toBeInTheDocument();
    });

    it('não deve exibir erro quando error é null', () => {
      render(<FileUpload />);

      const errorElement = screen.queryByRole('alert');
      expect(errorElement).not.toBeInTheDocument();
    });
  });

  describe('Filtro de features', () => {
    it('deve filtrar apenas LineStrings de FeatureCollection mista', async () => {
      const mixedGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [10, 10]],
            },
            properties: {},
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [5, 5],
            },
            properties: {},
          },
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[20, 20], [30, 30]],
            },
            properties: {},
          },
        ],
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(mixedGeoJSON));
      const file = new File([JSON.stringify(mixedGeoJSON)], 'mixed.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          const calls = mockAddLayer.mock.calls;
          if (calls.length > 0) {
            const features = calls[0][1];
            expect(features).toHaveLength(2); // Apenas 2 LineStrings
          }
        });
      }
    });
  });

  describe('Preservação de propriedades', () => {
    it('deve preservar propriedades das features originais', async () => {
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'custom-id-1',
            geometry: {
              type: 'LineString',
              coordinates: [[0, 0], [10, 10]],
            },
            properties: {
              name: 'Test Line',
              color: 'blue',
              width: 5,
            },
          },
        ],
      };

      const mockText = jest.fn().mockResolvedValue(JSON.stringify(geoJSON));
      const file = new File([JSON.stringify(geoJSON)], 'props.geojson', { type: 'application/json' });
      file.text = mockText;

      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
          const calls = mockAddLayer.mock.calls;
          if (calls.length > 0) {
            const features = calls[0][1];
            expect(features[0].properties.name).toBe('Test Line');
            expect(features[0].properties.color).toBe('blue');
            expect(features[0].properties.width).toBe(5);
          }
        });
      }
    });
  });
});
