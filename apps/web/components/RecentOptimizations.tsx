'use client';

import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const MODE_COLORS: Record<string, { bg: string; text: string }> = {
  auto: { bg: 'var(--accent-dim)', text: 'var(--accent)' },
  compress: { bg: 'rgba(22,163,74,0.08)', text: 'var(--green)' },
  enhance: { bg: 'rgba(217,119,6,0.08)', text: 'var(--amber)' },
};

export function RecentOptimizations() {
  const prompts = useQuery(api.prompts.getHistory, { limit: 5 });

  if (prompts === undefined) {
    return (
      <div
        className="rounded-xl border animate-pulse"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="h-5 rounded w-40" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-5 py-4 space-y-2">
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
            <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          No optimizations yet
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Forge your first prompt to see history here.
        </p>
        <Link
          href="/forge"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            backgroundColor: 'var(--accent-dim)',
            color: 'var(--accent)',
          }}
        >
          Forge a prompt
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="border-b px-5 py-3.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Recent optimizations
        </h2>
      </div>

      <div>
        {prompts.map((prompt, i) => (
          <div
            key={prompt._id}
            className="px-5 py-3.5 transition-colors"
            style={{
              borderBottom: i < prompts.length - 1 ? '1px solid var(--border)' : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {prompt.original.substring(0, 60)}
                  {prompt.original.length > 60 ? '...' : ''}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 font-medium"
                    style={{
                      backgroundColor: MODE_COLORS[prompt.mode]?.bg ?? 'var(--surface-hover)',
                      color: MODE_COLORS[prompt.mode]?.text ?? 'var(--text-secondary)',
                    }}
                  >
                    {prompt.mode}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {prompt.targetModel}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>
                  -{prompt.savedTokens}
                </span>
                <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  tokens
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-t px-5 py-3 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs font-medium transition-all"
          style={{ color: 'var(--accent)' }}
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
