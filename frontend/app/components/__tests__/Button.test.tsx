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

  describe('Estado Ativo', () => {
    it('deve aplicar estilo ativo quando active=true', () => {
      render(<Button active>Ativo</Button>);

      const button = screen.getByText('Ativo');
      expect(button).toHaveClass('bg-blue-700');
    });

    it('deve aplicar estilo ativo em variant danger', () => {
      render(
        <Button variant="danger" active>
          Ativo Danger
        </Button>
      );

      const button = screen.getByText('Ativo Danger');
      expect(button).toHaveClass('bg-red-700');
    });
  });

  describe('Estado Desabilitado', () => {
    it('deve desabilitar botão quando disabled=true', () => {
      render(<Button disabled>Desabilitado</Button>);

      const button = screen.getByText('Desabilitado');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('não deve chamar onClick quando desabilitado', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Desabilitado
        </Button>
      );

      const button = screen.getByText('Desabilitado');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Eventos', () => {
    it('deve chamar onClick quando clicado', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Clique</Button>);

      const button = screen.getByText('Clique');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onClick múltiplas vezes', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Clique</Button>);

      const button = screen.getByText('Clique');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Atributos HTML', () => {
    it('deve ter type="button" por padrão', () => {
      render(<Button>Button</Button>);

      const button = screen.getByText('Button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('deve aceitar type="submit"', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('deve aceitar type="reset"', () => {
      render(<Button type="reset">Reset</Button>);

      const button = screen.getByText('Reset');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('deve aplicar title', () => {
      render(<Button title="Tooltip do botão">Hover</Button>);

      const button = screen.getByText('Hover');
      expect(button).toHaveAttribute('title', 'Tooltip do botão');
    });
  });

  describe('Classes customizadas', () => {
    it('deve aplicar className adicional', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByText('Custom');
      expect(button).toHaveClass('custom-class');
    });

    it('deve manter classes base com className customizado', () => {
      render(<Button className="w-full">Full Width</Button>);

      const button = screen.getByText('Full Width');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('inline-flex'); // Classe base
    });
  });

  describe('Acessibilidade', () => {
    it('deve ser focável via teclado', () => {
      render(<Button>Focável</Button>);

      const button = screen.getByText('Focável');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('não deve ser focável quando desabilitado', () => {
      render(<Button disabled>Não Focável</Button>);

      const button = screen.getByText('Não Focável');
      button.focus();

      expect(button).not.toHaveFocus();
    });

    it('deve ter estilos de focus ring', () => {
      render(<Button>Focus</Button>);

      const button = screen.getByText('Focus');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('Combinações de props', () => {
    it('deve combinar variant + size + active', () => {
      render(
        <Button variant="danger" size="lg" active>
          Combo
        </Button>
      );

      const button = screen.getByText('Combo');
      expect(button).toHaveClass('bg-red-700'); // variant danger + active
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg'); // size lg
    });

    it('deve combinar todas as props', () => {
      const handleClick = jest.fn();

      render(
        <Button
          variant="success"
          size="sm"
          active
          disabled={false}
          onClick={handleClick}
          className="custom"
          type="submit"
          title="Tooltip"
        >
          Tudo
        </Button>
      );

      const button = screen.getByText('Tudo');
      expect(button).toHaveClass('bg-green-700'); // success + active
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm'); // sm
      expect(button).toHaveClass('custom');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('title', 'Tooltip');
      expect(button).not.toBeDisabled();
    });
  });
});
