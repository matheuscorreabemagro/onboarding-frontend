export const MAP_CONFIG = {
  DEFAULT_CENTER: [-47.9292, -15.7801] as [number, number],
  DEFAULT_ZOOM: 4,
  STYLE: 'mapbox://styles/mapbox/satellite-streets-v12',
  FIT_BOUNDS_PADDING: 100,
  FIT_BOUNDS_DURATION: 1500,
  FIT_BOUNDS_MAX_ZOOM: 15,
} as const;

export const LAYER_IDS = {
  LINES: 'lines-layer',
  LINES_SOURCE: 'lines',
} as const;

export const COLORS = {
  SELECTED: '#ef4444',
  HOVERED: '#fbbf24',
  UPLOADED: '#3388ff',
  DRAWN: '#22c55e',
  DEFAULT: '#3388ff',
} as const;

export const LINE_WIDTHS = {
  SELECTED: 5,
  HOVERED: 4,
  DEFAULT: 3,
} as const;

export const OPACITY = {
  SELECTED: 1.0,
  HOVERED: 1.0,
  DEFAULT: 0.8,
} as const;

export const CURSORS = {
  POINTER: 'pointer',
  CROSSHAIR: 'crosshair',
  DEFAULT: '',
} as const;

export const DRAW_MODES = {
  SIMPLE_SELECT: 'simple_select',
  DRAW_LINE: 'draw_line_string',
  SNAP_LINE: 'snap_line',
} as const;
