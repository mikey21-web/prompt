'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import type { Id } from '@promptforge/convex/convex/_generated/dataModel';
import { diffLines } from '@promptforge/core';
import {
  Save,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

export default function ThreadDetailPage() {
  const params = useParams<{ id: string }>();
  const threadId = params.id as Id<'promptThreads'>;
  const data = useQuery(api.threads.getThread, { threadId });
  const saveVersion = useMutation(api.threads.saveVersion);
  const revertTo = useMutation(api.threads.revertTo);

  const [draft, setDraft] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comparingVer, setComparingVer] = useState<number | null>(null);

  const versions = data?.versions ?? [];
  const thread = data?.thread;
  const current =
    versions.find((v) => v._id === thread?.currentVersionId) ??
    versions[versions.length - 1] ??
    null;
  const editing = draft ?? current?.content ?? '';

  const compareTarget =
    comparingVer !== null
      ? versions.find((v) => v.versionNum === comparingVer)
      : current
        ? versions.find((v) => v.versionNum === current.versionNum - 1)
        : undefined;

  const diff = useMemo(() => {
    if (!compareTarget) return null;
    return diffLines(compareTarget.content, editing);
  }, [compareTarget, editing]);

  if (data === undefined) {
    return <div className="animate-pulse h-64 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />;
  }
  if (data === null || !thread || !current) {
    return <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Thread not found.</p>;
  }

  const handleSave = async () => {
    if (draft === null || draft.trim() === current.content.trim()) return;
    setSaving(true);
    try {
      await saveVersion({
        threadId,
        content: draft,
        source: 'edit',
        note: note || undefined,
      });
      setDraft(null);
      setNote('');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async (versionNum: number) => {
    await revertTo({ threadId, versionNum });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editing);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{thread.title}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="rounded px-2 py-0.5 font-mono text-xs" style={{ backgroundColor: 'var(--surface)' }}>
              {thread.target}
            </span>{' '}
            · {thread.modality} · v{current.versionNum} of {versions.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editor */}
        <div className="lg:col-span-2 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <textarea
            value={editing}
            onChange={(e) => setDraft(e.target.value)}
            rows={20}
            className="block w-full rounded-md border p-3 text-sm font-mono shadow-inner focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            style={{ borderColor: 'var(--border)' }}
          />
          {draft !== null && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional commit message"
                className="flex-1 rounded-md border px-3 py-1.5 text-xs"
                style={{ borderColor: 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || draft.trim() === current.content.trim()}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:bg-violet-400"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Save className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save version'}
              </button>
            </div>
          )}
        </div>

        {/* Version timeline */}
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>History</h3>
          <ul className="mt-3 space-y-2">
            {[...versions].reverse().map((v) => (
              <li
                key={v._id}
                className="rounded border p-2 text-xs"
                style={{
                  borderColor: v._id === current._id ? 'rgba(124, 58, 237, 0.3)' : 'var(--border)',
                  backgroundColor: v._id === current._id ? 'var(--accent-dim)' : 'var(--surface-raised)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">v{v.versionNum}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(v.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {v.note && (
                  <p className="mt-0.5 italic" style={{ color: 'var(--text-secondary)' }}>{v.note}</p>
                )}
                <div className="mt-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setComparingVer(v.versionNum)}
                    className="text-violet-700 hover:underline"
                  >
                    Compare
                  </button>
                  {v._id !== current._id && (
                    <>
                        <span style={{ color: 'var(--border)' }}>·</span>
                      <button
                        type="button"
                        onClick={() => handleRevert(v.versionNum)}
                        className="inline-flex items-center text-violet-700 hover:underline"
                      >
                        <RotateCcw className="mr-0.5 h-3 w-3" />
                        Revert
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Diff viewer */}
      {diff && compareTarget && (
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Diff: v{compareTarget.versionNum} → current
          </h3>
          <pre className="mt-3 overflow-auto rounded p-3 text-xs font-mono leading-relaxed" style={{ backgroundColor: 'var(--surface)' }}>
            {diff.map((seg, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  background:
                    seg.op === 'added'
                      ? '#dcfce7'
                      : seg.op === 'removed'
                        ? '#fee2e2'
                        : 'transparent',
                  color:
                    seg.op === 'added'
                      ? '#15803d'
                      : seg.op === 'removed'
                        ? '#b91c1c'
                        : 'var(--text-secondary)',
                }}
              >
                {seg.op === 'added' ? '+' : seg.op === 'removed' ? '-' : ' '}{' '}
                {seg.line}
              </span>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
