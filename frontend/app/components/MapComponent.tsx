'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';

// Define o token de acesso do Mapbox (use variável de ambiente)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MapComponent: React.FC = () => {
  // Cria uma referência para a div do mapa
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const features = useMapStore((state) => state.features);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-47.9292, -15.7801],
      zoom: 4,
    });

    map.on('load', () => {
      map.addSource('lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'lines-layer',
        type: 'line',
        source: 'lines',
        paint: {
          'line-color': '#3388ff',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    // Aguarda o mapa carregar completamente
    const updateMapData = () => {
      const source = map.getSource('lines') as mapboxgl.GeoJSONSource;
      if (!source) {
        return;
      }

      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: features.map((f) => ({
          type: 'Feature' as const,
          geometry: f.geometry,
          properties: { ...f.properties, id: f.id, source: f.type },
        })),
      };

      source.setData(geojsonData);

      // Ajusta o viewport para mostrar todas as features (fit bounds)
      if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach((feature) => {
          feature.geometry.coordinates.forEach((coord) => {
            bounds.extend(coord as [number, number]);
          });
        });
        map.fitBounds(bounds, { padding: 100, duration: 1500, maxZoom: 15 });
      }
    };

    if (map.isStyleLoaded()) {
      updateMapData();
    } else {
      map.once('load', updateMapData);
    }
  }, [features]);

  // Renderiza a div que será o container do mapa
  return (
    <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }} className="relative" />
  );
};

export default MapComponent;
