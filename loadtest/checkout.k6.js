/**
 * k6 load test for /api/checkout
 *
 * Run with:
 *   k6 run --vus 50 --duration 30s loadtest/checkout.k6.js \
 *     -e BASE_URL=https://staging.promptforge.dev \
 *     -e CLERK_SESSION=__session=eyJ...
 *
 * Targets:
 *   - p95 < 500ms (checkout creation should be fast)
 *   - error_rate < 1%
 *   - rate-limit rejections (429) < 5% (otherwise the limiter is too tight)
 *
 * Note: this hits Stripe Checkout in test mode. Ensure STRIPE_SECRET_KEY in
 * the staging env points at a Stripe **test** key, never live.
 */
import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const CLERK_SESSION = __ENV.CLERK_SESSION || '';

const errorRate = new Rate('errors');
const rateLimited = new Counter('rate_limited');

export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'errors': ['rate<0.01'],
    'rate_limited': ['count<50'], // <5% of 1000 (50vus*30s)
  },
  scenarios: {
    burst: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 25 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
      ],
    },
  },
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/checkout`,
    JSON.stringify({ plan: 'pro' }),
    {
      headers: {
        'Content-Type': 'application/json',
        Cookie: CLERK_SESSION,
      },
    }
  );

  const ok = check(res, {
    '200 or 429': (r) => r.status === 200 || r.status === 429,
    'has body': (r) => !!r.body && r.body.length > 0,
  });

  if (res.status === 429) rateLimited.add(1);
  if (!ok) errorRate.add(1);
}
