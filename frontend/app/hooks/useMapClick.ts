import { useEffect, RefObject } from 'react';
import { useMapStore } from '../store/mapStore';
interface UseMapClickProps {
  mapRef: RefObject<mapboxgl.Map | null>;
  mapLoadedRef: RefObject<boolean>;
}

export const useMapClick = ({ mapRef, mapLoadedRef }: UseMapClickProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setupClickHandler = () => {
      if (!mapLoadedRef.current) return;

      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const { activeLayerId, activeTool, selectFeature, setPopupPosition, selectedFeatureId } = useMapStore.getState();
        
        // Se está em modo split E já tem feature selecionada, não processa cliques
        // O Draw vai lidar com o desenho da linha de corte
        if (activeTool === 'split' && selectedFeatureId) {
          return;
        }
        
        // Se não há camada ativa, não faz nada
        if (!activeLayerId) {
          return;
        }
        
        // Busca features apenas da camada ativa
        const activeLayerPrefix = `layer-${activeLayerId}`;
        
        // Lista todas as possíveis layers da camada ativa (fill, line, point, etc)
        const possibleLayers = [
          `${activeLayerPrefix}-fill`,
          `${activeLayerPrefix}-line`,
          `${activeLayerPrefix}-point`,
          `${activeLayerPrefix}-outline`,
        ].filter(layerId => map.getLayer(layerId));
        
        if (possibleLayers.length === 0) {
          return;
        }
        
        const mapFeatures = map.queryRenderedFeatures(e.point, {
          layers: possibleLayers,
        });

        // Se há ferramenta split, offset ou simplify ativa, armazena posição do clique
        if ((activeTool === 'split' || activeTool === 'offset' || activeTool === 'simplify') && mapFeatures.length > 0) {
          const featureId = mapFeatures[0].properties?.originalId;
          selectFeature(featureId);
          if (activeTool === 'offset' || activeTool === 'simplify') {
            setPopupPosition({ x: e.point.x, y: e.point.y });
          }
        } else if (!activeTool && mapFeatures.length > 0) {
          // Sem ferramenta ativa: seleciona e mostra popup de delete
          const featureId = mapFeatures[0].properties?.originalId;
          selectFeature(featureId);
          setPopupPosition({ x: e.point.x, y: e.point.y });
        } else {
          // Clicou fora ou sem feature: limpa seleção
          selectFeature(null);
          setPopupPosition(null);
        }
      };

      map.off('click', handleClick);
      map.on('click', handleClick);
    };

    if (mapLoadedRef.current) {
      setupClickHandler();
    } else {
      map.once('load', setupClickHandler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
