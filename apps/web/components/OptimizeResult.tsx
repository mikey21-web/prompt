'use client';

import { PromptDiff, TokenSavings } from '@promptforge/ui';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OptimizeResultProps {
  original: string;
  optimized: string;
  tokensIn: number;
  tokensOut: number;
  savedTokens: number;
}

export function OptimizeResult({
  original,
  optimized,
  tokensIn,
  tokensOut,
  savedTokens,
}: OptimizeResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const savingPercent =
    tokensIn > 0 ? ((savedTokens / tokensIn) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Result</h3>

      <PromptDiff
        original={original}
        optimized={optimized}
        tokensIn={tokensIn}
        tokensOut={tokensOut}
        savedTokens={savedTokens}
      />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Input Tokens</p>
          <p className="text-2xl font-bold text-gray-900">{tokensIn}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Output Tokens</p>
          <p className="text-2xl font-bold text-gray-900">{tokensOut}</p>
        </div>
      </div>

      {savedTokens > 0 && (
        <div className="mt-4">
          <TokenSavings saved={savedTokens} percent={parseFloat(savingPercent)} />
        </div>
      )}

      <button
        onClick={handleCopy}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </>
        )}
      </button>
    </div>
  );
}
