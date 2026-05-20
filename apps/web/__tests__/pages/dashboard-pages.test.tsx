import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuery, useMutation } from 'convex/react';

import HistoryPage from '@/app/(dashboard)/history/page';
import TemplatesPage from '@/app/(dashboard)/templates/page';
import SettingsPage from '@/app/(dashboard)/settings/page';
import BillingPage from '@/app/(dashboard)/billing/page';

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading state when history is undefined', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const { container } = render(<HistoryPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows the empty state when there is no history', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<HistoryPage />);
    expect(
      screen.getByText(/No prompts yet\. Start by optimizing one!/i)
    ).toBeInTheDocument();
  });

  it('renders history items', () => {
    vi.mocked(useQuery).mockReturnValue([
      {
        _id: 'p1',
        original: 'Hello world prompt',
        createdAt: new Date('2025-01-15T12:00:00Z').getTime(),
      },
      {
        _id: 'p2',
        original: 'Another prompt',
        createdAt: new Date('2025-02-01T12:00:00Z').getTime(),
      },
    ] as any);
    render(<HistoryPage />);
    expect(screen.getByText('Hello world prompt')).toBeInTheDocument();
    expect(screen.getByText('Another prompt')).toBeInTheDocument();
  });
});

describe('TemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading state when templates is undefined', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const { container } = render(<TemplatesPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows the empty state when there are no templates', () => {
    vi.mocked(useQuery).mockReturnValue([]);
    render(<TemplatesPage />);
    expect(
      screen.getByText(/No templates yet\. Save a prompt to create one!/i)
    ).toBeInTheDocument();
  });

  it('renders templates when present', () => {
    vi.mocked(useQuery).mockReturnValue([
      {
        _id: 't1',
        title: 'Cold Email Template',
        description: 'Best cold email template',
        tags: ['sales', 'email'],
        targetModel: 'gpt-4o-mini',
        votes: 12,
        usageCount: 30,
      },
    ] as any);
    render(<TemplatesPage />);
    expect(screen.getByText('Cold Email Template')).toBeInTheDocument();
    expect(screen.getByText(/New Template/i)).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // settings page now needs convexUser to be defined
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      preferences: { emailNotifications: true },
    });
  });

  it('renders the user email and the email-notifications checkbox', () => {
    render(<SettingsPage />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', {
      name: /email notifications/i,
    }) as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(true);
  });

  it('persists toggle changes via the updatePreferences mutation', async () => {
    const updatePreferences = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useMutation).mockReturnValue(updatePreferences as any);
    const user = userEvent.setup();
    render(<SettingsPage />);
    const checkbox = screen.getByRole('checkbox', {
      name: /email notifications/i,
    }) as HTMLInputElement;
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(updatePreferences).toHaveBeenCalledWith({
      emailNotifications: false,
    });
  });

  it('shows a loading indicator while convex user is undefined', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const { container } = render(<SettingsPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the three plans (Free, Pro, Team)', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'free',
      dailyUsage: 1,
      dailyReset: Date.now(),
    });
    render(<BillingPage />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$9')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
  });

  it('marks the current plan as "Current Plan"', () => {
    vi.mocked(useQuery).mockReturnValue({
      _id: 'user_1',
      plan: 'pro',
      dailyUsage: 1,
      dailyReset: Date.now(),
    });
    render(<BillingPage />);
    // At least one button should now say "Current Plan"
    const currentButtons = screen.getAllByRole('button', {
      name: /current plan/i,
    });
    expect(currentButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the loading skeleton when user is undefined', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const { container } = render(<BillingPage />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
