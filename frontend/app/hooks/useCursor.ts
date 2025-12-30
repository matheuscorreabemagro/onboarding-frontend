import { useEffect, RefObject } from 'react';
import mapboxgl from 'mapbox-gl';
import { CURSORS } from '../constants/map';
import type { ToolMode } from '../store/mapStore';

interface UseCursorProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  activeTool: ToolMode;
}

export const useCursor = ({ mapRef, activeTool }: UseCursorProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const canvas = map.getCanvas();
    const isDrawingTool = activeTool === 'draw' || activeTool === 'snap' || activeTool === 'split';
    canvas.style.cursor = isDrawingTool ? CURSORS.CROSSHAIR : CURSORS.DEFAULT;
  }, [activeTool]);
};
