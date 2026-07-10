'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { Microscope } from 'lucide-react';

export default function ReversePage() {
  const reverse = useAction(api.promptforge.reverse);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const run = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError('Paste a prompt at least 10 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const res = await reverse({ prompt });
      setExplanation(res.explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reverse failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Reverse</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Paste a prompt you found. We&apos;ll show you what it&apos;s actually trying to do.
        </p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <label
          htmlFor="reverse-input"
          className="block text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Prompt to reverse
        </label>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Works on any format — XML, markdown, Midjourney tokens, shot lists.
        </p>
        <textarea
          id="reverse-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={8}
          placeholder="<role>You are a senior copywriter…</role><task>…</task>"
          className="mt-2 block w-full rounded-md border p-3 text-sm font-mono outline-none transition-all"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || prompt.trim().length < 10}
          className="mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#0b0b0e',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Microscope className="-ml-1 mr-2 h-4 w-4" />
          {loading ? 'Analyzing…' : 'Reverse'}
        </button>
        {error && <p className="mt-3 text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
      </div>

      {explanation && (
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Plain English breakdown</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm" style={{ color: 'var(--text-primary)' }}>
            {explanation}
          </pre>
        </div>
      )}
    </div>
  );
}
