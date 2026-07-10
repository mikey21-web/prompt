/**
 * Sliding-window rate limiter with two backends:
 *
 *   - Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     are set (preferred for any multi-instance deploy)
 *   - In-memory fallback otherwise (per-instance state — fine for dev and
 *     single-container deploys)
 *
 * The two backends share the same `limit(identifier)` interface so callers
 * never have to branch.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface Limiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

// ---------- in-memory backend ----------

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number, windowMs: number) {
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

function createInMemoryLimiter(opts: CreateLimiterOptions): Limiter {
  const { limit, windowMs, prefix = 'rl' } = opts;
  return {
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

// ---------- Upstash backend ----------

function createUpstashLimiter(opts: CreateLimiterOptions): Limiter {
  const { limit, windowMs, prefix = 'rl' } = opts;
  const seconds = `${Math.ceil(windowMs / 1000)} s` as `${number} s`;
  const rl = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, seconds),
    analytics: false,
    prefix,
  });
  return {
    async limit(identifier: string) {
      const r = await rl.limit(identifier);
      if (!r.success) {
        logger.warn('ratelimit.exceeded', {
          identifier,
          prefix,
          limit,
          window_ms: windowMs,
        });
      }
      return {
        success: r.success,
        limit: r.limit,
        remaining: r.remaining,
        reset: r.reset,
      };
    },
  };
}

// ---------- factory ----------

export function createLimiter(opts: CreateLimiterOptions): Limiter {
  const upstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  if (upstashConfigured) {
    return createUpstashLimiter(opts);
  }
  return createInMemoryLimiter(opts);
}

/** Standard limiter for the /api/checkout endpoint: 5 requests per minute. */
export const checkoutLimiter = createLimiter({
  limit: 5,
  windowMs: 60_000,
  prefix: 'checkout',
});

/** Limiter for AI forge/reverse/showdown endpoints: 30 requests per minute */
export const aiLimiter = createLimiter({
  limit: 30,
  windowMs: 60_000,
  prefix: 'ai',
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
