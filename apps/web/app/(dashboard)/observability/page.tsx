'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { MODELS, type ModelId } from '@promptforge/core';
import {
  Activity,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  TrendingUp,
  Zap,
  BarChart2,
  Clock,
} from 'lucide-react';

const DAY_OPTIONS = [7, 14, 30, 90] as const;
type DayRange = (typeof DAY_OPTIONS)[number];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = 'violet',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: 'violet' | 'emerald' | 'amber' | 'blue';
}) {
  const colors = {
    violet: 'text-violet-600 bg-violet-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50',
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color = 'bg-violet-500',
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 truncate text-xs text-gray-700 text-right">{label}</span>
      <div className="flex-1 rounded-full bg-gray-100 h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-gray-600">
        {count}
      </span>
    </div>
  );
}

function MiniCalendar({
  dailyCounts,
  days,
}: {
  dailyCounts: Record<string, number>;
  days: number;
}) {
  // Build an array of the last `days` dates
  const dates: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dates.push({ date: key, count: dailyCounts[key] ?? 0 });
  }
  const max = Math.max(...dates.map((d) => d.count), 1);

  return (
    <div className="flex flex-wrap gap-1">
      {dates.map(({ date, count }) => {
        const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4);
        const bg = [
          'bg-gray-100',
          'bg-violet-100',
          'bg-violet-300',
          'bg-violet-500',
          'bg-violet-700',
        ][intensity];
        return (
          <div
            key={date}
            title={`${date}: ${count} run${count !== 1 ? 's' : ''}`}
            className={`h-4 w-4 rounded-sm ${bg} cursor-default`}
          />
        );
      })}
    </div>
  );
}

export default function ObservabilityPage() {
  const [days, setDays] = useState<DayRange>(30);

  const runStats = useQuery(api.observability.getForgeRunStats, { days });
  const ratingStats = useQuery(api.observability.getRatingStats, { days });
  const abStats = useQuery(api.observability.getAbVoteStats, { days });
  const recentRuns = useQuery(api.observability.getRecentRuns, { limit: 15 });

  const loading =
    runStats === undefined || ratingStats === undefined || abStats === undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Observability</h1>
          <p className="mt-2 text-gray-600">
            Your prompt quality metrics, token usage, and model performance.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total forge runs"
              value={runStats?.totalRuns ?? 0}
              sub={`last ${days} days`}
              icon={Activity}
              color="violet"
            />
            <StatCard
              label="Thumbs up rate"
              value={
                ratingStats?.thumbsUpRate != null
                  ? `${ratingStats.thumbsUpRate}%`
                  : '—'
              }
              sub={`${ratingStats?.total ?? 0} ratings`}
              icon={ThumbsUp}
              color="emerald"
            />
            <StatCard
              label="A/B win rate"
              value={
                abStats?.winRate != null ? `${abStats.winRate}%` : '—'
              }
              sub={`${abStats?.total ?? 0} comparisons`}
              icon={Trophy}
              color="amber"
            />
            <StatCard
              label="Avg tokens in"
              value={runStats?.avgTokensIn ?? 0}
              sub={`avg out: ${runStats?.avgTokensOut ?? 0}`}
              icon={Zap}
              color="blue"
            />
          </div>

          {/* Activity heatmap */}
          {runStats && Object.keys(runStats.dailyCounts).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                Daily activity
              </h2>
              <MiniCalendar dailyCounts={runStats.dailyCounts} days={days} />
              <p className="mt-2 text-xs text-gray-400">
                Darker = more runs. Hover for exact count.
              </p>
            </div>
          )}

          {/* By target + by modality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By target model */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-violet-500" />
                Runs by target model
              </h2>
              {runStats && Object.keys(runStats.byTarget).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(runStats.byTarget)
                    .sort(([, a], [, b]) => b - a)
                    .map(([target, count]) => (
                      <BarRow
                        key={target}
                        label={
                          MODELS[target as ModelId]?.label ?? target
                        }
                        count={count}
                        total={runStats.totalRuns}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No data yet.</p>
              )}
            </div>

            {/* By modality */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-violet-500" />
                Runs by modality
              </h2>
              {runStats && Object.keys(runStats.byModality).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(runStats.byModality)
                    .sort(([, a], [, b]) => b - a)
                    .map(([modality, count]) => (
                      <BarRow
                        key={modality}
                        label={
                          modality.charAt(0).toUpperCase() + modality.slice(1)
                        }
                        count={count}
                        total={runStats.totalRuns}
                        color="bg-blue-400"
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No data yet.</p>
              )}
            </div>
          </div>

          {/* A/B breakdown by target */}
          {abStats && abStats.total > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                A/B results by model
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Did PromptForge&apos;s optimized version beat your raw prompt?
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left font-medium text-gray-500">
                        Model
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500">
                        Optimized wins
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500">
                        Raw wins
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500">
                        Ties
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500">
                        Win rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(abStats.byTarget).map(
                      ([target, counts]) => {
                        const total =
                          counts.optimized + counts.raw + counts.tie;
                        const wr =
                          total > 0
                            ? Math.round((counts.optimized / total) * 100)
                            : 0;
                        return (
                          <tr key={target}>
                            <td className="py-2 font-medium text-gray-800">
                              {MODELS[target as ModelId]?.label ?? target}
                            </td>
                            <td className="py-2 text-right text-emerald-700">
                              {counts.optimized}
                            </td>
                            <td className="py-2 text-right text-red-600">
                              {counts.raw}
                            </td>
                            <td className="py-2 text-right text-gray-500">
                              {counts.tie}
                            </td>
                            <td className="py-2 text-right font-semibold text-gray-900">
                              {wr}%
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent runs */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-500" />
              Recent forge runs
            </h2>
            {recentRuns === undefined ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100" />
                ))}
              </div>
            ) : recentRuns.length === 0 ? (
              <p className="text-sm text-gray-400">No runs yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentRuns.map((run) => (
                  <div
                    key={run._id}
                    className="flex items-start gap-3 py-3 text-xs"
                  >
                    <span className="mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600 whitespace-nowrap">
                      {MODELS[run.target as ModelId]?.label ?? run.target}
                    </span>
                    <p className="flex-1 text-gray-700 line-clamp-2">
                      {run.input}
                    </p>
                    <span className="whitespace-nowrap text-gray-400">
                      {new Date(run.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
