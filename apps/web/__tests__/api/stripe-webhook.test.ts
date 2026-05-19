import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks declared before route import
const constructEventMock = vi.fn();
const subscriptionsRetrieveMock = vi.fn();
const convexMutationMock = vi.fn();

vi.mock('@/lib/billing', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => constructEventMock(...args),
    },
    subscriptions: {
      retrieve: (...args: unknown[]) => subscriptionsRetrieveMock(...args),
    },
  },
}));

vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    mutation: (...args: unknown[]) => convexMutationMock(...args),
  })),
}));

function mockReq(body: string, sig: string | null) {
  return {
    text: async () => body,
    headers: {
      get: (key: string) => (key === 'stripe-signature' ? sig : null),
    },
  } as any;
}

// Ensure STRIPE_WEBHOOK_SECRET is set so signature verification path is taken
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

import { POST } from '@/app/api/webhooks/stripe/route';

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when signature header is missing', async () => {
    const res = await POST(mockReq('{}', null));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing signature');
  });

  it('returns 400 on invalid signature', async () => {
    constructEventMock.mockImplementationOnce(() => {
      throw new Error('bad sig');
    });
    const res = await POST(mockReq('{}', 'sig_bad'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid signature');
  });

  it('handles checkout.session.completed and updates the plan', async () => {
    constructEventMock.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user_42', plan: 'pro' },
          customer: 'cus_123',
        },
      },
    });
    convexMutationMock.mockResolvedValueOnce(undefined);

    const res = await POST(mockReq('{}', 'sig_ok'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(convexMutationMock).toHaveBeenCalledWith(
      'users.updatePlan',
      expect.objectContaining({
        clerkId: 'user_42',
        plan: 'pro',
        stripeCustomerId: 'cus_123',
      })
    );
  });

  it('still returns 200 when the Convex mutation fails', async () => {
    constructEventMock.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user_42', plan: 'team' },
          customer: 'cus_999',
        },
      },
    });
    convexMutationMock.mockRejectedValueOnce(new Error('convex down'));

    const res = await POST(mockReq('{}', 'sig_ok'));
    expect(res.status).toBe(200);
  });

  it('handles invoice.payment_succeeded by retrieving the subscription', async () => {
    constructEventMock.mockReturnValueOnce({
      type: 'invoice.payment_succeeded',
      data: { object: { subscription: 'sub_789' } },
    });
    subscriptionsRetrieveMock.mockResolvedValueOnce({
      id: 'sub_789',
      customer: 'cus_xyz',
    });

    const res = await POST(mockReq('{}', 'sig_ok'));
    expect(res.status).toBe(200);
    expect(subscriptionsRetrieveMock).toHaveBeenCalledWith('sub_789');
  });

  it('handles customer.subscription.deleted without erroring', async () => {
    constructEventMock.mockReturnValueOnce({
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_zzz' } },
    });
    const res = await POST(mockReq('{}', 'sig_ok'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
