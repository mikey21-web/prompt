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
        <h1 className="text-3xl font-bold text-gray-900">Reverse</h1>
        <p className="mt-2 text-gray-600">
          Paste a prompt you found. We&apos;ll show you what it&apos;s actually trying to do.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="reverse-input"
          className="block text-sm font-medium text-gray-700"
        >
          Prompt to reverse
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Works on any format — XML, markdown, Midjourney tokens, shot lists.
        </p>
        <textarea
          id="reverse-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={8}
          placeholder="<role>You are a senior copywriter…</role><task>…</task>"
          className="mt-2 block w-full rounded-md border border-gray-300 p-3 text-sm font-mono shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || prompt.trim().length < 10}
          className="mt-4 inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
        >
          <Microscope className="-ml-1 mr-2 h-4 w-4" />
          {loading ? 'Analyzing…' : 'Reverse'}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {explanation && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">Plain English breakdown</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-900">
            {explanation}
          </pre>
        </div>
      )}
    </div>
  );
}
