import { GEOMETRY_TYPES } from '../constants/config';
import type { Feature } from '../types';

/**
 * Utilitário para formatar tipos de geometria
 * Extrai lógica repetida em vários componentes (DRY)
 */
export function getGeometryTypes(features: Feature[]): string {
  const types = new Set(features.map(f => f.geometry.type));
  
  return Array.from(types)
    .map(t => GEOMETRY_TYPES[t as keyof typeof GEOMETRY_TYPES] || t)
    .join(', ');
}

/**
 * Extrai o backendId de uma layer
 */
export function getLayerBackendId(layer: { features: Feature[] }): number | undefined {
  return layer.features[0]?.properties?.backendId as number | undefined;
}

/**
 * Verifica se uma layer está salva no backend
 */
export function isLayerSaved(layer: { features: Feature[] }): boolean {
  return !!getLayerBackendId(layer);
}
