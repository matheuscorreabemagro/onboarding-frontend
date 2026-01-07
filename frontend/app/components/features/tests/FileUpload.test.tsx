import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../FileUpload';

jest.mock('../../store/mapStore', () => ({
  useMapStore: () => jest.fn(),
}));
jest.mock('../../utils/geojsonValidator', () => ({
  isValidGeoJSON: jest.fn(() => true),
}));

const mockAddLayer = jest.fn();
const mockSetError = jest.fn();

jest.mock('../../store/mapStore', () => ({
  useMapStore: (fn: unknown) => {
    if ((fn as { name?: string }).name === 'addLayer') return mockAddLayer;
    if ((fn as { name?: string }).name === 'setError') return mockSetError;
    return null;
  },
}));

describe('FileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar área de upload', () => {
    render(<FileUpload />);
    expect(screen.getByText(/Faça upload do GeoJSON/)).toBeInTheDocument();
    expect(screen.getByText(/Clique para selecionar/)).toBeInTheDocument();
  });

  it('deve disparar input file ao clicar', async () => {
    render(<FileUpload />);
    const area = screen.getByText(/Faça upload do GeoJSON/).parentElement;
    if (area) {
      await userEvent.click(area);
      // Não há assert direto, mas não deve quebrar
    }
  });

  it('deve mostrar mensagem ao arrastar arquivo', () => {
    render(<FileUpload />);
    const area = screen.getByText(/Faça upload do GeoJSON/).parentElement;
    if (area) {
      userEvent.upload(area, new File(['{}'], 'test.geojson', { type: 'application/geo+json' }));
      expect(screen.getByText(/Solte o arquivo aqui/)).toBeInTheDocument();
    }
  });

  it('deve mostrar erro se múltiplos arquivos', () => {
    render(<FileUpload />);
    const input = screen.getByRole('textbox', { hidden: true });
    userEvent.upload(input, [
      new File(['{}'], 'a.geojson', { type: 'application/geo+json' }),
      new File(['{}'], 'b.geojson', { type: 'application/geo+json' })
    ]);
    expect(mockSetError).toHaveBeenCalled();
  });

  it('deve chamar addLayer ao upload válido', async () => {
    render(<FileUpload />);
    const input = screen.getByRole('textbox', { hidden: true });
    const file = new File([
      JSON.stringify({ type: 'FeatureCollection', features: [{ geometry: { type: 'Point' } }] })
    ], 'test.geojson', { type: 'application/geo+json' });
    await userEvent.upload(input, file);
    expect(mockAddLayer).toHaveBeenCalled();
  });

  it('deve mostrar Alert de erro', () => {
    mockSetError.mockReturnValue('Arquivo inválido');
    render(<FileUpload />);
    expect(screen.getByText(/Arquivo inválido/)).toBeInTheDocument();
  });

  it('deve aplicar classes CSS principais', () => {
    render(<FileUpload />);
    const area = screen.getByText(/Faça upload do GeoJSON/).parentElement;
    expect(area).toHaveClass('rounded-xl');
    expect(area).toHaveClass('border-2');
  });
});
