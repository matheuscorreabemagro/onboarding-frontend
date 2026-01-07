import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('deve renderizar com tamanho sm', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('deve renderizar com tamanho md', () => {
    render(<LoadingSpinner size="md" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('deve renderizar com tamanho lg', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('deve aplicar cor customizada', () => {
    render(<LoadingSpinner size="sm" color="blue" />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('text-blue-500');
  });
});