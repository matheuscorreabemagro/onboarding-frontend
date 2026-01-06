'use client';

import { useMapStore } from '../store/mapStore';
import { isValidGeoJSON } from '../utils/geojsonValidator';
import LayerItem from './LayerItem';
import Alert from './Alert';
import { useState, useEffect, RefObject, useRef } from 'react';
import type { GeoJSONFeature } from '../types';
import type mapboxgl from 'mapbox-gl';

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
    
    setError(null); // Limpa erro anterior
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!isValidGeoJSON(data)) {
        setError('Arquivo não é um GeoJSON válido. Verifique a estrutura do arquivo.');
        return;
      }
      
      let validFeatures: GeoJSONFeature[] = [];
      
      if (data.type === 'FeatureCollection') {
        validFeatures = data.features.filter((f: GeoJSONFeature) => f.geometry?.type);
        
        if (validFeatures.length === 0) {
          setError('GeoJSON não contém nenhuma geometria válida.');
          return;
        }
      } else if (data.type === 'Feature') {
        if (data.geometry?.type) {
          validFeatures = [data];
        } else {
          setError('Feature não contém uma geometria válida.');
          return;
        }
      }
      
      const features = validFeatures.map((f, i) => ({
        id: f.id ? String(f.id) : `uploaded-${Date.now()}-${i}`,
        type: 'uploaded' as const,
        geometry: f.geometry as any,
        properties: f.properties || {},
      }));
      
      addLayer(file.name, features);
      
      // Limpa o input para permitir upload do mesmo arquivo
      e.target.value = '';
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Erro ao processar arquivo: JSON inválido.');
      } else {
        setError('Erro ao ler arquivo. Verifique se o arquivo está correto.');
      }
      e.target.value = '';
    }
  };
  
  return (
    <div className="fixed right-4 top-4 w-72 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
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
          {/* Botão Nova Camada */}
          <div className="mb-3">
            <label htmlFor="layer-upload" className="block">
              <div className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Camada
              </div>
            </label>
            <input
              id="layer-upload"
              type="file"
              accept=".geojson,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
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
    </div>
  );
}
