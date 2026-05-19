# Security Posture — PromptForge Web

This is an OWASP-style review of the `apps/web` surface, covering the dashboard
and the public API routes (`/api/checkout`, `/api/webhooks/stripe`). Anything
not in scope (Convex backend, desktop app, browser extension) is called out
explicitly.

## Threat Model Summary

The web app is a thin client over Convex. The two attack surfaces that touch
secrets are the checkout endpoint (writes to Stripe on the user's behalf) and
the Stripe webhook (writes plan changes back to Convex). All other API access
flows through Convex, which has its own authentication (Clerk JWT or API key).

## OWASP Top 10 Walk-through

### A01:2021 — Broken Access Control
- `/api/checkout` calls `auth()` from `@clerk/nextjs/server` and returns 401
  if no userId. ✅
- All dashboard pages live under `apps/web/app/(dashboard)/...` which is
  protected by `apps/web/middleware.ts` via `auth.protect()`. ✅
- Convex queries/mutations always re-derive identity from `ctx.auth` rather
  than trusting client-passed user IDs. ✅
- **Gap**: webhook does not verify that the `userId` in `metadata` belongs
  to the Stripe customer. If an attacker can set their own metadata in a
  Checkout Session, they could attribute a payment to another user. Today
  metadata is only set by our own checkout route, but this should be audited
  if a third party ever creates sessions on our behalf.

### A02:2021 — Cryptographic Failures
- All cookies are issued by Clerk, which uses HttpOnly + Secure + SameSite
  cookies. ✅
- API keys are generated using `crypto.getRandomValues` (32 bytes, hex
  encoded) in `packages/convex/convex/users.ts`. ✅
- No secrets are checked into git. `.env.local` is in `.gitignore`,
  `.env.example` ships dummy values only. ✅

### A03:2021 — Injection
- No SQL anywhere — Convex is the only datastore and uses typed queries.
- The optimization prompt is forwarded to OpenAI as user content; we never
  evaluate it.
- All API responses are JSON; no template rendering of user input on the
  server.

### A04:2021 — Insecure Design
- Rate limiting is implemented on `/api/checkout` (5 requests/min per user).
  See `apps/web/lib/ratelimit.ts`.
- No registration captcha is required. Acceptable for a Clerk-fronted product
  during private beta; revisit before public launch.

### A05:2021 — Security Misconfiguration
- `next.config.js` sets `reactStrictMode: true`. ✅
- `typescript.ignoreBuildErrors` is currently `true` to unblock deploys with
  generated Convex stubs missing. **Re-enable strict types** after running
  `npx convex dev` to generate real types.
- No Content-Security-Policy header set yet. Add via `next.config.js`
  `headers()` before public launch.

### A06:2021 — Vulnerable & Outdated Components
- `npm audit` reports 16 vulnerabilities (1 critical) at time of writing.
  Most are transitive deps in `plasmo` (extension app), unrelated to web.
  Run `npm audit --workspace=@promptforge/web` for the web-only set.
- Lock file is committed. ✅

### A07:2021 — Identification & Authentication Failures
- All auth handled by Clerk. We never store passwords. ✅
- Convex JWT validation is delegated to Clerk; tokens cannot be forged
  without Clerk's private key.

### A08:2021 — Software & Data Integrity Failures
- Stripe webhook signature is verified against `STRIPE_WEBHOOK_SECRET` when
  the env var is set. The webhook **falls back to unverified parsing in dev**
  if no secret is configured — keep `STRIPE_WEBHOOK_SECRET` set in any
  long-running environment.
- No SRI on third-party scripts because we don't load any.

### A09:2021 — Security Logging & Monitoring
- All API routes use the `logger` facade in `apps/web/lib/logger.ts` which
  emits JSON in production. Stable event names (e.g. `checkout.ratelimited`,
  `webhook.signature_failed`) make alerting straightforward.
- ErrorBoundary + global-error funnel into `apps/web/lib/monitoring.ts`
  which is Sentry-ready. Install `@sentry/nextjs` and wire when desired.

### A10:2021 — Server-Side Request Forgery
- The only outbound HTTP from server code is to Stripe (URL is hard-coded
  inside the SDK) and to OpenAI (URL is hard-coded inside the Convex
  optimize action, not in the web app). No user-controlled URLs are fetched
  server-side.

## Things Still To Do Before Public Launch

1. Set Content-Security-Policy and HSTS headers in `next.config.js`.
2. Re-enable strict TypeScript by running `npx convex dev` to regenerate
   the `_generated/` folder for real, then flipping `ignoreBuildErrors` off.
3. Verify the `userId` ↔ `customer` mapping in the webhook (audit metadata
   handling).
4. Replace the in-memory rate limiter with `@upstash/ratelimit` once Redis
   is provisioned. Today the limit is per-instance.
5. Add `npm audit fix` to CI; fail builds on critical vulnerabilities.
6. Wire Sentry. Run a panic-induced error from staging to confirm alerts.
