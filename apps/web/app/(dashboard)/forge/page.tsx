'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import {
  MODELS,
  MODELS_BY_MODALITY,
  type ModelId,
  type Modality,
} from '@promptforge/core';
import {
  Copy,
  Check,
  Wand2,
  GitBranch,
  ImageIcon,
  Link2,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

const MODALITY_LABELS: Record<Modality, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  code: 'Code',
};

interface DetectionResult {
  modality: Modality;
  suggestedTarget: string;
  description: string;
}

export default function ForgePage() {
  const router = useRouter();
  const translate = useAction(api.promptforge.translate);
  const createThread = useMutation(api.threads.createThread);
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
  const [savingThread, setSavingThread] = useState(false);

  // Screenshot / URL detection state
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const EXAMPLES: { label: string; text: string }[] = [
    {
      label: '🎬 Cinematic shot',
      text: 'a guy walks into a dark hallway, sees a black cat, runs away — cinematic horror, 8 seconds',
    },
    {
      label: '📊 SaaS blog post',
      text: 'blog post about remote work for engineering leaders managing distributed teams of 10-50',
    },
    {
      label: '🎨 Product render',
      text: 'sleek matte black wireless earbuds floating above a glass surface, studio lighting',
    },
    {
      label: '🎵 Lo-fi track',
      text: 'wistful late-night lo-fi track, jazzy chords, vinyl crackle, 80 bpm, 90s anime vibe',
    },
    {
      label: '💻 Code review',
      text: 'review this React component for accessibility issues and propose specific fixes',
    },
  ];

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

  const handleSaveAsThread = async () => {
    if (!result) return;
    setSavingThread(true);
    try {
      const title = input.length > 60 ? input.slice(0, 57) + '…' : input;
      const { threadId } = await createThread({
        title: title || 'Untitled prompt',
        target: result.target,
        modality: result.intent.modality,
        initialContent: result.optimized,
      });
      router.push(`/threads/${threadId}`);
    } finally {
      setSavingThread(false);
    }
  };

  // ── Auto-detect from screenshot ──────────────────────────────────────────
  const handleScreenshot = async (file: File) => {
    setDetecting(true);
    setDetection(null);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );
      const res = await fetch('/api/detect-modality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error('Detection failed');
      const data: DetectionResult = await res.json();
      setDetection(data);
      // Auto-fill the target if we got a suggestion
      if (data.suggestedTarget) {
        setTarget(data.suggestedTarget as ModelId);
      }
      // Pre-fill input with the description if input is empty
      if (!input.trim() && data.description) {
        setInput(data.description);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed.');
    } finally {
      setDetecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleScreenshot(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleUrlDetect = async () => {
    if (!urlInput.trim()) return;
    setDetecting(true);
    setDetection(null);
    setError(null);
    try {
      const res = await fetch('/api/detect-modality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      if (!res.ok) throw new Error('Detection failed');
      const data: DetectionResult = await res.json();
      setDetection(data);
      if (data.suggestedTarget) setTarget(data.suggestedTarget as ModelId);
      if (!input.trim() && data.description) setInput(data.description);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed.');
    } finally {
      setDetecting(false);
      setShowUrlInput(false);
      setUrlInput('');
    }
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          {/* Auto-detect toolbar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              Auto-detect from:
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={detecting}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {detecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              Screenshot
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={detecting}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <Link2 className="h-3.5 w-3.5" />
              URL
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* URL input */}
          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlDetect()}
                placeholder="https://..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={handleUrlDetect}
                disabled={!urlInput.trim() || detecting}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
              >
                Detect
              </button>
              <button
                type="button"
                onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                className="rounded-md border border-gray-200 px-2 py-1.5 text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Detection result banner */}
          {detection && (
            <div className="flex items-start gap-2 rounded-md bg-violet-50 border border-violet-200 px-3 py-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-violet-800">
                  Detected: {MODALITY_LABELS[detection.modality]} →{' '}
                  {MODELS[detection.suggestedTarget as ModelId]?.label ??
                    detection.suggestedTarget}
                </span>
                <p className="text-violet-700 mt-0.5">{detection.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetection(null)}
                className="text-violet-400 hover:text-violet-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div>
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

            {/* Example chips — shown when input is empty */}
            {!input.trim() && !result && (
              <div className="mt-3">
                <p className="text-[11px] font-medium text-gray-500 mb-1.5">
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => setInput(ex.text)}
                      className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
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
            className="w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:bg-violet-400"
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
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Output */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Optimized prompt
            </h2>
            {result && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveAsThread}
                  disabled={savingThread}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  {savingThread ? 'Saving…' : 'Save as thread'}
                </button>
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
              </div>
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
