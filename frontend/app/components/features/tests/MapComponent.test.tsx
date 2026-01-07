import { render, screen } from '@testing-library/react';
import MapComponent from '../MapComponent';

jest.mock('../../store/mapStore', () => ({
  useMapStore: () => ({
    layers: [],
    activeLayerId: null,
    selectedFeatureId: null,
    activeTool: null,
    popupPosition: null,
    setPopupPosition: jest.fn(),
    setActiveTool: jest.fn(),
    addFeatureToActiveLayer: jest.fn(),
    removeFeature: jest.fn(),
    removeFeatureFromActiveLayer: jest.fn(),
  }),
}));
jest.mock('../../utils/drawConfig', () => ({
  createDrawInstance: jest.fn(),
}));
jest.mock('../../utils/drawHandlers', () => ({
  handleDrawCreate: jest.fn(),
  handleDrawModeChange: jest.fn(),
}));
jest.mock('../../hooks/useMapInitialization', () => ({
  useMapInitialization: jest.fn(),
}));
jest.mock('../../hooks/useMapTools', () => ({ useMapTools: jest.fn() }));
jest.mock('../../hooks/useMapInteractions', () => ({ useMapInteractions: jest.fn() }));
jest.mock('../../hooks/useMapClick', () => ({ useMapClick: jest.fn() }));
jest.mock('../../hooks/useKeyboardEvents', () => ({ useKeyboardEvents: jest.fn() }));
jest.mock('../../hooks/useCursor', () => ({ useCursor: jest.fn() }));
jest.mock('../../hooks/useLayerRendering', () => ({ useLayerRendering: jest.fn() }));

describe('MapComponent', () => {
  it('deve renderizar o container do mapa e o painel de camadas', () => {
    render(<MapComponent />);
    expect(screen.getByText('Camadas')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma camada carregada')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS principais', () => {
    render(<MapComponent />);
    const mapDiv = screen.getByText('Camadas').parentElement?.parentElement?.previousSibling;
    expect(mapDiv).toHaveClass('relative');
  });
});
