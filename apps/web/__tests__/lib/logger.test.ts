import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('writes info messages to console.log', () => {
    logger.info('hello', { foo: 'bar' });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('hello');
    expect(logSpy.mock.calls[0][0]).toContain('foo=bar');
  });

  it('writes warn messages to console.warn', () => {
    logger.warn('careful');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('writes error messages to console.error', () => {
    logger.error('boom', { err: 'oops' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('boom');
  });

  it('respects LOG_LEVEL=warn (suppresses info)', async () => {
    const previous = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'warn';
    // Re-import to pick up env (logger reads env on each call so import not needed)
    logger.info('should be suppressed');
    expect(logSpy).not.toHaveBeenCalled();
    logger.warn('should appear');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    process.env.LOG_LEVEL = previous;
  });

  it('serializes non-string fields', () => {
    logger.info('payload', { count: 3, ok: true });
    expect(logSpy.mock.calls[0][0]).toContain('count=3');
    expect(logSpy.mock.calls[0][0]).toContain('ok=true');
  });
});
