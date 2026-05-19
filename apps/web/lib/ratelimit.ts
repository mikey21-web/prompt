/**
 * In-memory sliding-window rate limiter with graceful degradation.
 *
 * Production deployments should run behind Upstash/Vercel KV (see README).
 * For now we use an in-memory map so the app stays functional in dev and on
 * single-instance deploys without forcing an external dep at install time.
 *
 * Limitation: in-memory state is per-instance. Multiple Vercel functions or
 * containers will not share a counter, so the *effective* limit is
 * `limit * instances`. Swap the implementation for `@upstash/ratelimit` when
 * you have Redis credentials — see `createUpstashLimiter` below for the
 * drop-in shape this module exposes.
 */

import { logger } from '@/lib/logger';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number, windowMs: number) {
  // Remove expired buckets every 60 seconds
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets.entries()) {
    if (now - b.windowStart > windowMs * 2) buckets.delete(k);
  }
}

export interface CreateLimiterOptions {
  /** Max requests per window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
  /** Prefix prepended to identifiers. Useful when you have multiple limiters. */
  prefix?: string;
}

export function createLimiter(opts: CreateLimiterOptions) {
  const { limit, windowMs, prefix = 'rl' } = opts;
  return {
    /**
     * Check if `identifier` is allowed under this limiter. Mutates internal state.
     */
    async limit(identifier: string): Promise<RateLimitResult> {
      const key = `${prefix}:${identifier}`;
      const now = Date.now();
      sweep(now, windowMs);

      const bucket = buckets.get(key);
      if (!bucket || now - bucket.windowStart >= windowMs) {
        buckets.set(key, { count: 1, windowStart: now });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + windowMs,
        };
      }
      bucket.count += 1;
      const reset = bucket.windowStart + windowMs;
      const remaining = Math.max(0, limit - bucket.count);
      const success = bucket.count <= limit;
      if (!success) {
        logger.warn('ratelimit.exceeded', {
          identifier,
          prefix,
          limit,
          window_ms: windowMs,
        });
      }
      return { success, limit, remaining, reset };
    },
  };
}

/** Standard limiter for the /api/checkout endpoint: 5 requests per minute. */
export const checkoutLimiter = createLimiter({
  limit: 5,
  windowMs: 60_000,
  prefix: 'checkout',
});

/**
 * Helper to derive a stable identifier for a request. Falls back to a generic
 * label if no headers are available — this means unauthed traffic from behind
 * the same NAT will share a bucket. Acceptable for a checkout endpoint.
 */
export function identifyRequest(req: {
  headers: { get(name: string): string | null };
}): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  );
}
