export const MAP_CONFIG = {
  DEFAULT_CENTER: [-47.9292, -15.7801] as [number, number],
  DEFAULT_ZOOM: 4,
  STYLE: 'mapbox://styles/mapbox/satellite-streets-v12',
  FIT_BOUNDS_PADDING: 100,
  FIT_BOUNDS_DURATION: 1500,
  FIT_BOUNDS_MAX_ZOOM: 15,
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
