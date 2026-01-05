import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '../Toolbar';
import { useMapStore } from '../../store/mapStore';
import type { Feature } from '../../types';

// Mock do store
jest.mock('../../store/mapStore');

// Mock do FileUpload
jest.mock('../FileUpload', () => {
  return function MockFileUpload({ onClose }: { onClose?: () => void }) {
    return (
      <div data-testid="mock-file-upload">
        <button onClick={onClose}>Close Upload</button>
      </div>
    );
  };
});

describe('Toolbar', () => {
  const mockSetActiveTool = jest.fn();
  const mockRemoveFeature = jest.fn();
  const mockSetPopupPosition = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        features: [],
        selectedFeatureId: null,
        activeTool: null,
        setActiveTool: mockSetActiveTool,
        removeFeature: mockRemoveFeature,
        setPopupPosition: mockSetPopupPosition,
      };
      return selector(state);
    });
  });

  describe('Renderização da Sidebar', () => {
    it('deve renderizar a sidebar com largura fixa', () => {
      render(<Toolbar />);
      const sidebar = screen.getByRole('button', { name: /upload/i }).closest('div.fixed');
      expect(sidebar).toHaveClass('w-16');
    });

    it('deve mostrar contador de linhas como 0 inicialmente', () => {
      render(<Toolbar />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('linhas')).toBeInTheDocument();
    });

    it('deve mostrar contador correto de features', () => {
      const mockFeatures: Feature[] = [
        {
          id: 'line-1',
          type: 'drawn',
          geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
          properties: {},
        },
        {
          id: 'line-2',
          type: 'uploaded',
          geometry: { type: 'LineString', coordinates: [[2, 2], [3, 3]] },
          properties: {},
        },
      ];

      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: mockFeatures,
          selectedFeatureId: null,
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('deve renderizar botão de upload com aria-label', () => {
      render(<Toolbar />);
      const uploadButton = screen.getByRole('button', { name: /upload de arquivo geojson/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('deve renderizar todas as 5 ferramentas', () => {
      render(<Toolbar />);
      
      // Verificar pelos títulos/tooltips
      const buttons = screen.getAllByRole('button');
      const toolButtons = buttons.filter(btn => 
        btn.getAttribute('title')?.includes('linha') || 
        btn.getAttribute('title')?.includes('magnética') ||
        btn.getAttribute('title')?.includes('geometria')
      );
      
      expect(toolButtons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Botão de Upload', () => {
    it('deve abrir modal ao clicar no botão de upload', () => {
      render(<Toolbar />);
      
      const uploadButton = screen.getByRole('button', { name: /upload de arquivo geojson/i });
      fireEvent.click(uploadButton);
      
      expect(screen.getByTestId('mock-file-upload')).toBeInTheDocument();
    });

    it('deve fechar modal ao clicar fora', () => {
      render(<Toolbar />);
      
      const uploadButton = screen.getByRole('button', { name: /upload de arquivo geojson/i });
      fireEvent.click(uploadButton);
      
      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);
      
      expect(screen.queryByTestId('mock-file-upload')).not.toBeInTheDocument();
    });

    it('modal deve ter atributos de acessibilidade', () => {
      render(<Toolbar />);
      
      const uploadButton = screen.getByRole('button', { name: /upload de arquivo geojson/i });
      fireEvent.click(uploadButton);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'upload-modal-title');
    });
  });

  describe('Ferramentas', () => {
    it('deve ativar ferramenta de desenho ao clicar', () => {
      render(<Toolbar />);

      const drawButton = screen.getByTitle('Desenhar nova linha');
      fireEvent.click(drawButton);

      expect(mockSetActiveTool).toHaveBeenCalledWith('draw');
    });

    it('deve desativar ferramenta ao clicar novamente', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [],
          selectedFeatureId: null,
          activeTool: 'draw',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const drawButton = screen.getByTitle('Desenhar nova linha');
      fireEvent.click(drawButton);

      expect(mockSetActiveTool).toHaveBeenCalledWith(null);
    });

    it('deve ativar ferramenta snap', () => {
      render(<Toolbar />);

      const snapButton = screen.getByTitle('Ativar atração magnética');
      fireEvent.click(snapButton);

      expect(mockSetActiveTool).toHaveBeenCalledWith('snap');
    });

    it('deve aplicar estilo ativo quando ferramenta está selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [],
          selectedFeatureId: null,
          activeTool: 'draw',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const drawButton = screen.getByTitle('Desenhar nova linha');
      expect(drawButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Ferramentas que requerem seleção', () => {
    it('deve desabilitar botão Cortar sem seleção', () => {
      render(<Toolbar />);

      const splitButton = screen.getByTitle('Dividir linha existente');
      expect(splitButton).toBeDisabled();
      expect(splitButton).toHaveClass('cursor-not-allowed');
    });

    it('deve desabilitar botão Offset sem seleção', () => {
      render(<Toolbar />);

      const offsetButton = screen.getByTitle('Criar linhas paralelas');
      expect(offsetButton).toBeDisabled();
    });

    it('deve desabilitar botão Suavizar sem seleção', () => {
      render(<Toolbar />);

      const simplifyButton = screen.getByTitle('Suavizar geometria');
      expect(simplifyButton).toBeDisabled();
    });

    it('deve habilitar ferramentas quando linha está selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [
            {
              id: 'line-1',
              type: 'drawn',
              geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
              properties: {},
            },
          ],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const splitButton = screen.getByTitle('Dividir linha existente');
      const offsetButton = screen.getByTitle('Criar linhas paralelas');
      const simplifyButton = screen.getByTitle('Suavizar geometria');

      expect(splitButton).not.toBeDisabled();
      expect(offsetButton).not.toBeDisabled();
      expect(simplifyButton).not.toBeDisabled();
    });

    it('deve chamar setPopupPosition ao clicar em offset com linha selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [{ id: 'line-1', type: 'drawn', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} }],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const offsetButton = screen.getByTitle('Criar linhas paralelas');
      fireEvent.click(offsetButton);

      expect(mockSetActiveTool).toHaveBeenCalledWith('offset');
      expect(mockSetPopupPosition).toHaveBeenCalled();
    });
  });

  describe('Botão Remover', () => {
    it('não deve mostrar botão remover sem seleção', () => {
      render(<Toolbar />);

      const removeButton = screen.queryByRole('button', { name: /remover linha selecionada do mapa/i });
      expect(removeButton).not.toBeInTheDocument();
    });

    it('deve mostrar botão remover quando linha está selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [
            {
              id: 'line-1',
              type: 'drawn',
              geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
              properties: {},
            },
          ],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const removeButton = screen.getByRole('button', { name: /remover linha selecionada do mapa/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('deve chamar removeFeature ao clicar no botão', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [
            {
              id: 'line-1',
              type: 'drawn',
              geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
              properties: {},
            },
          ],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const removeButton = screen.getByRole('button', { name: /remover linha selecionada do mapa/i });
      fireEvent.click(removeButton);

      expect(mockRemoveFeature).toHaveBeenCalledWith('line-1');
    });

    it('botão remover deve ter estilo vermelho', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [{ id: 'line-1', type: 'drawn', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} }],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
          setPopupPosition: mockSetPopupPosition,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const removeButton = screen.getByRole('button', { name: /remover linha selecionada do mapa/i });
      expect(removeButton).toHaveClass('bg-red-50', 'text-red-600');
    });
  });
});
