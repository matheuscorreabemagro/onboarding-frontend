'use client';

import React, { useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useMapStore } from '../../store/mapStore';
import { createDrawInstance } from '../../utils/drawConfig';
import { handleDrawCreate, handleDrawModeChange } from '../../utils/drawHandlers';
import { useMapInitialization } from '../../hooks/useMapInitialization';
import { useMapTools } from '../../hooks/useMapTools';
import { useMapInteractions } from '../../hooks/useMapInteractions';
import { useMapClick } from '../../hooks/useMapClick';
import { useKeyboardEvents } from '../../hooks/useKeyboardEvents';
import { useCursor } from '../../hooks/useCursor';
import { useLayerRendering } from '../../hooks/useLayerRendering';
import FieldOffsetPopup from '../popups/FieldOffsetPopup';
import SimplifyPopup from '../popups/SimplifyPopup';
import DeletePopup from '../popups/DeletePopup';
import { createMultipleOffsets, smoothLine } from '../../utils/turfOperations';
import LayerPanel from './LayerPanel';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const mapLoadedRef = useRef(false);

  const layers = useMapStore((state) => state.layers);
  const activeLayerId = useMapStore((state) => state.activeLayerId);
  const selectedFeatureId = useMapStore((state) => state.selectedFeatureId);
  const activeTool = useMapStore((state) => state.activeTool);
  const popupPosition = useMapStore((state) => state.popupPosition);
  const setPopupPosition = useMapStore((state) => state.setPopupPosition);
  const setActiveTool = useMapStore((state) => state.setActiveTool);
  const addFeatureToActiveLayer = useMapStore((state) => state.addFeatureToActiveLayer);
  const removeFeature = useMapStore((state) => state.removeFeature);
  const removeFeatureFromActiveLayer = useMapStore((state) => state.removeFeatureFromActiveLayer);
  
  // Features da camada ativa
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const features = activeLayer?.features || [];

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
      offsetResults.forEach((line) => addFeatureToActiveLayer(line));
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
      removeFeatureFromActiveLayer(selectedFeatureId);
      addFeatureToActiveLayer(smoothResult);
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

  // Habilitar scroll do mouse para navegação
  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.scrollZoom.enable();
      mapRef.current.dragRotate.disable();
      mapRef.current.touchZoomRotate.disableRotation();
    }
  }, []);

  useMapTools({ drawRef, mapRef, mapLoadedRef, activeTool, features, selectedFeatureId });
  useLayerRendering({ mapRef, mapLoadedRef });
  useMapInteractions({ mapRef, mapLoadedRef });
  useMapClick({ mapRef, mapLoadedRef });
  useKeyboardEvents({ selectedFeatureId });
  useCursor({ mapRef, activeTool });

  return (
    <>
      <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} className="relative" />
      
      {/* Layer Panel */}
      <LayerPanel mapRef={mapRef} />
      
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
      
      {/* Popup de exclusão quando nenhuma ferramenta está ativa */}
      {!activeTool && popupPosition && selectedFeatureId && (
        <DeletePopup
          position={popupPosition}
          onConfirm={() => {
            removeFeature(selectedFeatureId);
            setPopupPosition(null);
          }}
          onClose={() => {
            setPopupPosition(null);
          }}
        />
      )}
    </>
  );
};

export default MapComponent;
