'use client';

import { useMapStore } from '../../store/mapStore';
import { isValidGeoJSON } from '../../utils/geojsonValidator';
import LayerItem from './LayerItem';
import Alert from '../ui/Alert';
import BackendLayersModal from '../modals/BackendLayersModal';
import { useState, useEffect, RefObject, useRef } from 'react';
import { api, type LayerResponse } from '../../services/api';
import type { Feature, GeoJSONFeature } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const turf = require('@turf/turf');

interface LayerPanelProps {
  mapRef?: RefObject<mapboxgl.Map | null>;
}

export default function LayerPanel({ mapRef }: LayerPanelProps) {
  const layers = useMapStore((s) => s.layers);
  const addLayer = useMapStore((s) => s.addLayer);
  const setError = useMapStore((s) => s.setError);
  const error = useMapStore((s) => s.error);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const prevLayerCountRef = useRef(0);
  
  // Dá zoom na última camada adicionada
  useEffect(() => {
    if (!mapRef?.current || layers.length <= prevLayerCountRef.current) {
      prevLayerCountRef.current = layers.length;
      return;
    }
    
    // Pega a camada mais recente (última adicionada por createdAt)
    const latestLayer = [...layers].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
    
    if (!latestLayer || latestLayer.features.length === 0) {
      prevLayerCountRef.current = layers.length;
      return;
    }
    
    try {
      const geojson = {
        type: 'FeatureCollection' as const,
        features: latestLayer.features,
      };
      
      const [minLng, minLat, maxLng, maxLat] = turf.bbox(geojson);
      
      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 50, duration: 1000 }
      );
    } catch (error) {
      console.error('Erro ao calcular bounds:', error);
    }
    
    prevLayerCountRef.current = layers.length;
  }, [layers, mapRef]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const fileExt = file.name.toLowerCase().split('.').pop();
      
      // Se for GeoJSON, processa localmente como antes
      if (fileExt === 'geojson' || fileExt === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!isValidGeoJSON(data)) {
          setError('Arquivo não é um GeoJSON válido. Verifique a estrutura do arquivo.');
          setUploading(false);
          return;
        }
        
        let validFeatures: GeoJSONFeature[] = [];
        
        if (data.type === 'FeatureCollection') {
          validFeatures = data.features.filter((f: GeoJSONFeature) => f.geometry?.type);
          
          if (validFeatures.length === 0) {
            setError('GeoJSON não contém nenhuma geometria válida.');
            setUploading(false);
            return;
          }
        } else if (data.type === 'Feature') {
          if (data.geometry?.type) {
            validFeatures = [data];
          } else {
            setError('Feature não contém uma geometria válida.');
            setUploading(false);
            return;
          }
        }
        
        const features = validFeatures.map((f, i) => ({
          id: f.id ? String(f.id) : `uploaded-${Date.now()}-${i}`,
          type: 'uploaded' as const,
          geometry: f.geometry as import('geojson').Geometry,
          properties: f.properties || {},
        }));
        
        addLayer(file.name, features);
      } 
      // Para KML e Shapefile, envia para o backend
      else if (fileExt === 'kml' || fileExt === 'zip') {
        const layerName = file.name.replace(/\.(kml|zip)$/, '');
        const result = await api.uploadFile(file, layerName);
        
        // Buscar as camadas criadas e adicionar localmente
        for (const layerId of result.layer_ids) {
          const layerData = await api.getLayerGeoJSON(layerId);
          
          const features = [{
            id: `backend-${layerId}`,
            type: 'uploaded' as const,
            geometry: layerData.geometry,
            properties: {
              ...layerData.properties,
              backendId: layerId,
            },
          }];
          
          const layerName = layerData.properties?.name as string | undefined;
          addLayer(layerName || `Camada ${layerId}`, features);
        }
        
        setError(null);
      } else {
        setError('Formato não suportado. Use GeoJSON (.json, .geojson), KML (.kml) ou Shapefile (.zip)');
      }
      
      e.target.value = '';
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Erro ao processar arquivo: JSON inválido.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao processar arquivo.');
      }
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleLoadBackendLayer = (layer: LayerResponse) => {
    let features: Feature[];
    
    // Se for FeatureCollection, carregar todas as features
    if (layer.geometry_type === 'FeatureCollection' && 
        typeof layer.geometry === 'object' && 
        'features' in layer.geometry && 
        Array.isArray(layer.geometry.features)) {
      // É uma FeatureCollection - carregar todas as features
      features = layer.geometry.features.map((feature: { type: string; geometry: GeoJSON.Geometry; properties?: Record<string, unknown> }, idx: number) => ({
        id: `backend-${layer.id}-${idx}`,
        type: 'uploaded' as const,
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          backendId: layer.id, // Todas compartilham o mesmo backendId
        },
      }));
    } else {
      // É uma geometria única
      features = [{
        id: `backend-${layer.id}`,
        type: 'uploaded' as const,
        geometry: layer.geometry as GeoJSON.Geometry,
        properties: {
          ...layer.properties,
          backendId: layer.id,
        },
      }];
    }
    
    addLayer(layer.name, features);
  };
  
  return (
    <div className="fixed right-4 top-4 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-linear-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="font-semibold">Camadas</h3>
          <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-medium">
            {layers.length}
          </span>
        </div>
        
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      {!isMinimized && (
        <div className="p-3">
          {/* Botões de Ação */}
          <div className="space-y-2 mb-3">
            {/* Botão Importar Arquivo */}
            <label htmlFor="layer-upload" className="block">
              <div className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? 'Importando...' : 'Importar Arquivo'}
              </div>
            </label>
            <input
              id="layer-upload"
              type="file"
              accept=".geojson,.json,.kml,.zip"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />

            {/* Botão Carregar Camadas Salvas */}
            <button
              onClick={() => setShowBackendModal(true)}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Carregar Camadas Salvas
            </button>
          </div>
          
          {/* Lista de Camadas */}
          {layers.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="text-sm text-gray-400">
                Nenhuma camada carregada
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Adicione um arquivo GeoJSON
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {layers
                .sort((a, b) => {
                  // Camada ativa sempre no topo
                  if (a.isActive) return -1;
                  if (b.isActive) return 1;
                  return b.zIndex - a.zIndex;
                })
                .map((layer) => (
                  <LayerItem key={layer.id} layer={layer} />
                ))}
            </div>
          )}
          
          {/* Alert de Erro */}
          {error && (
            <div className="mt-3">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}
        </div>
      )}

      {/* Modal de Camadas do Backend */}
      <BackendLayersModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
        onLoadLayer={handleLoadBackendLayer}
      />
    </div>
  );
}
