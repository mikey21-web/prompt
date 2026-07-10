'use client';

import { PromptDiff, TokenSavings } from '@promptforge/ui';
import { Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OptimizeResultProps {
  original: string;
  optimized: string;
  tokens: { input: number; output: number };
  originalTokens?: number;
}

export function OptimizeResult({
  original,
  optimized,
  tokens,
  originalTokens,
}: OptimizeResultProps) {
  const [copied, setCopied] = useState(false);

  // Fix memory leak: cleanup timer on unmount
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(optimized);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const savedTokens = originalTokens ? originalTokens - tokens.output : 0;

  return (
    <div className="rounded-lg border p-6 shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
      <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Result</h3>

      <PromptDiff
        original={original}
        optimized={optimized}
        tokensIn={tokens.input}
        tokensOut={tokens.output}
        savedTokens={originalTokens ? tokens.input - tokens.output : 0}
      />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Input Tokens</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tokens.input}</p>
        </div>
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--surface)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Output Tokens</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tokens.output}</p>
        </div>
      </div>

      {savedTokens > 0 && (
        <div className="mt-4">
          <TokenSavings tokens={savedTokens} />
        </div>
      )}

      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy optimized prompt to clipboard'}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded px-4 py-2 transition-colors"
        style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
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
