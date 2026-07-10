'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function LandingTrustStrip() {
  const benchmark = useQuery(api.publicStats.getGlobalBenchmark);
  const activity = useQuery(api.publicStats.getGlobalActivity);

  // Don't render the strip if we have no data at all — keeps the homepage
  // from showing "0 prompts forged" before any users have signed up.
  if (
    benchmark !== undefined &&
    activity !== undefined &&
    activity.totalRuns === 0 &&
    benchmark.total === 0
  ) {
    return null;
  }

  const stats: { value: string; label: string; href?: string }[] = [];

  if (benchmark?.winRate != null && benchmark.total > 0) {
    stats.push({
      value: `${benchmark.winRate}%`,
      label: 'A/B win rate vs raw prompts',
      href: '/benchmark',
    });
  }
  if (activity && activity.totalRuns > 0) {
    stats.push({
      value: fmt(activity.totalRuns),
      label: 'prompts forged',
    });
  }
  if (activity?.thumbsUpRate != null) {
    stats.push({
      value: `${activity.thumbsUpRate}%`,
      label: 'thumbs-up rate',
    });
  }
  if (activity && activity.totalUsers > 0) {
    stats.push({
      value: fmt(activity.totalUsers),
      label: 'active users',
    });
  }

  if (stats.length === 0) return null;

  return (
    <div className="border-y border-black/8">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => {
            const inner = (
              <>
                <p className="text-2xl md:text-3xl font-bold tracking-tighter text-[#16161a]">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/40 mt-1">
                  {stat.label}
                </p>
              </>
            );
            return stat.href ? (
              <Link
                key={stat.label}
                href={stat.href}
                className="hover:text-[#7c3aed] transition-colors"
              >
                {inner}
              </Link>
            ) : (
              <div key={stat.label}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
