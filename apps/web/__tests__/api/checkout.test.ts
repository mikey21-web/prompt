import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- mocks must be declared before the route is imported ----
const authMock = vi.fn();
const currentUserMock = vi.fn();
const createCheckoutSessionMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
  currentUser: () => currentUserMock(),
}));

vi.mock('@/lib/billing', () => ({
  createCheckoutSession: (...args: unknown[]) =>
    createCheckoutSessionMock(...args),
}));

// Minimal NextRequest mock — only `.json()` is used by the route
type Body = Record<string, unknown> | undefined;
function mockReq(body?: Body) {
  return {
    json: async () => body ?? {},
  } as any;
}

import { POST } from '@/app/api/checkout/route';

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: 'user_123' });
    currentUserMock.mockResolvedValue({
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    });
    createCheckoutSessionMock.mockResolvedValue(
      'https://checkout.stripe.com/c/pay/cs_test_123'
    );
  });

  it('returns 401 when there is no auth', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const res = await POST(mockReq({ plan: 'pro' }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 for an invalid plan', async () => {
    const res = await POST(mockReq({ plan: 'enterprise' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid plan');
  });

  it('creates a checkout session for plan=pro', async () => {
    const res = await POST(mockReq({ plan: 'pro' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_123',
        email: 'test@example.com',
        plan: 'pro',
      })
    );
  });

  it('creates a checkout session for plan=team', async () => {
    const res = await POST(mockReq({ plan: 'team' }));
    expect(res.status).toBe(200);
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'team' })
    );
  });

  it('handles Stripe errors gracefully (500)', async () => {
    createCheckoutSessionMock.mockRejectedValueOnce(new Error('Stripe down'));
    const res = await POST(mockReq({ plan: 'pro' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Stripe down');
  });

  it('returns 400 when the user has no email', async () => {
    currentUserMock.mockResolvedValueOnce({ emailAddresses: [] });
    const res = await POST(mockReq({ plan: 'pro' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('No email on file');
  });
});
