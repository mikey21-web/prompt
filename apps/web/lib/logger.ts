/**
 * Lightweight structured logger.
 *
 * - JSON lines in production so log aggregators (Vercel, Datadog, Logflare,
 *   Loki) can parse fields out of the box.
 * - Human-readable, single-line output in development.
 * - Edge-runtime safe: no Node-only deps, no transports, no async sinks.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('checkout.start', { userId, plan });
 *   logger.error('webhook.failed', { err: e.message });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function activeLevel(): number {
  const env = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
  return LEVELS[env] ?? LEVELS.info;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function format(
  level: LogLevel,
  msg: string,
  fields?: Record<string, unknown>
): string {
  const base = {
    time: new Date().toISOString(),
    level,
    service: 'promptforge-web',
    env: process.env.NODE_ENV ?? 'development',
    msg,
    ...fields,
  };
  if (isProduction()) {
    return JSON.stringify(base);
  }
  // Dev: pretty single-line
  const tail = fields
    ? ' ' +
      Object.entries(fields)
        .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join(' ')
    : '';
  return `[${base.time}] ${level.toUpperCase()} ${msg}${tail}`;
}

function emit(
  level: LogLevel,
  msg: string,
  fields?: Record<string, unknown>
): void {
  if (LEVELS[level] < activeLevel()) return;
  const line = format(level, msg, fields);
  // Use the right console method so log aggregators map to severity correctly
  switch (level) {
    case 'debug':
    case 'info':
      // eslint-disable-next-line no-console
      console.log(line);
      return;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(line);
      return;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(line);
      return;
  }
}

export const logger = {
  debug: (msg: string, fields?: Record<string, unknown>) =>
    emit('debug', msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) =>
    emit('info', msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) =>
    emit('warn', msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) =>
    emit('error', msg, fields),
};
