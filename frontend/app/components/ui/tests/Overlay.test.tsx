import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overlay from '../Overlay';

describe('Overlay', () => {
  it('deve renderizar overlay', () => {
    const { container } = render(<Overlay onClick={() => {}} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('deve disparar onClick ao clicar', async () => {
    const onClick = jest.fn();
    render(<Overlay onClick={onClick} />);
    await userEvent.click(screen.getByTestId('overlay'));
    expect(onClick).toHaveBeenCalled();
  });

  it('deve aplicar classe customizada', () => {
    render(<Overlay onClick={() => {}} className="custom-overlay" />);
    expect(screen.getByTestId('overlay')).toHaveClass('custom-overlay');
  });
});