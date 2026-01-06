// @ts-expect-error - Turf.js types compatibility issue
import * as turf from '@turf/turf';
import type { Feature } from '../types';
import { logger } from './logger';

/**
 * Verifica se uma feature é uma LineString ou MultiLineString
 */
export const isLineGeometry = (feature: Feature): boolean => {
  return feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString';
};

/**
 * Verifica se uma feature é um Polygon ou MultiPolygon
 */
export const isPolygonGeometry = (feature: Feature): boolean => {
  return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon';
};

/**
 * Verifica se uma feature é um Point ou MultiPoint
 */
export const isPointGeometry = (feature: Feature): boolean => {
  return feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint';
};

/**
 * Divide uma linha usando outra linha como cortador
 * NOTA: Funciona apenas com LineString
 * @param targetLine Linha a ser cortada
 * @param splitterLine Linha usada para cortar
 * @returns Array de features resultantes do corte
 */
export const splitLine = (
  targetLine: Feature,
  splitterLine: Feature
): Feature[] => {
  try {
    // Valida se ambas as features são linhas
    if (!isLineGeometry(targetLine) || !isLineGeometry(splitterLine)) {
      logger.warn('Split funciona apenas com LineString ou MultiLineString');
      return [targetLine];
    }

    // Converte para formato Turf.js
    const targetGeom = targetLine.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const splitterGeom = splitterLine.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const turfLine = turf.lineString(targetGeom.coordinates);
    const turfSplitter = turf.lineString(splitterGeom.coordinates);

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
      geometry: feature.geometry,
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
 * NOTA: Funciona apenas com LineString
 * @param line Linha base
 * @param distance Distância em metros (positiva = esquerda, negativa = direita)
 * @returns Nova feature com a linha paralela
 */
export const offsetLine = (
  line: Feature,
  distance: number
): Feature | null => {
  try {
    if (!isLineGeometry(line)) {
      logger.warn('Offset funciona apenas com LineString ou MultiLineString');
      return null;
    }

    const lineGeom = line.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const turfLine = turf.lineString(lineGeom.coordinates);
    const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

    if (!offset || !offset.geometry) {
      logger.warn('Não foi possível criar offset');
      return null;
    }

    return {
      id: `offset-${Date.now()}`,
      type: 'drawn' as const,
      geometry: offset.geometry,
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
 * NOTA: Funciona apenas com LineString
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
    if (!isLineGeometry(line)) {
      logger.warn('Offset funciona apenas com LineString ou MultiLineString');
      return [];
    }

    // Cria linhas à esquerda (distância positiva)
    const lineGeom = line.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    
    for (let i = 1; i <= config.leftCount; i++) {
      const distance = config.distance * i;
      const turfLine = turf.lineString(lineGeom.coordinates);
      const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

      if (offset && offset.geometry) {
        results.push({
          id: `offset-left-${i}-${timestamp}`,
          type: 'drawn' as const,
          geometry: offset.geometry,
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
      const turfLine = turf.lineString(lineGeom.coordinates);
      const offset = turf.lineOffset(turfLine, distance, { units: 'meters' });

      if (offset && offset.geometry) {
        results.push({
          id: `offset-right-${i}-${timestamp}`,
          type: 'drawn' as const,
          geometry: offset.geometry,
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
 * Suaviza uma linha/polígono reduzindo o número de vértices
 * NOTA: Funciona com LineString e Polygon
 * @param feature Feature a ser suavizada
 * @param tolerance Tolerância de simplificação (menor = mais detalhes)
 * @param highQuality Se true, usa algoritmo mais lento mas mais preciso
 * @returns Feature com a geometria suavizada
 */
export const simplifyLine = (
  feature: Feature,
  tolerance: number = 0.01,
  highQuality: boolean = true
): Feature => {
  try {
    if (!isLineGeometry(feature) && !isPolygonGeometry(feature)) {
      logger.warn('Simplify funciona apenas com LineString ou Polygon');
      return feature;
    }

    const turfFeature = turf.feature(feature.geometry);
    const simplified = turf.simplify(turfFeature, {
      tolerance,
      highQuality,
    });

    const featureGeom = feature.geometry as { coordinates: number[][] | number[][][] };
    const simplifiedGeom = simplified.geometry as { coordinates: number[][] | number[][][] };
    
    const originalCount = isLineGeometry(feature) 
      ? (featureGeom.coordinates as number[][]).length
      : ((featureGeom.coordinates as number[][][])[0]?.length || 0);
    const simplifiedCount = isLineGeometry(simplified) 
      ? (simplifiedGeom.coordinates as number[][]).length
      : ((simplifiedGeom.coordinates as number[][][])[0]?.length || 0);

    return {
      ...feature,
      id: `simplified-${Date.now()}`,
      geometry: simplified.geometry,
      properties: {
        ...feature.properties,
        simplifiedFrom: feature.id,
        originalVertices: originalCount,
        simplifiedVertices: simplifiedCount,
      },
    };
  } catch (error) {
    logger.error('Erro ao simplificar:', error);
    return feature;
  }
};

/**
 * Suaviza uma linha usando curvas de Bézier
 * NOTA: Funciona apenas com LineString
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
    if (!isLineGeometry(line)) {
      logger.warn('Smooth funciona apenas com LineString ou MultiLineString');
      return line;
    }

    const lineGeom = line.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const turfLine = turf.lineString(lineGeom.coordinates);
    const bezier = turf.bezierSpline(turfLine, {
      resolution,
      sharpness,
    });

    return {
      ...line,
      id: `smoothed-${Date.now()}`,
      geometry: bezier.geometry,
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
    const lineGeom = line.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const turfLine = turf.lineString(lineGeom.coordinates);
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
    const line1Geom = line1.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const line2Geom = line2.geometry as { type: 'LineString' | 'MultiLineString'; coordinates: number[][] };
    const turfLine1 = turf.lineString(line1Geom.coordinates);
    const turfLine2 = turf.lineString(line2Geom.coordinates);
    const intersection = turf.lineIntersect(turfLine1, turfLine2);
    return intersection.features.length > 0;
  } catch (error) {
    logger.error('Erro ao verificar interseção:', error);
    return false;
  }
};
