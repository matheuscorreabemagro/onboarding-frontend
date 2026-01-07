import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirmação',
    message: 'Deseja continuar?',
    confirmText: 'Sim',
    cancelText: 'Não',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar título, mensagem e botões', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirmação')).toBeInTheDocument();
    expect(screen.getByText('Deseja continuar?')).toBeInTheDocument();
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
  });

  it('deve disparar onConfirm e onClose ao clicar em Sim', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText('Sim'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('deve disparar apenas onClose ao clicar em Não', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    await userEvent.click(screen.getByText('Não'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('deve renderizar variantes de botão', () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} confirmVariant="danger" />);
    const dangerBtn = screen.getByText('Sim');
    expect(dangerBtn).toHaveClass('bg-red-600');
    rerender(<ConfirmDialog {...defaultProps} confirmVariant="primary" />);
    const primaryBtn = screen.getByText('Sim');
    expect(primaryBtn).toHaveClass('bg-blue-600');
  });

  it('deve aplicar classes CSS nos botões', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const cancelBtn = screen.getByText('Não');
    expect(cancelBtn).toHaveClass('bg-gray-100');
    const confirmBtn = screen.getByText('Sim');
    expect(confirmBtn).toHaveClass('rounded-lg');
  });
});