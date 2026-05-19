# Manual QA Checklist

Run before every production release. Estimated time: 25 minutes for the full
sweep, 10 minutes for the smoke pass.

## Smoke pass (10 min)

1. Visit `/` — homepage loads, no console errors
2. Sign in via Clerk
3. Land on `/dashboard` — usage card renders
4. Submit a prompt on `/optimize` — receive optimized output
5. Sign out — redirected to homepage

## Full sweep (25 min)

### Authentication
- [ ] Sign up with email — verification flow works
- [ ] Sign in — lands on `/dashboard`
- [ ] Sign out — session cleared
- [ ] Visit `/dashboard` while signed out — redirected to `/sign-in`

### Dashboard (`/dashboard`)
- [ ] Quota card shows `0 of 25 requests used` for fresh user
- [ ] Plan badge says "Free"
- [ ] Recent optimizations panel shows empty state for fresh user
- [ ] Reset time line shows "Resets at midnight UTC"

### Optimize (`/optimize`)
- [ ] All three mode buttons render: Compress, Enhance, Rewrite
- [ ] Mode selection visibly switches active state
- [ ] Empty prompt → submit button disabled
- [ ] Type a prompt → submit becomes enabled
- [ ] Submit → loading state shows
- [ ] Result panel shows original + optimized
- [ ] Token counts displayed (input + output)
- [ ] Token savings widget shown when output < input
- [ ] Copy button copies optimized text
- [ ] "Copied!" feedback appears

### History (`/history`)
- [ ] After optimizing 1 prompt, that prompt appears
- [ ] Date format is human-readable
- [ ] Empty state shown for fresh users

### Templates (`/templates`)
- [ ] "New Template" button visible
- [ ] Empty state shown for fresh users
- [ ] After saving template (if implemented), card appears in grid

### Settings (`/settings`)
- [ ] Account section shows Clerk email
- [ ] Email notifications checkbox toggles
- [ ] Toggle persists after page reload (Convex updatePreferences)

### Billing (`/billing`)
- [ ] Three plan cards render: Free, Pro, Team
- [ ] Prices visible: $0, $9, $25
- [ ] User's current plan shows "Current Plan" button
- [ ] "Most Popular" badge on Pro
- [ ] Click Upgrade on Pro → redirect to Stripe Checkout
- [ ] Use test card 4242 4242 4242 4242 → success
- [ ] Return to `/billing?success=true` → green message
- [ ] Cancel from Stripe → return to `/billing?canceled=true` → red message
- [ ] Plan updates to "pro" in dashboard within 30s (webhook)

### Responsive
- [ ] Resize to 375px wide — sidebar collapses, layout doesn't break
- [ ] Resize to 768px — tablet layout
- [ ] Touch tap targets ≥ 44px

### Accessibility
- [ ] Tab through form on /optimize — focus rings visible
- [ ] Submit form via Enter key
- [ ] Use `axe` browser extension on each page — no critical issues

### Errors
- [ ] Trigger error boundary by editing a page to throw — fallback shows
- [ ] Reset button on fallback works
- [ ] Network blocked → loading skeletons → eventual error message

### Performance
- [ ] Lighthouse `/dashboard` — Performance ≥ 90
- [ ] Lighthouse `/optimize` — Performance ≥ 90
- [ ] LCP < 2.5s on a 4G throttled run

## Sign-off

Tester: _________  Date: _________  Build: _________  Pass / Fail
