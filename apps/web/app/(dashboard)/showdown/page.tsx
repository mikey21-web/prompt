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
import {
  Copy,
  Check,
  Share2,
  Swords,
  Play,
  Loader2,
  Send,
} from 'lucide-react';

interface ShowdownOutput {
  target: ModelId;
  optimized: string;
  error: string | null;
}

interface ShowdownResult {
  intent: { modality: Modality; subject?: string };
  outputs: ShowdownOutput[];
}

interface RunResult {
  callable: boolean;
  response: string;
}

export default function ShowdownPage() {
  const showdown = useAction(api.promptforge.showdown);
  const runPrompt = useAction(api.promptforge.run);
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

  // Per-target run state
  const [runs, setRuns] = useState<Record<string, RunResult | undefined>>({});
  const [running, setRunning] = useState<Set<ModelId>>(new Set());

  const toggle = (id: ModelId) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const start = async () => {
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
    setRuns({});
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

  const tweet = async () => {
    if (!result) return;
    let slug = shareSlug;
    if (!slug) {
      const created = await createShare({
        input,
        intentJson: JSON.stringify(result.intent),
        outputsJson: JSON.stringify(result.outputs),
      });
      slug = created.slug;
      setShareSlug(slug);
    }
    const url = `${window.location.origin}/s/${slug}`;
    const text = `Same prompt, every AI model's native format. Side by side. Made with @PromptForge\n\n"${input.slice(0, 80)}"`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };

  const copy = async (target: ModelId, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  const run = async (target: ModelId, prompt: string) => {
    if (running.has(target)) return;
    setRunning((prev) => new Set(prev).add(target));
    try {
      const res = (await runPrompt({ prompt, target })) as RunResult;
      setRuns((prev) => ({ ...prev, [target]: res }));
    } catch (e) {
      setRuns((prev) => ({
        ...prev,
        [target]: {
          callable: false,
          response: e instanceof Error ? e.message : 'Run failed.',
        },
      }));
    } finally {
      setRunning((prev) => {
        const next = new Set(prev);
        next.delete(target);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Showdown</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Same input, every model&apos;s native format. Side by side. Click Run on any column to see the actual response.
        </p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <label
          htmlFor="showdown-input"
          className="block text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Plain English input
        </label>
        <textarea
          id="showdown-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
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
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Targets</p>
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
                  className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  style={isOn ? {
                    borderColor: 'var(--accent)',
                    backgroundColor: 'var(--accent-dim)',
                    color: 'var(--accent)',
                  } : {
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--text-secondary)',
                  }}
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
            onClick={start}
            disabled={loading || !input.trim() || selected.size === 0}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#0b0b0e',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Swords className="-ml-1 mr-2 h-4 w-4" />
            {loading ? 'Running…' : 'Run showdown'}
          </button>
          {result && (
            <>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <Share2 className="-ml-1 mr-2 h-4 w-4" />
                {shareSlug ? 'Link copied!' : 'Share link'}
              </button>
              <button
                type="button"
                onClick={tweet}
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-all"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <Send className="-ml-1 mr-2 h-4 w-4" />
                Tweet this
              </button>
              {shareSlug && (
                <a
                  href={`/s/${shareSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline"
                  style={{ color: 'var(--accent)' }}
                >
                  View public page →
                </a>
              )}
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {result.outputs.map((out) => {
            const m = MODELS[out.target];
            const runRes = runs[out.target];
            const isRunning = running.has(out.target);
            return (
              <div
                key={out.target}
                className="rounded-lg border p-4 flex flex-col"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-raised)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {m.label}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.format}</p>
                  </div>
                  {!out.error && (
                    <button
                      type="button"
                      onClick={() => copy(out.target, out.optimized)}
                      className="rounded p-1 transition-all"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label="Copy"
                    >
                      {copiedTarget === out.target ? (
                        <Check className="h-4 w-4" style={{ color: 'var(--green)' }} />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {out.error ? (
                  <p className="mt-3 text-xs" style={{ color: 'var(--red)' }}>{out.error}</p>
                ) : (
                  <>
                    <pre
                      className="mt-3 whitespace-pre-wrap rounded p-3 text-xs overflow-auto max-h-64"
                      style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                    >
                      {out.optimized}
                    </pre>
                    <button
                      type="button"
                      onClick={() => run(out.target, out.optimized)}
                      disabled={isRunning}
                      className="mt-3 inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-60 transition-all"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                      )}
                      {isRunning ? 'Running' : runRes ? 'Run again' : 'Run prompt'}
                    </button>
                    {runRes && (
                      <div
                        className="mt-3 rounded p-3 text-xs"
                        style={runRes.callable ? {
                          backgroundColor: 'rgba(22, 163, 74, 0.08)',
                          color: 'var(--green)',
                        } : {
                          backgroundColor: 'rgba(217, 119, 6, 0.08)',
                          color: 'var(--amber)',
                        }}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide">
                          {runRes.callable ? `${m.label} response` : 'Note'}
                        </p>
                        <pre className="mt-1.5 whitespace-pre-wrap">
                          {runRes.response}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
