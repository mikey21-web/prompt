import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQuery } from 'convex/react';
import { QuotaCard } from '@/components/QuotaCard';

describe('QuotaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when user is undefined', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const { container } = render(<QuotaCard />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('returns null when user is null', () => {
    vi.mocked(useQuery).mockReturnValue(null);
    const { container } = render(<QuotaCard />);
    expect(container.firstChild).toBeNull();
  });

  it('renders usage stats correctly', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'free',
      dailyUsage: 5,
      dailyReset: Date.now(),
    });
    render(<QuotaCard />);
    // free plan limit is 25
    expect(screen.getByText(/5 of 25 requests used/)).toBeInTheDocument();
    expect(screen.getByText(/20 remaining/)).toBeInTheDocument();
  });

  it('shows warning at >80% usage', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'free',
      dailyUsage: 22, // 88%
      dailyReset: Date.now(),
    });
    render(<QuotaCard />);
    expect(
      screen.getByText(/using more than 80% of your daily quota/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/View upgrade options/i)).toBeInTheDocument();
  });

  it('does not show warning under 80% usage', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'free',
      dailyUsage: 10, // 40%
      dailyReset: Date.now(),
    });
    render(<QuotaCard />);
    expect(
      screen.queryByText(/using more than 80%/i)
    ).not.toBeInTheDocument();
  });

  it('renders PlanBadge with the correct plan', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'pro',
      dailyUsage: 10,
      dailyReset: Date.now(),
    });
    render(<QuotaCard />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('shows the reset time line', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'free',
      dailyUsage: 1,
      dailyReset: Date.now(),
    });
    render(<QuotaCard />);
    expect(screen.getByText(/Resets at midnight UTC/i)).toBeInTheDocument();
  });
});
