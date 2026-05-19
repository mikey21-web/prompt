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
    await run(prompt, mode, targetModel);
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Optimize Your Prompts
      </h1>
      <p className="mb-6 text-gray-600">
        Use AI to compress, enhance, or rewrite your prompts for better results.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <OptimizeForm onSubmit={handleSubmit} loading={loading} />

        <div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <OptimizeResult
              original={originalPrompt}
              optimized={result.optimized}
              tokens={result.tokens}
            />
          )}

          {!result && !error && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                Enter a prompt and click Optimize to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
