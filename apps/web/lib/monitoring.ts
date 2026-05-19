/**
 * Monitoring façade. Forwards to Sentry when @sentry/nextjs is installed AND
 * a DSN is configured; otherwise structured-logs locally so errors stay
 * visible in dev and Vercel function logs.
 *
 * Why a façade: it keeps test code, API routes, and ErrorBoundary blissfully
 * unaware of whether Sentry exists. Missing DSN = silently degrade.
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

const SENTRY_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
);

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

  if (SENTRY_ENABLED) {
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: {
        ...context?.extras,
        ...(context?.componentStack
          ? { componentStack: context.componentStack }
          : {}),
      },
    });
  }
}

export function captureMessage(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  logger[level](message);
  if (SENTRY_ENABLED) {
    Sentry.captureMessage(
      message,
      level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info'
    );
  }
}
