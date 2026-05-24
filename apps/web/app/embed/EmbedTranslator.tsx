'use client';

import { useState } from 'react';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://promptforge.dev';

const TARGETS: { value: string; label: string }[] = [
  { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'midjourney-v7', label: 'Midjourney v7' },
  { value: 'sora-2', label: 'Sora 2' },
];

/**
 * Public embeddable translator. No auth required to render — the actual
 * /api/forge call still requires auth, so on first attempt we open
 * promptforge.dev in a new tab for sign-in. After that the result is
 * shown inline.
 *
 * Designed for blog embeds and newsletters. Lightweight, single column,
 * branded with a subtle "Powered by PromptForge" link.
 */
export function EmbedTranslator() {
  const [input, setInput] = useState('');
  const [target, setTarget] = useState('claude-sonnet-4.5');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch(`${APP_URL}/api/forge`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, target }),
      });
      if (res.status === 401) {
        // open sign-in in new tab so cookie gets set
        window.open(`${APP_URL}/sign-in`, '_blank');
        setError('Sign in to PromptForge in the new tab, then try again.');
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? `Error ${res.status}`);
        return;
      }
      const data = await res.json();
      setOutput(data.optimized);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        maxWidth: 640,
        margin: '8px auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <strong style={{ color: '#111827', fontSize: 14 }}>PromptForge</strong>
        <a
          href={APP_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#7c3aed', fontSize: 12, textDecoration: 'none' }}
        >
          Open full app →
        </a>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="Type plain English…"
        style={{
          width: '100%',
          padding: 10,
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            background: 'white',
          }}
        >
          {TARGETS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px',
            background: loading ? '#a78bfa' : '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Forging…' : 'Forge'}
        </button>
      </div>

      {error && (
        <p
          style={{
            color: '#dc2626',
            fontSize: 12,
            marginTop: 10,
            marginBottom: 0,
          }}
        >
          {error}
        </p>
      )}

      {output && (
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 12,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 320,
            overflow: 'auto',
            margin: '12px 0 0',
          }}
        >
          {output}
        </pre>
      )}

      <p
        style={{
          marginTop: 12,
          marginBottom: 0,
          fontSize: 11,
          color: '#9ca3af',
          textAlign: 'center',
        }}
      >
        Powered by{' '}
        <a
          href={APP_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#7c3aed', textDecoration: 'none' }}
        >
          PromptForge
        </a>
      </p>
    </div>
  );
}
