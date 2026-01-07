import { render, screen } from '@testing-library/react';
import LayerPanel from '../LayerPanel';

jest.mock('../../store/mapStore', () => ({
  useMapStore: () => ({
    layers: [],
    addLayer: jest.fn(),
    setError: jest.fn(),
    error: '',
  }),
}));
jest.mock('../../utils/geojsonValidator', () => ({
  isValidGeoJSON: jest.fn(() => true),
}));
jest.mock('../../services/api', () => ({
  api: {
    uploadFile: jest.fn(),
    getLayerGeoJSON: jest.fn(),
  },
}));

describe('LayerPanel', () => {
  it('deve renderizar header e estado vazio', () => {
    render(<LayerPanel />);
    expect(screen.getByText('Camadas')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma camada carregada')).toBeInTheDocument();
  });

  it('deve renderizar botões de ação', () => {
    render(<LayerPanel />);
    expect(screen.getByText('Importar Arquivo')).toBeInTheDocument();
    expect(screen.getByText('Carregar Camadas Salvas')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS principais', () => {
    render(<LayerPanel />);
    const panel = screen.getByText('Camadas').parentElement?.parentElement;
    expect(panel).toHaveClass('rounded-lg');
    expect(panel).toHaveClass('shadow-xl');
  });
});
