'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import {
  MODELS,
  ALL_MODEL_IDS,
  MODELS_BY_MODALITY,
  type ModelId,
  type Modality,
} from '@promptforge/core';
import { Copy, Check, Wand2 } from 'lucide-react';

const MODALITY_LABELS: Record<Modality, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  code: 'Code',
};

export default function ForgePage() {
  const translate = useAction(api.promptforge.translate);
  const [input, setInput] = useState('');
  const [target, setTarget] = useState<ModelId | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    intent: { modality: Modality; subject?: string };
    target: ModelId;
    optimized: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || input.trim().length < 3) {
      setError('Type at least a few words.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await translate({
        input,
        target: target || undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PromptForge</h1>
        <p className="mt-2 text-gray-600">
          Plain English in. Optimized prompt in your model&apos;s native format out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="forge-input"
            className="block text-sm font-medium text-gray-700"
          >
            What do you want?
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Describe it however you&apos;d say it out loud. We&apos;ll figure out the format.
          </p>
          <textarea
            id="forge-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            rows={8}
            placeholder="a guy walks into a dark hallway, sees a black cat, runs away. cinematic horror, 8 seconds, sora"
            className="mt-3 block w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
          />

          <div className="mt-4">
            <label
              htmlFor="forge-target"
              className="block text-sm font-medium text-gray-700"
            >
              Target model
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Leave on auto and we&apos;ll pick based on what you wrote.
            </p>
            <select
              id="forge-target"
              value={target}
              onChange={(e) => setTarget(e.target.value as ModelId | '')}
              disabled={loading}
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50"
            >
              <option value="">Auto-detect</option>
              {(Object.keys(MODELS_BY_MODALITY) as Modality[]).map((modality) => {
                const list = MODELS_BY_MODALITY[modality];
                if (list.length === 0) return null;
                return (
                  <optgroup key={modality} label={MODALITY_LABELS[modality]}>
                    {list.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} — {m.blurb}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="mt-6 w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
          >
            {loading ? (
              <>Translating…</>
            ) : (
              <>
                <Wand2 className="-ml-1 mr-2 inline-block h-4 w-4" />
                Forge prompt
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Output */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Optimized prompt
            </h2>
            {result && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            )}
          </div>

          {result ? (
            <>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                  {MODELS[result.target].label}
                </span>
                <span className="rounded bg-violet-50 px-2 py-0.5 font-medium text-violet-700">
                  {MODALITY_LABELS[result.intent.modality]}
                </span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-900 overflow-auto max-h-96">
                {result.optimized}
              </pre>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Your optimized prompt will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
