import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alert from '../Alert';

describe('Alert', () => {
  it('deve renderizar mensagem e fechar', async () => {
    const onClose = jest.fn();
    render(<Alert type="error" message="Erro!" onClose={onClose} />);
    expect(screen.getByText('Erro!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve renderizar variantes', () => {
    render(<Alert type="success" message="Sucesso!" onClose={() => {}} />);
    const alert = screen.getByText('Sucesso!').parentElement;
    expect(alert).toHaveClass('bg-green-50');

    render(<Alert type="warning" message="Atenção!" onClose={() => {}} />);
    expect(screen.getByText('Atenção!').parentElement).toHaveClass('bg-yellow-50');

    render(<Alert type="info" message="Info!" onClose={() => {}} />);
    expect(screen.getByText('Info!').parentElement).toHaveClass('bg-blue-50');
  });

});