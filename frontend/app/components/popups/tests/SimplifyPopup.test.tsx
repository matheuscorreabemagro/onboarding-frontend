import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimplifyPopup from '../SimplifyPopup';

describe('SimplifyPopup', () => {
  const position = { x: 50, y: 80 };

  it('deve renderizar popup e Overlay', () => {
    render(<SimplifyPopup position={position} onApply={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Nível de suavização')).toBeInTheDocument();
    // Overlay existe
    const overlays = screen.getAllByTestId('overlay');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('deve disparar onClose ao clicar fora', async () => {
    const onClose = jest.fn();
    render(<SimplifyPopup position={position} onApply={() => {}} onClose={onClose} />);
    const overlay = screen.getAllByTestId('overlay')[0];
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('deve aplicar nível selecionado e disparar onApply', async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(<SimplifyPopup position={position} onApply={onApply} onClose={onClose} />);
    await userEvent.click(screen.getByText('Aplicar'));
    expect(onApply).toHaveBeenCalledWith('medium');
    expect(onClose).toHaveBeenCalled();
  });

  it('deve alternar entre níveis de suavização', async () => {
    render(<SimplifyPopup position={position} onApply={() => {}} onClose={() => {}} />);
    await userEvent.click(screen.getByText('Baixo'));
    expect(screen.getByText('Suavização leve, mantém mais detalhes')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Alto'));
    expect(screen.getByText('Suavização forte, remove mais vértices')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Médio'));
    expect(screen.getByText('Suavização moderada, balanceada')).toBeInTheDocument();
  });

  it('deve aplicar estilos de posição', () => {
    render(<SimplifyPopup position={position} onApply={() => {}} onClose={() => {}} />);
    const popup = screen.getByText('Nível de suavização').parentElement?.parentElement;
    expect(popup).toHaveStyle({ left: `${position.x}px`, top: `${position.y}px` });
  });
});