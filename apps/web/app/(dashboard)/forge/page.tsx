'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAction, useMutation } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import {
  MODELS,
  MODELS_BY_MODALITY,
  type ForgeMode,
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function ForgePage() {
  const router = useRouter();
  const translate = useAction(api.promptforge.translate);
  const createThread = useMutation(api.threads.createThread);
  const [input, setInput] = useState('');
  const [target, setTarget] = useState<ModelId | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    intent: { modality: Modality; subject?: string; diagnosis?: { strategy: string; reason: string } };
    target: ModelId;
    optimized: string;
    mode?: string;
    diagnosis?: { strategy: string; reason: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingThread, setSavingThread] = useState(false);

  const [mode, setMode] = useState<ForgeMode>('auto');

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
        mode,
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

  const handleScreenshot = async (file: File) => {
    setDetecting(true);
    setDetection(null);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const res = await fetch('/api/detect-modality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleScreenshot(file);
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            PromptForge
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Plain English in. Optimized prompt out.
          </p>
        </div>
        <div
          className="flex items-center gap-1 rounded-lg p-0.5"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {(['auto', 'compress', 'enhance'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                backgroundColor: mode === m ? 'var(--accent-dim)' : 'transparent',
                color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {m === 'auto' ? 'Auto' : m === 'compress' ? 'Compress' : 'Enhance'}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input */}
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          {/* Auto-detect toolbar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Auto-detect:
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={detecting}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {detecting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ImageIcon className="h-3 w-3" />
              )}
              Screenshot
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={detecting}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Link2 className="h-3 w-3" />
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

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlDetect()}
                placeholder="https://..."
                className="flex-1 rounded-md px-3 py-1.5 text-sm outline-none transition-all"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={handleUrlDetect}
                disabled={!urlInput.trim() || detecting}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'var(--accent-dim)',
                  color: 'var(--accent)',
                }}
              >
                Detect
              </button>
              <button
                type="button"
                onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                className="rounded-md px-2 py-1.5 transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {detection && (
            <div
              className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
              style={{
                borderColor: 'var(--accent-border)',
                backgroundColor: 'var(--accent-dim)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--accent)' }}>
                  Detected: {MODALITY_LABELS[detection.modality]} →{' '}
                  {MODELS[detection.suggestedTarget as ModelId]?.label ?? detection.suggestedTarget}
                </span>
                <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {detection.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetection(null)}
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div>
            <label htmlFor="forge-input" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              What do you want?
            </label>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Describe it however you&apos;d say it out loud.
            </p>
            <textarea
              id="forge-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              rows={8}
              placeholder="a guy walks into a dark hallway, sees a black cat, runs away. cinematic horror, 8 seconds, sora"
              className="mt-2 block w-full rounded-lg p-3 text-sm outline-none transition-all resize-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text-primary)',
              }}
            />

            {!input.trim() && !result && (
              <div className="mt-3">
                <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Try an example:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => setInput(ex.text)}
                      className="rounded-full border px-2.5 py-1 text-xs transition-all"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="forge-target" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Target model
            </label>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Leave on auto and we&apos;ll pick based on what you wrote.
            </p>
            <select
              id="forge-target"
              value={target}
              onChange={(e) => setTarget(e.target.value as ModelId | '')}
              disabled={loading}
              className="mt-2 block w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text-primary)',
              }}
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
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all btn-press"
            style={{
              backgroundColor: loading ? 'var(--accent-dim)' : 'var(--accent)',
              color: loading ? 'var(--accent)' : '#0b0b0e',
            }}
          >
            {loading ? 'Translating…' : 'Forge prompt'}
          </button>

          {error && (
            <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>
          )}
        </div>

        {/* Output */}
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Optimized prompt
            </h2>
            {result && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveAsThread}
                  disabled={savingThread}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  {savingThread ? 'Saving…' : 'Save as thread'}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" style={{ color: 'var(--green)' }} /> Copied
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
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className="rounded-md px-2 py-0.5 font-medium"
                  style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                >
                  {MODELS[result.target].label}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 font-medium"
                  style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
                >
                  {MODALITY_LABELS[result.intent.modality]}
                </span>
                {result.diagnosis && (
                  <span
                    className="rounded-md px-2 py-0.5 font-medium"
                    style={{
                      backgroundColor: 'rgba(167,139,250,0.08)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent)',
                    }}
                  >
                    {result.diagnosis.strategy === 'compress' ? 'Compress' : 'Enhance'}
                    {result.mode === 'auto' ? ` — ${result.diagnosis.reason}` : ' (manual)'}
                  </span>
                )}
              </div>
              <pre
                className="mt-3 whitespace-pre-wrap rounded-lg p-4 text-sm overflow-auto max-h-96 leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                {result.optimized}
              </pre>
            </>
          ) : (
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Your optimized prompt will appear here.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
