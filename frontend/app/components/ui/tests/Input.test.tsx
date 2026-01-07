import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('deve renderizar com valor', () => {
    render(<Input value="abc" onChange={() => {}} />);
    expect(screen.getByDisplayValue('abc')).toBeInTheDocument();
  });

  it('deve disparar onChange ao digitar', async () => {
    const onChange = jest.fn();
    render(<Input value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'x');
    expect(onChange).toHaveBeenCalled();
  });

  it('deve ser desabilitado', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('deve aplicar classe customizada', () => {
    render(<Input value="" onChange={() => {}} className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });
});