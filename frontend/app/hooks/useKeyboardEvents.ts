import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';

interface UseKeyboardEventsProps {
  selectedFeatureId: string | null;
}

export const useKeyboardEvents = ({ selectedFeatureId }: UseKeyboardEventsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { activeTool, removeFeature } = useMapStore.getState();
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFeatureId && !activeTool) {
        e.preventDefault();
        removeFeature(selectedFeatureId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFeatureId]);
};
