import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from '../IconButton';

describe('IconButton', () => {
  it('deve renderizar children', () => {
    render(<IconButton onClick={() => {}}>Icon</IconButton>);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('deve disparar onClick', async () => {
    const onClick = jest.fn();
    render(<IconButton onClick={onClick}>Icon</IconButton>);
    await userEvent.click(screen.getByText('Icon'));
    expect(onClick).toHaveBeenCalled();
  });

  it('deve ser desabilitado', () => {
    render(<IconButton onClick={() => {}} disabled>Desabilitado</IconButton>);
    expect(screen.getByText('Desabilitado')).toBeDisabled();
  });

  it('deve aplicar classe customizada', () => {
    render(<IconButton onClick={() => {}} className="custom-icon">Classe</IconButton>);
    expect(screen.getByText('Classe')).toHaveClass('custom-icon');
  });
});