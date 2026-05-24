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
    return <div className="animate-pulse h-64 rounded-lg bg-gray-200" />;
  }
  if (data === null || !thread || !current) {
    return <p className="text-sm text-gray-600">Thread not found.</p>;
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
          <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
              {thread.target}
            </span>{' '}
            · {thread.modality} · v{current.versionNum} of {versions.length}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editor */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <textarea
            value={editing}
            onChange={(e) => setDraft(e.target.value)}
            rows={20}
            className="block w-full rounded-md border border-gray-200 p-3 text-sm font-mono shadow-inner focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          {draft !== null && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional commit message"
                className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || draft.trim() === current.content.trim()}
                className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:bg-violet-400"
              >
                <Save className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save version'}
              </button>
            </div>
          )}
        </div>

        {/* Version timeline */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">History</h3>
          <ul className="mt-3 space-y-2">
            {[...versions].reverse().map((v) => (
              <li
                key={v._id}
                className={`rounded border p-2 text-xs ${
                  v._id === current._id
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">v{v.versionNum}</span>
                  <span className="text-gray-500">
                    {new Date(v.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {v.note && (
                  <p className="mt-0.5 text-gray-600 italic">{v.note}</p>
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
                      <span className="text-gray-300">·</span>
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">
            Diff: v{compareTarget.versionNum} → current
          </h3>
          <pre className="mt-3 overflow-auto rounded bg-gray-50 p-3 text-xs font-mono leading-relaxed">
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
                        : '#374151',
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
