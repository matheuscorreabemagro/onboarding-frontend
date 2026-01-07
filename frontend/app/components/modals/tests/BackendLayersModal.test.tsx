import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackendLayersModal from '../BackendLayersModal';

const mockLayers = [
  {
    id: '1',
    name: 'Layer 1',
    geometry_type: 'Polygon',
    description: 'Primeira camada',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Layer 2',
    geometry_type: 'LineString',
    description: 'Segunda camada',
    created_at: new Date().toISOString(),
  },
];

jest.mock('../../hooks/useBackendLayers', () => ({
  useBackendLayers: () => ({
    layers: mockLayers,
    loading: false,
    error: '',
    selectedLayers: new Set(),
    toggleSelection: jest.fn(),
    selectAll: jest.fn(),
    clearSelection: jest.fn(),
    deleteSelected: jest.fn(),
  }),
}));

describe('BackendLayersModal', () => {
  it('deve renderizar título e lista de camadas', () => {
    render(<BackendLayersModal isOpen={true} onClose={() => {}} onLoadLayer={() => {}} />);
    expect(screen.getByText('Camadas Salvas')).toBeInTheDocument();
    expect(screen.getByText('Layer 1')).toBeInTheDocument();
    expect(screen.getByText('Layer 2')).toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar no botão fechar', async () => {
    const onClose = jest.fn();
    render(<BackendLayersModal isOpen={true} onClose={onClose} onLoadLayer={() => {}} />);
    await userEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve mostrar estado de loading', () => {
    jest.mock('../../hooks/useBackendLayers', () => ({
      useBackendLayers: () => ({
        layers: [],
        loading: true,
        error: '',
        selectedLayers: new Set(),
        toggleSelection: jest.fn(),
        selectAll: jest.fn(),
        clearSelection: jest.fn(),
        deleteSelected: jest.fn(),
      }),
    }));
    render(<BackendLayersModal isOpen={true} onClose={() => {}} onLoadLayer={() => {}} />);
    expect(screen.getByText('Carregar Selecionadas')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('deve mostrar estado de erro', () => {
    jest.mock('../../hooks/useBackendLayers', () => ({
      useBackendLayers: () => ({
        layers: [],
        loading: false,
        error: 'Erro ao carregar',
        selectedLayers: new Set(),
        toggleSelection: jest.fn(),
        selectAll: jest.fn(),
        clearSelection: jest.fn(),
        deleteSelected: jest.fn(),
      }),
    }));
    render(<BackendLayersModal isOpen={true} onClose={() => {}} onLoadLayer={() => {}} />);
    expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
  });

  it('deve mostrar EmptyState quando não há camadas', () => {
    jest.mock('../../hooks/useBackendLayers', () => ({
      useBackendLayers: () => ({
        layers: [],
        loading: false,
        error: '',
        selectedLayers: new Set(),
        toggleSelection: jest.fn(),
        selectAll: jest.fn(),
        clearSelection: jest.fn(),
        deleteSelected: jest.fn(),
      }),
    }));
    render(<BackendLayersModal isOpen={true} onClose={() => {}} onLoadLayer={() => {}} />);
    expect(screen.getByText('Nenhuma camada salva')).toBeInTheDocument();
  });

  it('deve renderizar botões de ação e disparar callbacks', async () => {
    const onClose = jest.fn();
    const onLoadLayer = jest.fn();
    render(<BackendLayersModal isOpen={true} onClose={onClose} onLoadLayer={onLoadLayer} />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Excluir Selecionadas')).toBeInTheDocument();
    expect(screen.getByText('Carregar Selecionadas')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve aplicar estilos de modal', () => {
    render(<BackendLayersModal isOpen={true} onClose={() => {}} onLoadLayer={() => {}} />);
    const modal = screen.getByText('Camadas Salvas').parentElement?.parentElement?.parentElement;
    expect(modal).toHaveClass('bg-white');
    expect(modal).toHaveStyle({ maxWidth: '32rem' });
  });
});