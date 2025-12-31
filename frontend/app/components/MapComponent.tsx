'use client';

import React, { useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useMapStore } from '../store/mapStore';
import { createDrawInstance } from '../utils/drawConfig';
import { handleDrawCreate, handleDrawModeChange } from '../utils/drawHandlers';
import { useMapInitialization } from '../hooks/useMapInitialization';
import { useMapTools } from '../hooks/useMapTools';
import { useMapStyles } from '../hooks/useMapStyles';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { useMapClick } from '../hooks/useMapClick';
import { useKeyboardEvents } from '../hooks/useKeyboardEvents';
import { useCursor } from '../hooks/useCursor';
import { useFeatures } from '../hooks/useFeatures';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const hasFitBoundsRef = useRef(false);
  const mapLoadedRef = useRef(false);

  const features = useMapStore((state) => state.features);
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId);
  const hoveredFeatureId = useMapStore((state) => state.hoveredFeatureId);
  const activeTool = useMapStore((state) => state.activeTool);
  const uploadCounter = useMapStore((state) => state.uploadCounter);

  useMapInitialization({
    containerRef: mapContainerRef,
    mapRef,
    drawRef,
    mapLoadedRef,
    createDrawInstance,
    onDrawCreate: (e) => handleDrawCreate(e as unknown as Parameters<typeof handleDrawCreate>[0], drawRef.current!),
    onDrawModeChange: (e) => handleDrawModeChange(e as unknown as Parameters<typeof handleDrawModeChange>[0]),
  });

  useMapTools({ drawRef, mapLoadedRef, activeTool, features, selectedFeatureId });
  useMapStyles({ mapRef, mapLoadedRef, selectedFeatureId, hoveredFeatureId });
  useMapInteractions({ mapRef, mapLoadedRef });
  useMapClick({ mapRef, mapLoadedRef });
  useKeyboardEvents({ selectedFeatureId });
  useCursor({ mapRef, activeTool });
  useFeatures({ mapRef, mapLoadedRef, hasFitBoundsRef, features, uploadCounter });

  return (
    <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} className="relative" />
  );
};

export default MapComponent;
