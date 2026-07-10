'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X, Zap, BarChart3, Chrome } from 'lucide-react';

const STORAGE_KEY = 'promptforge.onboarding.dismissed';

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 md:p-6"
      style={{
        borderColor: 'rgba(124,58,237,0.2)',
        backgroundColor: 'var(--accent-dim)',
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          Welcome to PromptForge
        </span>
      </div>
      <h2 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
        Three things to try first
      </h2>
      <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
        Each takes under a minute.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <Link
          href="/forge"
          className="group rounded-lg border p-3.5 transition-all hover:translate-y-[-1px]"
          style={{
            borderColor: 'rgba(124,58,237,0.2)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              1
            </span>
            <Zap className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Forge a prompt
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Plain English in. Optimized prompt out.
          </p>
        </Link>

        <Link
          href="/showdown"
          className="group rounded-lg border p-3.5 transition-all hover:translate-y-[-1px]"
          style={{
            borderColor: 'rgba(124,58,237,0.2)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              2
            </span>
            <BarChart3 className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Run a Showdown
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Compare models side by side.
          </p>
        </Link>

        <Link
          href="/install"
          className="group rounded-lg border p-3.5 transition-all hover:translate-y-[-1px]"
          style={{
            borderColor: 'rgba(124,58,237,0.2)',
            backgroundColor: 'var(--surface)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              3
            </span>
            <Chrome className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Install extension
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Forge inside ChatGPT, Claude, Gemini.
          </p>
        </Link>
      </div>
    </div>
  );
}
