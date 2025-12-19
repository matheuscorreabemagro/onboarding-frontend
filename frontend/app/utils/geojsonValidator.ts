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
