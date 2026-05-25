"use client";

import { useQuery } from "convex/react";
import { api } from "@promptforge/convex/convex/_generated/api";
import { TokenSavings } from "@promptforge/ui";
import { QuotaCard } from "@/components/QuotaCard";
import { RecentOptimizations } from "@/components/RecentOptimizations";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import Link from "next/link";
import { Zap, Swords, FlaskConical, GitBranch } from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/forge",
    label: "Forge",
    description: "Plain English → optimized prompt",
    icon: Zap,
    accent: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    href: "/showdown",
    label: "Showdown",
    description: "Compare 4 flagship models",
    icon: Swords,
    accent: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    href: "/eval",
    label: "Eval",
    description: "Raw vs optimized, same model",
    icon: FlaskConical,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    href: "/threads",
    label: "Threads",
    description: "Versioned prompts with diff",
    icon: GitBranch,
    accent: "bg-amber-50 text-amber-700 border-amber-200",
  },
] as const;

export default function DashboardPage() {
  const user = useQuery(api.users.getMe);
  const stats = useQuery(api.usageLogs.getStats, { days: 30 });

  if (user === undefined) {
    return (
      <div className="animate-pulse text-gray-400">Loading dashboard...</div>
    );
  }

  if (user === null) {
    return (
      <div className="text-gray-700">
        <p>Account setup in progress... Refresh in a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* First-run onboarding */}
      <OnboardingBanner />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back. Pick a tool below or jump straight into Forge.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group rounded-2xl border bg-white p-4 hover:shadow-md transition flex flex-col gap-2 ${a.accent.replace(/bg-\S+/, "").replace(/text-\S+/, "")}`}
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.accent}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <p className="font-semibold text-gray-900">{a.label}</p>
            <p className="text-xs text-gray-500">{a.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats + recent */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <QuotaCard />

          {stats && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-violet-600">
                  {stats.totalRequests}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Forges in the last 30 days
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <TokenSavings
                  tokens={stats.totalSavedTokens}
                  estimatedCost={stats.estimatedSavedCost}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <RecentOptimizations />
        </div>
      </div>
    </div>
  );
}
