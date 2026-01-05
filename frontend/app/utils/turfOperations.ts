// @ts-expect-error - Turf.js types compatibility issue
import * as turf from '@turf/turf';
import type { Feature } from '../types';
import { logger } from './logger';

/**
 * Divide uma linha usando outra linha como cortador
 * @param targetLine Linha a ser cortada
 * @param splitterLine Linha usada para cortar
 * @returns Array de features resultantes do corte
 */
export const splitLine = (
  targetLine: Feature,
  splitterLine: Feature
): Feature[] => {
  try {
    // Converte para formato Turf.js
    const turfLine = turf.lineString(targetLine.geometry.coordinates);
    const turfSplitter = turf.lineString(splitterLine.geometry.coordinates);

    // Realiza o corte
    const split = turf.lineSplit(turfLine, turfSplitter);

    if (!split.features || split.features.length === 0) {
      logger.warn('Nenhum corte foi realizado. As linhas não se intersectam?');
      return [targetLine];
    }

    // Converte de volta para o formato do app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return split.features.map((feature: any, index: number) => ({
      id: `split-${Date.now()}-${index}`,
      type: 'drawn' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: feature.geometry.coordinates,
      },
      properties: {
        ...targetLine.properties,
        splitFrom: targetLine.id,
        splitIndex: index,
      },
    }));
  } catch (error) {
    logger.error('Erro ao realizar split:', error);
    return [targetLine];
  }
};

/**
 * Cria uma linha paralela (offset) a partir de uma linha existente
 * @param line Linha base
 * @param distance Distância em metros (positiva = esquerda, negativa = direita)
 * @returns Nova feature com a linha paralela
 */
export const offsetLine = (
  line: Feature,
  distance: number
): Feature | null => {
  try {
    const turfLine = turf.lineString(line.geometry.coordinates);
    const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

    if (!offset || !offset.geometry) {
      logger.warn('Não foi possível criar offset');
      return null;
    }

    return {
      id: `offset-${Date.now()}`,
      type: 'drawn' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: offset.geometry.coordinates,
      },
      properties: {
        ...line.properties,
        offsetFrom: line.id,
        offsetDistance: distance,
      },
    };
  } catch (error) {
    logger.error('Erro ao criar offset:', error);
    return null;
  }
};

/**
 * Cria múltiplas linhas paralelas (offset) para linhas de plantio
 * @param line Linha base
 * @param config Configuração do offset (distância, quantidade esquerda/direita)
 * @returns Array de features com as linhas paralelas criadas
 */
export const createMultipleOffsets = (
  line: Feature,
  config: { distance: number; leftCount: number; rightCount: number }
): Feature[] => {
  const results: Feature[] = [];
  const timestamp = Date.now();

  try {
    // Cria linhas à esquerda (distância positiva)
    for (let i = 1; i <= config.leftCount; i++) {
      const distance = config.distance * i;
      const turfLine = turf.lineString(line.geometry.coordinates);
      const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

      if (offset && offset.geometry) {
        results.push({
          id: `offset-left-${i}-${timestamp}`,
          type: 'drawn' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: offset.geometry.coordinates,
          },
          properties: {
            ...line.properties,
            offsetFrom: line.id,
            offsetDistance: distance,
            offsetSide: 'left',
            offsetIndex: i,
            plantingLine: true,
          },
        });
      }
    }

    // Cria linhas à direita (distância negativa)
    for (let i = 1; i <= config.rightCount; i++) {
      const distance = -(config.distance * i);
      const turfLine = turf.lineString(line.geometry.coordinates);
      const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

      if (offset && offset.geometry) {
        results.push({
          id: `offset-right-${i}-${timestamp}`,
          type: 'drawn' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: offset.geometry.coordinates,
          },
          properties: {
            ...line.properties,
            offsetFrom: line.id,
            offsetDistance: distance,
            offsetSide: 'right',
            offsetIndex: i,
            plantingLine: true,
          },
        });
      }
    }

    return results;
  } catch (error) {
    logger.error('Erro ao criar offsets múltiplos:', error);
    return [];
  }
};

/**
 * Suaviza uma linha reduzindo o número de vértices
 * @param line Linha a ser suavizada
 * @param tolerance Tolerância de simplificação (menor = mais detalhes)
 * @param highQuality Se true, usa algoritmo mais lento mas mais preciso
 * @returns Feature com a linha suavizada
 */
export const simplifyLine = (
  line: Feature,
  tolerance: number = 0.01,
  highQuality: boolean = true
): Feature => {
  try {
    const turfLine = turf.lineString(line.geometry.coordinates);
    const simplified = turf.simplify(turfLine, {
      tolerance,
      highQuality,
    });

    return {
      ...line,
      id: `simplified-${Date.now()}`,
      geometry: {
        type: 'LineString' as const,
        coordinates: simplified.geometry.coordinates,
      },
      properties: {
        ...line.properties,
        simplifiedFrom: line.id,
        originalVertices: line.geometry.coordinates.length,
        simplifiedVertices: simplified.geometry.coordinates.length,
      },
    };
  } catch (error) {
    logger.error('Erro ao simplificar linha:', error);
    return line;
  }
};

/**
 * Suaviza uma linha usando curvas de Bézier
 * @param line Linha a ser suavizada
 * @param resolution Resolução da curva (padrão: 10000)
 * @param sharpness Intensidade da suavização (padrão: 0.85)
 * @returns Feature com a linha suavizada
 */
export const smoothLine = (
  line: Feature,
  resolution: number = 10000,
  sharpness: number = 0.85
): Feature => {
  try {
    const turfLine = turf.lineString(line.geometry.coordinates);
    const bezier = turf.bezierSpline(turfLine, {
      resolution,
      sharpness,
    });

    return {
      ...line,
      id: `smoothed-${Date.now()}`,
      geometry: {
        type: 'LineString' as const,
        coordinates: bezier.geometry.coordinates,
      },
      properties: {
        ...line.properties,
        smoothedFrom: line.id,
      },
    };
  } catch (error) {
    logger.error('Erro ao suavizar linha com Bézier:', error);
    return line;
  }
};

/**
 * Calcula o comprimento de uma linha em metros
 * @param line Linha
 * @returns Comprimento em metros
 */
export const calculateLength = (line: Feature): number => {
  try {
    const turfLine = turf.lineString(line.geometry.coordinates);
    return turf.length(turfLine, { units: 'meters' });
  } catch (error) {
    logger.error('Erro ao calcular comprimento:', error);
    return 0;
  }
};

/**
 * Verifica se duas linhas se intersectam
 * @param line1 Primeira linha
 * @param line2 Segunda linha
 * @returns true se as linhas se intersectam
 */
export const linesIntersect = (line1: Feature, line2: Feature): boolean => {
  try {
    const turfLine1 = turf.lineString(line1.geometry.coordinates);
    const turfLine2 = turf.lineString(line2.geometry.coordinates);
    const intersection = turf.lineIntersect(turfLine1, turfLine2);
    return intersection.features.length > 0;
  } catch (error) {
    logger.error('Erro ao verificar interseção:', error);
    return false;
  }
};
