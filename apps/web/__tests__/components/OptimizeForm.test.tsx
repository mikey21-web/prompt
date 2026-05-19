import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OptimizeForm } from '@/components/OptimizeForm';

describe('OptimizeForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
  });

  it('renders 3 mode buttons (compress, enhance, rewrite)', () => {
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    expect(screen.getByText('Compress')).toBeInTheDocument();
    expect(screen.getByText('Enhance')).toBeInTheDocument();
    expect(screen.getByText('Rewrite')).toBeInTheDocument();
  });

  it('submits the form with prompt + mode + model', async () => {
    const user = userEvent.setup();
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    await user.type(
      screen.getByLabelText(/your prompt/i),
      'Write a poem about rain'
    );
    await user.click(
      screen.getByRole('button', { name: /optimize prompt/i })
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      'Write a poem about rain',
      'compress',
      'gpt-4o-mini'
    );
  });

  it('disables submit button on empty prompt', () => {
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    const button = screen.getByRole('button', { name: /optimize prompt/i });
    expect(button).toBeDisabled();
  });

  it('switches the active mode when a different mode is clicked', async () => {
    const user = userEvent.setup();
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    await user.type(screen.getByLabelText(/your prompt/i), 'hello');
    await user.click(screen.getByText('Enhance'));
    await user.click(
      screen.getByRole('button', { name: /optimize prompt/i })
    );
    expect(onSubmit).toHaveBeenCalledWith('hello', 'enhance', 'gpt-4o-mini');
  });

  it('shows both target models in the dropdown', () => {
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    const select = screen.getByLabelText(/target model/i) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('gpt-4o-mini');
    expect(options).toContain('gpt-4o');
  });

  it('defaults to gpt-4o-mini', () => {
    render(<OptimizeForm onSubmit={onSubmit} loading={false} />);
    const select = screen.getByLabelText(/target model/i) as HTMLSelectElement;
    expect(select.value).toBe('gpt-4o-mini');
  });

  it('shows loading text when loading is true', () => {
    render(<OptimizeForm onSubmit={onSubmit} loading={true} />);
    expect(
      screen.getByRole('button', { name: /optimize prompt/i })
    ).toHaveTextContent(/optimizing/i);
    expect(screen.getByLabelText(/your prompt/i)).toBeDisabled();
  });
});
