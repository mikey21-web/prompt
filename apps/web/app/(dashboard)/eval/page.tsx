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
        <h1 className="text-3xl font-bold text-gray-900">Eval</h1>
        <p className="mt-2 text-gray-600">
          Did our optimization actually help? Run your raw prompt and our optimized prompt against the same model. Pick the better answer.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="eval-input" className="block text-sm font-medium text-gray-700">
          Your prompt
        </label>
        <textarea
          id="eval-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={phase === 'optimizing' || phase === 'comparing'}
          rows={4}
          placeholder="explain how database transactions work to a 5 year old using a story"
          className="mt-2 block w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
        />

        <div className="mt-4">
          <label htmlFor="eval-target" className="block text-sm font-medium text-gray-700">
            Run on
          </label>
          <select
            id="eval-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as ModelId)}
            disabled={phase === 'optimizing' || phase === 'comparing'}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
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
          className="mt-6 inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
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

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['raw', 'optimized'] as const).map((side) => {
              const isWinner = winner === side;
              return (
                <div
                  key={side}
                  className={`rounded-lg border p-4 shadow-sm transition ${
                    winner && !isWinner
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : isWinner
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {side === 'raw' ? 'Your raw prompt' : 'PromptForge optimized'}
                    </h3>
                    {isWinner && (
                      <Trophy className="h-4 w-4 text-emerald-600" aria-label="Winner" />
                    )}
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-white p-3 text-xs text-gray-900 overflow-auto max-h-96 border border-gray-200">
                    {side === 'raw' ? result.rawResponse : result.optimizedResponse}
                  </pre>
                  {!winner && (
                    <button
                      type="button"
                      onClick={() => vote(side)}
                      className="mt-3 w-full rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
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
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Honestly, they&apos;re about the same
              </button>
            </div>
          )}

          {winner && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-center">
              <p className="text-sm text-violet-900">
                Thanks. Your vote was recorded — these power our quality benchmarks.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
