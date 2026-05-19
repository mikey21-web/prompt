import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from 'convex/react';
import { useOptimize } from '@/lib/hooks/useOptimize';

describe('useOptimize', () => {
  let optimizeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    optimizeMock = vi.fn();
    vi.mocked(useMutation).mockReturnValue(optimizeMock);
  });

  it('has the correct initial state', () => {
    const { result } = renderHook(() => useOptimize());
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading=true while run() is pending', async () => {
    let resolveCall: (v: unknown) => void = () => {};
    optimizeMock.mockReturnValue(
      new Promise((res) => {
        resolveCall = res;
      })
    );

    const { result } = renderHook(() => useOptimize());

    act(() => {
      void result.current.run('hello', 'compress', 'gpt-4o-mini');
    });

    await waitFor(() => expect(result.current.loading).toBe(true));

    act(() => {
      resolveCall({ optimized: 'hi', tokensIn: 1, tokensOut: 1, savedTokens: 0 });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('sets result on a successful response', async () => {
    const payload = {
      optimized: 'short',
      tokensIn: 50,
      tokensOut: 10,
      savedTokens: 40,
    };
    optimizeMock.mockResolvedValue(payload);

    const { result } = renderHook(() => useOptimize());
    await act(async () => {
      await result.current.run('Hello world', 'compress', 'gpt-4o-mini');
    });

    expect(result.current.result).toEqual(payload);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets error when the mutation rejects', async () => {
    optimizeMock.mockRejectedValue(new Error('quota exceeded'));
    const { result } = renderHook(() => useOptimize());

    await act(async () => {
      await expect(
        result.current.run('Hello', 'compress', 'gpt-4o-mini')
      ).rejects.toThrow('quota exceeded');
    });

    expect(result.current.error).toBe('quota exceeded');
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('normalizes the model name (gpt-4o-mini → gpt4omini, gpt-4o → gpt4o)', async () => {
    optimizeMock.mockResolvedValue({
      optimized: '',
      tokensIn: 0,
      tokensOut: 0,
      savedTokens: 0,
    });
    const { result } = renderHook(() => useOptimize());

    await act(async () => {
      await result.current.run('p', 'compress', 'gpt-4o-mini');
    });
    expect(optimizeMock).toHaveBeenLastCalledWith({
      prompt: 'p',
      mode: 'compress',
      targetModel: 'gpt4omini',
    });

    await act(async () => {
      await result.current.run('p', 'enhance', 'gpt-4o');
    });
    expect(optimizeMock).toHaveBeenLastCalledWith({
      prompt: 'p',
      mode: 'enhance',
      targetModel: 'gpt4o',
    });

    // No model provided → defaults to 'gpt4o'
    await act(async () => {
      await result.current.run('p', 'compress');
    });
    expect(optimizeMock).toHaveBeenLastCalledWith({
      prompt: 'p',
      mode: 'compress',
      targetModel: 'gpt4o',
    });
  });
});
