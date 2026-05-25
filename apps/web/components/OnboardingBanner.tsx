'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, X, Chrome, Zap, BarChart3 } from 'lucide-react';

const STORAGE_KEY = 'promptforge.onboarding.dismissed';

/**
 * First-run banner shown on the dashboard. Surfaces the three killer
 * actions a new user should take: forge their first prompt, install the
 * extension, see the benchmark.
 *
 * Dismissable with a state stored in localStorage.
 */
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
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-50 p-6 md:p-8">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-violet-700 mb-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Welcome to PromptForge
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
        Three things to try first
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Each takes under a minute and shows you what makes PromptForge different.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link
          href="/forge"
          className="group rounded-xl border border-violet-100 bg-white p-4 hover:border-violet-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
              1
            </span>
            <Zap className="h-4 w-4 text-violet-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Forge a prompt</p>
          <p className="text-xs text-gray-500">
            Plain English in. Optimized prompt out, in any model&apos;s native format.
          </p>
        </Link>

        <Link
          href="/showdown"
          className="group rounded-xl border border-violet-100 bg-white p-4 hover:border-violet-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
              2
            </span>
            <BarChart3 className="h-4 w-4 text-violet-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Run a Showdown</p>
          <p className="text-xs text-gray-500">
            Same input, four flagship models side by side. Pick the best.
          </p>
        </Link>

        <Link
          href="/install"
          className="group rounded-xl border border-violet-100 bg-white p-4 hover:border-violet-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
              3
            </span>
            <Chrome className="h-4 w-4 text-violet-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">Install the extension</p>
          <p className="text-xs text-gray-500">
            Get the Forge button right inside ChatGPT, Claude, and Gemini.
          </p>
        </Link>
      </div>
    </div>
  );
}
