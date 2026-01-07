import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LayerItem from '../LayerItem';
import type { Geometry } from 'geojson';

const mockLayer = {
  id: 'layer1',
  name: 'Camada Teste',
  color: '#123456',
  isActive: false,
  isVisible: true,
  features: [{ id: 'f1', type: 'uploaded' as const, geometry: { type: 'Point', coordinates: [0, 0] } as Geometry, properties: {} }],
  zIndex: 1,
  opacity: 1,
  createdAt: new Date(),
};

jest.mock('../../store/mapStore', () => ({
  useMapStore: () => jest.fn(),
}));
jest.mock('../../hooks/useLayerSave', () => ({
  useLayerSave: () => ({
    saving: false,
    saveError: '',
    successMessage: '',
    saveLayer: jest.fn(),
    clearMessages: jest.fn(),
  }),
}));
jest.mock('../../hooks/useLayerExport', () => ({
  useLayerExport: () => ({
    exportLayer: jest.fn(),
  }),
}));
jest.mock('../../utils/layerHelpers', () => ({
  getGeometryTypes: () => 'Point',
  getLayerBackendId: () => 'backend-1',
  isLayerSaved: () => true,
}));

describe('LayerItem', () => {
  it('deve renderizar nome, cor e botões', () => {
    render(<LayerItem layer={mockLayer} />);
    expect(screen.getByText('Camada Teste')).toBeInTheDocument();
    expect(screen.getByTitle('Editar nome')).toBeInTheDocument();
    expect(screen.getByTitle('Exportar')).toBeInTheDocument();
    expect(screen.getByTitle('Ocultar camada')).toBeInTheDocument();
    expect(screen.getByTitle('Excluir camada')).toBeInTheDocument();
  });

  it('deve alternar edição de nome', async () => {
    render(<LayerItem layer={mockLayer} />);
    await userEvent.click(screen.getByTitle('Editar nome'));
    const input = screen.getByDisplayValue('Camada Teste');
    expect(input).toBeInTheDocument();
    await userEvent.type(input, ' Nova');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('Camada Teste Nova')).toBeInTheDocument();
  });

  it('deve abrir modal de exportação', async () => {
    render(<LayerItem layer={mockLayer} />);
    await userEvent.click(screen.getByTitle('Exportar'));
    expect(screen.getByText(/Exportar:/)).toBeInTheDocument();
  });

  it('deve abrir dialog de exclusão', async () => {
    render(<LayerItem layer={mockLayer} />);
    await userEvent.click(screen.getByTitle('Excluir camada'));
    expect(screen.getByText(/Excluir Camada/)).toBeInTheDocument();
  });

  it('deve aplicar classes CSS principais', () => {
    render(<LayerItem layer={mockLayer} />);
    const item = screen.getByText('Camada Teste').parentElement?.parentElement;
    expect(item).toHaveClass('rounded-lg');
    expect(item).toHaveClass('border-2');
  });
});
