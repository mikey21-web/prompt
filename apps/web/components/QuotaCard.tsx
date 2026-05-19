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
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-40"></div>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  const limit = PLAN_LIMITS[user.plan].requestsPerDay;
  const percentageUsed = (user.dailyUsage / limit) * 100;
  const remaining = limit - user.dailyUsage;

  // Calculate reset time (midnight UTC)
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  const resetDate = new Date(user.dailyReset);
  resetDate.setUTCHours(24, 0, 0, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Daily Quota</h2>
        <PlanBadge plan={user.plan} />
      </div>

      <UsageBar used={user.dailyUsage} limit={limit} />

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {user.dailyUsage} of {limit} requests used
        </span>
        <span className="font-medium text-gray-900">{remaining} remaining</span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Resets at midnight UTC
      </p>

      {percentageUsed > 80 && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            You&apos;re using more than 80% of your daily quota. Consider upgrading your plan.
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-block text-sm font-medium text-amber-600 hover:text-amber-700 underline"
          >
            View upgrade options →
          </Link>
        </div>
      )}
    </div>
  );
}
