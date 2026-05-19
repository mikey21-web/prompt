/**
 * Next.js instrumentation hook. Loads Sentry server/edge configs once at
 * runtime startup. This file is the canonical Sentry integration point for
 * Next 14 — the old `sentry.{server,edge}.config.ts` files are imported
 * from here.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
