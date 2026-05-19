import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PricingCard } from '@/components/PricingCard';

describe('PricingCard', () => {
  const defaultProps = {
    name: 'Pro',
    price: 9,
    period: 'per month',
    features: ['500 optimizations/day', 'Priority routing', 'API access'],
    onAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onAction = vi.fn();
  });

  it('renders plan name and price', () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$9')).toBeInTheDocument();
    expect(screen.getByText('per month')).toBeInTheDocument();
  });

  it('lists all features', () => {
    render(<PricingCard {...defaultProps} />);
    defaultProps.features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('shows "Current Plan" text when isCurrentPlan is true', () => {
    render(<PricingCard {...defaultProps} isCurrentPlan />);
    expect(screen.getByRole('button')).toHaveTextContent('Current Plan');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows "Upgrade" text for non-current plans', () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveTextContent('Upgrade');
  });

  it('calls onAction when Upgrade clicked', async () => {
    const user = userEvent.setup();
    render(<PricingCard {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /upgrade/i }));
    expect(defaultProps.onAction).toHaveBeenCalledTimes(1);
  });

  it('renders the "Most Popular" badge when isPopular is true', () => {
    render(<PricingCard {...defaultProps} isPopular />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('does not render the popular badge when isPopular is false', () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
  });

  it('shows "Processing..." text when loading', () => {
    render(<PricingCard {...defaultProps} loading />);
    expect(screen.getByRole('button')).toHaveTextContent(/processing/i);
  });
});
