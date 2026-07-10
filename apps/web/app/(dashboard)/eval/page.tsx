'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import {
  MODELS,
  SHOWDOWN_MODELS,
  type ModelId,
} from '@promptforge/core';
import { Trophy, Loader2, Scale } from 'lucide-react';

interface AbResult {
  rawResponse: string;
  optimizedResponse: string;
  target: ModelId;
}

export default function EvalPage() {
  const translate = useAction(api.promptforge.translate);
  const abCompare = useAction(api.promptforge.abCompare);
  const recordVote = useAction(api.promptforge.recordAbVote);

  const [input, setInput] = useState('');
  const [target, setTarget] = useState<ModelId>('gpt-4o');
  const [phase, setPhase] = useState<
    'idle' | 'optimizing' | 'comparing' | 'voted' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<string | null>(null);
  const [result, setResult] = useState<AbResult | null>(null);
  const [winner, setWinner] = useState<'raw' | 'optimized' | 'tie' | null>(null);

  const start = async () => {
    if (!input.trim() || input.trim().length < 5) {
      setError('Type a real prompt first.');
      return;
    }
    setError(null);
    setResult(null);
    setWinner(null);
    setOptimized(null);
    setPhase('optimizing');
    try {
      const opt = await translate({ input, target });
      setOptimized(opt.optimized);
      setPhase('comparing');
      const cmp = (await abCompare({
        rawInput: input,
        optimized: opt.optimized,
        target,
      })) as AbResult;
      setResult(cmp);
      setPhase('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'A/B compare failed.');
      setPhase('error');
    }
  };

  const vote = async (w: 'raw' | 'optimized' | 'tie') => {
    if (!result || !optimized) return;
    setWinner(w);
    setPhase('voted');
    try {
      await recordVote({
        rawInput: input,
        optimized,
        target,
        winner: w,
      });
    } catch {
      // Silent fail — UI already moved on. Vote loss is acceptable here.
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Eval</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Did our optimization actually help? Run your raw prompt and our optimized prompt against the same model. Pick the better answer.
        </p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <label htmlFor="eval-input" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Your prompt
        </label>
        <textarea
          id="eval-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={phase === 'optimizing' || phase === 'comparing'}
          rows={4}
          placeholder="explain how database transactions work to a 5 year old using a story"
          className="mt-2 block w-full rounded-md border p-3 text-sm outline-none transition-all"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="mt-4">
          <label htmlFor="eval-target" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Run on
          </label>
          <select
            id="eval-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as ModelId)}
            disabled={phase === 'optimizing' || phase === 'comparing'}
            className="mt-2 block w-full rounded-md border px-3 py-2 text-sm outline-none transition-all"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-primary)',
            }}
          >
            {SHOWDOWN_MODELS.filter(
              (id) => MODELS[id].callable && MODELS[id].modality === 'text'
            ).map((id) => (
              <option key={id} value={id}>
                {MODELS[id].label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={start}
          disabled={phase === 'optimizing' || phase === 'comparing' || !input.trim()}
          className="mt-6 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#0b0b0e',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          {phase === 'optimizing' || phase === 'comparing' ? (
            <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Scale className="-ml-1 mr-2 h-4 w-4" />
          )}
          {phase === 'optimizing'
            ? 'Optimizing prompt…'
            : phase === 'comparing'
              ? 'Running both versions…'
              : 'Run A/B'}
        </button>

        {error && <p className="mt-3 text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['raw', 'optimized'] as const).map((side) => {
              const isWinner = winner === side;
              return (
                <div
                  key={side}
                  className="rounded-lg border p-4 transition"
                  style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    ...(winner && !isWinner
                      ? {
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface)',
                          opacity: 0.6,
                        }
                      : isWinner
                        ? {
                            borderColor: 'var(--green)',
                            backgroundColor: 'rgba(22, 163, 74, 0.08)',
                          }
                        : {
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--surface-raised)',
                          }),
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {side === 'raw' ? 'Your raw prompt' : 'PromptForge optimized'}
                    </h3>
                    {isWinner && (
                      <Trophy className="h-4 w-4" style={{ color: 'var(--green)' }} aria-label="Winner" />
                    )}
                  </div>
                  <pre
                    className="mt-3 whitespace-pre-wrap rounded p-3 text-xs overflow-auto max-h-96 border"
                    style={{
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {side === 'raw' ? result.rawResponse : result.optimizedResponse}
                  </pre>
                  {!winner && (
                    <button
                      type="button"
                      onClick={() => vote(side)}
                      className="mt-3 w-full rounded-md px-3 py-2 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#0b0b0e',
                      }}
                    >
                      This one is better
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!winner && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => vote('tie')}
                className="rounded-md border px-4 py-2 text-sm font-medium transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                Honestly, they&apos;re about the same
              </button>
            </div>
          )}

          {winner && (
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                borderColor: 'var(--accent)',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--accent)' }}>
                Thanks. Your vote was recorded — these power our quality benchmarks.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
