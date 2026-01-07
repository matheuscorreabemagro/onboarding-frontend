import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('deve renderizar título e descrição', () => {
    render(<EmptyState title="Sem dados" description="Nenhum item encontrado" />);
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
  });

  it('deve renderizar com ícone customizado', () => {
    render(<EmptyState title="Nada" description="Desc" icon="⭐" />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('deve aplicar classe customizada', () => {
    render(<EmptyState title="Classe" description="Desc" className="custom-empty" />);
    expect(screen.getByText('Classe').parentElement).toHaveClass('custom-empty');
  });
});