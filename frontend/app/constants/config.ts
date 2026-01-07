// Timeouts e delays
export const TIMEOUTS = {
  ERROR_AUTO_HIDE: 5000,
  SUCCESS_AUTO_HIDE: 3000,
  DEBOUNCE_DEFAULT: 300,
} as const;

// Limites de valores
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LAYERS_PER_PAGE: 10000,
  MIN_DISTANCE: 0.1,
  MAX_LINE_COUNT: 100,
  DEFAULT_LINE_COUNT: 10,
  DEFAULT_DISTANCE: 0.5,
} as const;

// Formatos de exportação
export const EXPORT_FORMATS = [
  { id: 'geojson', label: 'GeoJSON', icon: '📄', description: 'Formato JSON padrão para dados geoespaciais' },
  { id: 'kml', label: 'KML', icon: '🗺️', description: 'Formato Google Earth / Google Maps' },
  { id: 'shp', label: 'Shapefile', icon: '📦', description: 'Formato ESRI (arquivo .zip)' },
] as const;

// Tipos de geometria
export const GEOMETRY_TYPES = {
  Point: 'Ponto',
  LineString: 'Linha',
  Polygon: 'Polígono',
  MultiPoint: 'Multiponto',
  MultiLineString: 'Multilinha',
  MultiPolygon: 'Multipolígono',
} as const;

// Presets de culturas
export const CROP_PRESETS = [
  { name: 'Soja', distance: 0.45, count: 10 },
  { name: 'Milho', distance: 0.5, count: 10 },
  { name: 'Cana', distance: 0.9, count: 10 },
] as const;
