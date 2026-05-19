import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import type { Mode, TargetModel } from '@promptforge/core';

export function useOptimize() {
  const optimize = useMutation(api.prompts.optimize);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    optimized: string;
    tokens: { input: number; output: number };
    originalTokens?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    prompt: string,
    mode: Mode,
    targetModel?: TargetModel
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await optimize({
        prompt,
        mode,
        targetModel,
      });
      setResult(res);
      return res;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Optimization failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, result, error };
}
