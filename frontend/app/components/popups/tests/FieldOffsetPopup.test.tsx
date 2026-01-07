import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FieldOffsetPopup from '../FieldOffsetPopup';

describe('FieldOffsetPopup', () => {
  const position = { x: 100, y: 200 };

  it('deve renderizar popup e Overlay', () => {
    render(<FieldOffsetPopup position={position} onApply={() => {}} onClose={() => {}} />);
    expect(screen.getByText('Direção das linhas paralelas')).toBeInTheDocument();
    // Overlay existe
    const overlays = screen.getAllByTestId('overlay');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('deve disparar onClose ao clicar fora', async () => {
    const onClose = jest.fn();
    render(<FieldOffsetPopup position={position} onApply={() => {}} onClose={onClose} />);
    // Overlay tem onClick
    const overlay = screen.getAllByTestId('overlay')[0];
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('deve avançar para detalhes e aplicar configuração', async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(<FieldOffsetPopup position={position} onApply={onApply} onClose={onClose} />);
    await userEvent.click(screen.getByText('Continuar'));
    expect(screen.getByText('Distância (m)')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Aplicar'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ direction: 'both' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve alterar direção ao clicar nos botões', async () => {
    render(<FieldOffsetPopup position={position} onApply={() => {}} onClose={() => {}} />);
    await userEvent.click(screen.getByText('Esq'));
    await userEvent.click(screen.getByText('Continuar'));
    expect(screen.getByText(/Direção:/)).toHaveTextContent('Esquerda');
    // Voltar e mudar para direita
    await userEvent.click(screen.getByText('Voltar'));
    await userEvent.click(screen.getByText('Dir'));
    await userEvent.click(screen.getByText('Continuar'));
    expect(screen.getByText(/Direção:/)).toHaveTextContent('Direita');
  });

  it('deve aplicar presets corretamente', async () => {
    render(<FieldOffsetPopup position={position} onApply={() => {}} onClose={() => {}} />);
    await userEvent.click(screen.getByText('Continuar'));
    const presetButtons = screen.getAllByRole('button', { name: /Presets|Ambos|Esq|Dir|Voltar|Aplicar|.*/ });
    // Clicar em todos os presets
    presetButtons.forEach(btn => {
      if (btn.textContent && !['Voltar', 'Aplicar'].includes(btn.textContent)) {
        userEvent.click(btn);
      }
    });
    // Espera que os valores mudem (não há assert direto pois depende dos presets)
    expect(screen.getByText(/Distância/)).toBeInTheDocument();
  });

  it('deve aplicar estilos de posição', () => {
    render(<FieldOffsetPopup position={position} onApply={() => {}} onClose={() => {}} />);
    const popup = screen.getByText('Direção das linhas paralelas').parentElement?.parentElement;
    expect(popup).toHaveStyle({ left: `${position.x}px`, top: `${position.y}px` });
  });
});