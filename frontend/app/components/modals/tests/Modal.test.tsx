import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Título do Modal',
    children: 'Conteúdo do modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar título e conteúdo quando aberto', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('não deve renderizar quando fechado', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Título do Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar no botão fechar', async () => {
    render(<Modal {...defaultProps} />);
    const closeBtn = screen.getByTitle('Fechar');
    await userEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve disparar onClose ao clicar no overlay', async () => {
    render(<Modal {...defaultProps} />);
    const overlay = screen.getByText('Título do Modal').parentElement?.parentElement?.parentElement;
    if (overlay) {
      await userEvent.click(overlay);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('deve disparar onClose ao pressionar ESC', () => {
    render(<Modal {...defaultProps} />);
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve renderizar variantes de largura', () => {
    const { rerender } = render(<Modal {...defaultProps} maxWidth="sm" />);
    let modal = screen.getByText('Título do Modal').parentElement?.parentElement;
    expect(modal).toHaveClass('max-w-sm');
    rerender(<Modal {...defaultProps} maxWidth="md" />);
    modal = screen.getByText('Título do Modal').parentElement?.parentElement;
    expect(modal).toHaveClass('max-w-md');
    rerender(<Modal {...defaultProps} maxWidth="lg" />);
    modal = screen.getByText('Título do Modal').parentElement?.parentElement;
    expect(modal).toHaveClass('max-w-lg');
    rerender(<Modal {...defaultProps} maxWidth="xl" />);
    modal = screen.getByText('Título do Modal').parentElement?.parentElement;
    expect(modal).toHaveClass('max-w-xl');
  });

  it('deve aplicar classes CSS principais', () => {
    render(<Modal {...defaultProps} />);
    const modal = screen.getByText('Título do Modal').parentElement?.parentElement;
    expect(modal).toHaveClass('bg-white');
    expect(modal).toHaveClass('rounded-xl');
  });
});