import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureException, captureMessage } from '@/lib/monitoring';

describe('monitoring', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('captures Error instances with stack and message', () => {
    captureException(new Error('boom'));
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('boom');
    expect(errorSpy.mock.calls[0][0]).toContain('exception');
  });

  it('coerces non-Error values to strings', () => {
    captureException('string error');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain('string error');
  });

  it('forwards extras and tags from context', () => {
    captureException(new Error('x'), {
      tags: { component: 'Header' },
      extras: { userId: 'user_1' },
    });
    const line = errorSpy.mock.calls[0][0];
    expect(line).toContain('component=Header');
    expect(line).toContain('userId=user_1');
  });

  it('captureMessage routes by level', () => {
    captureMessage('hi', 'info');
    captureMessage('careful', 'warn');
    captureMessage('bad', 'error');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
