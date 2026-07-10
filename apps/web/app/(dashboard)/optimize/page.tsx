'use client';

import { useState } from 'react';
import { OptimizeForm } from '@/components/OptimizeForm';
import { OptimizeResult } from '@/components/OptimizeResult';
import { useOptimize } from '@/lib/hooks/useOptimize';
import type { Mode, TargetModel } from '@promptforge/core';

export default function OptimizePage() {
  const { run, loading, result, error } = useOptimize();
  const [originalPrompt, setOriginalPrompt] = useState('');

  const handleSubmit = async (
    prompt: string,
    mode: Mode,
    targetModel: TargetModel
  ) => {
    setOriginalPrompt(prompt);
    try {
      await run(prompt, mode, targetModel);
    } catch (e) {
      // error already set in state by useOptimize
      console.error('Optimization failed:', e);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Optimize Your Prompts
      </h1>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        Use AI to compress, enhance, or rewrite your prompts for better results.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <OptimizeForm onSubmit={handleSubmit} loading={loading} />

        <div>
          {error && (
            <div
              className="rounded-lg border p-4"
              style={{
                borderColor: 'var(--red)',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                color: 'var(--red)',
              }}
            >
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <OptimizeResult
              original={originalPrompt}
              optimized={result.optimized}
              tokens={{ input: result.tokensIn, output: result.tokensOut }}
              originalTokens={result.tokensIn}
            />
          )}

          {!result && !error && (
            <div
              className="rounded-lg border p-6 text-center"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                Enter a prompt and click Optimize to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
