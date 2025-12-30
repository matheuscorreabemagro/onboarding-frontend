import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { SnapLineMode, SnapDirectSelect } from 'mapbox-gl-draw-snap-mode';

export const createDrawInstance = () => {
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      point: false,
      line_string: true,
      polygon: false,
      trash: true,
    },
    defaultMode: 'simple_select',
    modes: {
      ...MapboxDraw.modes,
      draw_line_string: MapboxDraw.modes.draw_line_string,
      snap_line: SnapLineMode,
      direct_select: SnapDirectSelect,
    },
    userProperties: true,
    snap: true,
    guides: true,
    snapOptions: {
      snapPx: 15,
      snapToMidPoints: true,
      snapVertexPriorityDistance: 0.0025,
    },
    styles: [
      {
        id: 'gl-draw-line',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
        },
      },
      {
        id: 'gl-draw-line-active',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
        paint: {
          'line-color': '#ef4444',
          'line-width': 3,
        },
      },
      {
        id: 'gl-draw-polygon-and-line-vertex-active',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
        paint: {
          'circle-radius': 5,
          'circle-color': '#fff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#3b82f6',
        },
      },
      {
        id: 'gl-draw-polygon-and-line-vertex-inactive',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'active', 'true']],
        paint: {
          'circle-radius': 4,
          'circle-color': '#fff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#94a3b8',
        },
      },
    ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return draw;
};
