import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from '../Checkbox';

describe('Checkbox', () => {
  it('deve renderizar label e descrição', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Test" description="Desc" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('deve disparar onChange ao clicar', async () => {
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} label="Test" />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('deve renderizar como marcado', () => {
    render(<Checkbox checked={true} onChange={() => {}} label="Marcado" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('deve renderizar com ícone', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Icon" icon="⭐" />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('deve ser desabilitado', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Disabled" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});