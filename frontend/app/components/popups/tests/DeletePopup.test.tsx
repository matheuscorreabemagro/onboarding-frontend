import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeletePopup from '../DeletePopup';

describe('DeletePopup', () => {
  it('deve renderizar e disparar onConfirm', async () => {
    const onConfirm = jest.fn();
    render(<DeletePopup position={{ x: 10, y: 10 }} onConfirm={onConfirm} onClose={() => {}} />);
    await userEvent.click(screen.getByText('Excluir'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('deve disparar onClose', async () => {
    const onClose = jest.fn();
    render(<DeletePopup position={{ x: 10, y: 10 }} onConfirm={() => {}} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve renderizar com posição customizada', () => {
    render(<DeletePopup position={{ x: 123, y: 456 }} onConfirm={() => {}} onClose={() => {}} />);
    const popup = screen.getByText('Excluir').parentElement?.parentElement;
    expect(popup).toHaveStyle({ left: '123px', top: '456px' });
  });
});