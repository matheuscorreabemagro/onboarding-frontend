import { render, screen, fireEvent } from '@testing-library/react';
import Toolbar from '../Toolbar';
import { useMapStore } from '../../store/mapStore';
import type { Feature } from '../../types';

// Mock do store
jest.mock('../../store/mapStore');

describe('Toolbar', () => {
  const mockSetActiveTool = jest.fn();
  const mockRemoveFeature = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        features: [],
        selectedFeatureId: null,
        activeTool: null,
        setActiveTool: mockSetActiveTool,
        removeFeature: mockRemoveFeature,
      };
      return selector(state);
    });
  });

  describe('Renderização', () => {
    it('deve renderizar título e contador', () => {
      render(<Toolbar />);

      expect(screen.getByText('Controles')).toBeInTheDocument();
      expect(screen.getByText('Total de linhas:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
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
          type: 'drawn',
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
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('deve renderizar todas as ferramentas', () => {
      render(<Toolbar />);

      expect(screen.getByText('Desenhar')).toBeInTheDocument();
      expect(screen.getByText('Snap')).toBeInTheDocument();
      expect(screen.getByText('Cortar')).toBeInTheDocument();
      expect(screen.getByText('Offset')).toBeInTheDocument();
      expect(screen.getByText('Suavizar')).toBeInTheDocument();
    });
  });

  describe('Ativação de Ferramentas', () => {
    it('deve ativar ferramenta de desenho ao clicar', () => {
      render(<Toolbar />);

      const drawButton = screen.getByText('Desenhar').closest('button');
      fireEvent.click(drawButton!);

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
        };
        return selector(state);
      });

      render(<Toolbar />);

      const drawButton = screen.getByText('Desenhar').closest('button');
      fireEvent.click(drawButton!);

      expect(mockSetActiveTool).toHaveBeenCalledWith(null);
    });

    it('deve ativar ferramenta snap', () => {
      render(<Toolbar />);

      const snapButton = screen.getByText('Snap').closest('button');
      fireEvent.click(snapButton!);

      expect(mockSetActiveTool).toHaveBeenCalledWith('snap');
    });
  });

  describe('Ferramentas que requerem seleção', () => {
    it('deve desabilitar botão Cortar sem seleção', () => {
      render(<Toolbar />);

      const splitButton = screen.getByText('Cortar').closest('button');
      expect(splitButton).toBeDisabled();
    });

    it('deve desabilitar botão Offset sem seleção', () => {
      render(<Toolbar />);

      const offsetButton = screen.getByText('Offset').closest('button');
      expect(offsetButton).toBeDisabled();
    });

    it('deve desabilitar botão Suavizar sem seleção', () => {
      render(<Toolbar />);

      const simplifyButton = screen.getByText('Suavizar').closest('button');
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
        };
        return selector(state);
      });

      render(<Toolbar />);

      const splitButton = screen.getByText('Cortar').closest('button');
      const offsetButton = screen.getByText('Offset').closest('button');
      const simplifyButton = screen.getByText('Suavizar').closest('button');

      expect(splitButton).not.toBeDisabled();
      expect(offsetButton).not.toBeDisabled();
      expect(simplifyButton).not.toBeDisabled();
    });
  });

  describe('Botão Remover', () => {
    it('não deve mostrar botão remover sem seleção', () => {
      render(<Toolbar />);

      expect(screen.queryByText('Remover Linha')).not.toBeInTheDocument();
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
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('Remover Linha')).toBeInTheDocument();
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
        };
        return selector(state);
      });

      render(<Toolbar />);

      const removeButton = screen.getByText('Remover Linha');
      fireEvent.click(removeButton);

      expect(mockRemoveFeature).toHaveBeenCalledWith('line-1');
    });

    it('não deve mostrar botão remover quando ferramenta está ativa', () => {
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
          activeTool: 'split',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.queryByText('Remover Linha')).not.toBeInTheDocument();
    });
  });

  describe('Instruções de ferramenta ativa', () => {
    it('deve mostrar instruções quando ferramenta draw está ativa', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [],
          selectedFeatureId: null,
          activeTool: 'draw',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('Desenhar Ativo')).toBeInTheDocument();
      expect(screen.getByText('Clique no mapa • Duplo clique finaliza')).toBeInTheDocument();
    });

    it('deve mostrar instruções quando ferramenta snap está ativa', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [],
          selectedFeatureId: null,
          activeTool: 'snap',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('Snap Ativo')).toBeInTheDocument();
      expect(screen.getByText(/Desenhe próximo aos vértices/)).toBeInTheDocument();
    });

    it('deve mostrar instruções quando ferramenta split está ativa', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [{ id: 'line-1', type: 'drawn', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} }],
          selectedFeatureId: 'line-1',
          activeTool: 'split',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('Cortar Ativo')).toBeInTheDocument();
      expect(screen.getByText('Desenhe linha de corte • Duplo clique finaliza')).toBeInTheDocument();
    });
  });

  describe('Indicador visual de seleção', () => {
    it('deve mostrar indicador quando linha está selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [{ id: 'line-1', type: 'drawn', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} }],
          selectedFeatureId: 'line-1',
          activeTool: null,
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      expect(screen.getByText('✅ LINHA SELECIONADA (Vermelha)')).toBeInTheDocument();
      expect(screen.getByText(/Agora você pode usar: Cortar/)).toBeInTheDocument();
    });

    it('não deve mostrar indicador sem seleção', () => {
      render(<Toolbar />);

      expect(screen.queryByText('✅ LINHA SELECIONADA (Vermelha)')).not.toBeInTheDocument();
    });
  });

  describe('Estilos visuais', () => {
    it('deve aplicar estilo ativo na ferramenta selecionada', () => {
      (useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          features: [],
          selectedFeatureId: null,
          activeTool: 'draw',
          setActiveTool: mockSetActiveTool,
          removeFeature: mockRemoveFeature,
        };
        return selector(state);
      });

      render(<Toolbar />);

      const drawButton = screen.getByText('Desenhar').closest('button');
      expect(drawButton).toHaveClass('bg-blue-500');
    });
  });
});
