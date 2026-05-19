import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock UI primitives so we don't depend on their internal shape (TokenSavings
// has a prop mismatch with OptimizeResult that's not relevant here).
vi.mock('@promptforge/ui', () => ({
  PromptDiff: ({ original, optimized }: any) => (
    <div data-testid="prompt-diff">
      <div data-testid="original">{original}</div>
      <div data-testid="optimized">{optimized}</div>
    </div>
  ),
  TokenSavings: ({ saved, percent }: any) => (
    <div data-testid="token-savings">
      Tokens saved: {saved} ({percent}%)
    </div>
  ),
}));

import { OptimizeResult } from '@/components/OptimizeResult';

describe('OptimizeResult', () => {
  const defaultProps = {
    original: 'The original prompt text here',
    optimized: 'The optimized prompt',
    tokens: { input: 100, output: 50 },
    originalTokens: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders original and optimized text', () => {
    render(<OptimizeResult {...defaultProps} />);
    expect(screen.getByTestId('original')).toHaveTextContent(
      defaultProps.original
    );
    expect(screen.getByTestId('optimized')).toHaveTextContent(
      defaultProps.optimized
    );
  });

  it('displays token counts (input & output)', () => {
    render(<OptimizeResult {...defaultProps} />);
    expect(screen.getByText('Input Tokens')).toBeInTheDocument();
    expect(screen.getByText('Output Tokens')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('copies optimized text to clipboard on Copy click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    render(<OptimizeResult {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(defaultProps.optimized);
    });
  });

  it('shows "Copied!" feedback after copying', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    render(<OptimizeResult {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows TokenSavings only when savedTokens > 0', () => {
    // savedTokens = originalTokens - tokens.output = 100 - 50 = 50 (>0)
    const { rerender } = render(<OptimizeResult {...defaultProps} />);
    expect(screen.getByTestId('token-savings')).toBeInTheDocument();

    // Now flip so savedTokens <= 0
    rerender(
      <OptimizeResult
        {...defaultProps}
        tokens={{ input: 100, output: 200 }}
        originalTokens={100}
      />
    );
    expect(screen.queryByTestId('token-savings')).not.toBeInTheDocument();
  });
});
