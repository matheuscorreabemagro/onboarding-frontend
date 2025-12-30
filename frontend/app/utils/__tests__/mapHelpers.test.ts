import { createFeatureFromDraw, fitMapToFeatures, updateMapSource } from '../mapHelpers';
import mapboxgl from 'mapbox-gl';
import type { Feature } from '../../types';

describe('mapHelpers - createFeatureFromDraw', () => {
  it('deve criar Feature a partir de coordenadas', () => {
    const coordinates: number[][] = [
      [0, 0],
      [10, 10],
    ];

    const feature = createFeatureFromDraw(coordinates);

    expect(feature.type).toBe('drawn');
    expect(feature.geometry.type).toBe('LineString');
    expect(feature.geometry.coordinates).toEqual(coordinates);
    expect(feature.properties).toEqual({});
    expect(feature.id).toMatch(/^line-\d+$/);
  });

  it('deve gerar ID único baseado em timestamp', async () => {
    const coords: number[][] = [[0, 0], [1, 1]];

    const feature1 = createFeatureFromDraw(coords);
    // Aguarda 10ms para garantir timestamp diferente
    await new Promise(resolve => setTimeout(resolve, 10));
    const feature2 = createFeatureFromDraw(coords);

    expect(feature1.id).not.toBe(feature2.id);
  });

  it('deve aceitar coordenadas com altitude (3D)', () => {
    const coordinates: number[][] = [
      [0, 0, 100],
      [10, 10, 200],
    ];

    const feature = createFeatureFromDraw(coordinates);

    expect(feature.geometry.coordinates[0]).toHaveLength(3);
    expect(feature.geometry.coordinates[0][2]).toBe(100);
  });
});

describe('mapHelpers - fitMapToFeatures', () => {
  let mockMap: jest.Mocked<mapboxgl.Map>;
  let mockBounds: jest.Mocked<mapboxgl.LngLatBounds>;

  beforeEach(() => {
    mockBounds = {
      extend: jest.fn().mockReturnThis(),
      isEmpty: jest.fn(() => false),
      toArray: jest.fn(() => [[-180, -90], [180, 90]]),
    } as unknown as jest.Mocked<mapboxgl.LngLatBounds>;

    // Garantir que o mock do construtor existe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(mapboxgl.LngLatBounds as any).mockImplementation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapboxgl.LngLatBounds = jest.fn(() => mockBounds) as any;
    } else {
      (mapboxgl.LngLatBounds as unknown as jest.Mock).mockImplementation(() => mockBounds);
    }

    mockMap = {
      fitBounds: jest.fn(),
      getBounds: jest.fn(() => mockBounds),
    } as unknown as jest.Mocked<mapboxgl.Map>;
  });

  it('deve ajustar o mapa aos bounds das features', () => {
    const features: Feature[] = [
      {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [10, 10],
          ],
        },
        properties: {},
      },
    ];

    fitMapToFeatures(mockMap, features);

    expect(mockBounds.extend).toHaveBeenCalledTimes(2);
    expect(mockBounds.extend).toHaveBeenCalledWith([0, 0]);
    expect(mockBounds.extend).toHaveBeenCalledWith([10, 10]);
    expect(mockMap.fitBounds).toHaveBeenCalledWith(
      mockBounds,
      expect.objectContaining({
        padding: expect.any(Number),
        duration: expect.any(Number),
        maxZoom: expect.any(Number),
      })
    );
  });

  it('não deve fazer nada se não houver features', () => {
    fitMapToFeatures(mockMap, []);

    expect(mockMap.fitBounds).not.toHaveBeenCalled();
  });

  it('deve processar múltiplas features', () => {
    const features: Feature[] = [
      {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [5, 5]],
        },
        properties: {},
      },
      {
        id: 'line-2',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[10, 10], [20, 20]],
        },
        properties: {},
      },
    ];

    fitMapToFeatures(mockMap, features);

    expect(mockBounds.extend).toHaveBeenCalledTimes(4);
    expect(mockMap.fitBounds).toHaveBeenCalled();
  });
});

describe('mapHelpers - updateMapSource', () => {
  let mockMap: jest.Mocked<mapboxgl.Map>;
  let mockSource: jest.Mocked<mapboxgl.GeoJSONSource>;

  beforeEach(() => {
    mockSource = {
      setData: jest.fn(),
    } as unknown as jest.Mocked<mapboxgl.GeoJSONSource>;

    mockMap = {
      getSource: jest.fn(() => mockSource),
    } as unknown as jest.Mocked<mapboxgl.Map>;
  });

  it('deve atualizar source com features', () => {
    const features: Feature[] = [
      {
        id: 'line-1',
        type: 'drawn',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: { color: 'blue' },
      },
    ];

    updateMapSource(mockMap, 'lines-source', features);

    expect(mockMap.getSource).toHaveBeenCalledWith('lines-source');
    expect(mockSource.setData).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: features[0].geometry,
          properties: {
            color: 'blue',
            id: 'line-1',
            source: 'drawn',
          },
        },
      ],
    });
  });

  it('não deve fazer nada se source não existir', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    mockMap.getSource = jest.fn((_id: string) => undefined) as any;

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
    ];

    updateMapSource(mockMap, 'invalid-source', features);

    expect(mockSource.setData).not.toHaveBeenCalled();
  });

  it('deve aceitar array vazio de features', () => {
    updateMapSource(mockMap, 'lines-source', []);

    expect(mockSource.setData).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('deve preservar propriedades das features', () => {
    const features: Feature[] = [
      {
        id: 'line-1',
        type: 'uploaded',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [10, 10]],
        },
        properties: {
          name: 'Test Line',
          color: 'red',
          width: 5,
        },
      },
    ];

    updateMapSource(mockMap, 'lines-source', features);

    const callArg = (mockSource.setData as jest.Mock).mock.calls[0][0];
    expect(callArg.features[0].properties).toEqual({
      name: 'Test Line',
      color: 'red',
      width: 5,
      id: 'line-1',
      source: 'uploaded',
    });
  });
});
