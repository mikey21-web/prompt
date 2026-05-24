/**
 * Lightweight smoke test runnable against any deployed environment without auth.
 * Hits the homepage and the sign-in page, verifies they return 2xx.
 *
 * Run:
 *   k6 run loadtest/smoke.k6.js -e BASE_URL=https://your-deployment.vercel.app
 *
 * Compared to checkout.k6.js this needs no auth state, so it's safe for CI to
 * run on every staging deploy.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    'homepage 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  const signIn = http.get(`${BASE_URL}/sign-in`);
  check(signIn, {
    'sign-in 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  sleep(1);
}
