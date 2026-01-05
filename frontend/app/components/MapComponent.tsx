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
import FieldOffsetPopup from './FieldOffsetPopup';
import SimplifyPopup from './SimplifyPopup';
import { createMultipleOffsets, smoothLine } from '../utils/turfOperations';

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
  const popupPosition = useMapStore((state) => state.popupPosition);
  const setPopupPosition = useMapStore((state) => state.setPopupPosition);
  const setActiveTool = useMapStore((state) => state.setActiveTool);
  const addFeature = useMapStore((state) => state.addFeature);
  const removeFeature = useMapStore((state) => state.removeFeature);

  const handleOffsetApply = (config: { direction: 'left' | 'right' | 'both'; distance: number; count: number }) => {
    if (!selectedFeatureId) return;
    
    const selectedFeature = features.find((f) => f.id === selectedFeatureId);
    if (!selectedFeature) return;

    const leftCount = config.direction === 'right' ? 0 : config.count;
    const rightCount = config.direction === 'left' ? 0 : config.count;

    const offsetResults = createMultipleOffsets(selectedFeature, {
      distance: config.distance,
      leftCount,
      rightCount,
    });

    if (offsetResults.length > 0) {
      offsetResults.forEach((line) => addFeature(line));
    }
    
    setPopupPosition(null);
    setActiveTool(null);
  };

  const handleSimplifyApply = (level: 'low' | 'medium' | 'high') => {
    if (!selectedFeatureId) return;
    
    const selectedFeature = features.find((f) => f.id === selectedFeatureId);
    if (!selectedFeature) return;

    const resolution = level === 'low' ? 10000 : level === 'medium' ? 5000 : 2000;
    
    const smoothResult = smoothLine(selectedFeature, resolution);
    if (smoothResult) {
      removeFeature(selectedFeatureId);
      addFeature(smoothResult);
    }
    
    setPopupPosition(null);
    setActiveTool(null);
  };

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
    <>
      <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} className="relative" />
      
      {/* Popups aparecem quando ferramenta está ativa E linha selecionada */}
      {activeTool === 'offset' && popupPosition && selectedFeatureId && (
        <FieldOffsetPopup
          position={popupPosition}
          onApply={handleOffsetApply}
          onClose={() => {
            setPopupPosition(null);
            setActiveTool(null);
          }}
        />
      )}
      
      {activeTool === 'simplify' && popupPosition && selectedFeatureId && (
        <SimplifyPopup
          position={popupPosition}
          onApply={handleSimplifyApply}
          onClose={() => {
            setPopupPosition(null);
            setActiveTool(null);
          }}
        />
      )}
    </>
  );
};

export default MapComponent;
