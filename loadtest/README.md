# Load Testing

Uses [k6](https://k6.io). Install:
```
choco install k6      # Windows
brew install k6       # macOS
sudo apt install k6   # Debian/Ubuntu
```

## Scripts

| Script | Endpoint | Purpose |
|--------|----------|---------|
| `checkout.k6.js` | POST /api/checkout | Verify rate limiter + p95 < 500ms |

## Run against staging

```
k6 run --vus 50 --duration 30s loadtest/checkout.k6.js \
  -e BASE_URL=https://staging.promptforge.dev \
  -e CLERK_SESSION="__session=eyJ..."
```

Get the `__session` cookie by signing in to staging in a browser, opening
DevTools → Application → Cookies, and copying the value.

## What "good" looks like

- `http_req_duration` p95 < 500ms
- `errors` rate < 1%
- Some `rate_limited` is healthy — it shows the limiter is doing its job.
  Concerning if every request is rate-limited (limit is too tight) or
  none are (limit is unenforced).

## Acceptance gates for production push

| Test | Pass criterion |
|------|----------------|
| 50vu/30s burst | All thresholds green |
| 200vu/2min sustained | p95 < 1s, no 5xx errors |
| webhook flood (Stripe CLI replay 100 events) | All processed, no Convex errors in logs |
