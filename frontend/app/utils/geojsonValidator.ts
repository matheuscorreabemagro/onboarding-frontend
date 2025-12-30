export function isValidGeoJSON(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('type' in obj) &&
    (obj.type === 'FeatureCollection' ||
      (obj.type === 'Feature' && 'geometry' in obj && typeof obj.geometry === 'object' && obj.geometry !== null && 'type' in obj.geometry && obj.geometry.type === 'LineString'))
  );
}

export function parseGeoJSON(data: unknown): unknown[] {
  if (typeof data === 'object' && data !== null && 'type' in data) {
    if (data.type === 'FeatureCollection' && 'features' in data && Array.isArray(data.features)) {
      return data.features.filter((f: unknown) => typeof f === 'object' && f !== null && 'geometry' in f && typeof f.geometry === 'object' && f.geometry !== null && 'type' in f.geometry && f.geometry.type === 'LineString');
    }
    if (data.type === 'Feature' && 'geometry' in data && typeof data.geometry === 'object' && data.geometry !== null && 'type' in data.geometry && data.geometry.type === 'LineString') {
      return [data];
    }
  }
  return [];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateGeoJSON(jsonString: string): ValidationResult {
  try {
    const obj = JSON.parse(jsonString);
    
    if (!obj || typeof obj !== 'object') {
      return { isValid: false, error: 'GeoJSON deve ser um objeto' };
    }
    
    if (!obj.type) {
      return { isValid: false, error: 'GeoJSON deve ter uma propriedade "type"' };
    }
    
    // Helper to validate coordinates
    const validateCoordinates = (coords: unknown, geomType: string): boolean => {
      if (!Array.isArray(coords)) return false;
      
      if (geomType === 'Point') {
        return coords.length >= 2 && coords.every(c => typeof c === 'number');
      }
      
      if (geomType === 'LineString' || geomType === 'MultiPoint') {
        return coords.length >= 1 && coords.every(coord => 
          Array.isArray(coord) && coord.length >= 2 && coord.every(c => typeof c === 'number')
        );
      }
      
      if (geomType === 'Polygon' || geomType === 'MultiLineString') {
        return coords.length >= 1 && coords.every(ring => 
          Array.isArray(ring) && ring.length >= 1 && ring.every(coord =>
            Array.isArray(coord) && coord.length >= 2 && coord.every(c => typeof c === 'number')
          )
        );
      }
      
      return true;
    };
    
    if (obj.type === 'FeatureCollection') {
      if (!Array.isArray(obj.features)) {
        return { isValid: false, error: 'FeatureCollection deve ter um array "features"' };
      }
      
      for (const feature of obj.features) {
        if (!feature || typeof feature !== 'object') {
          return { isValid: false, error: 'Feature deve ser um objeto' };
        }
        if (feature.type !== 'Feature') {
          return { isValid: false, error: 'Item em features deve ter type="Feature"' };
        }
        if (!feature.geometry || typeof feature.geometry !== 'object') {
          return { isValid: false, error: 'Feature deve ter uma propriedade "geometry"' };
        }
        if (!feature.geometry.type) {
          return { isValid: false, error: 'Geometry deve ter uma propriedade "type"' };
        }
        if (!Array.isArray(feature.geometry.coordinates)) {
          return { isValid: false, error: 'Geometry deve ter um array "coordinates"' };
        }
        if (!validateCoordinates(feature.geometry.coordinates, feature.geometry.type)) {
          return { isValid: false, error: 'Coordenadas inválidas' };
        }
      }
    } else if (obj.type === 'Feature') {
      if (!obj.geometry || typeof obj.geometry !== 'object') {
        return { isValid: false, error: 'Feature deve ter uma propriedade "geometry"' };
      }
      if (!obj.geometry.type) {
        return { isValid: false, error: 'Geometry deve ter uma propriedade "type"' };
      }
      if (!Array.isArray(obj.geometry.coordinates)) {
        return { isValid: false, error: 'Geometry deve ter um array "coordinates"' };
      }
      if (!validateCoordinates(obj.geometry.coordinates, obj.geometry.type)) {
        return { isValid: false, error: 'Coordenadas inválidas' };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'JSON inválido: ' + (error instanceof Error ? error.message : 'Erro desconhecido') };
  }
}
