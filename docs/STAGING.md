# Staging Environment

Staging mirrors production with isolated credentials and a separate Convex
deployment. Use it before every `master → production` release.

## Provisioning

| Resource | How |
|----------|-----|
| Vercel project | Clone `promptforge-web` → `promptforge-web-staging` |
| Convex deployment | `npx convex dev --configure staging` from `packages/convex` |
| Clerk app | Create new Clerk app `promptforge-staging`, configure webhook URLs |
| Stripe | Use Stripe **test mode** keys (no separate account needed) |
| Domain | `staging.promptforge.dev` (CNAME to Vercel) |

## Required env vars on staging

Copy `apps/web/.env.example` and fill the staging values. Critical to keep
distinct from production:

- `NEXT_PUBLIC_CONVEX_URL` — points at staging Convex
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — staging Clerk app
- `STRIPE_SECRET_KEY` — Stripe **test** secret (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — distinct webhook signing secret
- `NEXT_PUBLIC_APP_URL=https://staging.promptforge.dev`

## CI Smoke Test

After every push to `master`, GitHub Actions should:

1. Wait for Vercel staging deploy to be ready.
2. Run `npx playwright test apps/web/e2e/homepage.spec.ts \
     --project=chromium -- --base-url=https://staging.promptforge.dev`.
3. Hit `/api/checkout` with a sentinel session token to verify 401 path.
4. Notify #releases on Slack with results.

If smoke fails, `master → production` promotion is blocked until green.

## Manual gate before promoting to production

- [ ] Sign-in flow works end-to-end on staging
- [ ] Optimize → result → copy works on staging
- [ ] Stripe checkout completes with test card `4242 4242 4242 4242`
- [ ] Webhook updates plan from `free` to `pro`
- [ ] Lighthouse score ≥ 90 on `/dashboard`
- [ ] Sentry receives a test event (if Sentry wired)
