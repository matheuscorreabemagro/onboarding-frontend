import { splitLine, offsetLine, simplifyLine, smoothLine, calculateLength, linesIntersect } from '../turfOperations';
import type { Feature } from '../../types';

// Mock de turf/convex que usa concaveman (módulo ES problemático)
jest.mock('@turf/convex', () => ({
  default: jest.fn(() => null),
}));

describe('turfOperations - splitLine', () => {
  it('deve dividir uma linha quando intersectada por outra', () => {
    const targetLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const splitterLine: Feature = {
      id: 'splitter-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [5, -5],
          [5, 5],
        ],
      },
      properties: {},
    };

    const result = splitLine(targetLine, splitterLine);

    expect(result).toHaveLength(2);
    expect(result[0].geometry.type).toBe('LineString');
    expect(result[1].geometry.type).toBe('LineString');
    expect(result[0].properties.splitFrom).toBe('line-1');
  });

  it('deve retornar linha original quando não há interseção', () => {
    const targetLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const splitterLine: Feature = {
      id: 'splitter-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [20, 20],
          [30, 30],
        ],
      },
      properties: {},
    };

    const result = splitLine(targetLine, splitterLine);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(targetLine);
  });

  it('deve preservar propriedades da linha original', () => {
    const targetLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {
        color: 'blue',
        name: 'Test Line',
      },
    };

    const splitterLine: Feature = {
      id: 'splitter-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [5, -5],
          [5, 5],
        ],
      },
      properties: {},
    };

    const result = splitLine(targetLine, splitterLine);

    result.forEach((feature) => {
      expect(feature.properties.color).toBe('blue');
      expect(feature.properties.name).toBe('Test Line');
    });
  });
});

describe('turfOperations - offsetLine', () => {
  it('deve criar linha paralela com distância positiva', () => {
    const line: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-47.9292, -15.7801],
          [-47.9192, -15.7701],
        ],
      },
      properties: {},
    };

    const result = offsetLine(line, 100); // 100 metros

    expect(result).not.toBeNull();
    expect(result!.geometry.type).toBe('LineString');
    expect(result!.geometry.coordinates.length).toBeGreaterThan(1);
    expect(result!.properties.offsetFrom).toBe('line-1');
    expect(result!.properties.offsetDistance).toBe(100);
  });

  it('deve criar linha paralela com distância negativa (lado oposto)', () => {
    const line: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-47.9292, -15.7801],
          [-47.9192, -15.7701],
        ],
      },
      properties: {},
    };

    const result = offsetLine(line, -100); // -100 metros (outro lado)

    expect(result).not.toBeNull();
    expect(result!.geometry.type).toBe('LineString');
    expect(result!.properties.offsetDistance).toBe(-100);
  });

  it('deve retornar null para linha inválida', () => {
    const invalidLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0]], // Apenas 1 ponto (inválido)
      },
      properties: {},
    };

    const result = offsetLine(invalidLine, 100);

    expect(result).toBeNull();
  });
});

describe('turfOperations - simplifyLine', () => {
  it('deve reduzir número de vértices', () => {
    const complexLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 0.1],
          [2, 0.2],
          [3, 0.15],
          [4, 0.25],
          [5, 0.3],
          [6, 0.2],
          [7, 0.1],
          [8, 0.05],
          [9, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const result = simplifyLine(complexLine, 0.1, true);

    expect(result.geometry.coordinates.length).toBeLessThan(
      complexLine.geometry.coordinates.length
    );
    expect(result.properties.originalVertices).toBe(11);
    expect(result.properties.simplifiedVertices).toBeLessThan(11);
  });

  it('deve preservar linha com poucos vértices', () => {
    const simpleLine: Feature = {
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
    };

    const result = simplifyLine(simpleLine, 0.01, true);

    expect(result.geometry.coordinates).toHaveLength(2);
  });
});

describe('turfOperations - smoothLine', () => {
  it('deve criar curvas suaves usando Bézier', () => {
    const zigzagLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 0],
          [3, 1],
          [4, 0],
          [5, 1],
        ],
      },
      properties: {},
    };

    const result = smoothLine(zigzagLine);

    expect(result.geometry.type).toBe('LineString');
    expect(result.geometry.coordinates.length).toBeGreaterThanOrEqual(
      zigzagLine.geometry.coordinates.length
    );
    expect(result.properties.smoothedFrom).toBe('line-1');
  });

  it('deve aceitar parâmetros customizados de resolução', () => {
    const line: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [5, 5],
          [10, 0],
        ],
      },
      properties: {},
    };

    const result = smoothLine(line, 5000, 0.5);

    expect(result.geometry.type).toBe('LineString');
    expect(result.id).toContain('smoothed-');
  });
});

describe('turfOperations - calculateLength', () => {
  it('deve calcular comprimento de linha em quilômetros', () => {
    const line: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-47.9292, -15.7801],
          [-47.9192, -15.7701],
        ],
      },
      properties: {},
    };

    const length = calculateLength(line);

    expect(length).toBeGreaterThan(0);
    expect(typeof length).toBe('number');
    expect(length).toBeGreaterThan(1500); // ~1543m para essas coordenadas
    expect(length).toBeLessThan(1600);
  });

  it('deve retornar 0 para linha com apenas 1 ponto', () => {
    const singlePointLine: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0]],
      },
      properties: {},
    };

    const length = calculateLength(singlePointLine);

    expect(length).toBe(0);
  });
});

describe('turfOperations - linesIntersect', () => {
  it('deve detectar interseção entre linhas que se cruzam', () => {
    const line1: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const line2: Feature = {
      id: 'line-2',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [5, -5],
          [5, 5],
        ],
      },
      properties: {},
    };

    const result = linesIntersect(line1, line2);

    expect(result).toBe(true);
  });

  it('deve retornar false para linhas que não se cruzam', () => {
    const line1: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const line2: Feature = {
      id: 'line-2',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [20, 20],
          [30, 30],
        ],
      },
      properties: {},
    };

    const result = linesIntersect(line1, line2);

    expect(result).toBe(false);
  });

  it('deve retornar true para linhas paralelas próximas', () => {
    const line1: Feature = {
      id: 'line-1',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [10, 0],
        ],
      },
      properties: {},
    };

    const line2: Feature = {
      id: 'line-2',
      type: 'drawn',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0.00001],
          [10, 0.00001],
        ],
      },
      properties: {},
    };

    const result = linesIntersect(line1, line2);

    // Linhas paralelas próximas NÃO se intersectam
    expect(result).toBe(false);
  });
});
