import { describe, it, expect, beforeEach } from 'vitest';
import { createLimiter, identifyRequest } from '@/lib/ratelimit';

describe('createLimiter', () => {
  let limiter: ReturnType<typeof createLimiter>;

  beforeEach(() => {
    limiter = createLimiter({ limit: 3, windowMs: 1000, prefix: 'test' });
  });

  it('allows up to `limit` requests in a window', async () => {
    for (let i = 0; i < 3; i++) {
      const r = await limiter.limit('user_a');
      expect(r.success).toBe(true);
    }
  });

  it('blocks the request that exceeds the limit', async () => {
    for (let i = 0; i < 3; i++) await limiter.limit('user_b');
    const blocked = await limiter.limit('user_b');
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('returns the remaining count', async () => {
    const r1 = await limiter.limit('user_c');
    expect(r1.remaining).toBe(2);
    const r2 = await limiter.limit('user_c');
    expect(r2.remaining).toBe(1);
  });

  it('isolates buckets per identifier', async () => {
    for (let i = 0; i < 3; i++) await limiter.limit('user_d');
    const blockedD = await limiter.limit('user_d');
    expect(blockedD.success).toBe(false);
    const freshE = await limiter.limit('user_e');
    expect(freshE.success).toBe(true);
  });

  it('exposes the reset timestamp', async () => {
    const before = Date.now();
    const r = await limiter.limit('user_f');
    expect(r.reset).toBeGreaterThanOrEqual(before);
    expect(r.reset).toBeLessThanOrEqual(before + 2000);
  });
});

describe('identifyRequest', () => {
  function fakeReq(headers: Record<string, string>) {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    };
  }

  it('prefers x-forwarded-for', () => {
    expect(
      identifyRequest(fakeReq({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))
    ).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    expect(identifyRequest(fakeReq({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('falls back to "anonymous" when no IP headers are present', () => {
    expect(identifyRequest(fakeReq({}))).toBe('anonymous');
  });
});
