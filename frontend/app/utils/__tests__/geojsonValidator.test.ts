import { validateGeoJSON, isValidGeoJSON, parseGeoJSON } from '../geojsonValidator';

describe('geojsonValidator - validateGeoJSON', () => {
  it('deve validar FeatureCollection válido', () => {
    const validGeoJSON = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [10, 10],
            ],
          },
          properties: {},
        },
      ],
    });

    const result = validateGeoJSON(validGeoJSON);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('deve validar Feature único válido', () => {
    const validFeature = JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
      properties: {},
    });

    const result = validateGeoJSON(validFeature);

    expect(result.isValid).toBe(true);
  });

  it('deve rejeitar JSON inválido', () => {
    const invalidJSON = '{invalid json}';

    const result = validateGeoJSON(invalidJSON);

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('deve rejeitar objeto sem propriedade type', () => {
    const noType = JSON.stringify({
      features: [],
    });

    const result = validateGeoJSON(noType);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('type');
  });

  it('deve rejeitar FeatureCollection sem array features', () => {
    const noFeatures = JSON.stringify({
      type: 'FeatureCollection',
    });

    const result = validateGeoJSON(noFeatures);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('features');
  });

  it('deve rejeitar Feature sem geometry', () => {
    const noGeometry = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
        },
      ],
    });

    const result = validateGeoJSON(noGeometry);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('geometry');
  });

  it('deve rejeitar coordenadas inválidas', () => {
    const invalidCoords = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: 'invalid', // String ao invés de array
          },
          properties: {},
        },
      ],
    });

    const result = validateGeoJSON(invalidCoords);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('coordinates');
  });

  it('deve validar LineString com múltiplos pontos', () => {
    const lineString = JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      },
      properties: {},
    });

    const result = validateGeoJSON(lineString);

    expect(result.isValid).toBe(true);
  });

  it('deve validar Polygon com anel fechado', () => {
    const polygon = JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      },
      properties: {},
    });

    const result = validateGeoJSON(polygon);

    expect(result.isValid).toBe(true);
  });

  it('deve rejeitar coordenadas com valores não numéricos', () => {
    const invalidNumbers = JSON.stringify({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: ['0', '0'], // Strings ao invés de números
      },
      properties: {},
    });

    const result = validateGeoJSON(invalidNumbers);

    expect(result.isValid).toBe(false);
  });
});

describe('geojsonValidator - isValidGeoJSON', () => {
  it('deve retornar true para FeatureCollection válido', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [1, 1]],
          },
          properties: {},
        },
      ],
    };

    expect(isValidGeoJSON(fc)).toBe(true);
  });

  it('deve retornar true para Feature com LineString', () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]],
      },
      properties: {},
    };

    expect(isValidGeoJSON(feature)).toBe(true);
  });

  it('deve retornar false para objeto sem type', () => {
    const invalid = { features: [] };

    expect(isValidGeoJSON(invalid)).toBe(false);
  });

  it('deve retornar false para null', () => {
    expect(isValidGeoJSON(null)).toBe(false);
  });

  it('deve retornar false para string', () => {
    expect(isValidGeoJSON('not an object')).toBe(false);
  });

  it('deve retornar false para array', () => {
    expect(isValidGeoJSON([])).toBe(false);
  });
});

describe('geojsonValidator - parseGeoJSON', () => {
  it('deve extrair features de FeatureCollection', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [1, 1]],
          },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[2, 2], [3, 3]],
          },
          properties: {},
        },
      ],
    };

    const result = parseGeoJSON(fc);

    expect(result).toHaveLength(2);
  });

  it('deve retornar array com Feature único', () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [1, 1]],
      },
      properties: {},
    };

    const result = parseGeoJSON(feature);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(feature);
  });

  it('deve filtrar apenas LineStrings', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[0, 0], [1, 1]],
          },
          properties: {},
        },
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

    const result = parseGeoJSON(fc);

    expect(result).toHaveLength(1); // Apenas LineString
  });

  it('deve retornar array vazio para dados inválidos', () => {
    expect(parseGeoJSON(null)).toEqual([]);
    expect(parseGeoJSON(undefined)).toEqual([]);
    expect(parseGeoJSON('string')).toEqual([]);
    expect(parseGeoJSON(123)).toEqual([]);
    expect(parseGeoJSON({})).toEqual([]);
  });

  it('deve retornar array vazio para FeatureCollection sem features', () => {
    const fc = {
      type: 'FeatureCollection',
      features: [],
    };

    const result = parseGeoJSON(fc);

    expect(result).toEqual([]);
  });
});
