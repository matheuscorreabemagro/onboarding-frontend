import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from '../Toolbar';

jest.mock('../../store/mapStore', () => ({
  useMapStore: () => ({
    layers: [],
    activeLayerId: null,
    selectedFeatureId: null,
    removeFeatureFromActiveLayer: jest.fn(),
    activeTool: null,
    setActiveTool: jest.fn(),
    setPopupPosition: jest.fn(),
  }),
}));
jest.mock('../../services/toolsService', () => ({
  getToolValidation: () => ({ canSplit: true, canOffset: true, canSimplify: true }),
}));

describe('Toolbar', () => {
  it('deve renderizar botões de ferramentas e upload', () => {
    render(<Toolbar />);
    expect(screen.getByTitle('Upload GeoJSON')).toBeInTheDocument();
    expect(screen.getByText('Desenhar')).toBeInTheDocument();
    expect(screen.getByText('Snap')).toBeInTheDocument();
    expect(screen.getByText('Cortar')).toBeInTheDocument();
    expect(screen.getByText('Offset')).toBeInTheDocument();
    expect(screen.getByText('Suavizar')).toBeInTheDocument();
  });

  it('deve abrir modal de upload ao clicar', async () => {
    render(<Toolbar />);
    await userEvent.click(screen.getByTitle('Upload GeoJSON'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS principais', () => {
    render(<Toolbar />);
    const toolbar = screen.getByTitle('Upload GeoJSON').parentElement?.parentElement;
    expect(toolbar).toHaveClass('border-r');
    expect(toolbar).toHaveClass('shadow-lg');
  });
});
