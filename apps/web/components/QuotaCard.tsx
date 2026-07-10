'use client';

import { useQuery } from 'convex/react';
import { api } from '@promptforge/convex/convex/_generated/api';
import { UsageBar, PlanBadge } from '@promptforge/ui';
import { PLAN_LIMITS } from '@promptforge/core';
import Link from 'next/link';

export function QuotaCard() {
  const user = useQuery(api.users.getMe);

  if (user === undefined) {
    return (
      <div
        className="rounded-xl border p-5 animate-pulse"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="h-5 rounded w-24 mb-4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
        <div className="h-2 rounded mb-4" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
        <div className="h-4 rounded w-32" style={{ backgroundColor: 'var(--surface-hover)' }}></div>
      </div>
    );
  }

  if (user === null) return null;

  const limit = PLAN_LIMITS[user.plan].requestsPerDay;
  const remaining = limit - user.dailyUsage;
  const pct = Math.min((user.dailyUsage / limit) * 100, 100);

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Daily quota
        </span>
        <PlanBadge plan={user.plan} />
      </div>

      <UsageBar used={user.dailyUsage} limit={limit} />

      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-secondary)' }}>
          {user.dailyUsage} / {limit} requests
        </span>
        <span className="font-medium" style={{ color: remaining > 20 ? 'var(--green)' : 'var(--amber)' }}>
          {remaining} left
        </span>
      </div>

      {pct > 80 && (
        <div
          className="rounded-lg border p-3 text-xs space-y-2"
          style={{ borderColor: 'rgba(217,119,6,0.2)', backgroundColor: 'rgba(217,119,6,0.08)' }}
        >
          <p style={{ color: 'var(--amber)' }}>
            Almost at your daily limit. Upgrade for more.
          </p>
          <Link
            href="/billing"
            className="inline-block text-xs font-medium underline underline-offset-2"
            style={{ color: 'var(--amber)' }}
          >
            View upgrades
          </Link>
        </div>
      )}
    </div>
  );
}
