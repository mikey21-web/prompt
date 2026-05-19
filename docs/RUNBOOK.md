# PromptForge Production Runbook

A short on-call guide. If this is your first time on-call, read top to bottom.
After that, treat the table of contents as your jump list.

## Contents
1. Overview
2. On-Call Rotation
3. Severity Definitions
4. Common Incidents
5. Rollback Procedures
6. Hotfix Procedure
7. Useful Links & Commands

---

## 1. Overview

PromptForge is deployed across three Vercel projects (web, extension, desktop),
plus a Convex deployment for backend. Stripe handles payments. Clerk handles
auth.

```
User → Clerk (auth) → Vercel (web) → Convex (backend) → OpenAI (LLM)
                                  ↘ Stripe (billing) — webhook back to Vercel
```

## 2. On-Call Rotation

- Primary: rotates weekly between core engineers (see #oncall channel topic).
- Backup: previous week's primary stays available for the first 24h.
- Hand-off happens at 9am Asia/Calcutta on Monday with a 15min sync.

## 3. Severity Definitions

| Sev | Description | Response time | Examples |
|-----|-------------|---------------|----------|
| 1 | Full outage; no users can use the product | 15 min | Vercel down, Convex unreachable, Clerk 5xx storm |
| 2 | Critical feature broken; some users impacted | 1 h | Checkout endpoint 500ing, optimize action timing out |
| 3 | Degraded experience; product usable | 4 h | Templates page slow, dashboard charts stale |
| 4 | Cosmetic / non-blocking | next business day | Typo, off-by-one in usage display |

## 4. Common Incidents

### 4.1 Checkout returning 500
1. Open Vercel logs, filter by `route=/api/checkout level=error`.
2. The `logger` event will be `checkout.error` with `err=<reason>`.
3. If Stripe is down, monitor https://status.stripe.com — comms only.
4. If Convex is the cause, see 4.4.

### 4.2 Stripe webhook failing
1. Filter logs for `webhook.signature_failed` or `webhook.plan_update_failed`.
2. If signature failures: confirm `STRIPE_WEBHOOK_SECRET` matches the webhook
   in the Stripe dashboard. Rotate if leaked.
3. If plan updates failing: check Convex deploy is healthy (4.4). The
   webhook returns 200 to Stripe regardless to avoid retry storms; replay
   manually via the Stripe dashboard once Convex is back.

### 4.3 Rate limit triggering legitimate users
1. The in-memory limiter resets every 60s. If a user is hitting it,
   `checkout.ratelimited` log line will show their userId.
2. If false-positives spike, raise the limit in `apps/web/lib/ratelimit.ts`
   and ship a hotfix (section 6).

### 4.4 Convex unreachable
1. Check https://status.convex.dev.
2. If healthy upstream but our deployment is down, run
   `npx convex dev --once` from `packages/convex` to redeploy functions.
3. If the schema migration is the issue, roll back to the previous Convex
   deployment via dashboard.

### 4.5 Auth failures
1. Check https://status.clerk.com.
2. Confirm `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` match
   the active Clerk app.
3. If JWT verification fails on Convex, regenerate Convex auth config
   via Clerk JWT template, then redeploy Convex.

## 5. Rollback Procedures

### Vercel (web app)
1. Open the failing deployment in Vercel dashboard.
2. Find the last green deployment.
3. Click "Promote to Production". DNS cuts over within 30s.

### Convex
1. Open Convex dashboard → Deployments.
2. Pick the last green deployment hash.
3. Click "Rollback".

### Stripe webhook config
- Stripe stores webhook history. If we shipped a bad receiver, disable the
  bad endpoint in the dashboard, fix and redeploy, then replay missed
  events.

## 6. Hotfix Procedure

```
git checkout master
git pull
git checkout -b hotfix/short-description
# ...make minimal changes...
npm run lint && npm run test:run
git commit -m "hotfix(web): <description>"
git push -u origin hotfix/short-description
# open PR, get one review, merge
# Vercel auto-deploys master to production within ~3 min
```

For genuine emergencies (Sev 1) you can push directly to master after a
verbal go-ahead from another engineer. Open the PR retroactively for
review.

## 7. Useful Links & Commands

- Web logs: Vercel → promptforge-web → Logs (filter `level=error`)
- Convex logs: Convex dashboard → Logs
- Stripe events: dashboard.stripe.com → Developers → Events
- Clerk users: dashboard.clerk.com → Users
- Local repro: `npm run dev` in `apps/web`
- Run all tests: `cd apps/web && npm run test:run`
- Run E2E suite: `cd apps/web && npm run test:e2e`

## Comms templates

**Sev 1 acknowledgement (status page)**
> We are aware of an issue affecting [feature]. Investigating now. Updates
> every 15 minutes.

**Sev 1 resolved**
> Resolved at HH:MM UTC. Root cause: [one sentence]. Affected users may
> need to refresh.
