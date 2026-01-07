import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  describe('Renderização', () => {
    it('deve renderizar com children', () => {
      render(<Button>Clique aqui</Button>);
      expect(screen.getByText('Clique aqui')).toBeInTheDocument();
    });

    it('deve renderizar com ícones', () => {
      render(
        <Button>
          <span>✏️</span> Desenhar
        </Button>
      );
      expect(screen.getByText('✏️')).toBeInTheDocument();
      expect(screen.getByText('Desenhar')).toBeInTheDocument();
    });
  });

  describe('Variantes', () => {
    it('deve aplicar estilo primary por padrão', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button).toHaveClass('bg-blue-600');
    });
    it('deve aplicar estilo secondary', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('bg-gray-200');
    });
    it('deve aplicar estilo danger', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByText('Danger');
      expect(button).toHaveClass('bg-red-600');
    });
    it('deve aplicar estilo success', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByText('Success');
      expect(button).toHaveClass('bg-green-600');
    });
    it('deve aplicar estilo outline', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByText('Outline');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('text-gray-700');
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho md por padrão', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByText('Medium');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });
    it('deve aplicar tamanho sm', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText('Small');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
    it('deve aplicar tamanho lg', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText('Large');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('Props', () => {
    it('deve ser desabilitado', () => {
      render(<Button disabled>Desabilitado</Button>);
      expect(screen.getByText('Desabilitado')).toBeDisabled();
    });
    it('deve disparar onClick', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Clique</Button>);
      await userEvent.click(screen.getByText('Clique'));
      expect(onClick).toHaveBeenCalled();
    });
    it('deve aplicar classe customizada', () => {
      render(<Button className="custom">Classe</Button>);
      expect(screen.getByText('Classe')).toHaveClass('custom');
    });
  });
});