'use client';

import { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import {
  MODELS,
  SHOWDOWN_MODELS,
  type ModelId,
  type Modality,
} from '@promptforge/core';
import { Copy, Check, Share2, Swords } from 'lucide-react';

interface ShowdownResult {
  intent: { modality: Modality; subject?: string };
  outputs: { target: ModelId; optimized: string; error: string | null }[];
}

export default function ShowdownPage() {
  const showdown = useAction(api.promptforge.showdown);
  const createShare = useMutation(api.shares.createShare);

  const [input, setInput] = useState('');
  const [selected, setSelected] = useState<Set<ModelId>>(
    new Set(SHOWDOWN_MODELS)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShowdownResult | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<ModelId | null>(null);

  const toggle = (id: ModelId) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const run = async () => {
    if (!input.trim() || input.trim().length < 3) {
      setError('Type at least a few words.');
      return;
    }
    if (selected.size === 0) {
      setError('Pick at least one target model.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setShareSlug(null);
    try {
      const res = (await showdown({
        input,
        targets: Array.from(selected),
      })) as ShowdownResult;
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Showdown failed.');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!result) return;
    const { slug } = await createShare({
      input,
      intentJson: JSON.stringify(result.intent),
      outputsJson: JSON.stringify(result.outputs),
    });
    setShareSlug(slug);
    await navigator.clipboard.writeText(
      `${window.location.origin}/s/${slug}`
    );
  };

  const copy = async (target: ModelId, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Showdown</h1>
        <p className="mt-2 text-gray-600">
          Same input, every model&apos;s native format. Side by side.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="showdown-input"
          className="block text-sm font-medium text-gray-700"
        >
          Plain English input
        </label>
        <textarea
          id="showdown-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          rows={4}
          placeholder="a guy walks into a dark hallway, sees a black cat, runs away. cinematic horror"
          className="mt-2 block w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
        />

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Targets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SHOWDOWN_MODELS.map((id) => {
              const m = MODELS[id];
              const isOn = selected.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  disabled={loading}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    isOn
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={loading || !input.trim() || selected.size === 0}
            className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
          >
            <Swords className="-ml-1 mr-2 h-4 w-4" />
            {loading ? 'Running…' : 'Run showdown'}
          </button>
          {result && (
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Share2 className="-ml-1 mr-2 h-4 w-4" />
              {shareSlug ? 'Link copied!' : 'Share'}
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {result.outputs.map((out) => {
            const m = MODELS[out.target];
            return (
              <div
                key={out.target}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {m.label}
                    </h3>
                    <p className="text-xs text-gray-500">{m.format}</p>
                  </div>
                  {!out.error && (
                    <button
                      type="button"
                      onClick={() => copy(out.target, out.optimized)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Copy"
                    >
                      {copiedTarget === out.target ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {out.error ? (
                  <p className="mt-3 text-xs text-red-600">{out.error}</p>
                ) : (
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs text-gray-900 overflow-auto max-h-96 flex-1">
                    {out.optimized}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
