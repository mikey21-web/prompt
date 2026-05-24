'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, type ModelId } from '@promptforge/core';
import { Trophy, ThumbsUp, Activity, Users, Zap } from 'lucide-react';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function BenchmarkPage() {
  const benchmark = useQuery(api.publicStats.getGlobalBenchmark);
  const activity = useQuery(api.publicStats.getGlobalActivity);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-xl">
          ⚡ PromptForge
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700"
          >
            Try it free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <Trophy className="h-3.5 w-3.5" />
          Live benchmark — updated in real time
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Does PromptForge actually
          <br />
          <span className="text-violet-600">make prompts better?</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Every user can run their raw prompt and our optimized version against the same model and pick the winner. Here&apos;s how often we win.
        </p>
      </section>

      {/* Headline win rate */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 p-12 text-center text-white shadow-2xl">
          {benchmark === undefined ? (
            <div className="animate-pulse">
              <div className="h-24 w-48 mx-auto rounded bg-white/20" />
              <div className="h-6 w-72 mx-auto mt-4 rounded bg-white/20" />
            </div>
          ) : benchmark.total === 0 ? (
            <>
              <p className="text-2xl font-semibold mb-3">No votes yet</p>
              <p className="text-violet-100">
                Be the first — run an A/B test in the{' '}
                <Link href="/eval" className="underline font-medium">
                  Eval tool
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              <p className="text-7xl md:text-8xl font-bold mb-2">
                {benchmark.winRate}%
              </p>
              <p className="text-xl text-violet-100 font-medium">
                of the time, PromptForge&apos;s optimized prompts beat the user&apos;s raw prompt
              </p>
              <p className="mt-4 text-sm text-violet-200">
                Based on {formatNumber(benchmark.total)} head-to-head A/B votes
              </p>
            </>
          )}
        </div>
      </section>

      {/* Activity stats */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Prompts forged',
              value: activity?.totalRuns ?? 0,
              icon: Zap,
              color: 'violet',
            },
            {
              label: 'Active users',
              value: activity?.totalUsers ?? 0,
              icon: Users,
              color: 'blue',
            },
            {
              label: 'Thumbs-up rate',
              value:
                activity?.thumbsUpRate != null
                  ? `${activity.thumbsUpRate}%`
                  : '—',
              icon: ThumbsUp,
              color: 'emerald',
            },
            {
              label: 'Tokens optimized',
              value: activity?.totalTokensIn ?? 0,
              icon: Activity,
              color: 'amber',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            const colors: Record<string, string> = {
              violet: 'text-violet-600 bg-violet-50',
              blue: 'text-blue-600 bg-blue-50',
              emerald: 'text-emerald-600 bg-emerald-50',
              amber: 'text-amber-600 bg-amber-50',
            };
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center"
              >
                <div
                  className={`inline-flex rounded-xl p-2.5 mb-3 ${colors[stat.color]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {typeof stat.value === 'number'
                    ? formatNumber(stat.value)
                    : stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-model breakdown */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Win rate by model
        </h2>
        <p className="text-center text-gray-500 mb-8">
          How often the optimized version wins, broken down by which AI model ran it.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {benchmark === undefined ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">
              Loading benchmark…
            </div>
          ) : Object.keys(benchmark.byTarget).length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No per-model data yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">
                    Model
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">
                    Win rate
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">
                    Optimized wins
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">
                    Raw wins
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">
                    Total votes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(benchmark.byTarget)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([target, data]) => (
                    <tr key={target}>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {MODELS[target as ModelId]?.label ?? target}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            data.winRate >= 60
                              ? 'bg-emerald-100 text-emerald-700'
                              : data.winRate >= 40
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {data.winRate}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-emerald-700 font-medium">
                        {data.optimized}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-500">
                        {data.raw}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-700">
                        {data.total}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Updated live. Numbers grow as more users vote in the{' '}
          <Link href="/eval" className="underline">
            Eval
          </Link>{' '}
          tool.
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Verify it yourself
        </h2>
        <p className="text-gray-600 mb-8">
          Type a prompt. Run your raw version against ours on the same model. Pick the winner. Your vote becomes part of this benchmark.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center bg-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-violet-700 shadow-lg"
        >
          Run an A/B test free →
        </Link>
        <p className="mt-3 text-xs text-gray-400">
          50 free requests per day. No credit card.
        </p>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 PromptForge.</p>
      </footer>
    </main>
  );
}
