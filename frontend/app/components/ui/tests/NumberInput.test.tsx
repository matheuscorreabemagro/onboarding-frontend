import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberInput from '../NumberInput';

describe('NumberInput', () => {
  it('deve renderizar com valor', () => {
    render(<NumberInput value={5} onChange={() => {}} />);
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('deve disparar onChange ao digitar', async () => {
    const onChange = jest.fn();
    render(<NumberInput value={0} onChange={onChange} />);
    await userEvent.type(screen.getByRole('spinbutton'), '10');
    expect(onChange).toHaveBeenCalled();
  });

  it('deve ser desabilitado', () => {
    render(<NumberInput value={0} onChange={() => {}} disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('deve aplicar classe customizada', () => {
    render(<NumberInput value={0} onChange={() => {}} className="custom-number" />);
    expect(screen.getByRole('spinbutton')).toHaveClass('custom-number');
  });
});