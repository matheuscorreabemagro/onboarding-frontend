import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportModal from '../ExportModal';

const mockFormats = [
  { id: 'geojson', label: 'GeoJSON', icon: 'geojson-icon', description: 'Formato padrão GeoJSON' },
  { id: 'shp', label: 'SHP', icon: 'shp-icon', description: 'Formato ESRI Shapefile' },
];

jest.mock('../../constants/config', () => ({
  EXPORT_FORMATS: mockFormats,
}));

describe('ExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onExport: jest.fn(async () => {}),
    layerName: 'Camada.geojson',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar título, formatos e botões', () => {
    render(<ExportModal {...defaultProps} />);
    expect(screen.getByText('Exportar: Camada')).toBeInTheDocument();
    expect(screen.getByText('GeoJSON')).toBeInTheDocument();
    expect(screen.getByText('SHP')).toBeInTheDocument();
    expect(screen.getByText('Exportar (2)')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve alternar seleção de formatos', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('GeoJSON'));
    expect(screen.getByText('Exportar (1)')).toBeInTheDocument();
    await userEvent.click(screen.getByText('SHP'));
    expect(screen.getByText('Exportar')).toBeInTheDocument();
  });

  it('deve selecionar e desmarcar todos', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Desmarcar todos'));
    expect(screen.getByText('Exportar')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Selecionar todos'));
    expect(screen.getByText('Exportar (2)')).toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar em Cancelar', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Cancelar'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve disparar onExport ao clicar em Exportar', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Exportar (2)'));
    expect(defaultProps.onExport).toHaveBeenCalledWith(['geojson', 'shp']);
  });

  it('deve mostrar erro se nenhum formato selecionado', async () => {
    render(<ExportModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Desmarcar todos'));
    await userEvent.click(screen.getByText('Exportar'));
    expect(screen.getByText(/Selecione pelo menos um formato/)).toBeInTheDocument();
  });

  it('deve aplicar classes CSS nos botões', () => {
    render(<ExportModal {...defaultProps} />);
    const exportBtn = screen.getByText('Exportar (2)');
    expect(exportBtn).toHaveClass('flex-1');
    const cancelBtn = screen.getByText('Cancelar');
    expect(cancelBtn).toHaveClass('flex-1');
  });
});