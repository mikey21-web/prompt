/**
 * Monitoring façade: wraps Sentry so the app keeps running even when
 * @sentry/nextjs isn't installed or DSN isn't configured. To activate:
 *
 *   npm install @sentry/nextjs
 *   set NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN
 *   replace the dynamic import below with a static one and uncomment
 *   the init blocks in instrumentation.ts (see file)
 *
 * Until then, captureException is a console.error so errors are visible
 * in dev and Vercel logs.
 */

import { logger } from '@/lib/logger';

export interface CaptureContext {
  componentStack?: string;
  tags?: Record<string, string>;
  extras?: Record<string, unknown>;
}

export function captureException(
  error: unknown,
  context?: CaptureContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error('exception', {
    err: message,
    stack,
    ...context?.extras,
    ...context?.tags,
    ...(context?.componentStack
      ? { componentStack: context.componentStack }
      : {}),
  });

  // Sentry hook — opt-in. When @sentry/nextjs is installed, you can replace
  // this stub with:
  //   Sentry.captureException(error, { contexts: { react: context } });
}

export function captureMessage(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  logger[level](message);
}
